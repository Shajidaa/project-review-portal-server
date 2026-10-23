import { z } from "zod";

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters").optional(),
        gender: z.enum(["MALE", "FEMALE"]).optional(),
        avatarUrl: z.url("Invalid URL").optional(),
    }),
});

const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string({ error: "Current password is required" }).min(1),
        newPassword: z
            .string({ error: "New password is required" })
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number"),
    }),
});

const updateRoleSchema = z.object({
    body: z.object({
        role: z.enum(["STUDENT", "MENTOR", "ADMIN"], { error: "Invalid role" }),
    }),
});

const userQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional().default(1),
        limit: z.coerce.number().int().min(1).max(100).optional().default(10),
        role: z.enum(["STUDENT", "MENTOR", "ADMIN"]).optional(),
        search: z.string().optional(),
    }),
});

export const UserValidation = {
    updateProfileSchema,
    changePasswordSchema,
    updateRoleSchema,
    userQuerySchema,
};
