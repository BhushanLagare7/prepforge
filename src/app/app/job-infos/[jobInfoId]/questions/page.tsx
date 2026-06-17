import { Suspense } from "react";
import { cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";

import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { canCreateQuestion } from "@/features/questions/permissions";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

import { NewQuestionClientPage } from "./_new-question-client-page";

interface QuestionsPageProps {
  params: Promise<{ jobInfoId: string }>;
}

const QuestionsPage = async ({ params }: QuestionsPageProps) => {
  const { jobInfoId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen-header">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
};

export default QuestionsPage;

const SuspendedComponent = async ({ jobInfoId }: { jobInfoId: string }) => {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  if (!(await canCreateQuestion())) return redirect("/app/upgrade");

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <NewQuestionClientPage jobInfo={jobInfo} />;
};

const getJobInfo = async (id: string, userId: string) => {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
};
