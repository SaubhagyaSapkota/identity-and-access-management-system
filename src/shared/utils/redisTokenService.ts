import redis from "../../database/connections/redis.connection";

const SESSION_PREFIX = "session:";
const USER_SESSIONS_PREFIX = "user:sessions:";
const REFRESH_TOKEN_PREFIX = "refresh_token:";
const BLACKLIST_PREFIX = "blacklist:";

export const redisTokenService = {
  // Save session data with access token JTI
  async saveUserSession(
    userId: string,
    accessJti: string,
    sessionData: object,
    expiresInSec: number = 15 * 60 // 15 minutes default
  ) {
    const sessionKey = `${SESSION_PREFIX}${userId}:${accessJti}`;
    await redis.setex(sessionKey, expiresInSec, JSON.stringify(sessionData));
  },

  // Track active session for a user
  async addActiveSession(userId: string, accessJti: string) {
    await redis.sadd(`${USER_SESSIONS_PREFIX}${userId}`, accessJti);
  },

  // Store refresh token mapping to access token
  async saveRefreshToken(
    refreshJti: string,
    accessJti: string,
    expiresInSec: number = 7 * 24 * 3600 // 7 days default
  ) {
    await redis.setex(
      `${REFRESH_TOKEN_PREFIX}${refreshJti}`,
      expiresInSec,
      accessJti
    );
  },

  // Delete user session from Redis
  async deleteUserSession(userId: string, accessJti: string) {
    const sessionKey = `${SESSION_PREFIX}${userId}:${accessJti}`;
    await redis.del(sessionKey);
  },

  // Remove active session from user's session set
  async removeActiveSession(userId: string, accessJti: string) {
    await redis.srem(`${USER_SESSIONS_PREFIX}${userId}`, accessJti);
  },

  // Delete refresh token mapping
  async deleteRefreshToken(refreshJti: string) {
    await redis.del(`${REFRESH_TOKEN_PREFIX}${refreshJti}`);
  },

  // Blacklist access token
  async blacklistAccessToken(accessJti: string, expiresInSec: number) {
    if (expiresInSec > 0) {
      await redis.setex(`${BLACKLIST_PREFIX}${accessJti}`, expiresInSec, "1");
    }
  },

  // Blacklist refresh token
  async blacklistRefreshToken(refreshJti: string, expiresInSec: number) {
    if (expiresInSec > 0) {
      await redis.setex(`${BLACKLIST_PREFIX}${refreshJti}`, expiresInSec, "1");
    }
  },

  // Check if token is blacklisted
  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const result = await redis.get(`${BLACKLIST_PREFIX}${jti}`);
    return result !== null;
  },

  // Get all active sessions for a user
  async getAllUserSessions(userId: string): Promise<string[]> {
    return await redis.smembers(`${USER_SESSIONS_PREFIX}${userId}`);
  },

  // Delete all user sessions
  async deleteAllUserSessions(userId: string, jtis: string[]) {
    for (const jti of jtis) {
      await this.deleteUserSession(userId, jti);
    }
  },

  // Blacklist multiple tokens
  async blacklistMultipleTokens(jtis: string[], expiresInSec: number) {
    for (const jti of jtis) {
      await this.blacklistAccessToken(jti, expiresInSec);
    }
  },

  // Clear user session tracking
  async clearUserSessionTracking(userId: string) {
    await redis.del(`${USER_SESSIONS_PREFIX}${userId}`);
  },

  // Get access JTI from refresh token
  async getAccessJtiFromRefreshToken(
    refreshJti: string
  ): Promise<string | null> {
    return await redis.get(`${REFRESH_TOKEN_PREFIX}${refreshJti}`);
  },

  // Update session with new tokens (used during refresh)
  async updateSessionTokens(
    userId: string,
    oldAccessJti: string,
    newAccessJti: string,
    oldRefreshJti: string,
    newRefreshJti: string,
    sessionData: object
  ) {
    // Delete old session
    await this.deleteUserSession(userId, oldAccessJti);
    await this.removeActiveSession(userId, oldAccessJti);
    await this.deleteRefreshToken(oldRefreshJti);

    // Create new session
    await this.saveUserSession(userId, newAccessJti, sessionData, 15 * 60);
    await this.addActiveSession(userId, newAccessJti);
    await this.saveRefreshToken(newRefreshJti, newAccessJti, 7 * 24 * 3600);
  },

  // Blacklist old tokens after refresh
  async blacklistOldTokensAfterRefresh(
    oldAccessJti: string,
    oldRefreshJti: string,
    refreshExpSeconds: number
  ) {
    // Blacklist old access token (15 minutes)
    await this.blacklistAccessToken(oldAccessJti, 15 * 60);

    // Blacklist old refresh token for remaining lifetime
    await this.blacklistRefreshToken(oldRefreshJti, refreshExpSeconds);
  },

  // Get session data
  async getSessionData(userId: string, accessJti: string): Promise<any | null> {
    const sessionKey = `${SESSION_PREFIX}${userId}:${accessJti}`;
    const data = await redis.get(sessionKey);
    return data ? JSON.parse(data) : null;
  },

  // Check if session exists
  async sessionExists(userId: string, accessJti: string): Promise<boolean> {
    const sessionKey = `${SESSION_PREFIX}${userId}:${accessJti}`;
    const exists = await redis.exists(sessionKey);
    return exists === 1;
  },

  // Get user's active session count
  async getUserSessionCount(userId: string): Promise<number> {
    return await redis.scard(`${USER_SESSIONS_PREFIX}${userId}`);
  },

  // Extend session expiry
  async extendSessionExpiry(
    userId: string,
    accessJti: string,
    expiresInSec: number
  ) {
    const sessionKey = `${SESSION_PREFIX}${userId}:${accessJti}`;
    await redis.expire(sessionKey, expiresInSec);
  },
};
