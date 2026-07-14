import { NextResponse } from "next/server";
import { getTrace } from "@/server/control-plane";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  try {
    const data = getTrace(id);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
