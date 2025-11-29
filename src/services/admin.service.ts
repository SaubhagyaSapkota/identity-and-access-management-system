import { adminRepository } from "../database/repositories/admin.repository";

export const adminService = {
  //Service to Get all users
  async allUsers(queryParams: any) {
    const filters = {
      name: queryParams.name as string | undefined,
      email: queryParams.email as string | undefined,
    };

    const limit = queryParams.limit
      ? parseInt(queryParams.limit as string)
      : 10;
    const offset = queryParams.offset
      ? parseInt(queryParams.offset as string)
      : 0;

    const users = await adminRepository.getAllUsers(filters, limit, offset);
    return users;
  },
};
