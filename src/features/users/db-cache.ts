import { revalidateTag } from "next/cache";

import { getGlobalTag, getIdTag } from "@/lib/data-cache";

export function getUserGlobalTag() {
  return getGlobalTag("users");
}

export function getUserIdTag(id: string) {
  return getIdTag("users", id);
}

export function revalidateUserCache(id: string) {
  revalidateTag(getUserGlobalTag(), { expire: 0 });
  revalidateTag(getUserIdTag(id), { expire: 0 });
}
