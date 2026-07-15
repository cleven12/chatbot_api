import type { Tenant } from "../types";
import { getSupabase } from "./supabase";

/**
 * Look up a tenant by API key.
 * Returns null if the key is missing, empty, or not found.
 */
export async function getTenant(
  apiKey: string | null | undefined
): Promise<Tenant | null> {
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, api_key, system_prompt, created_at")
    .eq("api_key", apiKey.trim())
    .maybeSingle();

  if (error) {
    console.error("[auth] tenant lookup failed:", error.message);
    return null;
  }

  if (!data) {
    return null;
  }

  return data as Tenant;
}
