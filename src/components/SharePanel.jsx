import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { SHARE_DOC } from "../graphql/operations";

export default function SharePanel({ docId, onSuccess }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [shareDoc] = useMutation(SHARE_DOC);

  async function onShare() {
    if (!docId || !email.trim()) return;

    setStatus("");
    setLoading(true);

    try {
      const { data } = await shareDoc({
        variables: { id: String(docId), email: email.trim() },
      });

      if (data?.shareDocument === false) {
        throw new Error("Delning misslyckades");
      }

      setStatus("Delningsinbjudan skickades framgångsrikt!");
      setEmail("");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Share error:", err);
      setStatus(`Fel: ${err.message || "Ett okänt fel inträffade"}`);
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

      {status && (
        <p className={`share-status ${status.includes("Fel") ? "error" : "success"}`}>
          {status}
        </p>
      )}
    </div>
  );
}