import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { AuditLogService } from "./auditLog.service";

// ── Admin: all logs with optional filters ─────────────────────────────────────
const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
    const { logs, meta } = await AuditLogService.getAuditLogs(req.query as any);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Audit logs retrieved successfully",
        data: logs,
        meta,
    });
});

// ── Admin: logs for a specific user ───────────────────────────────────────────
const getAuditLogsByUser = catchAsync(async (req: Request, res: Response) => {
    const { logs, meta } = await AuditLogService.getAuditLogsByUser(
        req.params.userId as string,
        req.query as any,
    );

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User audit logs retrieved successfully",
        data: logs,
        meta,
    });
});

export const AuditLogController = {
    getAuditLogs,
    getAuditLogsByUser,
};
