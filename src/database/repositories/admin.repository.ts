import { pool } from "../connections/postgres.connection";

export const adminRepository = {
  // Get all users
  async getAllUsers(userdata: any) {
    const result = await pool.query(`SELECT id, name, email FROM users`);
    return result.rows;
  },
};
