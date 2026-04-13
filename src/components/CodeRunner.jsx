import { useState } from "react";
import { auth } from "../auth";

export default function CodeRunner({ code, documentId }) {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setOut("");
    setErr("");
    try {
      const token = auth.getToken();
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/docs/${documentId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code: code }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to execute");

      let outputText = result.output || "No output";
      try {
        outputText = atob(outputText);
      } catch (e) {
      }

      setOut(outputText);
    } catch (e) {
      setErr(String(e.message));
    } finally {
      setLoading(false);
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