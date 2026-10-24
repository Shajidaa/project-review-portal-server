import ejs from "ejs";
import path from "path";
import { transporter } from "../libs/nodemailer";
import config from "../config/env";

const TEMPLATES_DIR = path.join(
    process.cwd(),
    "src/app/v1/modules/templates",
);

export const OTP_TTL_SECONDS = 5 * 60; // 5 minutes
export const OTP_EXPIRATION_MINUTES = 5;

export const RESET_OTP_TTL_SECONDS = 10 * 60; // 10 minutes
export const RESET_OTP_EXPIRATION_MINUTES = 10;

export const generateOtp = (): string =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const sendOtpEmail = async (
    to: string,
    name: string,
    otp: string,
): Promise<void> => {
    const html = await ejs.renderFile(
        path.join(TEMPLATES_DIR, "registation-user-otp.ejs"),
        { name, email: to, otp, expirationMinutes: OTP_EXPIRATION_MINUTES },
    );

    await transporter.sendMail({
        from: `"Project Review Portal" <${config.email_sender}>`,
        to,
        subject: "Verify your email address",
        html,
    });
};

export const sendWelcomeEmail = async (
    to: string,
    name: string,
): Promise<void> => {
    const html = await ejs.renderFile(
        path.join(TEMPLATES_DIR, "user-welcome-email.ejs"),
        { name },
    );

    await transporter.sendMail({
        from: `"Project Review Portal" <${config.email_sender}>`,
        to,
        subject: "Welcome to Project Review Portal",
        html,
    });
};

export const sendForgotPasswordOtpEmail = async (
    to: string,
    name: string,
    otp: string,
): Promise<void> => {
    const html = await ejs.renderFile(
        path.join(TEMPLATES_DIR, "forgot-password-otp.ejs"),
        { name, email: to, otp, expirationMinutes: RESET_OTP_EXPIRATION_MINUTES },
    );

    await transporter.sendMail({
        from: `"Project Review Portal" <${config.email_sender}>`,
        to,
        subject: "Reset your password",
        html,
    });
};
