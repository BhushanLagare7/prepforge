import { Suspense } from "react";
import { redirect } from "next/navigation";

import { Loader2Icon } from "lucide-react";

import { JobInfoBackLink } from "@/features/job-infos/components/job-info-back-link";
import { canRunResumeAnalysis } from "@/features/resume-analyses/permissions";

import { ResumePageClient } from "./_client";

interface ResumePageProps {
  params: Promise<{ jobInfoId: string }>;
}

const ResumePage = async ({ params }: ResumePageProps) => {
  const { jobInfoId } = await params;

  return (
    <div className="container flex flex-col items-start py-4 space-y-4 h-screen-header">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="m-auto animate-spin size-24" />}
      >
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
};

interface SuspendedComponentProps {
  jobInfoId: string;
}

const SuspendedComponent = async ({ jobInfoId }: SuspendedComponentProps) => {
  if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade");

  return <ResumePageClient jobInfoId={jobInfoId} />;
};

export default ResumePage;
