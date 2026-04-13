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

  async function loadDoc() {
    if (isCreate) return;
    try {
      const d = await api.getDoc(id);
      const resolvedId = String(d.id || id);
      setDocId(resolvedId);
      setTitle(d.title || "");
      setType(d.type || "text");
      setContent(d.content || "");
      joinDoc(resolvedId);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    connect();
    loadDoc();

    onDocumentUpdate((payload) => {
      if (!payload) return;
      applyingRemote.current = true;
      if (typeof payload.title === "string") setTitle(payload.title);
      if (typeof payload.type === "string") setType(payload.type);
      if (typeof payload.content === "string") setContent(payload.content);
      queueMicrotask(() => { applyingRemote.current = false; });
    });

    return () => { disconnect(); };
  }, [id, isCreate]);

  const emitChange = useMemo(() => debounce((next) => {
    sendDocumentUpdate({
      documentId: next.documentId,
      title: next.title,
      content: next.content,
    });
  }, 180), []);

  function onTitle(e) {
    const v = e.target.value;
    setTitle(v);
    if (!applyingRemote.current && !isCreate) emitChange({ documentId: docId || id, title: v, content });
  }

  function onContentChange(v) {
    setContent(v);
    if (!applyingRemote.current && !isCreate) emitChange({ documentId: docId || id, title, content: v });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isCreate) {
        const created = await api.createDoc({ title, content, type });
        nav(`/doc/${created.id}`);
      } else {
        await api.updateDoc(docId || id, { title, content, type });
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
      <label>Titel <input value={title} onChange={onTitle} required /></label>
      <label>Typ <select value={type} onChange={(e) => setType(e.target.value)}><option value="text">Text</option><option value="code">Code (JavaScript)</option></select></label>
      {type === "code" ? (
        <div style={{ display: "grid", gap: 12 }}>
          <CodeEditor value={content} onChange={onContentChange} language="javascript" />
          <CodeRunner code={content} />
        </div>
      ) : (
        <label>Innehåll <textarea rows={12} value={content} onChange={(e) => onContentChange(e.target.value)} required /></label>
      )}
      {!isCreate && (
        <div style={{ display: "grid", gap: 12 }}>
          <SharePanel docId={docId || id} onSuccess={loadDoc} />
          <div>
            <h3>Kommentarer</h3>
            <CommentsPanel docId={docId || id} content={content} />
          </div>
        </div>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Sparar…" : "Spara"}</button>
      </div>
    </form>
  );
}