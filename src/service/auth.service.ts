import { authRepository } from "../database/repositories/auth.repository";
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";

export const authService = {
  // service to register a user
  async registerUser(userData: any) {
    const { name, email, password } = userData;

    const existingUser = await authRepository.findUserByEmail(email);
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
      name,
      email,
      password: hashedPassword,
    });

    const token = randomBytes(32).toString("hex");

    // await authRepository.saveVerificationToken(user.id, token);

    return { user }; //verificationToken: token
  },

  //Service to Get all users
  async allUsers(userData: any){
    const result = await authRepository.getAllUsers(userData);
    return result;
  }
};
