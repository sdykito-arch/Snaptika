import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  split,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

// HTTP Link
const httpLink = createHttpLink({
  uri: process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:3000/graphql',
});

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: process.env.REACT_APP_WS_URL || 'ws://localhost:3000/graphql',
    connectionParams: () => {
      const token = localStorage.getItem('token');
      return {
        authorization: token ? `Bearer ${token}` : '',
      };
    },
  })
);

// Auth Link
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      
      // Handle authentication errors
      if (message.includes('Unauthorized') || message.includes('jwt')) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    });
  }

  if (networkError) {
    console.error(`Network error: ${networkError}`);
    
    // Handle network errors
    if (networkError.statusCode === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  }
});

// Split link for HTTP and WebSocket
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
);

// Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          feed: {
            keyArgs: [],
            merge(existing = { posts: [], total: 0, hasMore: true }, incoming) {
              return {
                ...incoming,
                posts: [...existing.posts, ...incoming.posts],
              };
            },
          },
          posts: {
            keyArgs: ['hashtag', 'userId'],
            merge(existing = { posts: [], total: 0, hasMore: true }, incoming) {
              return {
                ...incoming,
                posts: [...existing.posts, ...incoming.posts],
              };
            },
          },
          users: {
            keyArgs: ['search'],
            merge(existing = { users: [], total: 0, hasMore: true }, incoming) {
              return {
                ...incoming,
                users: [...existing.users, ...incoming.users],
              };
            },
          },
          notifications: {
            keyArgs: [],
            merge(existing = { notifications: [], total: 0, hasMore: true }, incoming) {
              return {
                ...incoming,
                notifications: [...existing.notifications, ...incoming.notifications],
              };
            },
          },
        },
      },
      User: {
        fields: {
          followersCount: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          followingCount: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      Post: {
        fields: {
          likesCount: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          commentsCount: {
            merge(existing, incoming) {
              return incoming;
            },
          },
          viewsCount: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
