import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "../auth";

const httpLink = createHttpLink({
  uri: (process.env.REACT_APP_GRAPHQL_URL || "/graphql").trim(),
});

const authLink = setContext((_, { headers }) => {
  const t = auth.getToken();

  return {
    headers: {
      ...headers,
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
  };
});

export const apollo = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only',
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});