import { useState } from "react";

function toBase64(str) {
  try {
    return btoa(unescape(encodeURIComponent(str || "")));
  } catch {
    return btoa(str || "");
  }
}

function fromBase64(str) {
  try {
    return decodeURIComponent(escape(atob(str || "")));
  } catch {
    return atob(str || "");
  }
}

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
          code: toBase64(code || ""),
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json?.errors?.[0]?.detail || json?.message || "Execution failed");
      }

      if (!json?.data) {
        throw new Error("Ingen exekveringsdata returnerades.");
      }

      const decoded = fromBase64(json.data);
      setOut(decoded || "No output");
    } catch (error) {
      console.error(error);
      setErr("Exekveringsfel: " + (error?.message || error));
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