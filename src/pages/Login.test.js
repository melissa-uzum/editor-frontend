import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { api } from "../api.gql";
import { auth } from "../auth";

jest.mock("../api.gql", () => ({
  api: { login: jest.fn() },
}));

jest.mock("../auth", () => ({
  auth: { setToken: jest.fn() },
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
  jest.clearAllMocks();
});

test("Login: loggar in och navigerar", async () => {
  const user = userEvent.setup();
  api.login.mockResolvedValue({
    token: "FAKE_TOKEN",
    user: { id: "1", email: "a@b.com" },
  });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText("E-post"), "a@b.com");
  await user.type(screen.getByPlaceholderText("Lösenord"), "secret");
  await user.click(screen.getByRole("button", { name: /Logga in/i }));

  await waitFor(() =>
    expect(api.login).toHaveBeenCalledWith({ email: "a@b.com", password: "secret" })
  );

  await waitFor(() => expect(auth.setToken).toHaveBeenCalledWith("FAKE_TOKEN"));

  await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/"));
});

test("Login: visar fel om token saknas", async () => {
  const user = userEvent.setup();
  api.login.mockResolvedValue({ token: null });

  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );

  await user.type(screen.getByPlaceholderText("E-post"), "a@b.com");
  await user.type(screen.getByPlaceholderText("Lösenord"), "secret");
  await user.click(screen.getByRole("button", { name: /Logga in/i }));

  expect(await screen.findByText(/Ingen token/i)).toBeInTheDocument();
});