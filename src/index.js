import React from "react";
import ReactDOM from "react-dom/client";
import { ApolloProvider } from "@apollo/client/react";
import App from "./App";
import { apollo } from "./graphql/client";

const rootEl = document.getElementById("root");
rootEl.classList.add("fe-app");

const root = ReactDOM.createRoot(rootEl);
root.render(
  <React.StrictMode>
    <ApolloProvider client={apollo}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);