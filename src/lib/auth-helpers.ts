import { Role } from "@prisma/client";
import { auth } from "@/auth";

export async function getSessionUser() {
  const session = await auth();
  return session?.user;
}

export async function requireOwner() {
  const user = await getSessionUser();
  if (!user || user.role !== Role.OWNER) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function getMode() {
  const user = await getSessionUser();
  return user?.role === Role.OWNER ? "OWNER" : "VISITOR";
}
