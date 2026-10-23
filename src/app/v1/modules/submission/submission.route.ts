import { Router } from "express";
import { SubmissionController } from "./submission.controller";
import { validateRequest } from "../../../middleware/validateRequest";
import { authenticate, authorize } from "../../../middleware/authenticate";
import { submissionRateLimiter } from "../../../middleware/rateLimiter";
import { SubmissionValidation } from "./submission.validation";

const router = Router();

// ── Student routes ────────────────────────────────────────────────────────────
router.post(
  "/",
  authenticate,
  authorize("STUDENT"),
  submissionRateLimiter,
  validateRequest(SubmissionValidation.createSubmissionSchema),
  SubmissionController.createSubmission,
);

router.get(
  "/my",
  authenticate,
  authorize("STUDENT"),
  validateRequest(SubmissionValidation.submissionQuerySchema),
  SubmissionController.getMySubmissions,
);

router.get(
  "/my/:id",
  authenticate,
  authorize("STUDENT"),
  SubmissionController.getMySubmissionById,
);

router.delete(
  "/my/:id",
  authenticate,
  authorize("STUDENT"),
  SubmissionController.deleteMySubmission,
);

// ── Mentor / Admin routes ─────────────────────────────────────────────────────
router.get(
  "/stats",
  authenticate,
  authorize("MENTOR", "ADMIN"),
  SubmissionController.getStats,
);

router.get(
  "/",
  authenticate,
  authorize("MENTOR", "ADMIN"),
  validateRequest(SubmissionValidation.submissionQuerySchema),
  SubmissionController.getAllSubmissions,
);

router.get(
  "/:id",
  authenticate,
  authorize("MENTOR", "ADMIN"),
  SubmissionController.getSubmissionById,
);

router.patch(
  "/:id/review",
  authenticate,
  authorize("MENTOR", "ADMIN"),
  validateRequest(SubmissionValidation.reviewSubmissionSchema),
  SubmissionController.reviewSubmission,
);

export const SubmissionRoutes = router;
