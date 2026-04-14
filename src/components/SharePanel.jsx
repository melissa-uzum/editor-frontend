import { useState } from "react";
import { api } from "../api";

export default function SharePanel({ docId, onSuccess }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onShare() {
    if (!docId || !email.trim()) return;

    setStatus("");
    setLoading(true);

    try {
      const result = await api.shareDoc(String(docId), email.trim());

      if (result === null) {
        setStatus("Det gick inte att dela dokumentet. Kontrollera att mottagaren finns registrerad.");
      } else {
        setStatus("Delningsinbjudan skickades framgångsrikt!");
        setEmail("");
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Share error:", err);
      setStatus("Ett tekniskt fel uppstod. Försök igen senare.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      onShare();
    }
  }

  return (
    <div className="share-panel">
      <h3>Dela dokument</h3>
      <div className="share-form">
        <input
          type="email"
          placeholder="E-postadress..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          onClick={onShare}
          disabled={loading || !email.trim()}
        >
          {loading ? "Skickar…" : "Dela"}
        </button>
      </div>
      {status && (
        <p className={`share-status ${status.includes("fel") ? "error" : "success"}`}>
          {status}
        </p>
      )}
    </div>
  );
}