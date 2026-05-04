import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SharePanel from "../components/SharePanel";
import { api } from "../api";

jest.mock("../api", () => ({
  api: {
    shareDoc: jest.fn(),
  },
}));

describe("SharePanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shares a document with an email", async () => {
    api.shareDoc.mockResolvedValueOnce({ success: true });

    render(<SharePanel docId="123" />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "test@example.com" },
    });

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(api.shareDoc).toHaveBeenCalledWith("123", "test@example.com");
    });
  });

  test("does not share when email is empty", () => {
    render(<SharePanel docId="123" />);

    fireEvent.click(screen.getByRole("button"));

    expect(api.shareDoc).not.toHaveBeenCalled();
  });
});