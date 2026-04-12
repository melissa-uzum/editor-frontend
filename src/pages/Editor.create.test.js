import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Editor from "./Editor";
import { api } from "../api.gql";

jest.mock("../api.gql", () => ({
  api: {
    createDoc: jest.fn(),
    updateDoc: jest.fn(),
    getDoc: jest.fn(),
  },
}));

jest.mock("../socket", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  joinDoc: jest.fn(),
  onDocumentUpdate: jest.fn(),
  sendDocumentUpdate: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  mockNavigate.mockClear();
  api.createDoc.mockReset();
  api.updateDoc.mockReset();
  api.getDoc.mockReset();
});

test("skapar nytt dokument", async () => {
  api.createDoc.mockResolvedValue({
    id: "99",
    title: "Ny",
    content: "Hej",
    type: "text",
    createdAt: "",
    updatedAt: "",
  });

  render(
    <MemoryRouter>
      <Editor mode="create" />
    </MemoryRouter>
  );

  await userEvent.type(screen.getByLabelText(/Titel/i), "Ny");
  await userEvent.type(screen.getByLabelText(/Innehåll/i), "Hej");
  await userEvent.click(screen.getByRole("button", { name: /Skapa/i }));

  await waitFor(() => {
    expect(api.createDoc).toHaveBeenCalledWith({
      title: "Ny",
      content: "Hej",
      type: "text",
    });
  });

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/doc/99");
  });
});