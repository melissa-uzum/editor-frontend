import { useState } from "react";
import { toBase64Unicode, fromBase64Unicode } from "../utils/base64";

export default function CodeRunner({ code }) {
  const [loading, setLoading] = useState(false);
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setOut("");
    setErr("");
    try {
      const b64Code = toBase64Unicode(code);
      const response = await fetch("https://execjs.emilfolino.se/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: b64Code }),
      });

      const result = await response.json();

      if (result.stdout) {
        setOut(fromBase64Unicode(result.stdout));
      } else if (result.stderr) {
        setErr(fromBase64Unicode(result.stderr));
      } else {
        setOut("No output");
      }
    } catch (e) {
      setErr(String(e.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={run} disabled={loading || !code?.trim()}>Kör kod</button>
      {loading && <span>Exekverar...</span>}
      {err && <pre style={{ color: "crimson", whiteSpace: "pre-wrap" }}>{err}</pre>}
      {out && (
        <pre style={{ background: "#0b1020", color: "#c7e1ff", padding: 12, borderRadius: 6 }}>
          {out}
        </pre>
      )}
    </div>
  );
}