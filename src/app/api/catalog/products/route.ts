import { NextResponse } from "next/server";
import { listCatalog } from "@/server/catalog";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ products: listCatalog() });
}
