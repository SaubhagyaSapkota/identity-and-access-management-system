import { authRepository } from "../database/repositories/auth.repository";
import bcrypt from "bcrypt";
import { sendEmail } from "../middleware/sendEmail.middleware";
import { jwtTokenService } from "../utils/jwtToken.utils";
import { tokenRepository } from "../database/repositories/token.repository";

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

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    await sendEmail(
      email,
      "Verify your email address",
      `
        <h2>Hello ${name},</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${verifyLink}">
          Verify Email
        </a>
        <p>If you didn’t request this, ignore this message.</p>
      `
    );

    return {
      success: true,
      message: "User registered. Verification email sent.",
    };
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

    await sendEmail(
      email,
      "Email to reset password",
      `
        <h2>Hello ${user.name},</h2>
        <p>Click the link below to reset your Password:</p>
        <a href="${verifyLink}">
          Verify Email
        </a>
        <p>If you didn’t request this, ignore this message.</p>
      `
    );

    return {
      success: true,
      message: "Your Password has been reset.",
    };
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

    await sendEmail(
      email,
      "Email Verified Successfully",
      `
      <h2>Hello ${user.name},</h2>
      <p>Your email has been successfully verified.</p>
      <p>You can now log in.</p>
    `
    );

    return {
      success: true,
      message: "Email verified successfully. You can now log in.",
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
};
