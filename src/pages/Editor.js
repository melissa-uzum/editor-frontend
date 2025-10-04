import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

export default function Editor({ mode }) {
  const isCreate = mode === "create";
  const { id } = useParams();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isCreate) {
      api.getDoc(id)
        .then(d => {
          setTitle(d.title || "");
          setContent(d.content || "");
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isCreate]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isCreate) {
        const created = await api.createDoc({ title, content });
        nav(`/doc/${created.id}`);
      } else {
        await api.updateDoc(id, { title, content });
         nav(`/doc/${id}`);
    }
    } catch (e) {
      setError(String(e.message || e));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Laddar…</p>;

return (
  <form onSubmit={onSubmit} className="new-doc">
    <h1>{isCreate ? "Nytt dokument" : "Redigera dokument"}</h1>
    {error && <p style={{ color: "crimson" }}>Fel: {error}</p>}

    <label>
      Titel
      <input value={title} onChange={e => setTitle(e.target.value)} required />
    </label>

    <label>
      Innehåll
      <textarea rows={12} value={content} onChange={e => setContent(e.target.value)} required />
    </label>

    <div style={{ display: "flex", gap: 12 }}>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Sparar…" : isCreate ? "Skapa" : "Spara"}
      </button>
      <button type="button" className="btn" onClick={() => nav("/")}>Avbryt</button>
    </div>
  </form>
);
}
