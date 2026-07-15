import { getSupabase } from "./supabase";

/** Fixed window size in seconds */
const WINDOW_SECONDS = 60;

/** Max chat requests per tenant per window (free-tier friendly) */
const MAX_REQUESTS_PER_WINDOW = 30;

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Simple fixed-window rate limit stored in Postgres.
 */
export async function checkRateLimit(
  tenantId: string
): Promise<RateLimitResult> {
  const supabase = getSupabase();
  const now = new Date();
  const windowStart = new Date(
    Math.floor(now.getTime() / (WINDOW_SECONDS * 1000)) *
      WINDOW_SECONDS *
      1000
  );
  const windowIso = windowStart.toISOString();

  const { data: existing, error: selectError } = await supabase
    .from("rate_limits")
    .select("request_count")
    .eq("tenant_id", tenantId)
    .eq("window_start", windowIso)
    .maybeSingle();

  if (selectError) {
    console.error("[rate-limit] select failed:", selectError.message);
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW,
      retryAfterSeconds: WINDOW_SECONDS,
    };
  }

  const current = (existing?.request_count as number | undefined) ?? 0;

  if (current >= MAX_REQUESTS_PER_WINDOW) {
    const elapsed = Math.floor((now.getTime() - windowStart.getTime()) / 1000);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(WINDOW_SECONDS - elapsed, 1),
    };
  }

  const nextCount = current + 1;

  const { error: upsertError } = await supabase.from("rate_limits").upsert(
    {
      tenant_id: tenantId,
      window_start: windowIso,
      request_count: nextCount,
    },
    { onConflict: "tenant_id,window_start" }
  );

  if (upsertError) {
    console.error("[rate-limit] upsert failed:", upsertError.message);
  }

  return {
    allowed: true,
    remaining: Math.max(MAX_REQUESTS_PER_WINDOW - nextCount, 0),
    retryAfterSeconds: WINDOW_SECONDS,
  };
}

export const RATE_LIMIT = {
  WINDOW_SECONDS,
  MAX_REQUESTS_PER_WINDOW,
} as const;
