import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * Decode the JWT payload (no verify) to read the Supabase `role` claim.
 * Helps catch the common mistake of putting the anon key in SUPABASE_SERVICE_KEY.
 */
export function getSupabaseKeyRole(key: string): string | null {
  try {
    const parts = key.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const json = Buffer.from(
      payload.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    ).toString("utf8");
    const data = JSON.parse(json) as { role?: string };
    return data.role ?? null;
  } catch {
    return null;
  }
}

/**
 * Server-side Supabase client using the service role key.
 * Never expose this client or the service key to browsers.
 */
export function getSupabase(): SupabaseClient {
  if (client) {
    return client;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables"
    );
  }

  const role = getSupabaseKeyRole(key);
  if (role && role !== "service_role") {
    console.warn(
      `[supabase] SUPABASE_SERVICE_KEY has JWT role="${role}". ` +
        `Expected "service_role". Using the anon/public key causes RLS insert failures. ` +
        `Copy the service_role secret from Supabase → Project Settings → API.`
    );
  }

  client = createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return client;
}

/** Map common Supabase/PostgREST errors to clearer operator messages. */
export function explainSupabaseError(message: string): string {
  if (/row-level security/i.test(message)) {
    return (
      "Row-level security blocked this write. " +
      "Set SUPABASE_SERVICE_KEY to the service_role secret " +
      "(Supabase → Project Settings → API → service_role), not the anon key. " +
      "Then re-run supabase/migrations/0002_fix_rls.sql if needed."
    );
  }
  return message;
}
