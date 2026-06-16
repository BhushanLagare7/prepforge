import { Suspense } from "react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";

import { eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";

import { BackLink } from "@/components/back-link";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import Skeleton, { SkeletonButton } from "@/components/skeleton";
import { SuspendedItem } from "@/components/suspended-item";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { generateInterviewFeedback } from "@/features/interviews/actions";
import { getInterviewIdTag } from "@/features/interviews/db-cache";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { formatDateTime } from "@/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { CondensedMessages } from "@/services/hume/components/condensed-messages";
import { fetchChatMessages } from "@/services/hume/lib/api";
import { condenseChatMessages } from "@/services/hume/lib/condense-chat-messages";

interface InterviewPageProps {
  params: Promise<{ jobInfoId: string; interviewId: string }>;
}

const InterviewPage = async ({ params }: InterviewPageProps) => {
  const { jobInfoId, interviewId } = await params;

  const interview = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const interview = await getInterview(interviewId, userId);
      if (interview == null) return notFound();
      return interview;
    },
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
        All Interviews
      </BackLink>
      <div className="space-y-6">
        <div className="flex gap-2 justify-between">
          <div className="mb-6 space-y-2">
            <h1 className="text-3xl md:text-4xl">
              Interview:{" "}
              <SuspendedItem
                fallback={<Skeleton className="w-48" />}
                item={interview}
                result={(i) => formatDateTime(i.createdAt)}
              />
            </h1>
            <p className="text-muted-foreground">
              <SuspendedItem
                fallback={<Skeleton className="w-24" />}
                item={interview}
                result={(i) => i.duration}
              />
            </p>
          </div>
          <SuspendedItem
            fallback={<SkeletonButton className="w-32" />}
            item={interview}
            result={(i) =>
              i.feedback == null ? (
                <ActionButton
                  action={generateInterviewFeedback.bind(null, i.id)}
                >
                  Generate Feedback
                </ActionButton>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>View Feedback</Button>
                  </DialogTrigger>
                  <DialogContent className="flex flex-col overflow-y-auto md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)]">
                    <DialogTitle>Feedback</DialogTitle>
                    <MarkdownRenderer>{i.feedback}</MarkdownRenderer>
                  </DialogContent>
                </Dialog>
              )
            }
          />
        </div>
        <Suspense
          fallback={<Loader2Icon className="mx-auto animate-spin size-24" />}
        >
          <Messages interview={interview} />
        </Suspense>
      </div>
    </div>
  );
};

const Messages = async ({
  interview,
}: {
  interview: Promise<{ humeChatId: string | null }>;
}) => {
  const { user, redirectToSignIn } = await getCurrentUser({ allData: true });
  if (user == null) return redirectToSignIn();

  const { humeChatId } = await interview;
  if (humeChatId == null) return notFound();

  const condensedMessages = condenseChatMessages(
    await fetchChatMessages(humeChatId),
  );

  return (
    <CondensedMessages
      className="mx-auto max-w-5xl"
      messages={condensedMessages}
      user={user}
    />
  );
};

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
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
};

export default InterviewPage;
