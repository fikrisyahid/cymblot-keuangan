/**
 * Per-User Data Encryption Module
 *
 * Architecture:
 * - Encryption key derived from user password via PBKDF2 (600K iterations)
 * - Data encrypted with AES-256-GCM (per-field encryption)
 * - Key NEVER stored in DB — only exists in encrypted session cookie
 * - Admin cannot read user data even with direct DB access
 *
 * Uses Web Crypto API only (Edge-runtime compatible)
 */

const PBKDF2_ITERATIONS = 600_000;
const VERIFIER_PLAINTEXT = "cymblot_verify_v1";

// ============================================
// UTILITY: Hex encoding
// ============================================

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// ============================================
// KEY DERIVATION (PBKDF2)
// ============================================

/**
 * Derive a 256-bit encryption key from password using PBKDF2-SHA256
 * @param password - User's plaintext password
 * @param existingSalt - Hex-encoded salt (for existing users), or undefined to generate new
 * @returns { key: hex, salt: hex }
 */
export async function deriveEncryptionKey(
  password: string,
  existingSalt?: string,
): Promise<{ key: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = existingSalt
    ? hexToBytes(existingSalt)
    : crypto.getRandomValues(new Uint8Array(32));

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passwordKey,
    256,
  );

  return {
    key: bytesToHex(new Uint8Array(derivedBits)),
    salt: bytesToHex(salt),
  };
}

// ============================================
// AES-256-GCM ENCRYPT / DECRYPT
// ============================================

/**
 * Encrypt plaintext with AES-256-GCM
 * Output format: base64( IV[12] || ciphertext || authTag[16] )
 */
export async function encrypt(
  plaintext: string,
  keyHex: string,
): Promise<string> {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(keyHex).buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );

  const combined = new Uint8Array(
    iv.length + new Uint8Array(ciphertext).length,
  );
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt AES-256-GCM ciphertext
 * Input: base64-encoded string from encrypt()
 */
export async function decrypt(
  ciphertextB64: string,
  keyHex: string,
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextB64), (c) =>
    c.charCodeAt(0),
  );
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const key = await crypto.subtle.importKey(
    "raw",
    hexToBytes(keyHex).buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  return new TextDecoder().decode(plaintext);
}

// ============================================
// VERIFIER (prove key is correct)
// ============================================

/**
 * Create a verifier: encrypt a known plaintext with the key.
 * Stored in DB so we can verify the derived key is correct on login.
 */
export async function createVerifier(keyHex: string): Promise<string> {
  return encrypt(VERIFIER_PLAINTEXT, keyHex);
}

/**
 * Validate that a derived key matches the stored verifier.
 */
export async function validateKey(
  verifier: string,
  keyHex: string,
): Promise<boolean> {
  try {
    const decrypted = await decrypt(verifier, keyHex);
    return decrypted === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}

// ============================================
// COOKIE ENCRYPTION (server-side key wrapping)
// ============================================

/**
 * Encrypt the user's encryption key for safe storage in an httpOnly cookie.
 * Uses AES-256-GCM with a key derived from the server's JWT_SECRET.
 */
export async function encryptForCookie(
  data: string,
  serverSecret: string,
): Promise<string> {
  const enc = new TextEncoder();
  const secretHash = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(serverSecret),
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    secretHash,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(data),
  );

  const combined = new Uint8Array(
    iv.length + new Uint8Array(ciphertext).length,
  );
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);

  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt the encryption key from the httpOnly cookie.
 */
export async function decryptFromCookie(
  ciphertextB64: string,
  serverSecret: string,
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertextB64), (c) =>
    c.charCodeAt(0),
  );
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const enc = new TextEncoder();
  const secretHash = await crypto.subtle.digest(
    "SHA-256",
    enc.encode(serverSecret),
  );

  const key = await crypto.subtle.importKey(
    "raw",
    secretHash,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    ciphertext.buffer as ArrayBuffer,
  );

  return new TextDecoder().decode(plaintext);
}

// ============================================
// FIELD-LEVEL HELPERS
// ============================================

/**
 * Encrypt a field value. Returns null if input is null/undefined.
 */
export async function encryptField(
  value: string | null | undefined,
  keyHex: string,
): Promise<string | null> {
  if (value === null || value === undefined) return null;
  return encrypt(value, keyHex);
}

/**
 * Decrypt a field value. Returns null if input is null/undefined.
 */
export async function decryptField(
  value: string | null | undefined,
  keyHex: string,
): Promise<string | null> {
  if (value === null || value === undefined) return null;
  return decrypt(value, keyHex);
}

// ============================================
// ENTITY DECRYPTION HELPERS
// ============================================

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function decryptAccount<T extends { name: string; balance: string }>(
  account: T,
  keyHex: string,
): Promise<T> {
  return {
    ...account,
    name: await decrypt(account.name, keyHex),
    balance: await decrypt(account.balance, keyHex),
  };
}

export async function decryptCategory<T extends { name: string }>(
  category: T,
  keyHex: string,
): Promise<T> {
  return {
    ...category,
    name: await decrypt(category.name, keyHex),
  };
}

export async function decryptTransaction(txn: any, keyHex: string): Promise<any> {
  const result = {
    ...txn,
    amount: await decrypt(txn.amount, keyHex),
    description: await decrypt(txn.description, keyHex),
    note: txn.note ? await decrypt(txn.note, keyHex) : null,
  };

  if (result.account) {
    result.account = await decryptAccount(result.account, keyHex);
  }
  if (result.category) {
    result.category = await decryptCategory(result.category, keyHex);
  }

  return result;
}

export async function decryptBudgetWithCategory(budget: any, keyHex: string): Promise<any> {
  const result = {
    ...budget,
    amount: await decrypt(budget.amount, keyHex),
  };

  if (result.category) {
    result.category = await decryptCategory(result.category, keyHex);
  }

  return result;
}

export async function decryptRecurring(rec: any, keyHex: string): Promise<any> {
  const result = {
    ...rec,
    amount: await decrypt(rec.amount, keyHex),
    description: await decrypt(rec.description, keyHex),
  };

  if (result.account) {
    result.account = await decryptAccount(result.account, keyHex);
  }
  if (result.category) {
    result.category = await decryptCategory(result.category, keyHex);
  }

  return result;
}

export async function decryptDebt<
  T extends {
    personName: string;
    amount: string;
    remainingAmount: string;
    description: string | null;
  },
>(debt: T, keyHex: string): Promise<T> {
  return {
    ...debt,
    personName: await decrypt(debt.personName, keyHex),
    amount: await decrypt(debt.amount, keyHex),
    remainingAmount: await decrypt(debt.remainingAmount, keyHex),
    description: debt.description
      ? await decrypt(debt.description, keyHex)
      : null,
  };
}

/* eslint-enable @typescript-eslint/no-explicit-any */
