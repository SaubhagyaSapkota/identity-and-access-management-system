import { pool } from "../connections/postgres.connection";

export const tokenRepository = {
  // New method to save refresh token
  async saveRefreshToken(token: string, userId: number, expires: Date) {
    await pool.query(
      "INSERT INTO refresh_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)",
      [token, userId, expires]
    );
  },

  // New method to delete refresh token
  async deleteRefreshToken(token: string) {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  },
};
