/**
 * AI SDK v6 Migration Notes — Client-side (useCompletion):
 *
 * 1. `data` property REMOVED from `useCompletion` return value.
 *    - v5: const { data } = useCompletion({ ... });  // JSONValue[] of custom data
 *    - v6: `data` no longer exists on UseCompletionHelpers.
 *    In v5, the server could push arbitrary JSON via `dataStream.writeData()`
 *    and the client could read it from the `data` array. This entire data
 *    stream concept is gone in v6.
 *
 * 2. `streamProtocol` should be set to `"text"`.
 *    - v5: streamProtocol defaults to "data" (SSE-based data stream protocol)
 *    - v6: Use `streamProtocol: "text"` since the server now returns plain
 *          text via `toTextStreamResponse()` instead of `toDataStreamResponse()`.
 *
 * 3. Custom data (like `questionId`) must be sent via a different channel.
 *    Since `dataStream.writeData()` is gone, we use a custom HTTP response
 *    header (`X-Question-Id`) set by the server. On the client, we provide
 *    a custom `fetch` function to `useCompletion` that intercepts the response
 *    and extracts the header value.
 *
 *    v5 pattern (data stream):
 *      // Server: dataStream.writeData({ questionId: id });
 *      // Client: const questionId = data?.at(-1)?.questionId;
 *
 *    v6 pattern (response header + custom fetch):
 *      // Server: res.toTextStreamResponse({ headers: { "X-Question-Id": id } });
 *      // Client: custom fetch reads response.headers.get("X-Question-Id")
 */
"use client";

import { useCallback, useState } from "react";

import { useCompletion } from "@ai-sdk/react";

import { BackLink } from "@/components/back-link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  JobInfoTable,
  questionDifficulties,
  QuestionDifficulty,
} from "@/drizzle/schema";
import { formatQuestionDifficulty } from "@/features/questions/formatters";
import { errorToast } from "@/lib/error-toast";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

interface NewQuestionClientPageProps {
  jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "name" | "title">;
}

export const NewQuestionClientPage = ({
  jobInfo,
}: NewQuestionClientPageProps) => {
  const [status, setStatus] = useState<Status>("init");
  const [answer, setAnswer] = useState<string | null>(null);
  // v6: `questionId` is now managed via React state instead of the removed
  // `data` property from useCompletion. The server sends it as a response header.
  const [questionId, setQuestionId] = useState<string | null>(null);

  // v6: Custom fetch wrapper to extract the `X-Question-Id` header from the
  // streaming response. This replaces the v5 pattern of reading from `data`:
  //   v5: const questionId = z.object({ questionId: z.string() }).parse(data?.at(-1));
  //   v6: response.headers.get("X-Question-Id")
  const questionFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await globalThis.fetch(input, init);
      const id = response.headers.get("X-Question-Id");
      if (id) setQuestionId(id);
      return response;
    },
    [],
  );

  const {
    complete: generateQuestion,
    completion: question,
    setCompletion: setQuestion,
    isLoading: isGeneratingQuestion,
  } = useCompletion({
    api: "/api/ai/questions/generate-question",
    // v6: Must use "text" since the server returns a plain text stream via
    // `toTextStreamResponse()`. In v5 this defaulted to "data" for the
    // SSE-based data stream protocol.
    streamProtocol: "text",
    // v6: Custom fetch to intercept the response and read the X-Question-Id
    // header. This replaces the v5 `data` property.
    fetch: questionFetch,
    onFinish: () => {
      setStatus("awaiting-answer");
    },
    onError: (error) => {
      errorToast(error.message);
    },
  });

  const {
    complete: generateFeedback,
    completion: feedback,
    setCompletion: setFeedback,
    isLoading: isGeneratingFeedback,
  } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    // v6: Use "text" protocol to match server's `toTextStreamResponse()`.
    streamProtocol: "text",
    onFinish: () => {
      setStatus("awaiting-difficulty");
    },
    onError: (error) => {
      errorToast(error.message);
    },
  });

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-[2000px] mx-auto grow h-screen-header">
      <div className="container flex gap-4 justify-between items-center mt-4">
        <div className="grow basis-0">
          <BackLink href={`/app/job-infos/${jobInfo.id}`}>
            {jobInfo.name}
          </BackLink>
        </div>
        <Controls
          disableAnswerButton={
            answer == null || answer.trim() === "" || questionId == null
          }
          generateFeedback={() => {
            if (answer == null || answer.trim() === "" || questionId == null)
              return;

            generateFeedback(answer?.trim(), { body: { questionId } });
          }}
          generateQuestion={(difficulty) => {
            setQuestion("");
            setFeedback("");
            setAnswer(null);
            setQuestionId(null);
            generateQuestion(difficulty, { body: { jobInfoId: jobInfo.id } });
          }}
          isLoading={isGeneratingFeedback || isGeneratingQuestion}
          reset={() => {
            setStatus("init");
            setQuestion("");
            setFeedback("");
            setAnswer(null);
            setQuestionId(null);
          }}
          status={status}
        />
        <div className="hidden grow md:block" />
      </div>
      <QuestionContainer
        answer={answer}
        feedback={feedback}
        question={question}
        setAnswer={setAnswer}
        status={status}
      />
    </div>
  );
};

