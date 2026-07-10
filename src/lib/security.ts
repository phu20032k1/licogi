import crypto from "crypto";

export const SESSION_COOKIE = "licogi_session";
export const DEFAULT_MAX_AGE = 60 * 60 * 10;

export function createPasswordHash(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 210000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, iterationsRaw, salt, expected] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !iterationsRaw || !salt || !expected) return false;
  const iterations = Number(iterationsRaw);
  const actual = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256").toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(actual, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function buildSessionCookie(sessionId: string, secret: string) {
  return `${sessionId}.${secret}`;
}

export function parseSessionCookie(value?: string | null) {
  if (!value || !value.includes(".")) return null;
  const [sessionId, secret] = value.split(".");
  if (!sessionId || !secret) return null;
  return { sessionId, secret, tokenHash: sha256(secret) };
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DEFAULT_MAX_AGE,
};
