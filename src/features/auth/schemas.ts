import { z } from "zod";

/** Same rules as the backend `passwordSchema`, so users see errors before the round-trip. */
export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(64, "At most 64 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[0-9]/, "Add a number");

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email").max(150);

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number");

const nameSchema = (label: string) => z.string().trim().min(1, `${label} is required`).max(100);

const withConfirm = <T extends z.ZodRawShape>(shape: T, field: string) =>
  z.object({ ...shape, confirmPassword: z.string().min(1, "Please confirm your password") }).refine(
    (v) => (v as Record<string, unknown>)[field] === v.confirmPassword,
    { path: ["confirmPassword"], message: "Passwords don't match" },
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required").max(64),
});

export const registerSchema = withConfirm(
  {
    firstName: nameSchema("First name"),
    lastName: nameSchema("Last name"),
    email: emailSchema,
    phone: z.union([phoneSchema, z.literal("")]).optional(),
    password: passwordSchema,
  },
  "password",
);

export const emailOnlySchema = z.object({ email: emailSchema });

export const resetPasswordSchema = withConfirm({ password: passwordSchema }, "password");

export const changePasswordSchema = withConfirm(
  { currentPassword: z.string().min(1, "Current password is required"), newPassword: passwordSchema },
  "newPassword",
).refine((v) => v.currentPassword !== v.newPassword, { path: ["newPassword"], message: "Use a different password than the current one" });

export const profileSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  phone: z.union([phoneSchema, z.literal("")]),
  address: z.string().trim().max(255),
  bio: z.string().trim().max(1000),
  profilePhoto: z.string().url().nullable(),
});
