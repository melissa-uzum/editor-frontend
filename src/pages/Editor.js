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

  const [docId, setDocId] = useState(isCreate ? "" : String(id || ""));
  const [title, setTitle] = useState("");
  const [type, setType] = useState("text");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [initialLoaded, setInitialLoaded] = useState(isCreate);
  const [selectedLine, setSelectedLine] = useState(null);
  const applyingRemote = useRef(false);

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
        sendDocumentUpdate({
          documentId: next.documentId,
          title: next.title,
          content: next.content,
          type: next.type,
        });
      }, 180),
    []
  );

  function onTitle(e) {
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
        const result = await updateDocument({
          variables: {
            id: String(docId || id),
            input: {
              title,
              content,
              type: currentType,
            },
          },
        });

        if (!result?.data?.updateDocument) {
          throw new Error("Dokumentet kunde inte uppdateras.");
        }
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
        <select value={type} onChange={onTypeChange}>
          <option value="text">Text</option>
          <option value="code">Code (JavaScript)</option>
        </select>
      </label>

      {type === "code" ? (
        <div style={{ display: "grid", gap: 12 }}>
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
          {saving ? "Sparar…" : isCreate ? "Skapa" : "Spara"}
        </button>
      </div>
    </form>
  );
}