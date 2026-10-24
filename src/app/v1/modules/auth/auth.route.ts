import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerSchema),
  AuthController.register,
);

router.post(
  "/verify-email",
  validateRequest(AuthValidation.verifyEmailSchema),
  AuthController.verifyEmail,
);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpSchema),
  AuthController.resendOtp,
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginSchema),
  AuthController.login,
);

router.post(
  "/refresh-token",
  validateRequest(AuthValidation.refreshTokenSchema),
  AuthController.refreshToken,
);

router.post("/logout", AuthController.logout);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordSchema),
  AuthController.forgotPassword,
);

router.post(
  "/reset-password",
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthController.resetPassword,
);

export const AuthRoutes = router;
