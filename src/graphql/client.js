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
      Authorization: t ? `Bearer ${t}` : "",
    },
  };
});

export const apollo = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: { fetchPolicy: "network-only" },
    mutate: { fetchPolicy: "network-only" },
  },
});