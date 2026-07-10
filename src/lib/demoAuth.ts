export const AUTH_STORAGE_KEY = "licogi-demo-session";

export type DemoSession = {
  email: string;
  name: string;
  role: string;
  scope: string;
  signedAt: string;
};

export function readSession(): DemoSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: DemoSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("licogi-auth-updated"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("licogi-auth-updated"));
}
