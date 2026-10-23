import { z } from "zod";

const createSubmissionSchema = z.object({
    body: z.object({
        projectName: z
            .string({ error: "Project name is required" })
            .min(3, "Project name must be at least 3 characters")
            .max(100, "Project name must not exceed 100 characters"),

        projectType: z.enum(["WEB", "MOBILE", "OTHER"], { error: "Invalid project type" }),

        repoUrl: z
            .url("Repo URL must be a valid URL")
            .refine(
                (url) => /^https?:\/\/(www\.)?(github|gitlab|bitbucket)\.com\/.+/.test(url),
                "Repo URL must be a valid GitHub, GitLab, or Bitbucket URL",
            ),

        liveLink: z.url("Live link must be a valid URL"),

        description: z
            .string({ error: "Description is required" })
            .min(20, "Description must be at least 20 characters")
            .max(2000, "Description must not exceed 2000 characters"),

        repoStack: z.enum(["Frontend", "Backend", "Fullstack", "Mobile", "Other"], {
            error: "Invalid repo stack",
        }),

        projectImage: z.url("Project image must be a valid URL").optional(),
    }),
});

const reviewSubmissionSchema = z.object({
    body: z.object({
        reviewStatus: z.enum(["APPROVED", "REJECTED"], { error: "Status must be APPROVED or REJECTED" }),
        reviewComments: z.string().max(1000, "Comments must not exceed 1000 characters").optional(),
    }),
});

const submissionQuerySchema = z.object({
    query: z.object({
        page: z.coerce.number().int().min(1).optional().default(1),
        limit: z.coerce.number().int().min(1).max(100).optional().default(10),
        status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
        projectType: z.enum(["WEB", "MOBILE", "OTHER"]).optional(),
        search: z.string().optional(),
    }),
});

export const SubmissionValidation = {
    createSubmissionSchema,
    reviewSubmissionSchema,
    submissionQuerySchema,
};
