import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { cookieOptions, setAuthCookies } from "../../../utils/setCookies";

const register = catchAsync(async (req: Request, res: Response) => {
  const { email, name } = await AuthService.register(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Registration successful. Please check your email for the OTP.",
    data: { email, name },
  });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.verifyEmail(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email verified successfully",
    data: { accessToken, refreshToken },
  });
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resendOtp(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP resent successfully. Please check your email.",
    data: null,
  });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.login(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: { accessToken, refreshToken },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const token: string | undefined =
    req.cookies?.refreshToken ?? req.body?.refreshToken;

  if (!token) {
    res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Refresh token not provided",
    });
    return;
  }

  const { accessToken, refreshToken: newRefreshToken } =
    await AuthService.refreshToken(token);

  setAuthCookies(res, accessToken, newRefreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: { accessToken },
  });
});

const logout = catchAsync(async (_req: Request, res: Response) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out successfully",
    data: null,
  });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "If that email exists, a reset code has been sent.",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully. You can now log in.",
    data: null,
  });
});

export const AuthController = {
  register,
  verifyEmail,
  resendOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};
