import { useMutation, useQuery } from "@apollo/client/react";
import { Link, useNavigate } from "react-router-dom";
import { DELETE_DOC, GET_DOCUMENTS } from "../graphql/operations";
import { auth } from "../auth";

export default function Home() {
  const navigate = useNavigate();

  const { data, loading, error, refetch } = useQuery(GET_DOCUMENTS, {
    fetchPolicy: "network-only",
    onError: (err) => {
      const msg = String(err?.message || "");
      if (msg.includes("Authentication required")) {
        auth.clear();
        navigate("/login");
      }
    },
  });

  const [deleteDocument, { loading: deleting }] = useMutation(DELETE_DOC, {
    onError: (err) => {
      const msg = String(err?.message || "");
      if (msg.includes("Authentication required")) {
        auth.clear();
        navigate("/login");
      }
    },
  });

  async function handleDelete(id) {
    try {
      await deleteDocument({
        variables: { id: String(id) },
      });
      await refetch();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) return <p>Laddar…</p>;
  if (error) return <p style={{ color: "crimson" }}>Fel: {error.message}</p>;

  const docs = data?.documents || [];

  return (
    <>
      <h1>Dokument</h1>
      {docs.length === 0 && <p>Inga dokument ännu.</p>}

      <ul className="doc-list">
        {docs.map((d) => (
          <li key={d.id} className="doc-item">
            <Link to={`/doc/${d.id}`}>{d.title || "(utan titel)"}</Link>
            <button
              className="btn"
              onClick={() => handleDelete(d.id)}
              aria-label={`Ta bort ${d.title || "dokument"}`}
              disabled={deleting}
            >
              Ta bort
            </button>
          </li>
        ))}
      </ul>

      <p>
        <Link className="btn btn-primary" to="/new">
          + Skapa nytt
        </Link>
      </p>
    </>
  );
}