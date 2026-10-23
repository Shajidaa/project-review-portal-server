import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { AuthService } from "./auth.service";
import { cookieOptions, setAuthCookies } from "../../../utils/setCookies";

const register = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await AuthService.register(req.body);

  setAuthCookies(res, accessToken, refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: { accessToken, refreshToken },
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

export const AuthController = { register, login, refreshToken, logout };
