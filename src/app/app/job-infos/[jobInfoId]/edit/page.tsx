import { Suspense } from "react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";

import { and, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { JobInfoBackLink } from "@/features/job-infos/components/job-info-back-link";
import { JobInfoForm } from "@/features/job-infos/components/job-info-form";
import { getJobInfoIdTag } from "@/features/job-infos/db-cache";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

interface JobInfoEditPageProps {
  params: Promise<{ jobInfoId: string }>;
}

const JobInfoEditPage = async ({ params }: JobInfoEditPageProps) => {
  const { jobInfoId } = await params;

  return (
    <div className="container my-4 space-y-4 max-w-5xl">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="mx-auto animate-spin size-24" />}
          >
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
};

interface SuspendedFormProps {
  jobInfoId: string;
}

const SuspendedForm = async ({ jobInfoId }: SuspendedFormProps) => {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <JobInfoForm jobInfo={jobInfo} />;
};

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

export default JobInfoEditPage;
