const BASE = (process.env.REACT_APP_API_URL || "http://localhost:3000").replace(/\/+$/, "");

function toId(x) {
  return x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;
}

async function getJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

function urlencode(obj) {
  return new URLSearchParams(obj).toString();
}

export const api = {
  async listDocs() {
    const data = await getJSON(`${BASE}/list`, { credentials: "include" });
    const arr = Array.isArray(data) ? data : (data?.data ?? []);
    return arr.map(d => ({ ...d, id: String(toId(d) ?? d.id) }));
  },

  async getDoc(id) {
    const list = await this.listDocs();
    const hit = list.find(d => String(d.id) === String(id));
    if (!hit) throw new Error("Not Found");
    return hit;
  },

  async createDoc(payload) {
    const res = await fetch(`${BASE}/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlencode(payload),
      redirect: "follow",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const url = new URL(res.url);
    const id = url.pathname.replace(/^\/+/, "");
    return { id, ...payload };
  },

  async updateDoc(id, payload) {
    const res = await fetch(`${BASE}/update`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: urlencode({ id, ...payload }),
      redirect: "follow",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return null;
  },

  async deleteDoc() {
    throw new Error("Delete not supported by backend");
  },
};
