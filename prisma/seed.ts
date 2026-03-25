import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, SkillEventType, SkillStatus } from "@prisma/client";
import { Pool } from "pg";
import { OWNER_EMAIL, VISITOR_EMAIL } from "../src/lib/constants";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const adapter = new PrismaPg(new Pool({ connectionString }));
const prisma = new PrismaClient({ adapter });

async function main() {
  const ownerPassword = await bcrypt.hash("ownerpass123", 10);
  const visitorPassword = await bcrypt.hash("visitorpass123", 10);

  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: { name: "Owner", passwordHash: ownerPassword, role: Role.OWNER },
    create: {
      email: OWNER_EMAIL,
      name: "Owner",
      passwordHash: ownerPassword,
      role: Role.OWNER,
    },
  });

  const visitor = await prisma.user.upsert({
    where: { email: VISITOR_EMAIL },
    update: { name: "Visitor", passwordHash: visitorPassword, role: Role.VISITOR },
    create: {
      email: VISITOR_EMAIL,
      name: "Visitor",
      passwordHash: visitorPassword,
      role: Role.VISITOR,
    },
  });

  const now = new Date();
  const demo = [
    {
      title: "Master React Server Components",
      category: "Engineering",
      status: SkillStatus.IN_PROGRESS,
      pinned: true,
      targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14),
      notes: "Build one production feature without client-side state drift.",
    },
    {
      title: "System design interview drills",
      category: "Career",
      status: SkillStatus.IN_PROGRESS,
      pinned: false,
      targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 21),
      notes: "Two mock sessions per week.",
    },
    {
      title: "Ship first public API case study",
      category: "Portfolio",
      status: SkillStatus.COMPLETED,
      pinned: true,
      completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2),
      notes: "Shared architecture and tradeoffs.",
    },
    {
      title: "Weekly strength training consistency",
      category: "Health",
      status: SkillStatus.COMPLETED,
      pinned: false,
      completedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 8),
      notes: "4 sessions completed with tracked progression.",
    },
  ];

  for (const item of demo) {
    const existing = await prisma.skill.findFirst({
      where: {
        userId: visitor.id,
        title: item.title,
      },
    });

    const skill =
      existing ??
      (await prisma.skill.create({
        data: {
          userId: visitor.id,
          title: item.title,
          category: item.category,
          status: item.status,
          pinned: item.pinned,
          completedAt: item.completedAt,
          targetDate: item.targetDate,
          notes: item.notes,
        },
      }));

    const created = await prisma.skillEvent.findFirst({
      where: { skillId: skill.id, eventType: SkillEventType.CREATED },
    });
    if (!created) {
      await prisma.skillEvent.create({
        data: {
          skillId: skill.id,
          userId: visitor.id,
          eventType: SkillEventType.CREATED,
          metadata: { source: "seed" },
        },
      });
    }

    if (skill.status === SkillStatus.COMPLETED) {
      const completed = await prisma.skillEvent.findFirst({
        where: { skillId: skill.id, eventType: SkillEventType.COMPLETED },
      });
      if (!completed) {
        await prisma.skillEvent.create({
          data: {
            skillId: skill.id,
            userId: visitor.id,
            eventType: SkillEventType.COMPLETED,
            metadata: { source: "seed" },
          },
        });
      }
    }
  }

  await prisma.skill.deleteMany({
    where: {
      userId: owner.id,
      title: { startsWith: "Demo:" },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
