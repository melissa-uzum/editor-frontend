const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

const join = (p) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;

const toId = (x) => x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;

const unwrap = (x) => (x && typeof x === "object" && "data" in x ? x.data : x);

async function getJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok && res.status !== 204) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.status === 204 ? null : unwrap(await res.json());
}

export const api = {
  async listDocs() {
    const data = await getJSON(join("/docs"), { credentials: "include" });
    const arr = Array.isArray(data) ? data : [];
    return arr.map((d) => ({ ...d, id: String(toId(d) ?? d.id) }));
  },

  async getDoc(id) {
    const data = await getJSON(join(`/docs/${encodeURIComponent(id)}`), {
      credentials: "include",
    });
    if (!data) throw new Error("Not Found");
    const normId = String(toId(data) ?? data.id ?? id);
    return { ...data, id: normId };
  },

  async createDoc(payload) {
    const data = await getJSON(join("/docs"), {
      method: "POST",
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const normId = String(toId(data) ?? data?.id);
    if (!normId) throw new Error("Create failed: missing id");
    return { ...data, id: normId };
  },

  async updateDoc(id, payload) {
    await getJSON(join(`/docs/${encodeURIComponent(id)}`), {
      method: "PUT",
      body: JSON.stringify(payload),
      credentials: "include",
    });
    return null;
  },

  async deleteDoc(id) {
    await getJSON(join(`/docs/${encodeURIComponent(id)}`), {
      method: "DELETE",
      credentials: "include",
    });
    return null;
  },
};
