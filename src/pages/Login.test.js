import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { auth } from "../auth";

const mockNavigate = jest.fn();
const mockLoginMutation = jest.fn();

jest.mock("../graphql/operations", () => ({
  LOGIN: {},
}));

jest.mock("../auth", () => ({
  auth: { setToken: jest.fn() },
}));

jest.mock("@apollo/client/react", () => ({
  useMutation: () => [mockLoginMutation, { loading: false }],
}));

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

test("Login: loggar in och navigerar", async () => {
  const user = userEvent.setup();

  mockLoginMutation.mockResolvedValue({
    data: {
      login: {
        token: "FAKE_TOKEN",
        user: { id: "1", email: "a@b.com" },
      },
    },
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText("E-post"), "a@b.com");
  await user.type(screen.getByPlaceholderText("Lösenord"), "secret");
  await user.click(screen.getByRole("button", { name: /logga in/i }));

  await waitFor(() => {
    expect(auth.setToken).toHaveBeenCalledWith("FAKE_TOKEN");
  });

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});

test("Login: visar fel om token saknas", async () => {
  const user = userEvent.setup();

  mockLoginMutation.mockResolvedValue({
    data: {
      login: {
        token: null,
      },
    },
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText("E-post"), "a@b.com");
  await user.type(screen.getByPlaceholderText("Lösenord"), "secret");
  await user.click(screen.getByRole("button", { name: /logga in/i }));

  expect(await screen.findByText(/ingen token/i)).toBeInTheDocument();
});