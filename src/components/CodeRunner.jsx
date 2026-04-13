import { useState } from "react";
import { fromBase64Unicode } from "../utils/base64";

export default function CodeRunner({ code }) {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setOut("");
    setErr("");
    try {
      const response = await fetch("https://execjs.emilfolino.se/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: btoa(code) }),
      });

      const result = await response.json();

      const b64Value = result.data || result.stdout;

      if (b64Value) {
        try {
          setOut(fromBase64Unicode(b64Value));
        } catch (e) {
          setOut("Kunde inte avkoda: " + b64Value);
        }
      } else {
        setOut("No output");
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={run} disabled={loading}>Kör kod</button>
      {loading && <span>Exekverar...</span>}
      {err && <pre style={{ color: "crimson" }}>{err}</pre>}
      {out && <pre style={{ background: "#0b1020", color: "#fff", padding: 10 }}>{out}</pre>}
    </div>
  );
}