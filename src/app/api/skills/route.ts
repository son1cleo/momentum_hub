import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { createSkill, getSkillsForUser } from "@/lib/skill-service";
import { VISITOR_EMAIL } from "@/lib/constants";
import { db } from "@/lib/db";

async function resolveEffectiveUser() {
  const session = await auth();
  if (session?.user?.role === Role.OWNER && session.user.id) {
    return { userId: session.user.id, role: Role.OWNER };
  }

  const visitor = await db.user.findUnique({ where: { email: VISITOR_EMAIL } });
  if (!visitor) {
    throw new Error("Visitor data not seeded");
  }

  return { userId: visitor.id, role: Role.VISITOR };
}

export async function GET() {
  try {
    const effective = await resolveEffectiveUser();
    const skills = await getSkillsForUser(effective.userId);
    return NextResponse.json({ mode: effective.role, skills });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const effective = await resolveEffectiveUser();
    if (effective.role !== Role.OWNER) {
      return NextResponse.json({ error: "Visitor mode is read-only" }, { status: 403 });
    }

    const body = await req.json();
    const skill = await createSkill(effective.userId, body);
    return NextResponse.json(skill, { status: 201 });
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
