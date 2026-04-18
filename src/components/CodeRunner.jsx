import { useState } from "react";
<<<<<<< Updated upstream
import { toBase64Unicode } from "../utils/base64";
import { api } from "../api.gql";

export default function CodeRunner({ code }) {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

    async function run() {
    setLoading(true);
    setOut("");
=======
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

>>>>>>> Stashed changes
    setErr("");
    try {
<<<<<<< Updated upstream
      const body = toBase64Unicode(code || "");
      const result = await api.executeCode(body);
      setOut(String(result ?? ""));
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
=======
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
>>>>>>> Stashed changes
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={run} disabled={loading || !code?.trim()}>Kör</button>
        {loading && <span>Kör…</span>}
      </div>

      {err && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{err}</pre>}

      {out !== "" && (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Output</div>
          <pre style={{ background: "#0b1020", color: "#c7e1ff", padding: 12, borderRadius: 6, overflow: "auto" }}>
            {out}
          </pre>
        </div>
      )}
    </div>
  );
}