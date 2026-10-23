import bcrypt from "bcrypt";
import { prisma } from "../../../libs/prisma";
import AppError from "../../../errors/appError";
import httpStatus from "http-status";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt.utils";
import type { IRegister, ILogin, ITokenPayload } from "./auth.interface";
import config from "../../../config/env";
const buildTokens = (payload: ITokenPayload) => ({
  accessToken: signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

const register = async (payload: IRegister) => {
  const exists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (exists) {
    throw new AppError(httpStatus.CONFLICT, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.salt_rounds,
  );

  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      authProvider: "CREDENTIAL",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  const tokens = buildTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return { ...tokens };
};

const login = async (payload: ILogin) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.authProvider !== "CREDENTIAL" || !user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `This account uses ${user.authProvider.toLowerCase()} sign-in. Please use the correct provider.`,
    );
  }

  const isValid = await bcrypt.compare(payload.password, user.password);

  if (!isValid) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const tokens = buildTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });
  console.log(tokens);

  return tokens;
};

const refreshToken = async (token: string) => {
  const decoded = verifyRefreshToken(token); // throws JsonWebTokenError / TokenExpiredError — caught by global handler

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User no longer exists");
  }

  const tokens = buildTokens({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return tokens;
};

export const AuthService = { register, login, refreshToken };
