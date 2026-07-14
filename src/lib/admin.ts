/**
 * Validate the admin key from the x-admin-key header.
 * Compared against ADMIN_API_KEY env var (timing-safe when both are strings).
 */
export function isValidAdminKey(headerValue: string | null): boolean {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !headerValue) {
    return false;
  }

  if (expected.length !== headerValue.length) {
    return false;
  }

  // Constant-time comparison to avoid leaking key length via early exit only
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ headerValue.charCodeAt(i);
  }
  return mismatch === 0;
}
