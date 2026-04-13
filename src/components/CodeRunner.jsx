import { useState } from "react";

export default function CodeRunner({ code }) {
  const [out, setOut] = useState("No output");

  async function run(e) {
    e.preventDefault();
    e.stopPropagation();

    console.log("RUN CLICKED");
    console.log("CODE:", code);

    setOut("BUTTON WORKS");

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
      console.log("RESULT:", result);

      const decoded = atob(result.data);
      console.log("DECODED:", decoded);

      setOut(decoded);
    } catch (error) {
      console.error(error);
      setOut("ERROR");
    }
  }

  console.log("RENDER OUT:", out);

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <button type="button" onClick={run}>
        Kör kod
      </button>

      <pre style={{ background: "#0b1020", color: "#fff", padding: 10 }}>
        {out}
      </pre>
    </div>
  );
}