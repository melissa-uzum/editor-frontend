jest.mock("../api.gql", () => ({
  api: {
    executeCode: jest.fn(),
  },
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CodeRunner from "./CodeRunner";
import { api } from "../api.gql";

beforeEach(() => {
  api.executeCode.mockResolvedValue("hej");
});

afterEach(() => {
  jest.clearAllMocks();
});

test("kör kod och visar output", async () => {
  const user = userEvent.setup();

  render(<CodeRunner code={`console.log("hej");`} />);

  await user.click(screen.getByRole("button", { name: /kör/i }));

  expect(await screen.findByText(/hej/i)).toBeInTheDocument();
});