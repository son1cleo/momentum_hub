import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { getEventsForUser } from "@/lib/skill-service";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.OWNER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await getEventsForUser(session.user.id);
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
