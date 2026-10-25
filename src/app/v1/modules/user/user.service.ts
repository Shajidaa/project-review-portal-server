import bcrypt from "bcrypt";
import { prisma } from "../../../libs/prisma";
import AppError from "../../../errors/appError";
import httpStatus from "http-status";
import { writeAuditLog } from "../../../utils/auditLogger";
import type { IUpdateProfile, IChangePassword, IUpdateRole, IUserQuery } from "./user.interface";

const SALT_ROUNDS = 12;

// Safe field selection — never expose password
const safeSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    gender: true,
    avatarUrl: true,
    emailVerified: true,
    authProvider: true,
    createdAt: true,
    updatedAt: true,
};

const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: safeSelect,
    });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    return user;
};

const updateMe = async (userId: string, payload: IUpdateProfile) => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: payload,
        select: safeSelect,
    });

    return user;
};

const changePassword = async (userId: string, payload: IChangePassword) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
        throw new AppError(httpStatus.BAD_REQUEST, "Password change is not available for this account");
    }

    const isMatch = await bcrypt.compare(payload.currentPassword, user.password);

    if (!isMatch) {
        throw new AppError(httpStatus.UNAUTHORIZED, "Current password is incorrect");
    }

    if (payload.currentPassword === payload.newPassword) {
        throw new AppError(httpStatus.BAD_REQUEST, "New password must differ from the current password");
    }

    const hashed = await bcrypt.hash(payload.newPassword, SALT_ROUNDS);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashed },
    });

    writeAuditLog({ userId, action: "USER_PASSWORD_CHANGED" });
};

const getAllUsers = async (query: IUserQuery) => {
    const limit = Number(query.limit) || 10;
    const page = Number(query.page) || 1;
    const { role, search } = query;
    const skip = (page - 1) * limit;

    const where = {
        ...(role && { role }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } },
            ],
        }),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({ where, select: safeSelect, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.user.count({ where }),
    ]);

    return {
        users,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: safeSelect,
    });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    return user;
};

// updateUserRole receives the adminId via the controller
const updateUserRole = async (adminId: string, id: string, payload: IUpdateRole) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    const updated = await prisma.user.update({
        where: { id },
        data: { role: payload.role },
        select: safeSelect,
    });

    writeAuditLog({
        userId: adminId,
        action: "USER_ROLE_UPDATED",
        targetId: id,
        details: {
            previousRole: user.role,
            newRole: payload.role,
            targetName: user.name,
            targetEmail: user.email,
        },
    });

    return updated;
};

const deleteUser = async (adminId: string, id: string) => {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new AppError(httpStatus.NOT_FOUND, "User not found");

    await prisma.user.delete({ where: { id } });

    writeAuditLog({
        userId: adminId,
        action: "USER_DELETED",
        targetId: id,
        details: {
            targetName: user.name,
            targetEmail: user.email,
            targetRole: user.role,
        },
    });
};

export const UserService = {
    getMe,
    updateMe,
    changePassword,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
};
