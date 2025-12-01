import { pool } from "../connections/postgres.connection";
import { seedPermissions } from "./seedPermissions";
import { seedRoles } from "./seedRoles";
import { seedRolePermissions } from "./seedRolePermissions";

async function seedAll() {
  try {
    console.log("Seeding started...");

    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    await pool.end();
  }
}

seedAll();
