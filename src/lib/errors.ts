import type { ApiError } from "../types";
import { CORS_HEADERS } from "./cors";

const jsonHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  ...CORS_HEADERS,
};

/** Build a JSON Response with the consistent `{ error, code }` shape. */
export function jsonError(
  status: number,
  code: string,
  error: string
): Response {
  const body: ApiError = { error, code };
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders,
  });
}

/** Build a JSON Response with a success body. */
export function jsonOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders,
  });
}
