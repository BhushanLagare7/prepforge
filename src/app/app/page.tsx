import { Suspense } from "react";
import { cacheTag } from "next/cache";

import { desc, eq } from "drizzle-orm";
import { LoaderIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { JobInfoForm } from "@/features/job-infos/components/job-info-form";
import { getJobInfoUserTag } from "@/features/job-infos/db-cache";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";

export default function AppPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen-header">
          <LoaderIcon className="animate-spin size-24" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

async function JobInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfos = await getJobInfos(userId);

  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return null;
}

function NoJobInfos() {
  return (
    <div className="container my-4 max-w-5xl">
      <h1 className="mb-4 text-3xl md:text-4xl lg:text-5xl">
        Welcome to PrepForge
      </h1>
      <p className="mb-8 text-muted-foreground">
        To get started, enter information about the type of job you are wanting
        to apply for. This can be specific information copied directly from a
        job listing or general information such as the tech stack you want to
        work in. The more specific you are in the description the closer the
        test interviews will be to the real thing.
      </p>
      <Card>
        <CardContent>
          <JobInfoForm />
        </CardContent>
      </Card>
    </div>
  );
}

async function getJobInfos(userId: string) {
  "use cache";
  cacheTag(getJobInfoUserTag(userId));

  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  });
}
