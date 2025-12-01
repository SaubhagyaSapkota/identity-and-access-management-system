import { pool } from "../connections/postgres.connection";
import { ROLE_PERMISSIONS } from "../../config/default.permission.config";

export async function seedRoles() {
  const roles = Object.keys(ROLE_PERMISSIONS);

  for (const role of roles) {
    await pool.query(
      `
      INSERT INTO roles (name)
      VALUES ($1)
      ON CONFLICT (name) DO NOTHING;
      `,
      [role]
    );
  }

  console.log("Roles seeded.");
}
