import { apiServices } from "../../../data/apiServices";

export async function GET() {
  return Response.json({ ok: true, data: apiServices });
}
