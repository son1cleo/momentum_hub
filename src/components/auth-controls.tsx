"use client";

import { signIn, signOut } from "next-auth/react";

export function LoginButton() {
  return (
    <button
      onClick={() => signIn(undefined, { callbackUrl: "/" })}
      className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
    >
      Login as Owner
    </button>
  );
}

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200"
    >
      Logout
    </button>
  );
}
