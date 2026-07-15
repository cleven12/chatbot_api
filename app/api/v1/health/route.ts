import { jsonOk } from "@/lib/errors";

export const runtime = "nodejs";

export async function GET() {
  return jsonOk({ status: "ok" });
}
