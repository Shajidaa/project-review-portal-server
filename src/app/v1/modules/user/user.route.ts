import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { authenticate, authorize } from "../../../middleware/authenticate";
import { UserValidation } from "./user.validation";

const router = Router();

// ── Own profile ──────────────────────────────────────────────────────────────
router.get("/me", authenticate, UserController.getMe);
router.patch(
  "/me",
  authenticate,
  validateRequest(UserValidation.updateProfileSchema),
  UserController.updateMe,
);
router.patch(
  "/me/change-password",
  authenticate,
  validateRequest(UserValidation.changePasswordSchema),
  UserController.changePassword,
);

// ── Admin only ───────────────────────────────────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize("ADMIN", "MODERATOR"),
  validateRequest(UserValidation.userQuerySchema),
  UserController.getAllUsers,
);
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "MODERATOR"),
  UserController.getUserById,
);
router.patch(
  "/:id/role",
  authenticate,
  authorize("ADMIN"),
  validateRequest(UserValidation.updateRoleSchema),
  UserController.updateUserRole,
);
router.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  UserController.deleteUser,
);

export const UserRoutes = router;
