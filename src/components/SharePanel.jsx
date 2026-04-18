import { useState } from "react";
<<<<<<< Updated upstream
import { api } from "../api.gql";
=======
import { SHARE_DOC } from "../graphql/operations";
import { useMutation } from "@apollo/client/react";
>>>>>>> Stashed changes

export default function SharePanel({ docId }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [shareDoc] = useMutation(SHARE_DOC);

  async function onShare() {
  if (!docId || !email.trim()) return;

  setStatus("");
  setLoading(true);

<<<<<<< Updated upstream
  try {
    const res = await api.shareDoc(String(docId), email.trim());

    if (!res) {
      throw new Error("Delning misslyckades (backend returnerade null).");
=======
    try {
      await shareDoc({
        variables: { id: docId, email: email.trim() }
      });

      setStatus("Delningsinbjudan skickades framgångsrikt!");
      setEmail("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Share error:", err);
      setStatus(`Fel: ${err.message || "Ett okänt fel inträffade"}`);
    } finally {
      setLoading(false);
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream

      {status && <p className="share-status">{status}</p>}
=======
      {status && (
        <p className={`share-status ${status.includes("Fel") ? "error" : "success"}`}>
          {status}
        </p>
      )}
>>>>>>> Stashed changes
    </div>
  );
}
