import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Home from "./Home";

jest.mock("../api", () => ({
  api: {
    listDocs: jest.fn(),
  },
}));

import { api } from "../api";

test("renders Dokument heading", async () => {
  api.listDocs.mockResolvedValueOnce([]);

  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(
    await screen.findByRole("heading", { name: /Dokument/i })
  ).toBeInTheDocument();

  expect(screen.getByText(/Inga dokument ännu/i)).toBeInTheDocument();
});
