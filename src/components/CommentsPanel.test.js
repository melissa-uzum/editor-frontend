import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import CommentsPanel from "./CommentsPanel";
import { api } from "../api.gql";
import { joinComments, onCommentAdded } from "../socket";

jest.mock("../api.gql", () => ({
  api: { listComments: jest.fn() },
}));
jest.mock("../socket", () => ({
  joinComments: jest.fn(),
  leaveComments: jest.fn(),
  onCommentAdded: jest.fn(),
  onCommentUpdated: jest.fn(),
  onCommentDeleted: jest.fn(),
  sendCommentAdd: jest.fn(),
  sendCommentDelete: jest.fn(),
}));

test("CommentsPanel: laddar kommentarer och hanterar live comment via socket", async () => {
  api.listComments.mockResolvedValue([
    { id: "c1", documentId: "d1", lineNumber: 1, content: "Hej" },
  ]);

  let addedHandler = null;
  onCommentAdded.mockImplementation((fn) => {
    addedHandler = fn;
  });

  render(<CommentsPanel docId="d1" content={"rad1\nrad2"} />);

  expect(joinComments).toHaveBeenCalledWith("d1");
  expect(await screen.findByText("Hej")).toBeInTheDocument();

  act(() => {
    addedHandler({
      comment: { id: "c2", documentId: "d1", lineNumber: 2, content: "Ny!" },
    });
  });

  await waitFor(() => {
    expect(screen.getByText("Ny!")).toBeInTheDocument();
  });
});