import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { completeSkill } from "@/lib/skill-service";

export async function PATCH(
  _request: Request,
  context: RouteContext<"/api/skills/[id]/complete">
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.OWNER) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const updated = await completeSkill(session.user.id, id);
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
