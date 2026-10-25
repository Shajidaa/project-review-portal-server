import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { UserService } from "./user.service";

const getMe = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getMe(req.user!.id);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile retrieved successfully",
        data: user,
    });
});

const updateMe = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.updateMe(req.user!.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Profile updated successfully",
        data: user,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    await UserService.changePassword(req.user!.id, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: null,
    });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const { users, meta } = await UserService.getAllUsers(req.query as any);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Users retrieved successfully",
        data: users,
        meta,
    });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.getUserById(req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User retrieved successfully",
        data: user,
    });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.updateUserRole(req.user!.id, req.params.id as string, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User role updated successfully",
        data: user,
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    await UserService.deleteUser(req.user!.id, req.params.id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User deleted successfully",
        data: null,
    });
});

export const UserController = {
    getMe,
    updateMe,
    changePassword,
    getAllUsers,
    getUserById,
    updateUserRole,
    deleteUser,
};
