const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
const join = (p) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
const toId = (x) => x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;
const unwrap = (x) => (x && typeof x === "object" && "data" in x ? x.data : x);

async function getJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
    credentials: "include",
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    const err = new Error(msg || `HTTP ${res.status}`);
    err.status = res.status;
    err.url = url;
    throw err;
  }
  return res.status === 204 ? null : unwrap(await res.json());
}

function urlencode(obj) {
  return new URLSearchParams(obj).toString();
}

async function tryListDocs() {
  try {
    const data = await getJSON(join("/docs"));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.status === 404) {
      const res = await fetch(join("/list"), { credentials: "include" });
      if (!res.ok) throw e;
      const json = await res.json();
      const data = Array.isArray(json) ? json : unwrap(json) ?? [];
      return data;
    }
    throw e;
  }
}

async function tryGetDoc(id) {
  try {
    const data = await getJSON(join(`/docs/${encodeURIComponent(id)}`));
    return data;
  } catch (e) {
    if (e.status === 404) {
      const list = await tryListDocs();
      const hit = list.find((d) => String(toId(d) ?? d.id) === String(id));
      if (!hit) throw e;
      return hit;
    }
    throw e;
  }
}

async function tryCreateDoc(payload) {
  try {
    const data = await getJSON(join("/docs"), {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    if (e.status === 404) {
      const res = await fetch(join("/"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: urlencode(payload),
        redirect: "follow",
        credentials: "include",
      });
      if (!res.ok) throw e;
      const url = new URL(res.url);
      const id = url.pathname.replace(/^\/+/, "");
      return { id, ...payload };
    }
    throw e;
  }
}

async function tryUpdateDoc(id, payload) {
  try {
    await getJSON(join(`/docs/${encodeURIComponent(id)}`), {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (e.status === 404) {
      const res = await fetch(join("/update"), {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: urlencode({ id, ...payload }),
        redirect: "follow",
        credentials: "include",
      });
      if (!res.ok) throw e;
      return;
    }
    throw e;
  }
}

export const api = {
  async listDocs() {
    const arr = await tryListDocs();
    return arr.map((d) => ({ ...d, id: String(toId(d) ?? d.id) }));
  },

  async getDoc(id) {
    const data = await tryGetDoc(id);
    const normId = String(toId(data) ?? data.id ?? id);
    return { ...data, id: normId };
  },

  async createDoc(payload) {
    const data = await tryCreateDoc(payload);
    const normId = String(toId(data) ?? data?.id);
    return { ...data, id: normId };
  },

  async updateDoc(id, payload) {
    await tryUpdateDoc(id, payload);
    return null;
  },

  async deleteDoc() {
    throw new Error("Delete not supported by backend");
  },
};
