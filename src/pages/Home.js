import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.gql";
import { auth } from "../auth";

export default function Home() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthed()) {
      navigate("/login");
      return;
    }
    api.listDocs()
      .then(setDocs)
      .catch(e => { if(e.status !== 401) setError(e.message); })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p>Laddar…</p>;
  if (error) return <p style={{ color: "crimson" }}>Fel: {error}</p>;

  return (
    <>
      <h1>Dokument</h1>
      <ul className="doc-list">
        {docs.map(d => (
          <li key={d.id}><Link to={`/doc/${d.id}`}>{d.title || "(utan titel)"}</Link></li>
        ))}
      </ul>
      <p><Link to="/new">+ Skapa nytt</Link></p>
    </>
  );
}