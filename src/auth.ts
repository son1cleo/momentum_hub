import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validation";
import {
  checkLoginRateLimit,
  checkAccountLockout,
  recordLoginAttempt,
} from "@/lib/login-security";

const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw, request) {
        // Get IP address from request headers
        const ipAddress =
          (request?.headers?.get("x-forwarded-for") as string) ||
          (request?.headers?.get("x-real-ip") as string) ||
          "unknown";

        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        // Check rate limit
        const rateLimitCheck = await checkLoginRateLimit(email, ipAddress);
        if (!rateLimitCheck.allowed) {
          await recordLoginAttempt(
            email,
            ipAddress,
            false,
            undefined,
            rateLimitCheck.reason,
          );
          throw new Error(rateLimitCheck.reason);
        }

        // Check account lockout
        const lockoutCheck = await checkAccountLockout(email);
        if (lockoutCheck.locked) {
          await recordLoginAttempt(
            email,
            ipAddress,
            false,
            undefined,
            lockoutCheck.reason,
          );
          throw new Error(lockoutCheck.reason);
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
          await recordLoginAttempt(
            email,
            ipAddress,
            false,
            undefined,
            "User not found",
          );
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          await recordLoginAttempt(
            email,
            ipAddress,
            false,
            user.id,
            "Invalid password",
          );
          return null;
        }

        // Successful login
        await recordLoginAttempt(email, ipAddress, true, user.id);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        secure: true,
        sameSite: "lax",
        path: "/",
      },
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "role" in user) {
        token.role = user.role as Role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? Role.VISITOR;
      }
      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = request.nextUrl.pathname.startsWith("/owner");
      if (isProtected) {
        return isLoggedIn;
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
