import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../utils/asyncHandler";
import { sendResponse } from "../../../utils/sendResponse";
import { SubmissionService } from "./submission.service";

// ── Student ───────────────────────────────────────────────────────────────────

const createSubmission = catchAsync(async (req: Request, res: Response) => {
  const submission = await SubmissionService.createSubmission(
    req.user!.id,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Project submitted successfully",
    data: submission,
  });
});

const getMySubmissions = catchAsync(async (req: Request, res: Response) => {
  const { submissions, meta } = await SubmissionService.getMySubmissions(
    req.user!.id,
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submissions retrieved successfully",
    data: submissions,
    meta,
  });
});

const getMySubmissionById = catchAsync(async (req: Request, res: Response) => {
  const submission = await SubmissionService.getMySubmissionById(
    req.user!.id,
    req.params.id as string,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission retrieved successfully",
    data: submission,
  });
});

const deleteMySubmission = catchAsync(async (req: Request, res: Response) => {
  await SubmissionService.deleteMySubmission(
    req.user!.id,
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission deleted successfully",
    data: null,
  });
});

// ── Mentor / Admin ────────────────────────────────────────────────────────────

const getAllSubmissions = catchAsync(async (req: Request, res: Response) => {
  const { submissions, meta } = await SubmissionService.getAllSubmissions(
    req.query as any,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submissions retrieved successfully",
    data: submissions,
    meta,
  });
});

const getSubmissionById = catchAsync(async (req: Request, res: Response) => {
  const submission = await SubmissionService.getSubmissionById(
    req.params.id as string,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Submission retrieved successfully",
    data: submission,
  });
});

const reviewSubmission = catchAsync(async (req: Request, res: Response) => {
  const submission = await SubmissionService.reviewSubmission(
    req.user!.id,
    req.params.id as string,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Submission ${req.body.reviewStatus.toLowerCase()} successfully`,
    data: submission,
  });
});

const getStats = catchAsync(async (_req: Request, res: Response) => {
  const stats = await SubmissionService.getStats();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Statistics retrieved successfully",
    data: stats,
  });
});

export const SubmissionController = {
  createSubmission,
  getMySubmissions,
  getMySubmissionById,
  deleteMySubmission,
  getAllSubmissions,
  getSubmissionById,
  reviewSubmission,
  getStats,
};
