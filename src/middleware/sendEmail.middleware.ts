import { sendEmail } from "../shared/utils/sendGrid.email.utils";

export const EmailManager = {
  async sendEmailVerificationEmail(
    email: string,
    name: string,
    verificationLink: string
  ) {
    try {
      await sendEmail(
        email,
        "Verify your email address",
        `
              <h2>Hello ${name},</h2>
              <p>Click the link below to verify your email:</p>
              <a href="${verificationLink}">
                Verify Email
              </a>
              <p>If you didn’t request this, ignore this message.</p>
            `
      );

      return {
        success: true,
        message: "User registered. Verification email sent.",
      };
    } catch (error: any) {
      throw new Error(
        `EmailManager.sendEmailVerificationEmail failed for ${email}: ${error.message}`
      );
    }
  },

  async sendEmailVerificationConfirmation(email: string, name: string) {
    try {
      await sendEmail(
        email,
        "Email Verified Successfully",
        `
      <h2>Hello ${name},</h2>
      <p>Your email has been successfully verified.</p>
      <p>You can now log in.</p>
    `
      );

      return {
        success: true,
        message: "Email verified successfully. You can now log in.",
      };
    } catch (error: any) {
      throw new Error(
        `EmailManager.sendForgotPasswordEmail failed for ${email}: ${error.message}`
      );
    }
  },

  async sendPasswordResetEmail(
    email: string,
    name: string,
    verificationLink: string
  ) {
    try {
      await sendEmail(
        email,
        "Reset your password",
        `
        <h2>Hello ${name},</h2>
        <p>Click the link below to reset your Password:</p>
        <a href="${verificationLink}">
          Verify Email
        </a>
        <p>If you didn’t request this, ignore this message.</p>
      `
      );

      return {
        success: true,
        message: "Forgot password email sent successfully.",
      };
    } catch (error: any) {
      throw new Error(
        `EmailManager.sendForgotPasswordEmail failed for ${email}: ${error.message}`
      );
    }
  },

  async sendPasswordResetConfirmationEmail(
    email: string,
    name: string,
    url: string
  ) {
    try {
      await sendEmail(
        email,
        "Email to reset password",
        `
        <h2>Hello ${name},</h2>
        <p>Your password has been reset successfully.</p>
        <p>You can now log in.</p>
        <h2>${url}</h2>
      `
      );

      return {
        success: true,
        message: "Your Password has been reset.",
      };
    } catch (error: any) {
      throw new Error(
        `EmailManager.sendPasswordResetConfirmationEmail failed for ${email}: ${error.message}`
      );
    }
  },
};
