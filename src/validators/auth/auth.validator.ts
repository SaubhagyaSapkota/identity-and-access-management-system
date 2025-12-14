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

export const resendEmailVerificationSchema = z.object({
  body: z.object({
    email: z
      .string("Email is required")
      .trim()
      .email("Please enter a valid email address")
      .max(50, "Email should not exceed 50 characters")
      .toLowerCase(),
  }),
});

export const userLoginSchema = z.object({
  body: z.object({
    email: z
      .string("Email is required")
      .trim()
      .email("Please enter a valid email address")
      .max(50, "Email should not exceed 50 characters")
      .toLowerCase(),
    password: z.string().min(6, "Password must be at least 6 characters long"),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      oldPassword: z
        .string()
        .min(6, "Old password must be at least 6 characters long"),
      newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z.string("Confirm password is required").trim(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    }),
});

export const forgetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string("Email is required")
      .trim()
      .email("Please enter a valid email address")
      .max(50, "Email should not exceed 50 characters")
      .toLowerCase(),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string("Email is required")
        .trim()
        .email("Please enter a valid email address")
        .max(50, "Email should not exceed 50 characters")
        .toLowerCase(),
      newPassword: z
        .string()
        .min(6, "Password must be at least 6 characters long"),
      confirmPassword: z.string("Confirm password is required").trim(),
      verificationToken: z.string("Verification token is required").trim(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords must match",
      path: ["confirmPassword"],
    })
    .transform((data) => ({
      email: data.email,
      newPassword: data.newPassword,
      verificationToken: data.verificationToken,
    })),
});

export type RegisterUserInput = z.infer<typeof registerUserValidator>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UserLoginInput = z.infer<typeof userLoginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgetPasswordInput = z.infer<typeof forgetPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResendEmailVerificationSchema = z.infer<
  typeof resendEmailVerificationSchema
>;
