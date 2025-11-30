import { authRepository } from "../database/repositories/auth.repository";
import bcrypt from "bcrypt";
import { sendEmail } from "../shared/utils/sendGrid.email.utils";
import { jwtTokenService } from "../shared/utils/jwtToken.utils";
import { tokenRepository } from "../database/repositories/token.repository";
import jwt from "jsonwebtoken";
import { EmailManager } from "middleware/sendEmail.middleware";

export const authService = {
  // service to register a user
  async registerUser(userData: any) {
    const { name, email, password } = userData;

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) throw new Error("User with that email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
      is_email_verified: false,
    });

    const token = await jwtTokenService.generateEmailVerificationToken(
      user.id,
      email
    );

    // Update timestamp BEFORE sending email
    await authRepository.updateLastVerificationEmailSentAt(user.id);

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    return await EmailManager.sendEmailVerificationEmail(
      email,
      name,
      verifyLink
    );
  },

  async loginUser(email: string, password: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (!user.is_email_verified) {
      throw new Error("Please verify your email before logging in");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const existingToken = await tokenRepository.findRefreshTokenByUserId(
      user.id
    );
    if (existingToken) {
      throw new Error("User already logged in");
    }

    const accessToken = await jwtTokenService.signAccessToken(user.id);
    const refreshToken = await jwtTokenService.signRefreshToken(user.id);

    await tokenRepository.saveRefreshToken(
      refreshToken,
      user.id,
      new Date(Date.now() + 7 * 86400000)
    );

    return { accessToken, refreshToken };
  },

  async logoutUser(refreshToken: any) {
    await tokenRepository.deleteRefreshToken(refreshToken);
  },

  async forgetPassword(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const token = await jwtTokenService.generateForgetPasswordToken(
      user.id,
      email
    );

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    return await EmailManager.sendPasswordResetEmail(
      email,
      user.name,
      verifyLink
    );
  },

  async resetPassword(
    email: string,
    newPassword: string,
    verificationToken: string
  ) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const isOldPassword = await bcrypt.compare(newPassword, user.password);
    if (isOldPassword) {
      throw new Error("New password must be different from the old password");
    }

    const isValidToken = await jwtTokenService.verifyPasswordResetToken(
      verificationToken
    );
    if (!isValidToken) {
      throw new Error("Invalid or expired verification token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await authRepository.updateUserPassword(user.id, hashedPassword);

    await EmailManager.sendPasswordResetConfirmationEmail(
      email,
      user.name,
      `${process.env.CLIENT_URL}/login`
    );
  },

  async verifyEmail(token: string, email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_email_verified) {
      return { message: "Email already verified" };
    }

    await jwtTokenService.verifyEmailVerificationToken(token);

    await authRepository.verifyUserEmail(user.id);

    await EmailManager.sendEmailVerificationConfirmation(email, user.name);
  },

  MIN_RESEND_DELAY: 2 * 60 * 1000, // 2 minutes

  async resendVerificationEmail(email: string) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.is_email_verified) {
      return { message: "Email already verified" };
    }

    const now = Date.now();
    const lastSent = user.last_verification_email_sent_at?.getTime() || 0;

    if (now - lastSent < this.MIN_RESEND_DELAY) {
      const delayRemaining = Math.ceil(
        (this.MIN_RESEND_DELAY - (now - lastSent)) / 1000
      );
      return {
        message: `Please wait ${delayRemaining} seconds before resending`,
        emailSent: false,
        delayRemaining,
      };
    }

    const token = await jwtTokenService.generateEmailVerificationToken(
      user.id,
      email
    );

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await EmailManager.sendEmailVerificationEmail(email, user.name, verifyLink);

    await authRepository.updateLastVerificationEmailSentAt(user.id);

    return {
      success: true,
      message: "Resent Verification email.",
    };
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await authRepository.findByuserID(userId);
    if (!user) {
      throw new Error("user not found");
    }

    const isOldPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPassword) {
      throw new Error("Old password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await authRepository.updateUserPassword(userId, hashedPassword);

    return { success: true, message: "Password changed successfully" };
  },

  async refreshAccessToken(oldRefreshToken: string) {
    const tokenExists = await tokenRepository.findRefreshToken(oldRefreshToken);
    if (!tokenExists) {
      throw new Error("Refresh token not found or invalid");
    }

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    const userId = decoded.userId;

    const newAccessToken = await jwtTokenService.signAccessToken(userId);
    const newRefreshToken = await jwtTokenService.signRefreshToken(userId);

    await tokenRepository.deleteRefreshToken(oldRefreshToken);

    await tokenRepository.saveRefreshToken(
      newRefreshToken,
      userId,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },
};
