/**
 * Encrypt auth tokens and user profile before localStorage (AES-GCM).
 * Key from NEXT_PUBLIC_TOKEN_STORAGE_KEY (min 16 chars recommended).
 * Legacy plaintext values are read once and re-saved encrypted.
 */

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";
const USER_KEY = "user";
const ENC_PREFIX = "enc:v1:";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

/** Copy bytes into a plain ArrayBuffer (strict Web Crypto BufferSource typing). */
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const buf = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buf).set(bytes);
  return buf;
}

function encodeUtf8(text: string): ArrayBuffer {
  return toArrayBuffer(new TextEncoder().encode(text));
}

function getKeyMaterial(): ArrayBuffer {
  const raw =
    process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY?.trim() ||
    "nux-dev-token-storage-key";
  const encoded = new TextEncoder().encode(raw);
  const key = new Uint8Array(KEY_LENGTH);
  key.set(encoded.subarray(0, KEY_LENGTH));
  return key.buffer;
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

let cachedCryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;
  cachedCryptoKey = await crypto.subtle.importKey(
    "raw",
    getKeyMaterial(),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
  return cachedCryptoKey;
}

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function isEncrypted(value: string): boolean {
  return value.startsWith(ENC_PREFIX);
}

async function encryptValue(plain: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await getCryptoKey();
  const cipherBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: toArrayBuffer(iv) },
    key,
    encodeUtf8(plain)
  );
  const cipherBytes = new Uint8Array(cipherBuf);
  const combined = concatBytes(iv, cipherBytes);
  return ENC_PREFIX + uint8ToBase64(combined);
}

async function decryptValue(stored: string): Promise<string | null> {
  if (!stored) return null;
  if (!isEncrypted(stored)) {
    return stored;
  }
  try {
    const combined = base64ToUint8(stored.slice(ENC_PREFIX.length));
    if (combined.length <= IV_LENGTH) return null;

    const iv = combined.subarray(0, IV_LENGTH);
    const cipherBytes = combined.subarray(IV_LENGTH);
    const key = await getCryptoKey();
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(cipherBytes)
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

export async function saveStoredTokens(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  if (typeof window === "undefined") return;
  const [encAccess, encRefresh] = await Promise.all([
    encryptValue(accessToken),
    encryptValue(refreshToken),
  ]);
  localStorage.setItem(ACCESS_KEY, encAccess);
  localStorage.setItem(REFRESH_KEY, encRefresh);
}

export async function loadStoredTokens(): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  if (typeof window === "undefined") return null;
  const rawAccess = localStorage.getItem(ACCESS_KEY);
  const rawRefresh = localStorage.getItem(REFRESH_KEY);
  if (!rawAccess || !rawRefresh) return null;

  const [accessToken, refreshToken] = await Promise.all([
    decryptValue(rawAccess),
    decryptValue(rawRefresh),
  ]);
  if (!accessToken || !refreshToken) return null;

  const needsMigration =
    !isEncrypted(rawAccess) || !isEncrypted(rawRefresh);
  if (needsMigration) {
    await saveStoredTokens(accessToken, refreshToken);
  }

  return { accessToken, refreshToken };
}

export async function saveStoredUser(user: unknown): Promise<void> {
  if (typeof window === "undefined") return;
  const encrypted = await encryptValue(JSON.stringify(user));
  localStorage.setItem(USER_KEY, encrypted);
}

export async function loadStoredUser<T = unknown>(): Promise<T | null> {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  const plain = await decryptValue(raw);
  if (!plain) return null;

  try {
    const user = JSON.parse(plain) as T;
    if (!isEncrypted(raw)) {
      await saveStoredUser(user);
    }
    return user;
  } catch {
    return null;
  }
}

export function clearStoredTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/** Remove encrypted tokens and user profile from localStorage. */
export function clearStoredAuth(): void {
  clearStoredTokens();
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_KEY);
}
