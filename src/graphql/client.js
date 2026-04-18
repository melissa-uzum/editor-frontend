import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { auth } from "../auth";

const graphqlUrl = (process.env.REACT_APP_GRAPHQL_URL || "").trim();

if (!graphqlUrl) {
  throw new Error("Missing REACT_APP_GRAPHQL_URL");
}

const httpLink = createHttpLink({
  uri: graphqlUrl,
});

const authLink = setContext((_, { headers }) => {
  const token = auth.getToken();

  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
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