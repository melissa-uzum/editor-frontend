import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Editor from "./Editor";

const mockNavigate = jest.fn();
const mockCreateDocument = jest.fn();
const mockUpdateDocument = jest.fn();

const CREATE_DOC = { kind: "CREATE_DOC" };
const UPDATE_DOC = { kind: "UPDATE_DOC" };
const DOC = { kind: "DOC" };

jest.mock("../graphql/operations", () => ({
  CREATE_DOC: { kind: "CREATE_DOC" },
  UPDATE_DOC: { kind: "UPDATE_DOC" },
  DOC: { kind: "DOC" },
}));

jest.mock("@apollo/client/react", () => ({
  useQuery: () => ({
    data: null,
    loading: false,
    error: null,
  }),
  useMutation: (operation) => {
    if (operation?.kind === "CREATE_DOC") {
      return [mockCreateDocument, { loading: false }];
    }

    if (operation?.kind === "UPDATE_DOC") {
      return [mockUpdateDocument, { loading: false }];
    }

    return [jest.fn(), { loading: false }];
  },
}));

jest.mock("../socket", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  joinDoc: jest.fn(),
  onDocumentUpdate: jest.fn(),
  sendDocumentUpdate: jest.fn(),
  joinComments: jest.fn(),
  leaveComments: jest.fn(),
  onCommentAdded: jest.fn(),
  onCommentDeleted: jest.fn(),
}));

<<<<<<< Updated upstream
const mockNavigate = jest.fn();
=======
jest.mock("../components/CodeEditor", () => () => <div>CodeEditor</div>);
jest.mock("../components/CodeRunner", () => () => <div>CodeRunner</div>);
jest.mock("../components/CommentsPanel", () => () => <div>CommentsPanel</div>);
jest.mock("../components/SharePanel", () => () => <div>SharePanel</div>);
>>>>>>> Stashed changes

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

test("skapar nytt dokument", async () => {
<<<<<<< Updated upstream
  api.createDoc.mockResolvedValue({
    id: "99",
    title: "Ny",
    content: "Hej",
    type: "text",
    createdAt: "",
    updatedAt: "",
=======
  const user = userEvent.setup();

  mockCreateDocument.mockResolvedValue({
    data: {
      createDocument: {
        id: "99",
        title: "Ny",
        content: "Hej",
        type: "text",
      },
    },
>>>>>>> Stashed changes
  });

  render(
    <MemoryRouter>
      <Editor mode="create" />
    </MemoryRouter>
  );

<<<<<<< Updated upstream
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
=======
  await user.type(screen.getByLabelText(/titel/i), "Ny");
  await user.type(screen.getByLabelText(/innehåll/i), "Hej");
  await user.click(screen.getByRole("button", { name: /spara/i }));

  await waitFor(() => {
    expect(mockCreateDocument).toHaveBeenCalled();
  });

  expect(mockNavigate).toHaveBeenCalledWith("/doc/99");
>>>>>>> Stashed changes
});