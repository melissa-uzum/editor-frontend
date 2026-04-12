import { useEffect, useMemo, useState } from "react";
import { api } from "../api.gql";
import {
  joinComments,
  leaveComments,
  onCommentAdded,
  onCommentDeleted,
  sendCommentAdd,
  sendCommentDelete,
} from "../socket";

function toLines(text) {
  return (text || "").split(/\r?\n/);
}

const toId = (x) => x?.id ?? x?._id;

export default function CommentsPanel({ docId, content }) {
  const [items, setItems] = useState([]);
  const [line, setLine] = useState(1);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const lines = useMemo(() => toLines(content), [content]);

  useEffect(() => {
    let alive = true;

    async function load() {
      if (!docId) return;
      try {
        const list = await api.listComments(docId);
        if (!alive) return;
        setItems(Array.isArray(list) ? list : []);
      } catch {
        if (!alive) return;
        setItems([]);
      }
    }

    if (!docId) {
      setItems([]);
      return () => {};
    }

    setError("");
    joinComments(docId);
    load();

    onCommentAdded((payload) => {
      const c = payload?.comment ?? payload;
      if (!c) return;

      const incomingDocId = String(c?.documentId ?? "");
      if (incomingDocId !== String(docId)) return;

      const id = String(toId(c) ?? "");

      setItems((prev) => {
        if (id && prev.some((x) => String(toId(x)) === id)) {
          return prev;
        }
        return [{ ...c, id }, ...prev];
      });
    });

    onCommentDeleted((payload) => {
      const id = String(payload?.commentId ?? "");
      if (!id) return;

      setItems((prev) =>
        prev.filter((c) => String(toId(c)) !== id)
      );
    });

    return () => {
      alive = false;
      leaveComments(docId);
    };
  }, [docId]);

  function handleDelete(commentId) {
    if (!commentId || !docId) return;

    setItems((prev) => prev.filter((c) => String(toId(c)) !== String(commentId)));

    sendCommentDelete(
      { commentId: String(commentId), documentId: String(docId) },
      (ack) => {
        if (ack?.status !== "ok") {
          api.listComments(docId)
            .then((list) => setItems(Array.isArray(list) ? list : []))
            .catch(() => {});
        }
      }
    );
  }

  async function submit() {
    if (!docId) return;
    const clean = text.trim();
    if (!clean) return;

    setPosting(true);
    setError("");

    const payload = {
      documentId: String(docId),
      lineNumber: Number(line) || 1,
      content: clean,
    };

    sendCommentAdd(payload, (ack) => {
      if (ack?.status !== "ok") {
        setError(ack?.message || "Kunde inte skapa kommentar");
      }
      setPosting(false);
    });

    setText("");
  }

  return (
    <div className="comments-panel">
      <div className="comment-form">
        <select value={line} onChange={(e) => setLine(e.target.value)}>
          {lines.map((_, i) => (
            <option key={i} value={i + 1}>
              Rad {i + 1}
            </option>
          ))}
        </select>

        <input
          placeholder="Ny kommentar…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={submit} disabled={posting || !text.trim()}>
          {posting ? "Skickar…" : "Lägg till"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <ul className="comment-list">
        {items.map((c) => (
          <li key={String(toId(c))}>
            <span className="comment-line">Rad {c.lineNumber}</span>
            <span className="comment-text">{c.content}</span>
            <button onClick={() => handleDelete(toId(c))}>
              Ta bort
            </button>
          </li>
        ))}
        {!items.length && <li>Inga kommentarer ännu.</li>}
      </ul>
    </div>
  );
}