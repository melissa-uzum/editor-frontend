import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./Home";
import { api } from "../api.gql";

jest.mock("../api.gql");

test("Home: visar docs och tar bort doc vid delete", async () => {
  api.listDocs.mockResolvedValue([
    { id: "d1", title: "Doc 1" },
    { id: "d2", title: "Doc 2" },
  ]);
  api.deleteDoc.mockResolvedValue(null);

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(await screen.findByText("Doc 1")).toBeInTheDocument();
  expect(screen.getByText("Doc 2")).toBeInTheDocument();

  fireEvent.click(screen.getAllByRole("button", { name: /ta bort/i })[0]);

  await waitFor(() => {
    expect(screen.queryByText("Doc 1")).not.toBeInTheDocument();
  });
});