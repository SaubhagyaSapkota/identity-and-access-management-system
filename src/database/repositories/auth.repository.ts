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
      [name, email, password]
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

  // Save a verification token
  async saveVerificationToken(userId: number, token: string) {
    const result = await pool.query(
      `INSERT INTO verification_tokens (user_id, token)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, token]
    );
    return result.rows[0];
  },

  // Get all users
  async getAllUsers(userdata: any) {
    const result = await pool.query(`SELECT id, name, email FROM users`);
    return result.rows;
  }
};
