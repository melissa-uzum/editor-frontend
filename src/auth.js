const TOKEN_KEY = "token";

function notify() {
  window.dispatchEvent(new Event("auth-changed"));
}

export const auth = {
  getToken: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  setToken: (t) => {
    try {
      if (t) {
        localStorage.setItem(TOKEN_KEY, t);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      notify();
    } catch {}
  },

  clear: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      notify();
    } catch {}
  },

  isAuthed: () => {
    try {
      return !!localStorage.getItem(TOKEN_KEY);
    } catch {
      return false;
    }
  },

  authHeader: () => {
    try {
      const t = localStorage.getItem(TOKEN_KEY);
      return t ? { Authorization: `Bearer ${t}` } : {};
    } catch {
      return {};
    }
  },
};