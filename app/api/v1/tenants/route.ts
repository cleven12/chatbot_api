import { randomBytes } from "node:crypto";
import { isValidAdminKey } from "@/lib/admin";
import { jsonError, jsonOk } from "@/lib/errors";
import { explainSupabaseError, getSupabase } from "@/lib/supabase";
import type { CreateTenantRequest, CreateTenantResponse } from "@/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!isValidAdminKey(request.headers.get("x-admin-key"))) {
      return jsonError(401, "UNAUTHORIZED", "Invalid or missing admin key");
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "INVALID_JSON", "Request body must be valid JSON");
    }

    const { name, system_prompt } = body as Partial<CreateTenantRequest>;

    if (typeof name !== "string" || name.trim() === "") {
      return jsonError(400, "VALIDATION_ERROR", "name is required");
    }
    if (typeof system_prompt !== "string") {
      return jsonError(400, "VALIDATION_ERROR", "system_prompt is required");
    }

    const apiKey = randomBytes(32).toString("hex");
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("tenants")
      .insert({
        name: name.trim(),
        system_prompt: system_prompt.trim(),
        api_key: apiKey,
      })
      .select("id, name, system_prompt, api_key, created_at")
      .single();

    if (error || !data) {
      console.error("[tenants] create failed:", error?.message);
      return jsonError(
        500,
        "INSERT_ERROR",
        explainSupabaseError(error?.message ?? "Failed to create tenant")
      );
    }

    const response: CreateTenantResponse = {
      id: data.id as string,
      name: data.name as string,
      system_prompt: data.system_prompt as string,
      api_key: data.api_key as string,
      created_at: data.created_at as string,
    };

    return jsonOk(response, 201);
  } catch (err) {
    console.error("[tenants] unhandled error:", err);
    return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred");
  }
}
