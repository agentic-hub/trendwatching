import { gql, GraphQLClient } from 'graphql-request';
import fetch from 'node-fetch';

// Set up GraphQL client with admin access
const graphqlClient = new GraphQLClient(process.env.HASURA_GRAPHQL_ENDPOINT || 'http://graphql-engine:8080/v1/graphql', {
  headers: {
    'x-hasura-admin-secret': process.env.HASURA_GRAPHQL_ADMIN_SECRET || 'dev_admin_secret',
  },
});

// Apify configuration
const APIFY_API_TOKEN = process.env.APIFY_API_TOKEN;
const APIFY_ACTOR_ID = 'apify/instagram-scraper';

// GraphQL queries
const GET_ACTIVE_ACCOUNTS = gql`
  query GetActiveInstagramAccounts {
    instagram_accounts(where: { is_active: { _eq: true } }) {
      id
      username
      scrape_frequency
    }
  }
`;

const CREATE_SCRAPING_LOG = gql`
  mutation CreateScrapingLog($instagram_account_id: uuid!, $status: String!) {
    insert_scraping_logs_one(object: { 
      instagram_account_id: $instagram_account_id, 
      status: $status 
    }) {
      id
    }
  }
`;

const UPDATE_SCRAPING_LOG = gql`
  mutation UpdateScrapingLog(
    $id: uuid!, 
    $status: String!, 
    $finished_at: timestamptz, 
    $items_scraped: Int, 
    $error_message: String
  ) {
    update_scraping_logs_by_pk(
      pk_columns: { id: $id }, 
      _set: { 
        status: $status, 
        finished_at: $finished_at, 
        items_scraped: $items_scraped, 
        error_message: $error_message 
      }
    ) {
      id
    }
  }
`;

const INSERT_SCRAPED_DATA = gql`
  mutation InsertScrapedData($objects: [scraped_data_insert_input!]!) {
    insert_scraped_data(
      objects: $objects,
      on_conflict: {
        constraint: scraped_data_instagram_account_id_post_id_key,
        update_columns: [
          caption, 
          image_url, 
          likes_count, 
          comments_count, 
          metadata, 
          scraped_at
        ]
      }
    ) {
      affected_rows
    }
  }
`;

// Helper function to call Apify
async function runApifyActor(username) {
  if (!APIFY_API_TOKEN) {
    throw new Error('APIFY_API_TOKEN environment variable is not set');
  }

  // Create Apify run
  const response = await fetch(`https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/runs?token=${APIFY_API_TOKEN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "directUrls": [`https://www.instagram.com/${username}/`],
      "resultsType": "posts",
      "resultsLimit": 100,
      "addParentData": false,
      "proxy": {
        "useApifyProxy": true
      }
    }),
  });

  const { data } = await response.json();
  
  if (!data || !data.id) {
    throw new Error('Failed to start Apify actor');
  }

  // Poll for completion
  let isFinished = false;
  let result = null;
  
  while (!isFinished) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${data.id}?token=${APIFY_API_TOKEN}`
    );
    const statusData = await statusResponse.json();

    if (statusData.data.status === 'SUCCEEDED') {
      isFinished = true;
      
      // Get the results
      const datasetResponse = await fetch(
        `https://api.apify.com/v2/actor-runs/${data.id}/dataset/items?token=${APIFY_API_TOKEN}`
      );
      result = await datasetResponse.json();
    } else if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(statusData.data.status)) {
      isFinished = true;
      throw new Error(`Apify actor run failed with status: ${statusData.data.status}`);
    }
  }

  return result;
}

// Main function to process an account
async function processAccount(account) {
  // Create initial log entry
  const { insert_scraping_logs_one } = await graphqlClient.request(CREATE_SCRAPING_LOG, {
    instagram_account_id: account.id,
    status: 'in_progress'
  });
  
  const logId = insert_scraping_logs_one.id;
  
  try {
    // Run Apify actor to scrape Instagram
    const scrapedData = await runApifyActor(account.username);
    
    // Transform and insert scraped data
    if (scrapedData && scrapedData.length > 0) {
      const transformedData = scrapedData.map(post => ({
        instagram_account_id: account.id,
        post_id: post.id,
        caption: post.caption,
        image_url: post.displayUrl,
        likes_count: post.likesCount,
        comments_count: post.commentsCount,
        posted_at: new Date(post.timestamp).toISOString(),
        metadata: post
      }));
      
      await graphqlClient.request(INSERT_SCRAPED_DATA, {
        objects: transformedData
      });
      
      // Update log entry with success
      await graphqlClient.request(UPDATE_SCRAPING_LOG, {
        id: logId,
        status: 'success',
        finished_at: new Date().toISOString(),
        items_scraped: transformedData.length,
        error_message: null
      });
      
      return {
        success: true,
        account: account.username,
        items_scraped: transformedData.length
      };
    } else {
      throw new Error('No data returned from Apify');
    }
  } catch (error) {
    // Update log entry with failure
    await graphqlClient.request(UPDATE_SCRAPING_LOG, {
      id: logId,
      status: 'failed',
      finished_at: new Date().toISOString(),
      items_scraped: 0,
      error_message: error.message
    });
    
    return {
      success: false,
      account: account.username,
      error: error.message
    };
  }
}

// Main handler function for the serverless endpoint
export default async (req, res) => {
  try {
    // Get all active Instagram accounts
    const { instagram_accounts } = await graphqlClient.request(GET_ACTIVE_ACCOUNTS);
    
    // Filter accounts based on scrape frequency
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    const accountsToScrape = instagram_accounts.filter(account => {
      switch (account.scrape_frequency) {
        case 'daily':
          return true;
        case 'weekly':
          return dayOfWeek === 1; // Monday
        case 'monthly':
          return now.getDate() === 1; // First day of month
        default:
          return true;
      }
    });
    
    if (accountsToScrape.length === 0) {
      return res.status(200).json({
        message: 'No accounts to scrape today',
        accounts_processed: 0
      });
    }
    
    // Process accounts one by one (to avoid rate limiting)
    const results = [];
    for (const account of accountsToScrape) {
      const result = await processAccount(account);
      results.push(result);
    }
    
    // Return response
    return res.status(200).json({
      message: 'Instagram scraping completed',
      accounts_processed: results.length,
      results
    });
  } catch (error) {
    console.error('Error in Instagram scraper:', error);
    return res.status(500).json({
      message: 'Error in Instagram scraper',
      error: error.message
    });
  }
}; 