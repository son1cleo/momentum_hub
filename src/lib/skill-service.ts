import { SkillEventType, SkillStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { computeAnalytics } from "@/lib/metrics";
import { createSkillSchema, pinSkillSchema } from "@/lib/validation";

export async function getSkillsForUser(userId: string) {
  const skills = await db.skill.findMany({
    where: { userId },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return skills;
}

export async function createSkill(userId: string, raw: unknown) {
  const parsed = createSkillSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const skill = await db.skill.create({
    data: {
      userId,
      title: parsed.data.title,
      category: parsed.data.category,
      targetDate: parsed.data.targetDate,
      notes: parsed.data.notes,
      pinned: parsed.data.pinned,
    },
  });

  await db.skillEvent.create({
    data: {
      skillId: skill.id,
      userId,
      eventType: SkillEventType.CREATED,
      metadata: { pinned: skill.pinned, category: skill.category },
    },
  });

  return skill;
}

export async function completeSkill(userId: string, skillId: string) {
  const skill = await db.skill.findFirst({ where: { id: skillId, userId } });
  if (!skill) {
    throw new Error("Skill not found");
  }

  if (skill.status === SkillStatus.COMPLETED) {
    return skill;
  }

  const updated = await db.skill.update({
    where: { id: skill.id },
    data: {
      status: SkillStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  await db.skillEvent.create({
    data: {
      skillId: skill.id,
      userId,
      eventType: SkillEventType.COMPLETED,
      metadata: { previousStatus: skill.status },
    },
  });

  return updated;
}

export async function pinSkill(userId: string, skillId: string, raw: unknown) {
  const parsed = pinSkillSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const skill = await db.skill.findFirst({ where: { id: skillId, userId } });
  if (!skill) {
    throw new Error("Skill not found");
  }

  const updated = await db.skill.update({
    where: { id: skill.id },
    data: { pinned: parsed.data.pinned },
  });

  await db.skillEvent.create({
    data: {
      skillId: skill.id,
      userId,
      eventType: parsed.data.pinned ? SkillEventType.PINNED : SkillEventType.UNPINNED,
      metadata: { previousPinned: skill.pinned },
    },
  });

  return updated;
}

export async function getAnalyticsForUser(userId: string) {
  const [skills, events] = await Promise.all([
    db.skill.findMany({ where: { userId } }),
    db.skillEvent.findMany({ where: { userId }, orderBy: { eventAt: "desc" } }),
  ]);

  return computeAnalytics(skills, events);
}

export async function getEventsForUser(userId: string) {
  return db.skillEvent.findMany({
    where: { userId },
    include: {
      skill: {
        select: {
          title: true,
          category: true,
        },
      },
    },
    orderBy: { eventAt: "desc" },
    take: 50,
  });
}

export async function getPublicPinned() {
  const skills = await db.skill.findMany({
    where: {
      pinned: true,
      status: SkillStatus.COMPLETED,
      user: { role: "OWNER" },
    },
    select: {
      id: true,
      title: true,
      category: true,
      completedAt: true,
      notes: true,
      createdAt: true,
    },
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
    take: 30,
  });

  return {
    totalPinnedCompleted: skills.length,
    latestCompletedLearning: skills[0] ?? null,
    items: skills,
  };
}
