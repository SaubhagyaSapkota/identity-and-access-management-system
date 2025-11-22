import z from "zod";

export const registerUserValidator = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .email("Please enter a valid email address")
      .max(50, "Email should not exceed 50 characters")
      .toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Token is required"),
    email: z
      .string("Email is required")
      .trim()
      .email("Please enter a valid email address")
      .max(50, "Email should not exceed 50 characters")
      .toLowerCase(),
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserValidator>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;