import type { Context } from "@netlify/functions";

export default async function handler(
  _request: Request,
  _context: Context
): Promise<Response> {
  return new Response(JSON.stringify({ status: "ok" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
