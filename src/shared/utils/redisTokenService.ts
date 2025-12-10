import redis from "../../database/connections/redis.connection";

const REFRESH_TOKEN_PREFIX = "refresh_token:";
const BLACKLIST_PREFIX = "blacklist:";

export const redisTokenService = {
  async saveRefreshToken(token: string, userId: string, expiresInSec: number) {
    await redis.set(REFRESH_TOKEN_PREFIX + token, userId, "EX", expiresInSec);
  },

  async findRefreshToken(token: string) {
    return await redis.get(REFRESH_TOKEN_PREFIX + token);
  },

  async deleteRefreshToken(token: string) {
    await redis.del(REFRESH_TOKEN_PREFIX + token);
  },

  async blacklistToken(token: string, expiresInSec: number) {
    await redis.set(BLACKLIST_PREFIX + token, "true", "EX", expiresInSec);
  },

  async isTokenBlacklisted(token: string) {
    return await redis.get(BLACKLIST_PREFIX + token);
  },
};
