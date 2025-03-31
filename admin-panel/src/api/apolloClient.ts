import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { nhost } from '../utils/nhost';

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:1337/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get the authentication JWT token from Nhost
  const jwt = nhost.auth.getAccessToken();
  
  return {
    headers: {
      ...headers,
      authorization: jwt ? `Bearer ${jwt}` : '',
      'x-hasura-admin-secret': process.env.REACT_APP_HASURA_ADMIN_SECRET || '',
    }
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
}); 