# Instagram Scraper Admin Panel

A React-based admin panel for managing Instagram accounts to be scraped using Apify's Instagram Scraper.

## Features

- User authentication and authorization
- Dashboard with statistics on Instagram accounts and scraping jobs
- Manage Instagram accounts (add, edit, delete, enable/disable)
- View and filter scraping logs
- Manually trigger scraping jobs
- Scheduled scraping using Hasura cron jobs

## Tech Stack

- **Frontend**: React, TypeScript, React Router, Apollo Client, Bootstrap
- **Backend**: Hasura GraphQL API, PostgreSQL, Nhost Auth
- **Services**: Apify for Instagram scraping

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file with the following environment variables:

```
REACT_APP_GRAPHQL_URL=http://localhost:1337/v1/graphql
REACT_APP_AUTH_URL=http://localhost:1337/v1/auth
REACT_APP_HASURA_ADMIN_SECRET=your-hasura-admin-secret
```

3. Start the development server:

```bash
npm start
```

## Deployment

1. Build the production-ready app:

```bash
npm run build
```

2. Deploy the contents of the `build` folder to your hosting provider.

## Integration with Apify

This admin panel works with the Apify platform to scrape Instagram data. Make sure to:

1. Create an Apify account and get your API token
2. Configure the backend to use your Apify token for API calls
3. Set up the relevant Apify actor for Instagram scraping

## Hasura/Backend Integration

This admin panel connects to a Hasura GraphQL API. Ensure you have:

1. Set up the required database tables in PostgreSQL
2. Configured Hasura to expose the GraphQL API
3. Set up authentication and proper permissions
4. Created the necessary cron jobs for scheduled scraping 