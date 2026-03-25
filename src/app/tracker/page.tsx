import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { TrackerClient } from "@/components/tracker-client";
import { db } from "@/lib/db";
import { getSkillsForUser } from "@/lib/skill-service";
import { VISITOR_EMAIL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const session = await auth();
  let mode: "OWNER" | "VISITOR" = "VISITOR";
  let userId: string | null = null;

  if (session?.user?.role === Role.OWNER && session.user.id) {
    mode = "OWNER";
    userId = session.user.id;
  } else {
    const visitor = await db.user.findUnique({ where: { email: VISITOR_EMAIL } });
    userId = visitor?.id ?? null;
  }

  const skills = userId ? await getSkillsForUser(userId) : [];

  return (
    <AppShell currentPath="/tracker">
      <TrackerClient initialSkills={skills} mode={mode} />
    </AppShell>
  );
}
