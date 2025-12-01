import { pool } from "../connections/postgres.connection";
import { PERMISSIONS } from "../../config/default.permission.config";

export async function seedPermissions() {
  const permissions = Object.values(PERMISSIONS);

  for (const perm of permissions) {
    await pool.query(
      `
      INSERT INTO permissions (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING;
      `,
      [perm]
    );
  }

  console.log("Permissions seeded.");
}
