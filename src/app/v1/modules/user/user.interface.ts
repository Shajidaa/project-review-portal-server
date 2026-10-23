export interface IUpdateProfile {
    name?: string;
    gender?: "MALE" | "FEMALE";
    avatarUrl?: string;
}

export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
}

export interface IUpdateRole {
    role: "STUDENT" | "MENTOR" | "ADMIN";
}

export interface IUserQuery {
    page?: number;
    limit?: number;
    role?: "STUDENT" | "MENTOR" | "ADMIN";
    search?: string;
}
