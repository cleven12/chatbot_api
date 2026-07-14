import { randomBytes } from "node:crypto";
import type { Context } from "@netlify/functions";
import { isValidAdminKey } from "../../src/lib/admin.ts";
import { jsonError, jsonOk } from "../../src/lib/errors.ts";
import { getSupabase } from "../../src/lib/supabase.ts";
import type {
  CreateTenantRequest,
  CreateTenantResponse,
  TenantPublic,
} from "../../src/types/index.ts";

export default async function handler(
  request: Request,
  _context: Context
): Promise<Response> {
  try {
    if (!isValidAdminKey(request.headers.get("x-admin-key"))) {
      return jsonError(401, "UNAUTHORIZED", "Invalid or missing admin key");
    }

    const url = new URL(request.url);
    // Prefer rewrite query (?id=:splat from netlify.toml), fall back to path
    const tenantId =
      url.searchParams.get("id") ?? extractTenantIdFromPath(url.pathname);

    if (request.method === "POST" && !tenantId) {
      return createTenant(request);
    }

    if (request.method === "GET" && tenantId) {
      return getTenantById(tenantId);
    }

    return jsonError(
      405,
      "METHOD_NOT_ALLOWED",
      "Supported: POST /api/v1/tenants, GET /api/v1/tenants/:id"
    );
  } catch (err) {
    console.error("[tenants] unhandled error:", err);
    return jsonError(500, "INTERNAL_ERROR", "An unexpected error occurred");
  }
}

function extractTenantIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/tenants\/([^/]+)\/?$/);
  if (!match?.[1] || match[1] === "tenants") {
    return null;
  }
  return decodeURIComponent(match[1]);
}

async function createTenant(request: Request): Promise<Response> {
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
    return jsonError(500, "INSERT_ERROR", "Failed to create tenant");
  }

  const response: CreateTenantResponse = {
    id: data.id as string,
    name: data.name as string,
    system_prompt: data.system_prompt as string,
    api_key: data.api_key as string,
    created_at: data.created_at as string,
  };

  return jsonOk(response, 201);
}

async function getTenantById(id: string): Promise<Response> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("tenants")
    .select("id, name, system_prompt, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[tenants] get failed:", error.message);
    return jsonError(500, "INTERNAL_ERROR", "Failed to fetch tenant");
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
}
