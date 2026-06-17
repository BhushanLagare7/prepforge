import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag, getJobInfoTag } from "@/lib/data-cache";

export const getQuestionGlobalTag = () => getGlobalTag("questions");

export const getQuestionJobInfoTag = (jobInfoId: string) =>
  getJobInfoTag("questions", jobInfoId);

export const getQuestionIdTag = (id: string) => getIdTag("questions", id);

export const revalidateQuestionCache = ({
  id,
  jobInfoId,
}: {
  id: string;
  jobInfoId: string;
}) => {
  revalidateTag(getQuestionGlobalTag(), { expire: 0 });
  revalidateTag(getQuestionJobInfoTag(jobInfoId), { expire: 0 });
  revalidateTag(getQuestionIdTag(id), { expire: 0 });
};
