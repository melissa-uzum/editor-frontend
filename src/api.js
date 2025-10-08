const BASE = (process.env.REACT_APP_API_URL || "").replace(/\/+$/, "");
const join = (p) => `${BASE}${p.startsWith("/") ? p : `/${p}`}`;
const toId = (x) =>
  x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;
const unwrap = (x) => (x && typeof x === "object" && "data" in x ? x.data : x);

function isDebug() {
  try {
    return localStorage.getItem("API_DEBUG") === "1";
  } catch (_) {
    return false;
  }
}
function dbg(...args) {
  if (isDebug()) {
    console.log("[api]", ...args);
  }
}

async function getJSON(url, opts = {}) {
  const init = {
    headers: { "Content-Type": "application/json" },
    ...opts,
  };

  const method = (init.method || "GET").toUpperCase();
  const previewBody =
    typeof init.body === "string" && init.body.length <= 500
      ? init.body
      : init.body
      ? "[large body]"
      : undefined;
  dbg(method, url, previewBody);

  const res = await fetch(url, init);

  dbg("→", res.status, res.statusText, url);

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
    const url = join("/docs");
    return await getJSON(url).then((data) => (Array.isArray(data) ? data : []));
  } catch (e) {
    if (e.status === 404) {
      const url = join("/list");
      dbg("fallback GET", url);
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw e;
      const json = await res.json();
      return Array.isArray(json) ? json : unwrap(json) ?? [];
    }
    throw e;
  }
}

async function tryGetDoc(id) {
  const url = join(`/docs/${encodeURIComponent(id)}`);
  try {
    return await getJSON(url);
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
  dbg("create payload", payload);

  try {
    const url = join("/docs");
    return await getJSON(url, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (e.status === 404) {
      const url = join("/");
      dbg("fallback POST form", url, payload);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: urlencode(payload),
        redirect: "follow",
        credentials: "include",
      });
      if (!res.ok) throw e;
      const loc = new URL(res.url);
      const id = loc.pathname.replace(/^\/+/, "");
      return { id, ...payload };
    }
    throw e;
  }
}

async function tryUpdateDoc(id, payload) {
  dbg("update payload", { id, ...payload });

  try {
    const url = join(`/docs/${encodeURIComponent(id)}`);
    await getJSON(url, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (e.status === 404) {
      const url = join("/update");
      dbg("fallback POST form", url, { id, ...payload });
      const res = await fetch(url, {
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
