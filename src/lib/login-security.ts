import { db } from "@/lib/db";

const LOCKOUT_DURATION_MINUTES = 15;
const MAX_FAILED_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 5;
const MAX_ATTEMPTS_PER_WINDOW = 10;

export async function checkLoginRateLimit(email: string, ipAddress: string) {
  // Check email-based rate limit (last 5 minutes)
  const recentAttempts = await db.loginEvent.count({
    where: {
      email,
      attemptAt: {
        gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000),
      },
    },
  });

  if (recentAttempts >= MAX_ATTEMPTS_PER_WINDOW) {
    return {
      allowed: false,
      reason: "Too many login attempts. Please try again later.",
    };
  }

  // Check IP-based rate limit (last 5 minutes)
  const ipAttempts = await db.loginEvent.count({
    where: {
      ipAddress,
      attemptAt: {
        gte: new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000),
      },
    },
  });

  if (ipAttempts >= MAX_ATTEMPTS_PER_WINDOW * 2) {
    return {
      allowed: false,
      reason: "Too many login attempts from this IP. Please try again later.",
    };
  }

  return { allowed: true };
}

export async function checkAccountLockout(email: string) {
  const user = await db.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  });

  if (!user) {
    return { locked: false };
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutesRemaining = Math.ceil(
      (user.lockedUntil.getTime() - Date.now()) / (60 * 1000),
    );
    return {
      locked: true,
      reason: `Account is locked. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? "s" : ""}.`,
    };
  }

  // Unlock if lockout period has expired
  if (user.lockedUntil && user.lockedUntil <= new Date()) {
    await db.user.update({
      where: { email },
      data: { lockedUntil: null, failedLoginAttempts: 0 },
    });
  }

  return { locked: false };
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  success: boolean,
  userId?: string,
  reason?: string,
) {
  await db.loginEvent.create({
    data: {
      email,
      ipAddress,
      success,
      userId: userId || undefined,
      reason: reason || undefined,
    },
  });

  if (success && userId) {
    // Reset failed attempts on successful login
    await db.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  } else if (!success) {
    // Increment failed attempts
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, failedLoginAttempts: true },
    });

    if (user) {
      const newAttempts = user.failedLoginAttempts + 1;

      // Lock account if max attempts reached
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockedUntil = new Date(
          Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000,
        );
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newAttempts,
            lockedUntil,
          },
        });
      } else {
        await db.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: newAttempts },
        });
      }
    }
  }
}

export async function getLoginAttempts(email: string, hoursBack: number = 24) {
  return db.loginEvent.findMany({
    where: {
      email,
      attemptAt: {
        gte: new Date(Date.now() - hoursBack * 60 * 60 * 1000),
      },
    },
    orderBy: { attemptAt: "desc" },
    take: 50,
  });
}
