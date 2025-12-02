import { pool } from "../connections/postgres.connection";

export const roleRepository = {
  // Get all roles of a user
  async getRolesForUser(userId: string): Promise<string[]> {
    const result = await pool.query(
      `
      SELECT r.name
      FROM user_roles ur
      JOIN roles r ON r.roleid = ur.role_id
      WHERE ur.user_id = $1
      `,
      [userId]
    );

    return result.rows.map((row) => row.name);
  },

  // Get all permissions of a user
  async getUserPermissions(userId: string) {
    const result = await pool.query(
      `
      SELECT DISTINCT p.name
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.permissionid
      JOIN user_roles ur ON ur.role_id = rp.role_id
      WHERE ur.user_id = $1
    `,
      [userId]
    );

    return result.rows.map((p) => p.name);
  },
};
