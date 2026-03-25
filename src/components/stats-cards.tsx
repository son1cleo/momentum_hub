import type { AnalyticsPayload } from "@/lib/metrics";
import { toPercent } from "@/lib/utils";

export function StatsCards({ analytics }: { analytics: AnalyticsPayload }) {
  const cards = [
    { label: "Unfinished Commitments", value: analytics.unfinishedCommitments.toString() },
    { label: "Completion Rate", value: toPercent(analytics.completionRate) },
    { label: "Current Streak", value: `${analytics.activeStreak} days` },
    { label: "Completed", value: analytics.completed.toString() },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
          <p className="text-xs uppercase tracking-wider text-zinc-400">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-50">{card.value}</p>
        </article>
      ))}
    </div>
  );
}
