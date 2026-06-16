import { Suspense } from "react";
import { cacheTag } from "next/cache";

import { eq } from "drizzle-orm";

import { BackLink } from "@/components/back-link";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { cn } from "@/lib/utils";

import { getJobInfoIdTag } from "../db-cache";

interface JobInfoBackLinkProps {
  jobInfoId: string;
  className?: string;
}

export const JobInfoBackLink = ({
  jobInfoId,
  className,
}: JobInfoBackLinkProps) => {
  return (
    <BackLink
      className={cn("mb-4", className)}
      href={`/app/job-infos/${jobInfoId}`}
    >
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  );
};

interface JobNameProps {
  jobInfoId: string;
}

const JobName = async ({ jobInfoId }: JobNameProps) => {
  const jobInfo = await getJobInfo(jobInfoId);
  return jobInfo?.name ?? "Job Description";
};

async function getJobInfo(id: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: eq(JobInfoTable.id, id),
  });
}
