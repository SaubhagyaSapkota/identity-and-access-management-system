import { pool } from "../connections/postgres.connection";

export const adminRepository = {
  // Get all users

  async getAllUsers(
    filters?: { name?: string; email?: string },
    limit = 10,
    offset = 0
  ) {
    let query = "SELECT id, name, email FROM users";
    const conditions: string[] = [];
    const params: any[] = [];
    let i = 1;

    // Filter by name
    if (filters?.name) {
      conditions.push(`name ILIKE $${i++}`);
      params.push(`%${filters.name}%`);
    }

    // Filter by email
    if (filters?.email) {
      conditions.push(`email ILIKE $${i++}`);
      params.push(`%${filters.email}%`);
    }

    // Add WHERE clause if there are filters
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    // Pagination
    query += ` ORDER BY id LIMIT $${i++} OFFSET $${i++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    return result.rows;
  },
};
