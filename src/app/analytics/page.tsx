import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { MonthlyChart, WeeklyChart } from "@/components/charts";
import { StatsCards } from "@/components/stats-cards";
import { db } from "@/lib/db";
import { getAnalyticsForUser } from "@/lib/skill-service";
import { VISITOR_EMAIL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const session = await auth();
  let userId: string | null = null;

  if (session?.user?.role === Role.OWNER && session.user.id) {
    userId = session.user.id;
  } else {
    const visitor = await db.user.findUnique({ where: { email: VISITOR_EMAIL } });
    userId = visitor?.id ?? null;
  }

  const analytics = userId
    ? await getAnalyticsForUser(userId)
    : {
        total: 0,
        inProgress: 0,
        completed: 0,
        completionRate: 0,
        unfinishedCommitments: 0,
        activeStreak: 0,
        weeklyCompletions: [],
        monthlyCompletions: [],
        categoryBreakdown: [],
      };

  return (
    <AppShell currentPath="/analytics">
      <StatsCards analytics={analytics} />
      <div className="grid gap-4 lg:grid-cols-2">
        <WeeklyChart data={analytics.weeklyCompletions} />
        <MonthlyChart data={analytics.monthlyCompletions} />
      </div>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-sm font-semibold text-zinc-200">Category Breakdown</h2>
        <ul className="mt-3 space-y-2">
          {analytics.categoryBreakdown.map((item) => (
            <li key={item.category} className="flex items-center justify-between text-sm text-zinc-300">
              <span>{item.category}</span>
              <span>
                {item.completed} completed / {item.inProgress} in progress
              </span>
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
