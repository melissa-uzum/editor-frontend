import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CommentsPanel from "./CommentsPanel";

const mockAddComment = jest.fn();
const mockDeleteComment = jest.fn();
const mockRefetch = jest.fn();

jest.mock("../graphql/operations", () => ({
  ADD_COMMENT: { kind: "ADD_COMMENT" },
  DELETE_COMMENT: { kind: "DELETE_COMMENT" },
  LIST_COMMENTS: { kind: "LIST_COMMENTS" },
}));

jest.mock("@apollo/client/react", () => ({
  useQuery: () => ({
    data: {
      comments: [
        {
          id: "c1",
          documentId: "doc1",
          lineNumber: 2,
          content: "Testkommentar",
          resolved: false,
          author: { id: "u1", username: "mel" },
        },
      ],
    },
    loading: false,
    error: null,
    refetch: mockRefetch,
  }),
  useMutation: (operation) => {
    if (operation?.kind === "ADD_COMMENT") {
      return [mockAddComment, { loading: false }];
    }

    if (operation?.kind === "DELETE_COMMENT") {
      return [mockDeleteComment, { loading: false }];
    }

    return [jest.fn(), { loading: false }];
  },
}));

jest.mock("../socket", () => ({
  joinComments: jest.fn(),
  leaveComments: jest.fn(),
  onCommentAdded: jest.fn(),
  onCommentDeleted: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

test("visar befintliga kommentarer för vald rad", async () => {
  render(
    <CommentsPanel
      docId="doc1"
      selectedLine={2}
      onSelectLine={() => {}}
    />
  );

  await waitFor(() => {
    expect(screen.getByText("Testkommentar")).toBeInTheDocument();
  });
});

test("lägger till kommentar för vald rad", async () => {
  mockAddComment.mockResolvedValue({
    data: {
      createComment: {
        id: "c2",
        documentId: "doc1",
        lineNumber: 2,
        content: "Ny kommentar",
        resolved: false,
        author: { id: "u1", username: "mel" },
      },
    },
  });

  render(
    <CommentsPanel
      docId="doc1"
      selectedLine={2}
      onSelectLine={() => {}}
    />
  );

  const input = screen.getByPlaceholderText(/skriv kommentar för rad 2/i);
  fireEvent.change(input, { target: { value: "Ny kommentar" } });
  fireEvent.click(screen.getByRole("button", { name: /lägg till kommentar/i }));

  await waitFor(() => {
    expect(mockAddComment).toHaveBeenCalled();
  });
});