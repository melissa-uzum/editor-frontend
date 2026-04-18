import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  ADD_COMMENT,
  DELETE_COMMENT,
  LIST_COMMENTS,
} from "../graphql/operations";
import {
  joinComments,
  leaveComments,
  onCommentAdded,
  onCommentDeleted,
} from "../socket";

function toId(x) {
  return x?.id ?? x?._id ?? "";
}

function groupByLine(items) {
  const grouped = {};

  for (const item of items || []) {
    const key = Number(item?.lineNumber || 0);
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  }

  return grouped;
}

export default function CommentsPanel({
  docId,
  selectedLine,
  onSelectLine,
}) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery(LIST_COMMENTS, {
    variables: { documentId: String(docId) },
    skip: !docId,
    fetchPolicy: "network-only",
  });

  const [addComment, { loading: posting }] = useMutation(ADD_COMMENT);
  const [deleteComment, { loading: deleting }] = useMutation(DELETE_COMMENT);

  useEffect(() => {
    if (queryError) {
      setError(String(queryError?.message || queryError));
      return;
    }

    if (data?.comments) {
      setItems(data.comments);
    }
  }, [data, queryError]);

  useEffect(() => {
    if (!docId) {
      return;
    }

    joinComments(String(docId));

    const handleAdded = (payload) => {
      const c = payload?.comment ?? payload;

      if (String(c?.documentId) !== String(docId)) {
        return;
      }

      setItems((prev) => {
        const exists = prev.some(
          (x) => String(toId(x)) === String(toId(c))
        );

        if (exists) {
          return prev;
        }

        return [c, ...prev];
      });
    };

    const handleDeleted = (payload) => {
      const commentId = String(payload?.commentId ?? "");

      setItems((prev) =>
        prev.filter((c) => String(toId(c)) !== commentId)
      );
    };

    onCommentAdded(handleAdded);
    onCommentDeleted(handleDeleted);

    return () => {
      leaveComments(String(docId));
    };
  }, [docId]);

  const grouped = useMemo(() => groupByLine(items), [items]);

  const selectedLineComments = useMemo(() => {
    const lineKey = Number(selectedLine || 0);
    return grouped[lineKey] || [];
  }, [grouped, selectedLine]);

  const lineNumbersWithComments = useMemo(() => {
    return Object.keys(grouped).map((x) => Number(x));
  }, [grouped]);

  async function submit() {
    if (!docId) {
      return;
    }

    if (!selectedLine) {
      setError("Välj en rad i dokumentet först.");
      return;
    }

    const clean = text.trim();
    if (!clean) {
      return;
    }

    setError("");

    try {
      const res = await addComment({
        variables: {
          input: {
            documentId: String(docId),
            lineNumber: Number(selectedLine),
            content: clean,
          },
        },
      });

      const created = res?.data?.createComment;

      if (created) {
        setItems((prev) => {
          const exists = prev.some(
            (x) => String(toId(x)) === String(toId(created))
          );

          if (exists) {
            return prev;
          }

          return [created, ...prev];
        });
      }

      setText("");
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  async function handleDelete(commentId) {
    if (!commentId) {
      return;
    }

    setError("");

    try {
      const res = await deleteComment({
        variables: { id: String(commentId) },
      });

      if (res?.data?.deleteComment) {
        setItems((prev) =>
          prev.filter((c) => String(toId(c)) !== String(commentId))
        );
        return;
      }

      await refetch();
    } catch (e) {
      setError(String(e?.message || e));
    }
  }

  return (
    <div className="comments-panel">
      <div className="comments-panel__header">
        <h3>Kommentarer</h3>
        {selectedLine ? (
          <p className="comments-panel__selected">
            Vald rad: <strong>{selectedLine}</strong>
          </p>
        ) : (
          <p className="comments-panel__selected">
            Klicka på en rad i dokumentet för att kommentera.
          </p>
        )}
      </div>

      <div className="comment-form">
        <input
          placeholder={
            selectedLine
              ? `Skriv kommentar för rad ${selectedLine}…`
              : "Välj först en rad i dokumentet…"
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!selectedLine}
        />

        <button
          type="button"
          onClick={submit}
          disabled={posting || !selectedLine || !text.trim()}
        >
          {posting ? "Skickar…" : "Lägg till kommentar"}
        </button>
      </div>

      {error && <p style={{ color: "crimson" }}>Fel: {error}</p>}
      {loading && <p>Laddar kommentarer…</p>}

      {selectedLine ? (
        <div className="comments-panel__line-comments">
          <h4>Kommentarer för rad {selectedLine}</h4>
          <ul className="comment-list">
            {selectedLineComments.map((c) => (
              <li key={String(toId(c))} className="comment-item">
                <div className="comment-item__top">
                  <span className="comment-line">Rad {c.lineNumber}</span>
                  {c.author?.username && (
                    <span className="comment-author">
                      av {c.author.username}
                    </span>
                  )}
                </div>

                <div className="comment-text">{c.content}</div>

                <button
                  type="button"
                  onClick={() => handleDelete(toId(c))}
                  disabled={deleting}
                >
                  Ta bort
                </button>
              </li>
            ))}

            {!loading && selectedLineComments.length === 0 && (
              <li>Inga kommentarer på denna rad ännu.</li>
            )}
          </ul>
        </div>
      ) : null}

      <div className="comments-panel__overview">
        <h4>Rader med kommentarer</h4>

        {lineNumbersWithComments.length === 0 ? (
          <p>Inga kommentarer ännu.</p>
        ) : (
          <div className="comment-line-badges">
            {lineNumbersWithComments
              .sort((a, b) => a - b)
              .map((lineNumber) => (
                <button
                  key={lineNumber}
                  type="button"
                  className={
                    Number(selectedLine) === Number(lineNumber)
                      ? "comment-line-badge is-active"
                      : "comment-line-badge"
                  }
                  onClick={() => onSelectLine(lineNumber)}
                >
                  Rad {lineNumber} ({grouped[lineNumber]?.length || 0})
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}