import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  from,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";

// Error handling link with more tolerance for the mock API
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
        );
      });

      // Continue with the request even if there are GraphQL errors
      return forward(operation);
    }
    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  },
);

// Middleware to log requests for debugging
const loggingMiddleware = new ApolloLink((operation, forward) => {
  console.log(`GraphQL Request: ${operation.operationName}`);
  return forward(operation).map((response) => {
    console.log(`GraphQL Response for ${operation.operationName}:`, response);
    return response;
  });
});

// HTTP link to the GraphQL API
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/graphql",
  credentials: "include",
});

// Create a more lenient cache configuration
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        // Define policies for specific query fields
        discoveryHomepage: {
          // Return the existing data if partial data is received
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
        products: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
        campaigns: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
      },
    },
  },
});

// Create the Apollo Client instance
const apolloClient = new ApolloClient({
  link: from([errorLink, loggingMiddleware, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
      // Be more tolerant of errors
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all",
    },
    mutate: {
      errorPolicy: "all",
    },
  },
});

export default apolloClient;
