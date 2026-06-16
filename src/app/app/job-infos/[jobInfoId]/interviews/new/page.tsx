import { Suspense } from "react";
import { cacheTag } from "next/cache";
import { notFound, redirect } from "next/navigation";

import { VoiceProvider } from "@humeai/voice-react";
import { and, eq } from "drizzle-orm";
import { fetchAccessToken } from "hume";
import { Loader2Icon } from "lucide-react";

import { env } from "@/data/env/server";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { canCreateInterview } from "@/features/interviews/permissions";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

import { StartCall } from "./_start-call";

interface NewInterviewPageProps {
  params: Promise<{ jobInfoId: string }>;
}

const NewInterviewPage = async ({ params }: NewInterviewPageProps) => {
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

const SuspendedComponent = async ({ jobInfoId }: { jobInfoId: string }) => {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });
  if (userId == null || user == null) return redirectToSignIn();

  if (!(await canCreateInterview())) return redirect("/app/upgrade");

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  const accessToken = await fetchAccessToken({
    apiKey: env.HUME_API_KEY,
    secretKey: env.HUME_SECRET_KEY,
  });

  return (
    <VoiceProvider>
      <StartCall accessToken={accessToken} jobInfo={jobInfo} user={user} />
    </VoiceProvider>
  );
};

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

export default NewInterviewPage;
