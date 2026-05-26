import { NextResponse } from "next/server";
import { getHeroStatsSnapshot, registerHeroSession } from "../../../lib/hero-stats";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getHeroStatsSnapshot();
  return NextResponse.json(snapshot);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { sessionId?: string; trackView?: boolean }
    | null;

  if (!body?.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const snapshot = await registerHeroSession(body.sessionId, Boolean(body.trackView));
  return NextResponse.json(snapshot);
}
