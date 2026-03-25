import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { getAnalyticsForUser } from "@/lib/skill-service";
import { db } from "@/lib/db";
import { VISITOR_EMAIL } from "@/lib/constants";

export async function GET() {
  try {
    const session = await auth();
    let userId = session?.user?.id;
    let mode = session?.user?.role ?? Role.VISITOR;

    if (!userId || mode !== Role.OWNER) {
      const visitor = await db.user.findUnique({ where: { email: VISITOR_EMAIL } });
      if (!visitor) {
        throw new Error("Visitor data not seeded");
      }
      userId = visitor.id;
      mode = Role.VISITOR;
    }

    const analytics = await getAnalyticsForUser(userId);
    return NextResponse.json({ mode, analytics });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
