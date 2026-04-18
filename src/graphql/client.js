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
<<<<<<< Updated upstream
  const t = auth.getToken();
=======
  const token = auth.getToken();
>>>>>>> Stashed changes

  return {
    headers: {
      ...headers,
<<<<<<< Updated upstream
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
=======
      Authorization: token ? `Bearer ${token}` : "",
>>>>>>> Stashed changes
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