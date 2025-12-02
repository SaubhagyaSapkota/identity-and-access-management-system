import { authenticateUser } from "./authUser.middleware";
import { checkRole } from "./checkRole.middleware";

export const createPlatformSecurity = {
  authenticatePlatfromUser: [
    authenticateUser,
    checkRole({
      hasRole: ["admin", "user"],
    }),
  ],
  authenticatePlatfromAdmin: [
    authenticateUser,
    checkRole({
      hasRole: ["admin"],
    }),
  ],
};

export default createPlatformSecurity;
