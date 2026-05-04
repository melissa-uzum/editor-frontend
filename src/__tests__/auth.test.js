import { auth } from "../auth";

describe("auth", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("saves token in localStorage", () => {
    auth.setToken("test-token");

    expect(localStorage.getItem("token")).toBe("test-token");
  });

  test("gets token from localStorage", () => {
    localStorage.setItem("token", "abc123");

    expect(auth.getToken()).toBe("abc123");
  });
});