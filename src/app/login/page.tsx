import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#23313b_0%,transparent_40%),radial-gradient(circle_at_80%_0%,#1e2330_0%,transparent_35%),#0b0f14] px-4 py-12 text-zinc-100">
      <div className="mx-auto max-w-md space-y-6">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold">Momentum Grid</h1>
          <p className="mt-2 text-sm text-zinc-400">Sign in to your accountability ledger.</p>
          
          <form
            className="mt-6 space-y-3"
            action={async (formData) => {
              "use server";
              await signIn("credentials", {
                email: formData.get("email"),
                password: formData.get("password"),
                redirectTo: "/",
              });
            }}
          >
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-zinc-400 mb-2">
                Email
              </label>
              <input
                required
                name="email"
                type="email"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm placeholder-zinc-600 focus:border-zinc-500 focus:outline-none transition"
                placeholder="owner@momentumgrid.local"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.1em] text-zinc-400 mb-2">
                Password
              </label>
              <input
                required
                name="password"
                type="password"
                className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm placeholder-zinc-600 focus:border-zinc-500 focus:outline-none transition"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full rounded-md bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-200 transition">
              Sign in
            </button>
          </form>

          <div className="mt-4 border-t border-zinc-800 pt-4">
            <p className="text-xs text-zinc-500 leading-relaxed">
              <strong>Demo credentials:</strong><br/>
              Email: owner@momentumgrid.local<br/>
              Password: ownerpass123
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold">Google Sign-in (Coming Soon)</h2>
          <p className="mt-2 text-xs text-zinc-400">
            OAuth integration is being configured. Coming in the next release.
          </p>
        </div>
      </div>
    </main>
  );
}
