import { prisma } from "../../../libs/prisma";
import type { IAuditLogQuery } from "./auditLog.interface";

// Shared select — include actor's basic info
const auditLogSelect = {
    id: true,
    action: true,
    targetId: true,
    details: true,
    createdAt: true,
    user: {
        select: { id: true, name: true, email: true, role: true },
    },
};

const getAuditLogs = async (query: IAuditLogQuery) => {
    const limit = Number(query.limit) || 20;
    const page = Number(query.page) || 1;
    const skip = (page - 1) * limit;

    const where = {
        ...(query.userId && { userId: query.userId }),
        ...(query.action && { action: query.action }),
        ...(query.targetId && { targetId: query.targetId }),
        ...((query.from || query.to) && {
            createdAt: {
                ...(query.from && { gte: new Date(query.from) }),
                ...(query.to && { lte: new Date(query.to) }),
            },
        }),
    };

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            select: auditLogSelect,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        logs,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

const getAuditLogsByUser = async (userId: string, query: IAuditLogQuery) => {
    return getAuditLogs({ ...query, userId });
};

export const AuditLogService = {
    getAuditLogs,
    getAuditLogsByUser,
};
