import { useMemo, useSyncExternalStore } from "react";
import { auth } from "../auth";

function subscribe(cb) {
  window.addEventListener("storage", cb);
  window.addEventListener("auth-changed", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("auth-changed", cb);
  };
}

function getSnapshot() {
  return auth.isAuthed();
}

export function useAuth() {
  const authed = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return useMemo(() => ({ authed }), [authed]);
}
