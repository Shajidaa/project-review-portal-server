import rateLimit from "express-rate-limit";

// 5 submissions per 15 minutes per IP — prevents spam
export const submissionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many submissions from this IP. Please try again after 15 minutes.",
  },
});
