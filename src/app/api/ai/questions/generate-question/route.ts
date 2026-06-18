/**
 * AI SDK v6 Migration Notes — generate-question route:
 *
 * The biggest breaking change in v6 is the removal of the "data stream" pattern.
 * In v5, you could send custom JSON data alongside the text stream:
 *
 *   v5 (removed in v6):
 *     import { createDataStreamResponse } from "ai";
 *     return createDataStreamResponse({
 *       execute: async (dataStream) => {
 *         const res = generateAiQuestion({ ... });
 *         res.mergeIntoDataStream(dataStream, { sendUsage: false });
 *         dataStream.writeData({ questionId: id }); // custom data
 *       },
 *     });
 *
 *   v6:
 *     const res = await generateAiQuestion({ ... });
 *     return res.toTextStreamResponse({         // plain text stream
 *       headers: { "X-Question-Id": questionId }, // custom data via headers
 *     });
 *
 * Key changes:
 * 1. `createDataStreamResponse` — REMOVED. Use `streamText().toTextStreamResponse()`.
 * 2. `mergeIntoDataStream()` — REMOVED. No data stream to merge into.
 * 3. `dataStream.writeData()` — REMOVED. Use response headers, separate API calls,
 *    or `toUIMessageStreamResponse()` for custom data alongside streaming.
 * 4. `toDataStreamResponse()` → `toTextStreamResponse()` for simple text streaming.
 * 5. Since we can no longer push the questionId mid-stream, we pre-create the
 *    question record (with empty text) before streaming, return the ID via the
 *    `X-Question-Id` header, and update the text in `onFinish`.
 */

import { cacheTag } from "next/cache";

import { and, asc, eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/drizzle/db";
import {
  JobInfoTable,
  questionDifficulties,
  QuestionTable,
} from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { insertQuestion } from "@/features/questions/db";
import {
  getQuestionJobInfoTag,
  revalidateQuestionCache,
} from "@/features/questions/db-cache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/error-toast";
import { generateAiQuestion } from "@/services/ai/questions";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
});

export const POST = async (req: Request) => {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Error generating your question", { status: 400 });
  }

  const { prompt: difficulty, jobInfoId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  if (!(await canCreateQuestion())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  const previousQuestions = await getQuestions(jobInfoId);

  // v6: Pre-create the question record to get its ID before streaming starts.
  // In v5, we could send the ID mid-stream via `dataStream.writeData()`.
  // Now we insert with empty text, return the ID as a header, and update
  // the text in `onFinish` once streaming completes.
  const { id: questionId } = await insertQuestion({
    text: "",
    jobInfoId,
    difficulty,
  });

  // v6: `generateAiQuestion` is async (returns Promise<StreamTextResult>),
  // so we must `await` before calling `.toTextStreamResponse()`.
  try {
    const res = await generateAiQuestion({
      previousQuestions,
      jobInfo,
      difficulty,
      onFinish: async (question) => {
        // Update the pre-created record with the fully generated question text.
        await db
          .update(QuestionTable)
          .set({ text: question })
          .where(eq(QuestionTable.id, questionId));

        revalidateQuestionCache({
          id: questionId,
          jobInfoId,
        });
      },
    });

    // v6: `toTextStreamResponse()` replaces `toDataStreamResponse()`.
    // Custom data (questionId) is sent via a response header since data
    // stream side-channels no longer exist. The client reads this with
    // a custom `fetch` wrapper in useCompletion.
    return res.toTextStreamResponse({
      headers: {
        "X-Question-Id": questionId,
      },
    });
  } catch {
    // In case question fails to generate, remove the pre-created record
    await db.delete(QuestionTable).where(eq(QuestionTable.id, questionId));
    revalidateQuestionCache({
      id: questionId,
      jobInfoId,
    });
    return new Response("Error generating question", { status: 500 });
  }
};

const getQuestions = async (jobInfoId: string) => {
  "use cache";
  cacheTag(getQuestionJobInfoTag(jobInfoId));

  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  });
};

const getJobInfo = async (id: string, userId: string) => {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
};
