import { Router } from "express";
import { AuditLogController } from "./auditLog.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { authenticate, authorize } from "../../../middleware/authenticate";
import { AuditLogValidation } from "./auditLog.validation";

const router = Router();

// All audit log routes are ADMIN-only
router.get(
    "/",
    authenticate,
    authorize("ADMIN"),
    validateRequest(AuditLogValidation.auditLogQuerySchema),
    AuditLogController.getAuditLogs,
);

router.get(
    "/users/:userId",
    authenticate,
    authorize("ADMIN"),
    validateRequest(AuditLogValidation.auditLogQuerySchema),
    AuditLogController.getAuditLogsByUser,
);

export const AuditLogRoutes = router;
