import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { de } from "zod/v4/locales";

dotenv.config();

export const jwtTokenService = {
  async generateEmailVerificationToken(
    userId: string,
    email: string
  ): Promise<string> {
    const token = jwt.sign(
      { userId, email },
      process.env.EMAIL_JWT_TOKEN_SECRET as string,
      { expiresIn: "15m" }
    );
    return token;
  },

    async verifyEmailVerificationToken(token: string): Promise<{ userId: string; email: string }> {
        try {
            const decoded = jwt.verify(
                token,
                process.env.EMAIL_JWT_TOKEN_SECRET as string
            ) as { userId: string; email: string };

            return decoded;
        } catch (error) {
            throw new Error("Invalid or expired verification token");
        }
    }
};
