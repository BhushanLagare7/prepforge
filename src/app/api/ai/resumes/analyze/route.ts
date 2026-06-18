import { cacheTag } from "next/cache";

import { and, eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { canRunResumeAnalysis } from "@/features/resume-analyses/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/error-toast";
import { analyzeResumeForJob } from "@/services/ai/resumes/ai";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

/**
 * API Route: Streams AI-generated resume analysis for a specific job.
 * Validates authentication, file requirements, ownership, and plan limits.
 */
export const POST = async (req: Request) => {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get("resumeFile") as File;
  const jobInfoId = formData.get("jobInfoId") as string;

  // Validate payload and file constraints (Max 10MB, specific document types)
  if (!resumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 });
  }

  if (resumeFile.size > 10 * 1024 * 1024) {
    return new Response("File size exceeds 10MB limit", { status: 400 });
  }

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedTypes.includes(resumeFile.type)) {
    return new Response("Please upload a PDF, Word document, or text file", {
      status: 400,
    });
  }

  // Ensure user owns the job info and has sufficient plan limits
  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  if (!(await canRunResumeAnalysis())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  // Generate and stream the AI analysis response
  const res = await analyzeResumeForJob({
    resumeFile,
    jobInfo,
  });

  return res.toTextStreamResponse();
};

/**
 * Retrieves and caches the target job information, scoped to the current user.
 */
const getJobInfo = async (id: string, userId: string) => {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
};
