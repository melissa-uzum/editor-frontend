const BASES = (process.env.REACT_APP_API_URL || "")
  .split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter(Boolean);

if (BASES.length === 0) BASES.push("");

const toPath = (p) => (p.startsWith("/") ? p : `/${p}`);
const toId = (x) =>
  x?.id ?? x?._id ?? x?.rowid ?? x?._rowid ?? x?._Id ?? x?._ID;
const unwrap = (x) => (x && typeof x === "object" && "data" in x ? x.data : x);

async function tryFetch(paths, init = {}) {
  const urlList = [];
  for (const base of BASES) {
    for (const p of paths) {
      urlList.push(`${base}${toPath(p)}`);
    }
  }
  let lastErr;
  for (const url of urlList) {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      ...init,
    });
    if (res.ok || res.status === 204) {
      return res.status === 204
        ? { ok: true, status: 204, json: null }
        : { ok: true, status: res.status, json: await res.json() };
    }
    if (res.status !== 404) {
      const msg = await res.text().catch(() => res.statusText);
      const err = new Error(msg || `HTTP ${res.status}`);
      err.status = res.status;
      err.url = url;
      throw err;
    }
    lastErr = { status: 404, url };
  }
  const err = new Error("Not Found");
  err.status = 404;
  err.url = lastErr?.url;
  throw err;
}

async function getJSON(paths, init) {
  const res = await tryFetch(paths, init);
  return res.json === null ? null : unwrap(res.json);
}

function urlencode(obj) {
  return new URLSearchParams(obj).toString();
}


async function tryListDocs() {
  try {
    const data = await getJSON(["/docs", "/api/docs"]);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    if (e.status === 404) {
      for (const base of BASES) {
        const res = await fetch(`${base}/list`, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          return Array.isArray(json) ? json : unwrap(json) ?? [];
        }
      }
    }
    throw e;
  }
}

async function tryGetDoc(id) {
  const path = [
    `/docs/${encodeURIComponent(id)}`,
    `/api/docs/${encodeURIComponent(id)}`,
  ];
  try {
    return await getJSON(path);
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
    return await getJSON(["/docs", "/api/docs"], {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (e.status === 404) {
      for (const base of BASES) {
        const res = await fetch(`${base}/`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: urlencode(payload),
          redirect: "follow",
          credentials: "include",
        });
        if (res.ok) {
          const url = new URL(res.url);
          const id = url.pathname.replace(/^\/+/, "");
          return { id, ...payload };
        }
      }
    }
    throw e;
  }
}

async function tryUpdateDoc(id, payload) {
  try {
    await getJSON(
      [
        `/docs/${encodeURIComponent(id)}`,
        `/api/docs/${encodeURIComponent(id)}`,
      ],
      { method: "PUT", body: JSON.stringify(payload) }
    );
  } catch (e) {
    if (e.status === 404) {
      for (const base of BASES) {
        const res = await fetch(`${base}/update`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: urlencode({ id, ...payload }),
          redirect: "follow",
          credentials: "include",
        });
        if (res.ok) return;
      }
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
