const BASE = process.env.REACT_APP_API_URL || "http://localhost:3000";

async function http(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  listDocs: () => http("/api/docs").then(r => r.data),
  getDoc: (id) => http(`/api/docs/${id}`).then(r => r.data),
  createDoc: (payload) =>
    http("/api/docs", { method: "POST", body: JSON.stringify(payload) })
      .then(r => r.data),
  updateDoc: (id, payload) =>
    http(`/api/docs/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteDoc: (id) =>
    http(`/api/docs/${id}`, { method: "DELETE" }),
};