interface QuestionContainerProps {
  question: string | null;
  feedback: string | null;
  answer: string | null;
  status: Status;
  setAnswer: (value: string) => void;
}

const QuestionContainer = ({
  question,
  feedback,
  answer,
  status,
  setAnswer,
}: QuestionContainerProps) => {
  return (
    <ResizablePanelGroup className="border-t grow" orientation="horizontal">
      <ResizablePanel defaultSize={50} id="question-and-feedback" minSize={5}>
        <ResizablePanelGroup className="grow" orientation="vertical">
          <ResizablePanel defaultSize={25} id="question" minSize={5}>
            <ScrollArea className="h-full min-w-48 *:h-full">
              {status === "init" && question == null ? (
                <p className="flex justify-center items-center p-6 h-full text-base md:text-lg">
                  Get started by selecting a question difficulty above.
                </p>
              ) : (
                question && (
                  <MarkdownRenderer className="p-6">
                    {question}
                  </MarkdownRenderer>
                )
              )}
            </ScrollArea>
          </ResizablePanel>
          {feedback && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={75} id="feedback" minSize={5}>
                <ScrollArea className="h-full min-w-48 *:h-full">
                  <MarkdownRenderer className="p-6">
                    {feedback}
                  </MarkdownRenderer>
                </ScrollArea>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50} id="answer" minSize={5}>
        <ScrollArea className="h-full min-w-48 *:h-full">
          <Textarea
            className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset text-base! p-6"
            disabled={status !== "awaiting-answer"}
            placeholder="Type your answer here..."
            value={answer ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

interface ControlsProps {
  disableAnswerButton: boolean;
  status: Status;
  isLoading: boolean;
  generateQuestion: (difficulty: QuestionDifficulty) => void;
  generateFeedback: () => void;
  reset: () => void;
}

const Controls = ({
  status,
  isLoading,
  disableAnswerButton,
  generateQuestion,
  generateFeedback,
  reset,
}: ControlsProps) => {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button
            disabled={isLoading}
            size="sm"
            variant="outline"
            onClick={reset}
          >
            <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
          </Button>
          <Button
            disabled={disableAnswerButton}
            size="sm"
            onClick={generateFeedback}
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        questionDifficulties.map((difficulty) => (
          <Button
            key={difficulty}
            disabled={isLoading}
            size="sm"
            onClick={() => generateQuestion(difficulty)}
          >
            <LoadingSwap isLoading={isLoading}>
              {formatQuestionDifficulty(difficulty)}
            </LoadingSwap>
          </Button>
        ))
      )}
    </div>
  );
};
