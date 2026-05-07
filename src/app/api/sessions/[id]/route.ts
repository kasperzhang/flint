import { NextResponse } from "next/server";
import { db, sessions, messages } from "@/lib/db";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!db) {
    return NextResponse.json({ error: "No database" }, { status: 404 });
  }

  try {
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, id));

    if (!session) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const sessionMessages = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, id))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ ...session, messages: sessionMessages });
  } catch (e) {
    console.error("Failed to load session:", e);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!db) {
    return NextResponse.json({ success: true });
  }

  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.title !== undefined) updates.title = body.title;
    if (body.scaffold !== undefined) updates.currentScaffold = body.scaffold;
    if (body.starred !== undefined) updates.starred = body.starred;

    const [updated] = await db
      .update(sessions)
      .set(updates)
      .where(eq(sessions.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Failed to update session:", e);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!db) {
    return NextResponse.json({ success: true });
  }

  try {
    await db.delete(sessions).where(eq(sessions.id, id));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Failed to delete session:", e);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
