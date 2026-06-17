/**
 * AI SDK v6 Migration Notes — generate-feedback route:
 *
 * 1. `toDataStreamResponse()` → `toTextStreamResponse()`
 *    - v5: return res.toDataStreamResponse({ sendUsage: false })
 *    - v6: return res.toTextStreamResponse()
 *    The `sendUsage` option no longer exists; usage is not included by default.
 *
 * 2. `generateAiQuestionFeedback()` is `async` and returns a Promise.
 *    You MUST `await` it before calling `.toTextStreamResponse()`.
 *    - v5: const res = generateAiQuestionFeedback({ ... }); // sync, returns directly
 *    - v6: const res = await generateAiQuestionFeedback({ ... }); // async, must await
 */
import { cacheTag } from "next/cache";

import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/drizzle/db";
import { QuestionTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { getQuestionIdTag } from "@/features/questions/db-cache";
import { generateAiQuestionFeedback } from "@/services/ai/questions";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

const schema = z.object({
  prompt: z.string().min(1),
  questionId: z.string().min(1),
});

export const POST = async (req: Request) => {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Error generating your feedback", { status: 400 });
  }

  const { prompt: answer, questionId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const question = await getQuestion(questionId, userId);
  if (question == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  // v6: Must `await` because `generateAiQuestionFeedback` is async.
  // In v5, `streamText()` returned synchronously so no await was needed.
  const res = await generateAiQuestionFeedback({
    question: question.text,
    answer,
  });

  // v6: `toTextStreamResponse()` replaces `toDataStreamResponse()`.
  // The `{ sendUsage: false }` option is no longer needed — usage metadata
  // is not sent over text streams by default.
  return res.toTextStreamResponse();
};

const getQuestion = async (id: string, userId: string) => {
  "use cache";
  cacheTag(getQuestionIdTag(id));

  const question = await db.query.QuestionTable.findFirst({
    where: eq(QuestionTable.id, id),
    with: { jobInfo: { columns: { id: true, userId: true } } },
  });

  if (question == null) return null;
  cacheTag(getJobInfoIdTag(question.jobInfo.id));

  if (question.jobInfo.userId !== userId) return null;
  return question;
};
