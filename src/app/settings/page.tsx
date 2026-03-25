import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { LoginButton, LogoutButton } from "@/components/auth-controls";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();
  const isOwner = session?.user?.role === Role.OWNER;

  return (
    <AppShell currentPath="/settings">
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
        <h2 className="text-xl font-semibold text-zinc-100">Settings</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Owner mode uses private data. Visitor mode displays seeded demo data only.
        </p>
        <div className="mt-4 flex gap-2">{isOwner ? <LogoutButton /> : <LoginButton />}</div>
      </section>
    </AppShell>
  );
}
