import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useNavigate, useParams } from "react-router-dom";
import { CREATE_DOC, DOC, UPDATE_DOC } from "../graphql/operations";
import {
  connect,
  disconnect,
  joinDoc,
  onDocumentUpdate,
  sendDocumentUpdate,
} from "../socket";
import { debounce } from "../utils/debounce";
import CodeEditor from "../components/CodeEditor";
import CodeRunner from "../components/CodeRunner";
import CommentsPanel from "../components/CommentsPanel";
import SharePanel from "../components/SharePanel";
import { auth } from "../auth";

function splitLines(text) {
  return (text || "").split(/\r?\n/);
}

export default function Editor({ mode }) {
  const isCreate = mode === "create";
  const { id } = useParams();
  const nav = useNavigate();

<<<<<<< Updated upstream
  const [docId, setDocId] = useState(isCreate ? "" : String(id));
=======
  const [docId, setDocId] = useState(isCreate ? "" : String(id || ""));
>>>>>>> Stashed changes
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(isCreate);
  const [selectedLine, setSelectedLine] = useState(null);
  const applyingRemote = useRef(false);

<<<<<<< Updated upstream
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

=======
  const {
    data,
    loading,
    error: queryError,
  } = useQuery(DOC, {
    variables: { id: String(id) },
    skip: isCreate || !id,
    fetchPolicy: "network-only",
  });

  const [createDocument] = useMutation(CREATE_DOC);
  const [updateDocument] = useMutation(UPDATE_DOC);

  const lines = useMemo(() => splitLines(content), [content]);

  useEffect(() => {
    if (isCreate) {
      setDocId("");
      setTitle("");
      setType("text");
      setContent("");
      setError("");
      setSelectedLine(null);
      setInitialLoaded(true);
    }
  }, [isCreate]);

  useEffect(() => {
    if (isCreate) {
      setInitialLoaded(true);
      return;
    }

    if (loading) {
      return;
    }

    if (queryError) {
      const msg = String(queryError?.message || queryError);

      if (msg.includes("Authentication required")) {
        auth.clear();
        nav("/login");
        return;
      }

      setError(msg);
      setInitialLoaded(true);
      return;
    }

    const d = data?.document;

    if (!d) {
      setError("Dokumentet kunde inte hittas.");
      setInitialLoaded(true);
      return;
    }

    const resolvedId = String(d.id || id);
    setDocId(resolvedId);
    setTitle(d.title || "");
    setType(d.type || "text");
    setContent(d.content || "");
    setInitialLoaded(true);
    joinDoc(resolvedId);
  }, [data, loading, queryError, id, isCreate, nav]);

  useEffect(() => {
    connect();

    onDocumentUpdate((payload) => {
      if (!payload) {
        return;
      }

      const currentId = String(docId || id || "");
      const payloadId = String(
        payload.documentId || payload.id || payload._id || ""
      );

      if (currentId && payloadId && currentId !== payloadId) {
        return;
      }

      applyingRemote.current = true;

      if (typeof payload.title === "string") {
        setTitle(payload.title);
      }

      if (typeof payload.type === "string") {
        setType(payload.type);
      }

      if (typeof payload.content === "string") {
        setContent(payload.content);
      }

      queueMicrotask(() => {
        applyingRemote.current = false;
      });
    });

    return () => {
      disconnect();
    };
  }, [docId, id]);

  const emitChange = useMemo(
    () =>
      debounce((next) => {
>>>>>>> Stashed changes
        sendDocumentUpdate({
          documentId: next.documentId,
          title: next.title,
          content: next.content,
<<<<<<< Updated upstream
=======
          type: next.type,
>>>>>>> Stashed changes
        });
      }, 180),
    []
  );

  function onTitle(e) {
<<<<<<< Updated upstream
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
=======
    const value = e.target.value;
    setTitle(value);

    if (!applyingRemote.current && !isCreate) {
      emitChange({
        documentId: docId || id,
        title: value,
        content,
        type,
      });
    }
  }

  function onTypeChange(e) {
    const value = e.target.value;
    setType(value);

    if (!applyingRemote.current && !isCreate) {
      emitChange({
        documentId: docId || id,
        title,
        content,
        type: value,
      });
    }
  }

  function onContentChange(value) {
    setContent(value);

    if (!applyingRemote.current && !isCreate) {
      emitChange({
        documentId: docId || id,
        title,
        content: value,
        type,
      });
>>>>>>> Stashed changes
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const currentType = type || "text";

      if (isCreate) {
        const result = await createDocument({
          variables: {
            input: {
              title,
              content,
              type: currentType,
            },
          },
        });

        const created = result?.data?.createDocument;

        if (!created?.id) {
          throw new Error("Dokumentet kunde inte skapas.");
        }

        nav(`/doc/${created.id}`);
      } else {
<<<<<<< Updated upstream
        await api.updateDoc(docId || id, { title, content, type });
        nav(`/doc/${docId || id}`);
=======
        const result = await updateDocument({
          variables: {
            id: String(docId || id),
            input: {
              title,
              content,
            },
          },
        });

        if (!result?.data?.updateDocument) {
          throw new Error("Dokumentet kunde inte uppdateras.");
        }
>>>>>>> Stashed changes
      }
    } catch (e2) {
      const msg = String(e2?.message || e2);

      if (msg.includes("Authentication required")) {
        auth.clear();
        nav("/login");
        return;
      }

      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (!initialLoaded || loading) {
    return <p>Laddar…</p>;
  }

  return (
    <form
      onSubmit={onSubmit}
      className="new-doc"
      style={{ display: "grid", gap: 16 }}
    >
      <h1>{isCreate ? "Nytt dokument" : "Redigera dokument"}</h1>

      {error && <p style={{ color: "crimson" }}>Fel: {error}</p>}

      <label>
        Titel
        <input value={title} onChange={onTitle} required />
      </label>

      <label>
        Typ
<<<<<<< Updated upstream
        <select value={type} onChange={onType}>
=======
        <select value={type} onChange={onTypeChange}>
>>>>>>> Stashed changes
          <option value="text">Text</option>
          <option value="code">Code (JavaScript)</option>
        </select>
      </label>

      {type === "code" ? (
        <div style={{ display: "grid", gap: 12 }}>
<<<<<<< Updated upstream
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
=======
          <CodeEditor
            value={content}
            onChange={onContentChange}
            language="javascript"
          />
          <CodeRunner code={content} documentId={docId || id} />
        </div>
      ) : (
        <div className="editor-text-mode">
          <label>
            Innehåll
            <textarea
              rows={12}
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              required
            />
          </label>

          {!isCreate && (
            <div className="line-picker">
              <h3>Klicka på en rad för att kommentera</h3>
              <div className="line-picker__list">
                {lines.map((lineText, index) => {
                  const lineNumber = index + 1;
                  const isSelected =
                    Number(selectedLine) === Number(lineNumber);

                  return (
                    <button
                      key={lineNumber}
                      type="button"
                      className={
                        isSelected
                          ? "line-picker__row is-selected"
                          : "line-picker__row"
                      }
                      onClick={() => setSelectedLine(lineNumber)}
                    >
                      <span className="line-picker__number">
                        {lineNumber}
                      </span>
                      <span className="line-picker__text">
                        {lineText || " "}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!isCreate && (
        <div style={{ display: "grid", gap: 12 }}>
          <SharePanel docId={docId || id} />
          <CommentsPanel
            docId={docId || id}
            selectedLine={selectedLine}
            onSelectLine={setSelectedLine}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Sparar…" : "Spara"}
>>>>>>> Stashed changes
        </button>
      </div>
    </form>
  );
}
