import { auth } from "./auth";

const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
const join = (p) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
const toId = (x) => x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;
const unwrap = (x) => (x && typeof x === "object" && "data" in x ? x.data : x);

function getAuthHeaders() {
  const token = auth.getToken();
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function getJSON(url, opts = {}) {
  const init = {
    ...opts,
    headers: { "Content-Type": "application/json", ...getAuthHeaders(), ...opts.headers },
  };
  const res = await fetch(url, init);
  if (!res.ok) {
    if (res.status === 401) { auth.clear(); window.location.href = "/login"; }
    const msg = await res.text().catch(() => res.statusText);
    const err = new Error(msg || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.status === 204 ? null : unwrap(await res.json());
}

async function tryListDocs() {
  try { return await getJSON(join("/docs")); }
  catch (e) {
    if (e.status === 404) {
      const res = await fetch(join("/list"), { headers: getAuthHeaders() });
      if (!res.ok) throw e;
      const json = await res.json();
      return Array.isArray(json) ? json : unwrap(json) ?? [];
    }
    throw e;
  }
}

async function tryCreateDoc(payload) {
  try { return await getJSON(join("/docs"), { method: "POST", body: JSON.stringify(payload) }); }
  catch (e) {
    if (e.status === 404) {
      const res = await fetch(join("/"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", ...getAuthHeaders() },
        body: new URLSearchParams(payload).toString()
      });
      if (!res.ok) throw e;
      const id = new URL(res.url).pathname.replace(/^\/+/, "");
      return { id, ...payload };
    }
    throw e;
  }
}

async function tryUpdateDoc(id, payload) {
  try { await getJSON(join(`/docs/${encodeURIComponent(id)}`), { method: "PUT", body: JSON.stringify(payload) }); }
  catch (e) {
    if (e.status === 404) {
      const res = await fetch(join("/update"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", ...getAuthHeaders() },
        body: new URLSearchParams({ id, ...payload }).toString()
      });
      if (!res.ok) throw e;
      return;
    }
    throw e;
  }
}

export const api = {
  async listDocs() { const arr = await tryListDocs(); return arr.map(d => ({ ...d, id: String(toId(d) ?? d.id) })); },
  async getDoc(id) { const data = await (async () => { try { return await getJSON(join(`/docs/${encodeURIComponent(id)}`)); } catch(e) { if(e.status===404) { const l = await tryListDocs(); return l.find(d=>String(toId(d)??d.id)===String(id)) || {}; } throw e; } })(); return { ...data, id: String(toId(data) ?? data.id ?? id) }; },
  async createDoc(p) { const d = await tryCreateDoc(p); return { ...d, id: String(toId(d) ?? d?.id) }; },
  async updateDoc(id, p) { await tryUpdateDoc(id, p); return null; },
  async deleteDoc() { throw new Error("Delete not supported"); }
};