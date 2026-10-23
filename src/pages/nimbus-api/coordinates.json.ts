import { getCoordinatesManifest } from "@cloudflare/nimbus-docs/runtime";

export const prerender = true;

export async function GET() {
  return Response.json(await getCoordinatesManifest());
}
