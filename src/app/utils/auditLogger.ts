import { AuditAction } from "../../generated/prisma";
import { prisma } from "../libs/prisma";

interface IAuditLogParams {
    userId: string;
    action: AuditAction;
    targetId?: string;
    details?: Record<string, unknown>;
}

/**
 * Fire-and-forget audit logger.
 * Errors are swallowed so they never break the primary operation.
 */
export const writeAuditLog = (params: IAuditLogParams): void => {
    prisma.auditLog
        .create({
            data: {
                userId: params.userId,
                action: params.action,
                targetId: params.targetId ?? null,
                details: params.details ?? null,
            },
        })
        .catch((err) => {
            console.error("[AuditLog] Failed to write audit log:", err);
        });
};
