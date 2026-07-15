import { isValidAdminKey } from "@/lib/admin";
import { jsonError, jsonOk } from "@/lib/errors";
import { explainSupabaseError, getSupabase } from "@/lib/supabase";
import type { TenantPublic } from "@/types";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    if (!isValidAdminKey(request.headers.get("x-admin-key"))) {
      return jsonError(401, "UNAUTHORIZED", "Invalid or missing admin key");
    }

    const { id } = await context.params;
    if (!id) {
      return jsonError(400, "VALIDATION_ERROR", "Tenant id is required");
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("tenants")
      .select("id, name, system_prompt, created_at")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error("[tenants] get failed:", error.message);
      return jsonError(500, "INTERNAL_ERROR", explainSupabaseError(error.message));
    }

    if (!data) {
      return jsonError(404, "NOT_FOUND", "Tenant not found");
    }

    const response: TenantPublic = {
      id: data.id as string,
      name: data.name as string,
      system_prompt: data.system_prompt as string,
      created_at: data.created_at as string,
    };

    return jsonOk(response);
  } catch (err) {
    console.error("[tenants] unhandled error:", err);
    return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred");
  }
}
