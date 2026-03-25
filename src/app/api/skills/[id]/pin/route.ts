import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { pinSkill } from "@/lib/skill-service";

export async function PATCH(
  request: NextRequest,
  context: RouteContext<"/api/skills/[id]/pin">
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.OWNER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const updated = await pinSkill(session.user.id, id, body);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Delete operations are disabled by design." },
    { status: 405 },
  );
}
