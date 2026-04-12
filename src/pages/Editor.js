import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.gql";
import { connect, disconnect, joinDoc, onDocumentUpdate, sendDocumentUpdate } from "../socket";
import { debounce } from "../utils/debounce";
import CodeEditor from "../components/CodeEditor";
import CodeRunner from "../components/CodeRunner";
import CommentsPanel from "../components/CommentsPanel";
import SharePanel from "../components/SharePanel";

export default function Editor({ mode }) {
  const isCreate = mode === "create";
  const { id } = useParams();
  const nav = useNavigate();

  const [docId, setDocId] = useState(isCreate ? "" : String(id));
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const applyingRemote = useRef(false);

  useEffect(() => {
  connect();

  return () => {
    if (process.env.NODE_ENV !== "development") {
      disconnect();
    }
  };
}, []);


  useEffect(() => {
    let alive = true;

    async function load() {
      if (isCreate) {
        setDocId("");
        setTitle("");
        setType("text");
        setContent("");
        setLoading(false);
        return;
      }

      try {
        const d = await api.getDoc(id);
        if (!alive) return;

        const resolvedId = String(d.id || id);
        setDocId(resolvedId);
        setTitle(d.title || "");
        setType(d.type || "text");
        setContent(d.content || "");

        joinDoc(resolvedId);

        onDocumentUpdate((payload) => {
          if (!payload) return;

          const payloadDocId = String(payload.documentId ?? payload.docId ?? payload.id ?? "");
          if (payloadDocId && payloadDocId !== resolvedId) return;

          applyingRemote.current = true;

          if (typeof payload.title === "string") setTitle(payload.title);
          if (typeof payload.type === "string") setType(payload.type);
          if (typeof payload.content === "string") setContent(payload.content);

          queueMicrotask(() => {
            applyingRemote.current = false;
          });
        });
      } catch (e) {
        setError(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [id, isCreate]);

  const emitChange = useMemo(
    () =>
      debounce((next) => {
        if (!next.documentId) return;

        sendDocumentUpdate({
          documentId: next.documentId,
          title: next.title,
          content: next.content,
        });
      }, 180),
    []
  );

  function onTitle(e) {
    const v = e.target.value;
    setTitle(v);
    if (!applyingRemote.current && !isCreate) {
      emitChange({ documentId: docId || id, title: v, content });
    }
  }

  function onType(e) {
    const v = e.target.value;
    setType(v);
  }

  function onContentChange(v) {
    setContent(v);
    if (!applyingRemote.current && !isCreate) {
      emitChange({ documentId: docId || id, title, content: v });
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (isCreate) {
        const created = await api.createDoc({ title, content, type });
        nav(`/doc/${created.id}`);
      } else {
        await api.updateDoc(docId || id, { title, content, type });
        nav(`/doc/${docId || id}`);
      }
    } catch (e2) {
      setError(String(e2?.message || e2));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Laddar…</p>;

  return (
    <form onSubmit={onSubmit} className="new-doc" style={{ display: "grid", gap: 16 }}>
      <h1>{isCreate ? "Nytt dokument" : "Redigera dokument"}</h1>
      {error && <p style={{ color: "crimson" }}>Fel: {error}</p>}

      <label>
        Titel
        <input value={title} onChange={onTitle} required />
      </label>

      <label>
        Typ
        <select value={type} onChange={onType}>
          <option value="text">Text</option>
          <option value="code">Code (JavaScript)</option>
        </select>
      </label>

      {type === "code" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <CodeEditor value={content} onChange={onContentChange} language="javascript" />
          <CodeRunner code={content} />
        </div>
      ) : (
        <label style={{ display: "block" }}>
          Innehåll
          <textarea rows={12} value={content} onChange={(e) => onContentChange(e.target.value)} required />
        </label>
      )}

      {!isCreate && (
        <div style={{ display: "grid", gap: 12 }}>
          <SharePanel docId={docId || id} />
          <div>
            <h3>Kommentarer</h3>
            <CommentsPanel docId={docId || id} content={content} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Sparar…" : isCreate ? "Skapa" : "Spara"}
        </button>
        <button type="button" className="btn" onClick={() => nav("/")}>
          Avbryt
        </button>
      </div>
    </form>
  );
}
