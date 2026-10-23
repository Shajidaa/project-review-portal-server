export interface ICreateSubmission {
    projectName: string;
    projectType: "WEB" | "MOBILE" | "OTHER";
    repoUrl: string;
    liveLink: string;
    description: string;
    repoStack: "Frontend" | "Backend" | "Fullstack" | "Mobile" | "Other";
    projectImage?: string;
}

export interface IReviewSubmission {
    reviewStatus: "APPROVED" | "REJECTED";
    reviewComments?: string;
}

export interface ISubmissionQuery {
    page?: number;
    limit?: number;
    status?: "PENDING" | "APPROVED" | "REJECTED";
    projectType?: "WEB" | "MOBILE" | "OTHER";
    search?: string;
}
