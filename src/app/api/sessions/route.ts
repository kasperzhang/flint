import { NextResponse } from "next/server";
import { db, sessions, messages } from "@/lib/db";
import { and, asc, desc, eq } from "drizzle-orm";

/** Collapse whitespace and trim a message down to a one-liner for cards. */
function toDescription(raw: string): string {
  const clean = raw.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return clean.slice(0, 157).trimEnd() + "…";
}

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

    // Attach a one-line description from each session's first user message.
    const withDescriptions = await Promise.all(
      allSessions.map(async (session) => {
        const [firstUserMessage] = await db!
          .select({ content: messages.content })
          .from(messages)
          .where(
            and(
              eq(messages.sessionId, session.id),
              eq(messages.role, "user")
            )
          )
          .orderBy(asc(messages.createdAt))
          .limit(1);

        return {
          ...session,
          description: firstUserMessage
            ? toDescription(firstUserMessage.content)
            : null,
        };
      })
    );

    return NextResponse.json(withDescriptions);
  } catch (e) {
    console.error("Failed to list sessions:", e);
    return NextResponse.json([]);
  }
}
