import { useState } from "react";

export default function CodeRunner({ code }) {
  const [out, setOut] = useState("No output");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(e) {
    e.preventDefault();
    e.stopPropagation();

    setLoading(true);
    setErr("");
    setOut("Running...");

    try {
      const response = await fetch("https://execjs.emilfolino.se/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: btoa(code || ""),
        }),
      });

      const result = await response.json();
      console.log("EXEC RESULT:", result);

      if (!response.ok) {
        throw new Error(result?.error || `HTTP ${response.status}`);
      }

      const decoded = result?.data ? atob(result.data) : "No output";
      console.log("DECODED:", decoded);
      setOut(decoded || "No output");
    } catch (error) {
      console.error(error);
      setErr(error.message || "Något gick fel");
      setOut("No output");
    } finally {
      setLoading(false);
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