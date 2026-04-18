import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { EXECUTE_CODE } from "../graphql/operations";

function toBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str || "")));
  } catch {
    return btoa(str || "");
  }
}

export default function CodeRunner({ code }) {
  const [out, setOut] = useState("No output");
  const [err, setErr] = useState("");

  const [executeCode, { loading }] = useMutation(EXECUTE_CODE);

  async function run(e) {
    e.preventDefault();
    e.stopPropagation();

    setErr("");
    setOut("Running...");

    try {
      const codeBase64 = toBase64(code || "");

      const response = await executeCode({
        variables: { codeBase64 },
      });

      const result = response?.data?.executeCode;

      if (!result) {
        throw new Error("Ingen exekveringsdata returnerades.");
      }

      const stdout = result.stdout || "";
      const stderr = result.stderr || "";

      if (stderr) {
        setErr(stderr);
      }

      setOut(stdout || (stderr ? "Execution finished with errors" : "No output"));
    } catch (error) {
      console.error(error);
      setErr("Exekveringsfel: " + (error?.message || error));
      setOut("No output");
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button type="button" onClick={run} disabled={loading}>
        {loading ? "Exekverar..." : "Kör kod"}
      </button>

      {err ? (
        <pre style={{ color: "crimson" }}>{err}</pre>
      ) : (
        <pre style={{ background: "#0b1020", color: "#fff", padding: 10 }}>
          {out}
        </pre>
      )}
    </div>
  );
}