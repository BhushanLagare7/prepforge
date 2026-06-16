"use server";

/**
 * @file interviews/actions.ts
 * @description Server actions for managing AI-powered job interviews.
 * Handles interview creation, updates, and AI feedback generation
 * with built-in rate limiting (Arcjet) and permission checks.
 */

import { cacheTag } from "next/cache";

import arcjet, { request, tokenBucket } from "@arcjet/next";
import { and, eq } from "drizzle-orm";

import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/error-toast";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

import { insertInterview, updateInterview as updateInterviewDb } from "./db";
import { getInterviewIdTag } from "./db-cache";
import { canCreateInterview } from "./permissions";

/**
 * Arcjet rate limiter instance using a token bucket strategy.
 * Scoped per userId to prevent abuse on a per-user basis.
 *
 * @config capacity  - Max 12 tokens per user
 * @config refillRate - Refills 4 tokens per day
 * @config mode      - "LIVE" actively blocks denied requests
 */
const aj = arcjet({
  characteristics: ["userId"],
  key: env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 12,
      refillRate: 4,
      interval: "1d",
      mode: "LIVE",
    }),
  ],
});

/**
 * Creates a new interview session linked to a specific job listing.
 *
 * @param jobInfoId - The ID of the job info record to associate with the interview
 *
 * @returns On success: `{ error: false, id: string }` with the new interview ID
 * @returns On failure: `{ error: true, message: string }` describing the reason
 *
 * @throws Will return an error object (not throw) for:
 * - Unauthenticated users
 * - Users exceeding their plan's interview creation limit
 * - Users exceeding the rate limit (Arcjet token bucket)
 * - Job info not found or not owned by the current user
 *
 * @example
 * const result = await createInterview({ jobInfoId: "job_123" });
 * if (result.error) console.error(result.message);
 * else console.log("Created interview:", result.id);
 */
export const createInterview = async ({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<
  { error: true; message: string } | { error: false; id: string }
> => {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (!(await canCreateInterview())) {
    return {
      error: true,
      message: PLAN_LIMIT_MESSAGE,
    };
  }

  const decision = await aj.protect(await request(), {
    userId,
    requested: 1,
  });

  if (decision.isDenied()) {
    return {
      error: true,
      message: RATE_LIMIT_MESSAGE,
    };
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await insertInterview({ jobInfoId, duration: "00:00:00" });

  return { error: false, id: interview.id };
};

/**
 * Updates an existing interview record with partial data.
 * Only the owner of the interview (matched via userId) can update it.
 *
 * @param id   - The ID of the interview to update
 * @param data - Partial interview fields to update
 * @param data.humeChatId - (optional) The Hume AI chat session ID
 * @param data.duration   - (optional) Duration string in "HH:MM:SS" format
 *
 * @returns `{ error: false }` on success
 * @returns `{ error: true, message: string }` if unauthorized or interview not found
 *
 * @example
 * await updateInterview("interview_123", { duration: "00:45:00" });
 */
export const updateInterview = async (
  id: string,
  data: {
    humeChatId?: string;
    duration?: string;
  },
) => {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  await updateInterviewDb(id, data);

  return { error: false };
};

/**
 * Generates and stores AI feedback for a completed interview.
 * Requires the interview to have an associated Hume chat session.
 *
 * @param interviewId - The ID of the completed interview
 *
 * @returns `{ error: false }` on success
 * @returns `{ error: true, message: string }` on failure for:
 *   - Unauthenticated users
 *   - Interview not found or not owned by the user
 *   - Interview missing a Hume chat session (`humeChatId` is null)
 *   - AI feedback generation failure
 *
 * @example
 * const result = await generateInterviewFeedback("interview_123");
 * if (!result.error) console.log("Feedback generated successfully");
 */
export const generateInterviewFeedback = async (interviewId: string) => {
  const { userId, user } = await getCurrentUser({ allData: true });
  if (userId == null || user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    userName: user.name,
  });

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    };
  }

  await updateInterviewDb(interviewId, { feedback });

  return { error: false };
};

/**
 * Fetches a job info record by ID, scoped to the given user.
 * Results are cached and tagged for granular cache invalidation.
 *
 * @param id     - The job info record ID
 * @param userId - The ID of the user who must own the record
 * @returns The matching job info record, or `undefined` if not found
 *
 * @remarks Marked with `"use cache"` — Next.js will cache the result
 * and associate it with the `getJobInfoIdTag(id)` cache tag.
 */
const getJobInfo = async (id: string, userId: string) => {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
};

/**
 * Fetches a full interview record by ID, including its related job info.
 * Performs ownership validation to ensure the interview belongs to the user.
 * Results are cached and tagged for both interview and job info invalidation.
 *
 * @param id     - The interview record ID
 * @param userId - The ID of the user who must own the related job info
 * @returns The interview with nested job info, or `null` if not found / unauthorized
 *
 * @remarks
 * - Marked with `"use cache"` for Next.js caching.
 * - Tags both the interview (`getInterviewIdTag`) and the job info
 *   (`getJobInfoIdTag`) for precise cache invalidation.
 * - Ownership is enforced by comparing `interview.jobInfo.userId` with `userId`.
 */
const getInterview = async (id: string, userId: string) => {
  "use cache";
  cacheTag(getInterviewIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
};
