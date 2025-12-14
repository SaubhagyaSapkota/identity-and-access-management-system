import redis from "../../database/connections/redis.connection";

const LOGIN_ATTEMPT_PREFIX = "login_attempts:";
const BLOCK_DURATION_SECONDS = 15 * 60; // 15 minutes
const MAX_ATTEMPTS = 5;

export const loginAttemptService = {
  getKey(identifier: string): string {
    return `${LOGIN_ATTEMPT_PREFIX}${identifier}`;
  },
  /**
   * Increment the failed login count for a user.
   * Returns the new count after increment.
   */
  async incrementFailedAttempts(identifier: string): Promise<number> {
    const key = this.getKey(identifier);
    const attempts = await redis.incr(key);
    if (attempts === 1) {
      // Set expiry only on first increment
      await redis.expire(key, BLOCK_DURATION_SECONDS);
    }
    return attempts;
  },

  /**
   * Check if the user is currently blocked due to too many failed attempts.
   */
  async isBlocked(identifier: string): Promise<boolean> {
    const key = this.getKey(identifier);
    const attempts = await redis.get(key);
    return attempts !== null && parseInt(attempts, 10) >= MAX_ATTEMPTS;
  },

  /**
   * Reset the failed login attempts (on successful login).
   */
  async resetAttempts(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    await redis.del(key);
  },

  /**
   * Get the remaining block time in seconds for a user.
   */
  async getBlockTTL(identifier: string): Promise<number> {
    const key = this.getKey(identifier);
    const ttl = await redis.ttl(key); // seconds remaining
    return ttl;
  },

  /**
   * Get the number of remaining attempts before the user is blocked.
   */
  async getRemainingAttempts(identifier: string): Promise<number> {
    const key = this.getKey(identifier);
    const attempts = await redis.get(key);
    return attempts
      ? Math.max(0, MAX_ATTEMPTS - parseInt(attempts, 10))
      : MAX_ATTEMPTS;
  },
};
