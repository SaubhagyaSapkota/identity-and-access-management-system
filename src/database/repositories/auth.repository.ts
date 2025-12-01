import { pool } from "../connections/postgres.connection";

export const authRepository = {
  // Create a new user
  async createUser({
    name,
    email,
    password,
  }: {
    name: string;
    email: string;
    password: string;
  }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, email, password || false]
    );
    return result.rows[0];
  },

  // Get role ID for user
  async getRoleIdByName(roleName: string) {
    const result = await pool.query(`SELECT id FROM roles WHERE name = $1`, [
      roleName,
    ]);
    return result.rows[0]?.id;
  },

  // Assign role to user
  async assignRoleToUser(userId: number, roleId: number) {
    await pool.query(
      `INSERT INTO user_roles (user_id, role_id)
     VALUES ($1, $2)`,
      [userId, roleId]
    );
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
