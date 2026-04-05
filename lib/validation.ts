import { z } from "zod";

// ─────────────────────────────────────────────────────────────
//  All user input is validated here before touching the database.
//  Never trust what comes in from the browser.
// ─────────────────────────────────────────────────────────────

export const SignUpSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long")
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  fullName: z
    .string()
    .min(1, "Please enter your name")
    .max(100, "Name is too long")
    .trim(),
});

export const SignInSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(1, "Password is required").max(72),
});

export const AccessCodeSchema = z.object({
  code: z
    .string()
    .min(8, "Invalid access code")
    .max(64, "Invalid access code")
    .toUpperCase()
    .trim(),
});

export const JournalSchema = z.object({
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  data: z.record(z.unknown()).default({}),
});

export const ProfileUpdateSchema = z.object({
  fullName: z.string().max(100).trim().optional(),
  orgName: z.string().max(200).trim().optional(),
  orgMission: z.string().max(1000).trim().optional(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
    .optional(),
});

export type SignUpInput        = z.infer<typeof SignUpSchema>;
export type SignInInput        = z.infer<typeof SignInSchema>;
export type AccessCodeInput    = z.infer<typeof AccessCodeSchema>;
export type JournalInput       = z.infer<typeof JournalSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
