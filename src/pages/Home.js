import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

export default function Home() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.listDocs()
      .then(setDocs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    try {
      await api.deleteDoc(id);
      setDocs(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      setError(String(e.message || e));
    }
  }

  if (loading) return <p>Laddar…</p>;
  if (error) return <p style={{ color: "crimson" }}>Fel: {error}</p>;

  return (
    <>
      <h1>Dokument</h1>
      {docs.length === 0 && <p>Inga dokument ännu.</p>}

      <ul className="doc-list">
        {docs.map(d => (
          <li key={d.id} className="doc-item">
            <Link to={`/doc/${d.id}`}>{d.title || "(utan titel)"}</Link>
            <button
              className="btn"
              onClick={() => handleDelete(d.id)}
              aria-label={`Ta bort ${d.title || "dokument"}`}
            >
              Ta bort
            </button>
          </li>
        ))}
      </ul>

      <p>
        <Link className="btn btn-primary" to="/new">+ Skapa nytt</Link>
      </p>
    </>
  );
}
