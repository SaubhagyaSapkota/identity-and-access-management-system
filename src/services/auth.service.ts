import { authRepository } from "../database/repositories/auth.repository";
import bcrypt from "bcrypt";
import { jwtTokenService } from "../shared/utils/jwtToken.utils";
import jwt from "jsonwebtoken";
import { EmailManager } from "middleware/sendEmail.middleware";
import { redisTokenService } from "shared/utils/redisTokenService";
import redis from "../database/connections/redis.connection";
import { sessionRepository } from "database/repositories/session.repository";
import crypto from "crypto";

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
    });

    const userRoleId = await authRepository.getRoleIdByName("user");
    await authRepository.assignRoleToUser(user.id, userRoleId);

    const token = await jwtTokenService.generateEmailVerificationToken(
      user.id,
      email
    );

    // Update timestamp BEFORE sending email
    await authRepository.updateLastVerificationEmailSentAt(user.id);

    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    EmailManager.sendEmailVerificationEmail(email, name, verifyLink);
    return user;
  },

  async loginUser(
    email: string,
    password: string,
    userAgent: string,
    ipAddress: string
  ) {
    // Find and validate user
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.is_email_verified) {
      throw new Error("Please verify your email before logging in");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens with JTI
    const { token: accessToken, jti: accessJti } =
      await jwtTokenService.signAccessToken(user.id);
    const { token: refreshToken, jti: refreshJti } =
      await jwtTokenService.signRefreshToken(user.id);

    // Hash refresh token for database
    const refreshTokenHash = sessionRepository.hashToken(refreshToken);

    // Create session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sessionRepository.createSession({
      user_id: user.id,
      access_token_jti: accessJti,
      refresh_token_hash: refreshTokenHash,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    // Cache session in Redis (fast lookup)
    const sessionData = {
      userId: user.id,
      email: user.email,
      accessJti,
      refreshJti,
      createdAt: new Date().toISOString(),
    };

    await redisTokenService.saveUserSession(
      user.id,
      accessJti,
      sessionData,
      15 * 60
    );

    await redisTokenService.addActiveSession(user.id, accessJti);

    await redisTokenService.saveRefreshToken(
      refreshJti,
      accessJti,
      7 * 24 * 3600
    );

    return { accessToken, refreshToken };
  },

  async logoutUser(accessToken: string, refreshToken: string) {
    // Verify and decode tokens
    const accessDecoded: any = jwtTokenService.verifyAccessToken(accessToken);
    const refreshDecoded: any =
      jwtTokenService.verifyRefreshToken(refreshToken);

    const { userId, jti: accessJti } = accessDecoded;
    const { jti: refreshJti } = refreshDecoded;

    // Revoke session in database
    await sessionRepository.revokeSessionByJti(accessJti);

    // Delete session from Redis using service methods
    await redisTokenService.deleteUserSession(userId, accessJti);
    await redisTokenService.removeActiveSession(userId, accessJti);
    await redisTokenService.deleteRefreshToken(refreshJti);

    // Blacklist tokens (for remaining lifetime)
    const accessExpSeconds = accessDecoded.exp - Math.floor(Date.now() / 1000);
    const refreshExpSeconds =
      refreshDecoded.exp - Math.floor(Date.now() / 1000);

    // Blacklist tokens using service methods
    await redisTokenService.blacklistAccessToken(accessJti, accessExpSeconds);
    await redisTokenService.blacklistRefreshToken(
      refreshJti,
      refreshExpSeconds
    );
  },

  async logoutAllDevices(userId: number) {
    // Revoke all sessions in database
    await sessionRepository.revokeAllUserSessions(userId);

    // Get all active sessions from Redis
    const jtis = await redisTokenService.getAllUserSessions(userId.toString());

    // Delete all sessions and blacklist tokens
    await redisTokenService.deleteAllUserSessions(userId.toString(), jtis);
    await redisTokenService.blacklistMultipleTokens(jtis, 15 * 60);

    // Clear session tracking
    await redisTokenService.clearUserSessionTracking(userId.toString());
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
    // Verify and decode old refresh token
    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as jwt.JwtPayload;

    // Validate required fields
    if (!decoded.exp || !decoded.userId || !decoded.jti) {
      throw new Error("Invalid token structure");
    }

    if (decoded.type !== "refresh") {
      throw new Error("Invalid token type");
    }

    const { userId, jti: oldRefreshJti, exp } = decoded;

    // Check if old refresh token is blacklisted
    const isBlacklisted = await redisTokenService.isTokenBlacklisted(
      oldRefreshJti
    );
    if (isBlacklisted) {
      // CRITICAL: Token reuse detected! Possible theft.
      console.error(`[SECURITY] Token reuse detected for user ${userId}`);

      // Revoke ALL user sessions
      await this.logoutAllDevices(userId);

      throw new Error(
        "Token reuse detected. All sessions revoked for security."
      );
    }

    // Hash the old refresh token to find session in database
    const oldRefreshTokenHash = sessionRepository.hashToken(oldRefreshToken);

    // Find session in database
    const session = await sessionRepository.findSessionByRefreshTokenHash(
      oldRefreshTokenHash
    );

    if (!session) {
      throw new Error("Session not found or expired");
    }

    // Verify user ID matches
    if (session.user_id !== userId) {
      throw new Error("Token user mismatch");
    }

    // Generate NEW tokens with NEW JTIs
    const { token: newAccessToken, jti: newAccessJti } =
      await jwtTokenService.signAccessToken(userId);
    const { token: newRefreshToken, jti: newRefreshJti } =
      await jwtTokenService.signRefreshToken(userId);

    // Hash new refresh token for database
    const newRefreshTokenHash = sessionRepository.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Update session in database with new tokens
    await sessionRepository.updateSessionTokens(
      session.id,
      newAccessJti,
      newRefreshTokenHash,
      newExpiresAt
    );

    // Get old access JTI from session
    const oldAccessJti = session.access_token_jti;

    // Create new access token session
    const sessionData = {
      userId,
      accessJti: newAccessJti,
      refreshJti: newRefreshJti,
      createdAt: new Date().toISOString(),
    };

    // Update Redis cache using service method
    await redisTokenService.updateSessionTokens(
      userId.toString(),
      oldAccessJti,
      newAccessJti,
      oldRefreshJti,
      newRefreshJti,
      sessionData
    );

    // Calculate old refresh token remaining lifetime
    const oldRefreshExpSeconds = exp - Math.floor(Date.now() / 1000);

    // Blacklist old tokens using service method
    await redisTokenService.blacklistOldTokensAfterRefresh(
      oldAccessJti,
      oldRefreshJti,
      oldRefreshExpSeconds
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
};
