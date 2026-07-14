import type { ApiError } from "../types/index.ts";

/** Build a JSON Response with the consistent `{ error, code }` shape. */
export function jsonError(
  status: number,
  code: string,
  error: string
): Response {
  const body: ApiError = { error, code };
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Build a JSON Response with a success body. */
export function jsonOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
