import { z } from "zod";

const AUDIT_ACTIONS = [
    "SUBMISSION_CREATED",
    "SUBMISSION_APPROVED",
    "SUBMISSION_REJECTED",
    "SUBMISSION_DELETED",
    "USER_ROLE_UPDATED",
    "USER_DELETED",
    "USER_REGISTERED",
    "USER_LOGIN",
    "USER_PASSWORD_CHANGED",
    "USER_PASSWORD_RESET",
] as const;

const auditLogQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional().default(1),
        limit: z.coerce.number().int().min(1).max(100).optional().default(20),
        userId: z.string().uuid("Invalid userId").optional(),
        action: z.enum(AUDIT_ACTIONS).optional(),
        targetId: z.string().uuid("Invalid targetId").optional(),
        from: z.string().datetime({ offset: true }).optional(),
        to: z.string().datetime({ offset: true }).optional(),
    }),
});

export const AuditLogValidation = { auditLogQuerySchema };
