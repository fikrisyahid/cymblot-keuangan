import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { encryptForCookie, decryptFromCookie } from "@/lib/encryption";

const secretKey =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const encodedKey = new TextEncoder().encode(secretKey);

const SESSION_COOKIE_NAME = "session";
const ENCRYPTION_KEY_COOKIE_NAME = "ek";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  expiresAt: Date;
}

/**
 * Hash password using Web Crypto API (Edge compatible)
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * Create a session JWT token
 */
export async function createSession(
  userId: string,
  email: string,
  name: string,
): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);

  const session = await new SignJWT({ userId, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  return session;
}

/**
 * Verify session token and return payload
 */
export async function verifySession(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      expiresAt: new Date(payload.exp! * 1000),
    };
  } catch {
    return null;
  }
}

/**
 * Get current session from cookies
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION),
    path: "/",
  });
}

/**
 * Clear session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(ENCRYPTION_KEY_COOKIE_NAME);
}

/**
 * Store the user's encryption key in an encrypted httpOnly cookie.
 * The key is encrypted with the server's JWT_SECRET before storage.
 */
export async function setEncryptionKeyCookie(
  encryptionKey: string,
): Promise<void> {
  const encrypted = await encryptForCookie(encryptionKey, secretKey);
  const cookieStore = await cookies();
  cookieStore.set(ENCRYPTION_KEY_COOKIE_NAME, encrypted, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + SESSION_DURATION),
    path: "/",
  });
}

/**
 * Retrieve the user's encryption key from the encrypted cookie.
 * Returns null if cookie is missing or invalid.
 */
export async function getEncryptionKey(): Promise<string | null> {
  const cookieStore = await cookies();
  const ekCookie = cookieStore.get(ENCRYPTION_KEY_COOKIE_NAME);

  if (!ekCookie?.value) return null;

  try {
    return await decryptFromCookie(ekCookie.value, secretKey);
  } catch {
    return null;
  }
}
