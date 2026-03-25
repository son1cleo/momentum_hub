import { z } from "zod";

export const createSkillSchema = z.object({
  title: z.string().trim().min(2).max(120),
  category: z.string().trim().min(2).max(40),
  targetDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), "Invalid target date"),
  pinned: z.boolean().optional().default(false),
  notes: z.string().trim().max(500).optional(),
});

export const pinSkillSchema = z.object({
  pinned: z.boolean(),
});

export const completeSkillSchema = z.object({
  completed: z.literal(true),
});

export const loginSchema = z.object({
  email: z.email().trim(),
  password: z.string().min(8).max(100),
});

export const passwordStrengthSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[!@#$%^&*]/, "Password must contain a special character (!@#$%^&*)"),
});
