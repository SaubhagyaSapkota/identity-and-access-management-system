import { pool } from "../connections/postgres.connection";

export const authRepository = {
  // Create a new user
  async createUser({
    name,
    email,
    password,
    is_email_verified,
  }: {
    name: string;
    email: string;
    password: string;
    is_email_verified?: boolean;
  }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, is_email_verified)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, password, is_email_verified || false]
    );
    return result.rows[0];
  },

  // Find a user by email
  async findUserByEmail(email: string) {
    const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
      email,
    ]);
    return result.rows[0] || null;
  },

  // Update user email verification status
  async verifyUserEmail(id: string) {
    await pool.query(
      "UPDATE users SET is_email_verified = TRUE, email_verified_at = NOW() WHERE id = $1",
      [id]
    );
  },

  // Find a user by id
  async findByuserID(userId: string) {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [
      userId,
    ]);
    return result.rows[0] || null;
  },

  // Update user password by user id
  async updateUserPassword(userId: string, hashedPassword: string) {
    const result = await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2 RETURNING id, email`,
      [hashedPassword, userId]
    );
    return result.rows[0] || null;
  },

  // Update last verification email sent timestamp
  async updateLastVerificationEmailSentAt(id: string) {
    await pool.query(
      "UPDATE users SET last_verification_email_sent_at = NOW() WHERE id = $1",
      [id]
    );
  },
};
