import { updateTag } from "next/cache";

import { getGlobalTag, getIdTag, getUserTag } from "@/lib/data-cache";

export function getJobInfoGlobalTag() {
  return getGlobalTag("jobInfos");
}

export function getJobInfoUserTag(userId: string) {
  return getUserTag("jobInfos", userId);
}

export function getJobInfoIdTag(id: string) {
  return getIdTag("jobInfos", id);
}

export function revalidateJobInfoCache({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  updateTag(getJobInfoGlobalTag());
  updateTag(getJobInfoUserTag(userId));
  updateTag(getJobInfoIdTag(id));
}
