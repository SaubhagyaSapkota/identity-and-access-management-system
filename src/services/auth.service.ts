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
    // 1. Find and validate user
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    if (!user.is_email_verified) {
      throw new Error("Please verify your email before logging in");
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // 3. Generate tokens with JTI
    const { token: accessToken, jti: accessJti } =
      await jwtTokenService.signAccessToken(user.id);
    const { token: refreshToken, jti: refreshJti } =
      await jwtTokenService.signRefreshToken(user.id);

    // 4. Hash refresh token for database
    const refreshTokenHash = sessionRepository.hashToken(refreshToken);

    // 5. Create session in database
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sessionRepository.createSession({
      user_id: user.id,
      access_token_jti: accessJti,
      refresh_token_hash: refreshTokenHash,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    });

    // 6. Cache session in Redis (fast lookup)
    const sessionData = {
      userId: user.id,
      email: user.email,
      accessJti,
      refreshJti,
      createdAt: new Date().toISOString(),
    };

    await redis.setex(
      `session:${user.id}:${accessJti}`,
      15 * 60, // 15 minutes
      JSON.stringify(sessionData)
    );

    // 7. Track active session
    await redis.sadd(`user:${user.id}:sessions`, accessJti);

    // 8. Store refresh token mapping (for token refresh flow)
    await redis.setex(`refresh:${refreshJti}`, 7 * 24 * 3600, accessJti);

    return { accessToken, refreshToken };
  },

  async logoutUser(accessToken: string, refreshToken: string) {
    try {
      // 1. Verify and decode tokens
      const accessDecoded: any = jwtTokenService.verifyAccessToken(accessToken);
      const refreshDecoded: any =
        jwtTokenService.verifyRefreshToken(refreshToken);

      const { userId, jti: accessJti } = accessDecoded;
      const { jti: refreshJti } = refreshDecoded;

      // 2. Revoke session in database (audit trail)
      await sessionRepository.revokeSessionByJti(accessJti);

      // 3. Delete session from Redis
      await redis.del(`session:${userId}:${accessJti}`);
      await redis.srem(`user:${userId}:sessions`, accessJti);

      // 4. Delete refresh token mapping
      await redis.del(`refresh:${refreshJti}`);

      // 5. Blacklist tokens (for remaining lifetime)
      const accessExpSeconds =
        accessDecoded.exp - Math.floor(Date.now() / 1000);
      const refreshExpSeconds =
        refreshDecoded.exp - Math.floor(Date.now() / 1000);

      if (accessExpSeconds > 0) {
        await redis.setex(`blacklist:${accessJti}`, accessExpSeconds, "1");
      }
      if (refreshExpSeconds > 0) {
        await redis.setex(`blacklist:${refreshJti}`, refreshExpSeconds, "1");
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Logout failed");
    }
  },

  async logoutAllDevices(userId: number) {
    // 1. Revoke all sessions in database
    await sessionRepository.revokeAllUserSessions(userId);

    // 2. Delete all Redis sessions
    const jtis = await redis.smembers(`user:${userId}:sessions`);

    for (const jti of jtis) {
      await redis.del(`session:${userId}:${jti}`);

      // Blacklist (get expiry from session data if needed)
      await redis.setex(`blacklist:${jti}`, 15 * 60, "1");
    }

    // 3. Clear session tracking
    await redis.del(`user:${userId}:sessions`);
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
    // 1. Verify and decode old refresh token
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

    // 2. Check if old refresh token is blacklisted
    const isBlacklisted = await redis.get(`blacklist:${oldRefreshJti}`);
    if (isBlacklisted) {
      // CRITICAL: Token reuse detected! Possible theft.
      console.error(`[SECURITY] Token reuse detected for user ${userId}`);

      // Revoke ALL user sessions
      await this.logoutAllDevices(userId);

      throw new Error(
        "Token reuse detected. All sessions revoked for security."
      );
    }

    // 3. Hash the old refresh token to find session in database
    const oldRefreshTokenHash = sessionRepository.hashToken(oldRefreshToken);

    // 4. Find session in database (source of truth)
    const session = await sessionRepository.findSessionByRefreshTokenHash(
      oldRefreshTokenHash
    );

    if (!session) {
      throw new Error("Session not found or expired");
    }

    // 5. Verify user ID matches
    if (session.user_id !== userId) {
      throw new Error("Token user mismatch");
    }

    // 6. Generate NEW tokens with NEW JTIs
    const { token: newAccessToken, jti: newAccessJti } =
      await jwtTokenService.signAccessToken(userId);
    const { token: newRefreshToken, jti: newRefreshJti } =
      await jwtTokenService.signRefreshToken(userId);

    // 7. Hash new refresh token for database
    const newRefreshTokenHash = sessionRepository.hashToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // 8. Update session in database with new tokens
    await sessionRepository.updateSessionTokens(
      session.id,
      newAccessJti,
      newRefreshTokenHash,
      newExpiresAt
    );

    // 9. Update Redis cache
    // Delete old access token session
    const oldAccessJti = session.access_token_jti;
    await redis.del(`session:${userId}:${oldAccessJti}`);
    await redis.srem(`user:${userId}:sessions`, oldAccessJti);

    // Create new access token session
    const sessionData = {
      userId,
      accessJti: newAccessJti,
      refreshJti: newRefreshJti,
      createdAt: new Date().toISOString(),
    };

    await redis.setex(
      `session:${userId}:${newAccessJti}`,
      15 * 60, // 15 minutes
      JSON.stringify(sessionData)
    );

    await redis.sadd(`user:${userId}:sessions`, newAccessJti);

    // 10. Update refresh token mapping
    await redis.del(`refresh:${oldRefreshJti}`);
    await redis.setex(`refresh:${newRefreshJti}`, 7 * 24 * 3600, newAccessJti);

    // 11. CRITICAL: Blacklist old refresh token
    const oldRefreshExpSeconds = exp - Math.floor(Date.now() / 1000);
    if (oldRefreshExpSeconds > 0) {
      await redis.setex(
        `blacklist:${oldRefreshJti}`,
        oldRefreshExpSeconds,
        "1"
      );
    }

    // 12. Optionally blacklist old access token too
    // Use a reasonable TTL for access token (15 minutes)
    await redis.setex(
      `blacklist:${oldAccessJti}`,
      15 * 60, // 15 minutes
      "1"
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },
};
