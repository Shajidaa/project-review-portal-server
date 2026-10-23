import { NextFunction, Request, Response } from "express";
import AppError from "../errors/appError";
import { verifyAccessToken } from "../utils/jwt.utils";
import httpStatus from "http-status";
import type { ITokenPayload } from "../v1/modules/auth/auth.interface";

// Extend Express Request to carry the authenticated user
declare global {
    namespace Express {
        interface Request {
            user?: ITokenPayload;
        }
    }
}

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Accept token from cookie or Authorization header
        const token: string | undefined =
            req.cookies?.accessToken ??
            req.headers.authorization?.replace(/^Bearer\s+/i, "");

        if (!token) {
            throw new AppError(httpStatus.UNAUTHORIZED, "Authentication token not provided");
        }

        req.user = verifyAccessToken(token);
        next();
    } catch (error) {
        next(error);
    }
};

// Role-based guard — use after authenticate
export const authorize =
    (...roles: string[]) =>
        (req: Request, _res: Response, next: NextFunction) => {
            if (!req.user || !roles.includes(req.user.role)) {
                return next(new AppError(httpStatus.FORBIDDEN, "You do not have permission to perform this action"));
            }
            next();
        };
