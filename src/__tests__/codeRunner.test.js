import { api } from "../api";

jest.mock("../api", () => ({
  api: {
    executeCode: jest.fn(),
  },
}));

describe("code runner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sends code to executeCode", async () => {
    api.executeCode.mockResolvedValueOnce({
      output: "Hello World",
    });

    const code = "console.log('Hello World');";

    const result = await api.executeCode(code);

    expect(api.executeCode).toHaveBeenCalledWith(code);
    expect(result.output).toBe("Hello World");
  });
});