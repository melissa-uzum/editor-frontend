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
      const response = await shareDoc({
        variables: {
          id: String(docId),
          email: email.trim(),
        },
        errorPolicy: "all",
      });
      const { errors } = response;
      if (errors?.length) {
        throw new Error(errors[0].message);
      }
      setStatus("Delningsinbjudan skickades!");
      setEmail("");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Share error:", err);
      setStatus(`Fel: ${err.message}`);
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