import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config/env";
import type { ITokenPayload } from "../v1/modules/auth/auth.interface";

export const signAccessToken = (payload: ITokenPayload): string =>
    jwt.sign(payload, config.jwt_access_secret, {
        expiresIn: config.jwt_access_expires_in as jwt.SignOptions["expiresIn"],
    });

export const signRefreshToken = (payload: ITokenPayload): string =>
    jwt.sign(payload, config.jwt_refresh_secret, {
        expiresIn: config.jwt_refresh_expires_in as jwt.SignOptions["expiresIn"],
    });

export const verifyAccessToken = (token: string): ITokenPayload & JwtPayload =>
    jwt.verify(token, config.jwt_access_secret) as ITokenPayload & JwtPayload;

export const verifyRefreshToken = (token: string): ITokenPayload & JwtPayload =>
    jwt.verify(token, config.jwt_refresh_secret) as ITokenPayload & JwtPayload;
