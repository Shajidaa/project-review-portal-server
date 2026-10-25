import { AuditAction } from "../../../../../generated/prisma/enums";


export interface IAuditLogQuery {
    page?: number;
    limit?: number;
    userId?: string;
    action?: AuditAction;
    targetId?: string;
    from?: string; // ISO date string
    to?: string;   // ISO date string
}
