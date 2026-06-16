import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/data-cache";

export function getInterviewGlobalTag() {
  return getGlobalTag("interviews");
}

export function getInterviewJobInfoTag(jobInfoId: string) {
  return getJobInfoTag("interviews", jobInfoId);
}

export function getInterviewIdTag(id: string) {
  return getIdTag("interviews", id);
}

export function revalidateInterviewCache({
  id,
  jobInfoId,
}: {
  id: string;
  jobInfoId: string;
}) {
  revalidateTag(getInterviewGlobalTag(), { expire: 0 });
  revalidateTag(getInterviewJobInfoTag(jobInfoId), { expire: 0 });
  revalidateTag(getInterviewIdTag(id), { expire: 0 });
}
