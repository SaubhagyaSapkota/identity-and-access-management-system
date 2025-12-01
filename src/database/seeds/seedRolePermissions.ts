import { pool } from "../connections/postgres.connection";
import { ROLE_PERMISSIONS } from "../../config/default.permission.config";

export async function seedRolePermissions() {
  const rolePermissionMap = ROLE_PERMISSIONS;

  for (const [roleName, permissions] of Object.entries(rolePermissionMap)) {
    for (const permName of permissions) {
      await pool.query(
        `
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT r.roleid, p.permissionid
        FROM roles r
        JOIN permissions p ON p.name = $1
        WHERE r.name = $2
        ON CONFLICT DO NOTHING;
      `,
        [permName, roleName]
      );
    }
  }

  console.log("Role-permission mappings seeded.");
}
