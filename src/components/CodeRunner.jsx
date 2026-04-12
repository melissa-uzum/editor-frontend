import { useState } from "react";
import { toBase64Unicode } from "../utils/base64";
import { api } from "../api.gql";

export default function CodeRunner({ code }) {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

    async function run() {
    setLoading(true);
    setOut("");
    setErr("");
    try {
      const body = toBase64Unicode(code || "");
      const result = await api.executeCode(body);
      setOut(String(result ?? ""));
    } catch (e) {
      setErr(String(e.message || e));
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