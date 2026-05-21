import crypto from 'crypto';

const MIN_TOKEN_LEN = 32;
const HMAC_LABEL = 'admin_bypass_v1';

function getToken(): string | null {
  return process.env.ADMIN_BYPASS_TOKEN ?? null;
}

// One-way hash stored as the cookie value — raw token never leaves the server.
export function makeCookieValue(token: string): string {
  return crypto.createHmac('sha256', token).update(HMAC_LABEL).digest('hex');
}

// Constant-time string comparison — prevents timing attacks.
function safeEqual(a: string, b: string): boolean {
  // Always compare same-length buffers; short-circuit on length mismatch
  // without leaking which side is shorter.
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); // burn time
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Validate the raw token from a URL param or request body. */
export function validateToken(provided: string | null | undefined): boolean {
  const token = getToken();
  if (!token || token.length < MIN_TOKEN_LEN) return false;
  if (!provided) return false;
  return safeEqual(provided, token);
}

/** Validate the hashed value stored in the admin_bypass cookie. */
export function validateCookieValue(cookieVal: string | null | undefined): boolean {
  const token = getToken();
  if (!token || token.length < MIN_TOKEN_LEN) return false;
  if (!cookieVal) return false;
  return safeEqual(cookieVal, makeCookieValue(token));
}
