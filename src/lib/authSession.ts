import type { ModuleCode, PermissionAction, SessionPermission } from "./rbac";

export const AUTH_STORAGE_KEY = "licogi-session";

export type UserSession = {
  id?: string;
  email: string;
  name: string;
  role: string;
  roleCode?: string;
  scope: string;
  departmentId?: string | null;
  customerId?: string | null;
  permissions?: SessionPermission[];
  mustChangePassword?: boolean;
  signedAt: string;
};

export function readSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: UserSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent("licogi-auth-updated"));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("licogi-auth-updated"));
}

export async function refreshServerSession() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) {
    clearSession();
    return null;
  }
  const data = await response.json();
  if (data?.ok && data.user) {
    saveSession(data.user as UserSession);
    return data.user as UserSession;
  }
  clearSession();
  return null;
}

export async function logoutSession() {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  clearSession();
}

export type { ModuleCode, PermissionAction, SessionPermission };
