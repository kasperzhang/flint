import { NextResponse } from "next/server";
import { db, sessions } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function POST(req: Request) {
  if (!db) {
    return NextResponse.json({
      id: crypto.randomUUID(),
      title: "New Chat",
      phase: "problem",
      createdAt: new Date().toISOString(),
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const [session] = await db
      .insert(sessions)
      .values({
        title: body.title ?? "New Chat",
      })
      .returning();

    return NextResponse.json(session);
  } catch (e) {
    console.error("Failed to create session:", e);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (!db) {
    return NextResponse.json([]);
  }

  try {
    const allSessions = await db
      .select()
      .from(sessions)
      .orderBy(desc(sessions.updatedAt));

    return NextResponse.json(allSessions);
  } catch (e) {
    console.error("Failed to list sessions:", e);
    return NextResponse.json([]);
  }
}
