import { AppShell } from "@/components/app-shell";
import { fmtDate } from "@/lib/date";
import { getPublicPinned } from "@/lib/skill-service";

export const dynamic = "force-dynamic";

export default async function PinnedPage() {
  const pinned = await getPublicPinned();

  return (
    <AppShell currentPath="/pinned">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-xl font-semibold text-zinc-100">Public Pinned Learnings</h2>
        <p className="mt-2 text-sm text-zinc-400">Portfolio-safe endpoint: /api/public/pinned</p>
        <p className="mt-2 text-sm text-zinc-300">Total completed pinned: {pinned.totalPinnedCompleted}</p>
      </section>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <ul className="space-y-3">
          {pinned.items.map((item) => (
            <li key={item.id} className="rounded-lg border border-zinc-800 bg-zinc-950/90 p-3">
              <p className="text-sm font-semibold text-zinc-100">{item.title}</p>
              <p className="text-xs text-zinc-400">{item.category} • completed {fmtDate(item.completedAt)}</p>
              {item.notes ? <p className="mt-1 text-sm text-zinc-300">{item.notes}</p> : null}
            </li>
          ))}
        </ul>
      </section>
    </AppShell>
  );
}
