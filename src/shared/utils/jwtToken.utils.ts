import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {v4 as uuidv4} from "uuid";

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

  async verifyEmailVerificationToken(
    token: string
  ): Promise<{ userId: string; email: string }> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.EMAIL_JWT_TOKEN_SECRET as string
      ) as { userId: string; email: string };

      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired verification token");
    }
  },

  async signAccessToken(userId: number) {
    const jti = uuidv4();
    return {
      token: jwt.sign({ userId, jti }, process.env.JWT_SECRET!, {
        expiresIn: "15m",
      }),
      jti,
    };
  },

  async signRefreshToken(userId: number) {
    const jti = uuidv4();
    return {
      token: jwt.sign(
        { userId, jti, type: "refresh" },
        process.env.REFRESH_TOKEN_SECRET!,
        { expiresIn: "7d" }
      ),
      jti,
    };
  },

  verifyAccessToken(token: string) {
    return jwt.verify(token, process.env.JWT_SECRET!);
  },

  verifyRefreshToken(token: string) {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
  },

  async generateForgetPasswordToken(userId: string, email: string) {
    const token = jwt.sign(
      { userId, email },
      process.env.PASSWORD_JWT_SECRET as string,
      { expiresIn: "15m" }
    );
    return token;
  },

  async verifyPasswordResetToken(
    token: string
  ): Promise<{ userId: string; email: string }> {
    try {
      const decoded = jwt.verify(
        token,
        process.env.PASSWORD_JWT_SECRET as string
      ) as { userId: string; email: string };

      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired verification token");
    }
  },
};
