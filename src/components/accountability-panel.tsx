import type { AnalyticsPayload } from "@/lib/metrics";

export function AccountabilityPanel({ analytics }: { analytics: AnalyticsPayload }) {
  return (
    <section className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-zinc-900/70 p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Accountability Center</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{analytics.unfinishedCommitments} unfinished commitments</h2>
      <p className="mt-2 max-w-2xl text-sm text-zinc-300">
        This ledger keeps your unfinished promises visible. You can complete work, but never erase history.
      </p>
    </section>
  );
}
