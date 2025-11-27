import { adminRepository } from "../database/repositories/admin.repository";

export const adminService = {
  //Service to Get all users
  async allUsers(userData: any) {
    const result = await adminRepository.getAllUsers(userData);
    return result;
  },

};
