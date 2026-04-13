import { useState } from "react";
import { toBase64Unicode } from "../utils/base64";

export default function CodeRunner({ code }) {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setOut("");
    setErr("");
    try {
      const b64 = toBase64Unicode(code || "");
      const response = await fetch("https://execjs.emilfolino.se/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: b64 }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to execute");
      setOut(String(result.stdout || result.stderr || "No output"));
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