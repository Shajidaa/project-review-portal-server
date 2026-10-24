import bcrypt from "bcrypt";
import { prisma } from "../../../libs/prisma";
import { redisClient } from "../../../libs/redis";
import AppError from "../../../errors/appError";
import httpStatus from "http-status";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../../utils/jwt.utils";
import {
  generateOtp,
  sendOtpEmail,
  sendWelcomeEmail,
  sendForgotPasswordOtpEmail,
  OTP_TTL_SECONDS,
  RESET_OTP_TTL_SECONDS,
} from "../../../utils/email.utils";
import type {
  IRegister,
  ILogin,
  ITokenPayload,
  IVerifyEmail,
  IResendOtp,
  IForgotPassword,
  IResetPassword,
} from "./auth.interface";
import config from "../../../config/env";

const OTP_KEY = (email: string) => `otp:${email}`;

const buildTokens = (payload: ITokenPayload) => ({
  accessToken: signAccessToken(payload),
  refreshToken: signRefreshToken(payload),
});

// ─── Register ───────────────────────────────────────────────────────────────
// Creates the user (unverified) and sends an OTP email.
// Does NOT return auth tokens — those come after verification.
const register = async (payload: IRegister) => {
  const exists = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (exists && exists.emailVerified) {
    throw new AppError(httpStatus.CONFLICT, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.salt_rounds);

  // Upsert: allow re-registration if account is not yet verified
  const user = exists
    ? await prisma.user.update({
      where: { email: payload.email },
      data: { name: payload.name, password: hashedPassword },
      select: { id: true, name: true, email: true, role: true },
    })
    : await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        authProvider: "CREDENTIAL",
        emailVerified: false,
      },
      select: { id: true, name: true, email: true, role: true },
    });

  const otp = generateOtp();

  await redisClient.setEx(OTP_KEY(user.email), OTP_TTL_SECONDS, otp);

  // Fire-and-forget — don't block registration response on email delivery
  sendOtpEmail(user.email, user.name, otp).catch((err) =>
    console.error("[OTP Email Error]", err),
  );

  return { email: user.email, name: user.name };
};

// ─── Verify Email ────────────────────────────────────────────────────────────
const verifyEmail = async (payload: IVerifyEmail) => {
  const { email, otp } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.emailVerified) {
    throw new AppError(httpStatus.CONFLICT, "Email is already verified");
  }

  const storedOtp = await redisClient.get(OTP_KEY(email));

  if (!storedOtp) {
    throw new AppError(
      httpStatus.GONE,
      "OTP has expired. Please request a new one.",
    );
  }

  if (storedOtp !== otp) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid OTP");
  }

  // Mark verified and clean up
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  await redisClient.del(OTP_KEY(email));

  // Send welcome email after successful verification
  sendWelcomeEmail(email, user.name).catch((err) =>
    console.error("[Welcome Email Error]", err),
  );

  const tokens = buildTokens({ id: user.id, email: user.email, role: user.role });

  return tokens;
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
const resendOtp = async (payload: IResendOtp) => {
  const { email } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.emailVerified) {
    throw new AppError(httpStatus.CONFLICT, "Email is already verified");
  }

  const otp = generateOtp();

  await redisClient.setEx(OTP_KEY(email), OTP_TTL_SECONDS, otp);

  await sendOtpEmail(email, user.name, otp);

  return { email };
};

// ─── Login ────────────────────────────────────────────────────────────────────
const login = async (payload: ILogin) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

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

  if (!user.emailVerified) {
    // Re-send an OTP so the user can complete verification
    const otp = generateOtp();
    await redisClient.setEx(OTP_KEY(user.email), OTP_TTL_SECONDS, otp);
    sendOtpEmail(user.email, user.name, otp).catch((err) =>
      console.error("[OTP Email Error]", err),
    );

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Email not verified. A new OTP has been sent to your email.",
    );
  }

  return buildTokens({ id: user.id, email: user.email, role: user.role });
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
const refreshToken = async (token: string) => {
  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User no longer exists");
  }

  return buildTokens({ id: user.id, email: user.email, role: user.role });
};

const RESET_KEY = (email: string) => `reset_otp:${email}`;

// ─── Forgot Password ──────────────────────────────────────────────────────────
// Generates a reset OTP and emails it. Always responds the same way to avoid
// user enumeration (don't reveal if the email exists or not in the response).
const forgotPassword = async (payload: IForgotPassword) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });

  if (user && user.authProvider === "CREDENTIAL") {
    const otp = generateOtp();
    await redisClient.setEx(RESET_KEY(user.email), RESET_OTP_TTL_SECONDS, otp);
    sendForgotPasswordOtpEmail(user.email, user.name, otp).catch((err) =>
      console.error("[Forgot Password Email Error]", err),
    );
  }

  // Always return the same shape — prevents email enumeration
  return { email: payload.email };
};

// ─── Reset Password ───────────────────────────────────────────────────────────
const resetPassword = async (payload: IResetPassword) => {
  const { email, otp, newPassword } = payload;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.authProvider !== "CREDENTIAL") {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid request");
  }

  const storedOtp = await redisClient.get(RESET_KEY(email));

  if (!storedOtp) {
    throw new AppError(
      httpStatus.GONE,
      "Reset code has expired. Please request a new one.",
    );
  }

  if (storedOtp !== otp) {
    throw new AppError(httpStatus.UNPROCESSABLE_ENTITY, "Invalid reset code");
  }

  const hashedPassword = await bcrypt.hash(newPassword, config.salt_rounds);

  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  await redisClient.del(RESET_KEY(email));

  return { email };
};

export const AuthService = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
