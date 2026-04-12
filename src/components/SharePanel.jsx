import { useState } from "react";
import { api } from "../api.gql";

export default function SharePanel({ docId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function onShare() {
  if (!docId || !email.trim()) return;

  setStatus("");
  setLoading(true);

  try {
    const res = await api.shareDoc(String(docId), email.trim());

    if (!res) {
      throw new Error("Delning misslyckades (backend returnerade null).");
    }

    setEmail("");
    setStatus("Delningsinbjudan skickad.");
  } catch (err) {
    setStatus(String(err?.message || err || "Kunde inte dela dokumentet."));
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
          placeholder="E-post att dela med…"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button
          type="button"
          onClick={onShare}
          disabled={loading || !email.trim()}
        >
          {loading ? "Delar…" : "Dela"}
        </button>
      </div>

      {status && <p className="share-status">{status}</p>}
    </div>
  );
}
