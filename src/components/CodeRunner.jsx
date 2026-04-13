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
      console.log("CODE SENT TO EXECJS:", code);

      const response = await fetch("https://execjs.emilfolino.se/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: toBase64Unicode(code || ""),
        }),
      });

      const result = await response.json();
      console.log("EXECJS RESULT:", result);

      if (!response.ok) {
        throw new Error(result?.error || `HTTP ${response.status}`);
      }

      if (result?.data) {
        setOut(fromBase64Unicode(result.data));
      } else {
        setOut("No output");
      }
    } catch (e) {
      console.error("EXEC ERROR:", e);
      setErr(e.message || "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button onClick={run} disabled={loading}>
        {loading ? "Exekverar..." : "Kör kod"}
      </button>

      {err && <pre style={{ color: "crimson" }}>{err}</pre>}

      <pre style={{ background: "#0b1020", color: "#fff", padding: 10 }}>
        {out || "No output"}
      </pre>
    </div>
  );
}