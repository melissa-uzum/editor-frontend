const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");

const norm = (p) => (p.startsWith("/") ? p : `/${p}`);
const join = (p) => `${BASE}${norm(p)}`;
const joinApi = (p) => `${BASE}/api${norm(p)}`;

const toId = (x) =>
  x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;
const unwrap = (x) => (x && typeof x === "object" && "data" in x ? x.data : x);

async function getJSON(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...opts,
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

async function getJSONEither(path, opts = {}) {
  try {
    return await getJSON(join(path), opts);
  } catch (e) {
    if (e.status === 404) {
      return await getJSON(joinApi(path), opts);
    }
    throw e;
  }
}

async function fetchEither(path, opts = {}) {
  let res = await fetch(join(path), opts);
  if (res.status === 404) {
    res = await fetch(joinApi(path), opts);
  }
  return res;
}

function urlencode(obj) {
  return new URLSearchParams(obj).toString();
}

async function tryListDocs() {
  try {
    const data = await getJSONEither("/docs");
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.status === 404) {
      const res = await fetchEither("/list", { credentials: "include" });
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
    const data = await getJSONEither(`/docs/${encodeURIComponent(id)}`);
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
    const data = await getJSONEither("/docs", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return data;
  } catch (e) {
    if (e.status === 404) {
      const res = await fetchEither("/", {
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
    await getJSONEither(`/docs/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (e.status === 404) {
      const res = await fetchEither("/update", {
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
