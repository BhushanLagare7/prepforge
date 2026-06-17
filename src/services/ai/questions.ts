/**
 * AI SDK v6 Migration Notes:
 *
 * 1. `CoreMessage` has been renamed to `ModelMessage`.
 *    - v5: import { CoreMessage } from "ai"
 *    - v6: import { type ModelMessage } from "ai"
 *
 * 2. Role literals ("user", "assistant", etc.) now require `as const` to
 *    prevent TypeScript from widening them to `string`. Without it, TS
 *    will error: 'Type "string" is not assignable to type "user" | "assistant" | ...'.
 *    - v5: { role: "user", content: "..." }
 *    - v6: { role: "user" as const, content: "..." }
 *
 * 3. `streamText()` return value is now a `StreamTextResult` (unchanged),
 *    but many of its methods have changed — see the route files for details.
 */
import { type ModelMessage, streamText } from "ai";

import {
  JobInfoTable,
  QuestionDifficulty,
  QuestionTable,
} from "@/drizzle/schema";

import { google } from "./models/google";

export const generateAiQuestion = async ({
  jobInfo,
  previousQuestions,
  difficulty,
  onFinish,
}: {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "description" | "experienceLevel"
  >;
  previousQuestions: Pick<
    typeof QuestionTable.$inferSelect,
    "text" | "difficulty"
  >[];
  difficulty: QuestionDifficulty;
  onFinish: (question: string) => void;
}) => {
  // v6: `as const` is required on role strings so TS narrows them to the
  // literal union "user" | "assistant" | "system" | "tool" expected by ModelMessage.
  const previousMessages = previousQuestions.flatMap(
    (q) =>
      [
        { role: "user" as const, content: q.difficulty },
        { role: "assistant" as const, content: q.text },
      ] satisfies ModelMessage[],
  );

  return streamText({
    model: google("gemini-2.5-flash"),
    onFinish: ({ text }) => onFinish(text),
    messages: [
      ...previousMessages,
      {
        role: "user" as const,
        content: difficulty,
      },
    ],

    system: `You are an AI assistant that creates technical interview questions tailored to a specific job role. Your task is to generate one **realistic and relevant** technical question that matches the skill requirements of the job and aligns with the difficulty level provided by the user.

Job Information:
- Job Description: \`${jobInfo.description}\`
- Experience Level: \`${jobInfo.experienceLevel}\`
${jobInfo.title ? `\n- Job Title: \`${jobInfo.title}\`` : ""}

Guidelines:
- The question must reflect the skills and technologies mentioned in the job description.
- Make sure the question is appropriately scoped for the specified experience level.
- A difficulty level of "easy", "medium", or "hard" is provided by the user and should be used to tailor the question.
- Prefer practical, real-world challenges over trivia.
- Return only the question, clearly formatted (e.g., with code snippets or bullet points if needed). Do not include the answer.
- Return only one question at a time.
- It is ok to ask a question about just a single part of the job description, such as a specific technology or skill (e.g., if the job description is for a Next.js, Drizzle, and TypeScript developer, you can ask a TypeScript only question).
- The question should be formatted as markdown.
- Stop generating output as soon you have provided the full question.`,
  });
};

/**
 * Generates AI-powered feedback for a candidate's answer.
 *
 * v6 Migration: This function is `async` and returns `Promise<StreamTextResult>`.
 * Callers MUST `await` this before calling `.toTextStreamResponse()` — in v5,
 * `streamText()` returned synchronously and you could chain directly.
 */
export const generateAiQuestionFeedback = async ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => {
  return streamText({
    model: google("gemini-2.5-flash"),
    prompt: answer,
    system: `You are an expert technical interviewer. Your job is to evaluate the candidate's answer to a technical interview question.

The original question was:
\`\`\`
${question}
\`\`\`

Instructions:
- Review the candidate's answer (provided in the user prompt).
- Assign a rating from **1 to 10**, where:
  - 10 = Perfect, complete, and well-articulated
  - 7-9 = Mostly correct, with minor issues or room for optimization
  - 4-6 = Partially correct or incomplete
  - 1-3 = Largely incorrect or missing the point
- Provide **concise, constructive feedback** on what was done well and what could be improved.
- Be honest but professional.
- Include a full correct answer in the output. Do not use this answer as part of the grading. Only look at the candidate's response when assigning a rating.
- Try to generate a concise answer where possible, but do not sacrifice quality for brevity.
- Refer to the candidate as "you" in your feedback. This feedback should be written as if you were speaking directly to the interviewee.
- Stop generating output as soon you have provided the rating, feedback, and full correct answer.

Output Format (strictly follow this structure):
\`\`\`
## Feedback (Rating: <Your rating from 1 to 10>/10)
<Your written feedback as markdown>
---
## Correct Answer
<The full correct answer as markdown>
\`\`\``,
  });
};
