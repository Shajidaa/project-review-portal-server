import { z } from "zod";

const registerSchema = z.object({
    body: z.object({
        name: z.string({ error: "Name is required" }).min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z
            .string({ error: "Password is required" })
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
    }),
});

const verifyEmailSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        otp: z
            .string({ error: "OTP is required" })
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only digits"),
    }),
});

const resendOtpSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        password: z.string({ error: "Password is required" }).min(1, "Password is required"),
    }),
});

const refreshTokenSchema = z.object({
    body: z.object({
        refreshToken: z.string().optional(),
    }),
});

const forgotPasswordSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
    }),
});

const resetPasswordSchema = z.object({
    body: z.object({
        email: z.email("Invalid email address"),
        otp: z
            .string({ error: "OTP is required" })
            .length(6, "OTP must be exactly 6 digits")
            .regex(/^\d{6}$/, "OTP must contain only digits"),
        newPassword: z
            .string({ error: "Password is required" })
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
            .regex(/[0-9]/, "Password must contain at least one number"),
    }),
});

export const AuthValidation = {
    registerSchema,
    verifyEmailSchema,
    resendOtpSchema,
    loginSchema,
    refreshTokenSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
