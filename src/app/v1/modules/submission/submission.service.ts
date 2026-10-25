import { prisma } from "../../../libs/prisma";
import AppError from "../../../errors/appError";
import httpStatus from "http-status";
import type {
  ICreateSubmission,
  IReviewSubmission,
  ISubmissionQuery,
} from "./submission.interface";

// ── Shared select shape ───────────────────────────────────────────────────────
const submissionSelect = {
  id: true,
  projectName: true,
  projectType: true,
  repoUrl: true,
  liveLink: true,
  description: true,
  repoStack: true,
  projectImage: true,
  status: true,
  reviewStatus: true,
  reviewComments: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: { id: true, name: true, email: true, avatarUrl: true },
  },
  reviewedBy: {
    select: { id: true, name: true, email: true },
  },
};

// ── Student: submit project ───────────────────────────────────────────────────
const createSubmission = async (
  studentId: string,
  payload: ICreateSubmission,
) => {
  // Prevent same repo being submitted twice (globally)
  const repoConflict = await prisma.submission.findUnique({
    where: { repoUrl: payload.repoUrl },
  });
  if (repoConflict) {
    throw new AppError(
      httpStatus.CONFLICT,
      "This repository has already been submitted",
    );
  }

  // Prevent a student submitting the same project name more than once
  const nameConflict = await prisma.submission.findFirst({
    where: {
      studentId,
      projectName: { equals: payload.projectName, mode: "insensitive" },
    },
  });
  if (nameConflict) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already submitted a project with this name",
    );
  }

  return prisma.submission.create({
    data: { ...payload, studentId },
    select: submissionSelect,
  });
};

// ── Student: own submissions ──────────────────────────────────────────────────
const getMySubmissions = async (studentId: string, query: ISubmissionQuery) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const { status } = query;
  const skip = Number((page - 1) * limit);

  const where = { studentId, ...(status && { status }) };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: submissionSelect,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    submissions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};
//-Student: own submission by ID ───────────────────────────────────────────────
const getMySubmissionById = async (studentId: string, submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: submissionSelect,
  });
  const isOwner = submission?.student.id === studentId;

  if (!submission)
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");
  if (!isOwner)
    throw new AppError(httpStatus.FORBIDDEN, "You do not own this submission");
  return submission;
};

// ── Student: delete own pending submission ────────────────────────────────────
const deleteMySubmission = async (studentId: string, submissionId: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission)
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");
  if (submission.studentId !== studentId)
    throw new AppError(httpStatus.FORBIDDEN, "You do not own this submission");
  if (submission.status !== "PENDING")
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Only pending submissions can be deleted",
    );

  await prisma.submission.delete({ where: { id: submissionId } });
};

// ── Mentor: paginated list with server-side filters ───────────────────────────
const getAllSubmissions = async (query: ISubmissionQuery) => {
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const { status, projectType, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(projectType && { projectType }),
    ...(search && {
      OR: [
        { projectName: { contains: search, mode: "insensitive" as const } },
        {
          student: { name: { contains: search, mode: "insensitive" as const } },
        },
        {
          student: {
            email: { contains: search, mode: "insensitive" as const },
          },
        },
      ],
    }),
  };

  const [submissions, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      select: submissionSelect,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.submission.count({ where }),
  ]);

  return {
    submissions,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

// ── Mentor: single submission detail ─────────────────────────────────────────
const getSubmissionById = async (id: string) => {
  const submission = await prisma.submission.findUnique({
    where: { id },
    select: submissionSelect,
  });

  if (!submission)
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");

  return submission;
};

// ── Mentor: approve or reject ─────────────────────────────────────────────────
const reviewSubmission = async (
  mentorId: string,
  submissionId: string,
  payload: IReviewSubmission,
) => {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission)
    throw new AppError(httpStatus.NOT_FOUND, "Submission not found");

  if (submission.status !== "PENDING") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Submission has already been ${submission.status.toLowerCase()}`,
    );
  }

  return prisma.submission.update({
    where: { id: submissionId },
    data: {
      reviewStatus: payload.reviewStatus,
      status: payload.reviewStatus, // keep both fields in sync
      reviewComments: payload.reviewComments ?? null,
      reviewedById: mentorId,
      reviewedAt: new Date(),
    },
    select: submissionSelect,
  });
};

// ── Aggregated statistics ─────────────────────────────────────────────────────
const getStats = async () => {
  const [total, pending, approved, rejected, byType] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.submission.count({ where: { status: "APPROVED" } }),
    prisma.submission.count({ where: { status: "REJECTED" } }),
    prisma.submission.groupBy({
      by: ["projectType"],
      _count: { id: true },
    }),
  ]);

  return {
    total,
    pending,
    approved,
    rejected,
    approvalRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    byProjectType: byType.map((t) => ({
      type: t.projectType,
      count: t._count.id,
    })),
  };
};

export const SubmissionService = {
  createSubmission,
  getMySubmissions,
  getMySubmissionById,
  deleteMySubmission,
  getAllSubmissions,
  getSubmissionById,
  reviewSubmission,
  getStats,
};
