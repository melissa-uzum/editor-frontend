import { io } from "socket.io-client";

let socket = null;
let currentDocId = null;
let currentCommentsDocId = null;

function getToken() {
  try {
    return localStorage.getItem("token") || localStorage.getItem("jwt") || "";
  } catch {
    return "";
  }
}

function getBaseUrl() {
  const envUrl = (process.env.REACT_APP_SOCKET_URL || "").trim();
  if (envUrl) {
    return envUrl;
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:3000";
  }

  return "https://rg-ssr-editor-nilb24-dnbkc9c2edf7gkfs.swedencentral-01.azurewebsites.net";
}

function ensure() {
  if (socket && socket.connected) {
    return socket;
  }

  const base = getBaseUrl();

  socket = io(base, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: { token: getToken() },
    withCredentials: true,
  });

  return socket;
}

export function connect() {
  return ensure();
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentDocId = null;
    currentCommentsDocId = null;
  }
}


export function joinDoc(documentId, callback) {
  const s = ensure();
  const id = String(documentId || "").trim();

  if (!id || currentDocId === id) {
    return;
  }

  s.emit("document:join", { documentId: id }, callback);
  currentDocId = id;
}

export function leaveDoc(documentId, callback) {
  const s = ensure();
  const id = String(documentId || "").trim();

  if (!id) {
    return;
  }

  s.emit("document:leave", { documentId: id }, callback);

  if (currentDocId === id) {
    currentDocId = null;
  }
}

export function onDocumentUpdate(handler) {
  const s = ensure();
  s.off("document:update");
  s.on("document:update", handler);
}

export function sendDocumentUpdate(payload, callback) {
  const s = ensure();
  const id = String(payload?.documentId ?? payload?.id ?? "").trim();

  if (!id) {
    return;
  }

  s.emit(
    "document:update",
    {
      documentId: id,
      title: String(payload?.title ?? ""),
      content: String(payload?.content ?? ""),
      type: String(payload?.type ?? "text"),
    },
    callback
  );
}


export function joinComments(documentId, callback) {
  const s = ensure();
  const id = String(documentId || "").trim();

  if (!id || currentCommentsDocId === id) {
    return;
  }

  s.emit("comments:join", { documentId: id }, callback);
  currentCommentsDocId = id;
}

export function leaveComments(documentId, callback) {
  const s = ensure();
  const id = String(documentId || "").trim();

  if (!id) {
    return;
  }

  s.emit("comments:leave", { documentId: id }, callback);

  if (currentCommentsDocId === id) {
    currentCommentsDocId = null;
  }
}

export function onCommentAdded(handler) {
  const s = ensure();
  s.off("comments:added");
  s.on("comments:added", handler);
}

export function onCommentUpdated(handler) {
  const s = ensure();
  s.off("comments:updated");
  s.on("comments:updated", handler);
}

export function onCommentDeleted(handler) {
  const s = ensure();
  s.off("comments:deleted");
  s.on("comments:deleted", handler);
}

export function sendCommentAdd(payload, callback) {
  const s = ensure();
  const documentId = String(payload?.documentId ?? "").trim();
  const lineNumber = Number(payload?.lineNumber);
  const content = String(payload?.content ?? "");

  if (!documentId || !lineNumber || !content.trim()) {
    return;
  }

  s.emit("comments:add", { documentId, lineNumber, content }, callback);
}

export function sendCommentDelete(payload, callback) {
  const s = ensure();
  const commentId = String(payload?.commentId ?? "").trim();
  const documentId = String(payload?.documentId ?? "").trim();

  if (!commentId) {
    return;
  }

  s.emit("comments:delete", { commentId, documentId }, callback);
}