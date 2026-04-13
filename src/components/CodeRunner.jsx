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

      setOut(result.output || "No output");
    } catch (e) {
      setErr(String(e.message));
    } finally {
      setLoading(false);
    }
  }

  return (

  );
}