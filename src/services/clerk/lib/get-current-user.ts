import { cacheTag } from "next/cache";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { getUserIdTag } from "@/features/users/db-cache";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, redirectToSignIn } = await auth();

  return {
    userId,
    redirectToSignIn,
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}
