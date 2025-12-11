import { pool } from "../connections/postgres.connection";
import crypto from "crypto";

export const sessionRepository = {
  createSession: async (data: {
    user_id: number;
    access_token_jti: string;
    refresh_token_hash: string;
    ip_address: string;
    user_agent: string;
    expires_at: Date;
  }) => {
    const query = `
      INSERT INTO sessions (
        user_id, 
        access_token_jti,
        refresh_token_hash, 
        ip_address, 
        user_agent,
        expires_at,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *;
    `;

    const values = [
      data.user_id,
      data.access_token_jti,
      data.refresh_token_hash,
      data.ip_address,
      data.user_agent,
      data.expires_at,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findSessionByJti: async (jti: string) => {
    const query = `
      SELECT * FROM sessions
      WHERE access_token_jti = $1 
      AND revoked_at IS NULL
      AND expires_at > NOW()
      LIMIT 1;
    `;
    const result = await pool.query(query, [jti]);
    return result.rows[0];
  },

  revokeSessionByJti: async (jti: string) => {
    const query = `
      UPDATE sessions
      SET revoked_at = NOW()
      WHERE access_token_jti = $1
      RETURNING *;
    `;
    const result = await pool.query(query, [jti]);
    return result.rows[0];
  },

  revokeAllUserSessions: async (userId: number) => {
    const query = `
      UPDATE sessions
      SET revoked_at = NOW()
      WHERE user_id = $1 
      AND revoked_at IS NULL
      RETURNING access_token_jti;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  },

  findSessionByRefreshTokenHash: async (refreshTokenHash: string) => {
    const query = `
      SELECT * FROM sessions
      WHERE refresh_token_hash = $1 
      AND revoked_at IS NULL
      AND expires_at > NOW()
      LIMIT 1;
    `;
    const result = await pool.query(query, [refreshTokenHash]);
    return result.rows[0];
  },

  updateSessionTokens: async (
    sessionId: number,
    newAccessJti: string,
    newRefreshTokenHash: string,
    newExpiresAt: Date
  ) => {
    const query = `
      UPDATE sessions
      SET 
        access_token_jti = $2,
        refresh_token_hash = $3,
        expires_at = $4,
        updated_at = NOW()
      WHERE id = $1
      AND revoked_at IS NULL
      RETURNING *;
    `;
    const result = await pool.query(query, [
      sessionId,
      newAccessJti,
      newRefreshTokenHash,
      newExpiresAt,
    ]);
    return result.rows[0];
  },

  // findSessionByRefreshToken: async (token: string) => {
  //   const query = `
  //     SELECT * FROM sessions
  //     WHERE refresh_token = $1
  //     LIMIT 1;
  //   `;

  //   const result = await pool.query(query, [token]);
  //   return result.rows[0];
  // },

  // revokeSession: async (sessionId: string) => {
  //   const query = `
  //     UPDATE sessions
  //     SET revoked = TRUE
  //     WHERE id = $1
  //     RETURNING *;
  //   `;

  //   const result = await pool.query(query, [sessionId]);
  //   return result.rows[0];
  // },
};
