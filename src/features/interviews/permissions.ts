/**
 * @file Interview Permission Guards
 * @description Provides authorization utilities to determine whether the current
 * user is eligible to create a new interview session. Permissions are evaluated
 * based on Clerk roles/permissions and the user's existing interview count in
 * the database.
 */

import { and, count, eq, isNotNull } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { hasPermission } from "@/services/clerk/lib/has-permission";

/**
 * Determines whether the currently authenticated user has the right to create
 * a new interview.
 *
 * @description
 * Two permission tiers are checked concurrently using `Promise.any`, meaning
 * the function resolves as soon as **one** of the following conditions is met:
 *
 * 1. **Unlimited Interviews** (`unlimited_interviews` permission):
 *    - The user has no restriction on the number of interviews they can create.
 *    - If this permission is granted, access is immediately allowed.
 *
 * 2. **Single Interview** (`1_interview` permission):
 *    - The user is allowed to create only **one** interview.
 *    - Access is granted only if the user has this permission AND their current
 *      interview count is less than 1 (i.e., they haven't created one yet).
 *
 * If **neither** condition is satisfied, the function safely returns `false`
 * via the `.catch()` fallback, ensuring no unhandled promise rejections.
 *
 * @returns {Promise<boolean>}
 *  - `true`  → The user is authorized to create an interview.
 *  - `false` → The user is not authorized (insufficient permissions or limit reached).
 *
 * @example
 * const allowed = await canCreateInterview();
 * if (!allowed) {
 *   throw new Error("You do not have permission to create an interview.");
 * }
 */
export const canCreateInterview = async (): Promise<boolean> => {
  return await Promise.any([
    /*
     * Tier 1: Unlimited Interview Access
     * ------------------------------------
     * Resolves if the user holds the `unlimited_interviews` permission.
     * Rejects (to allow Promise.any to try the next option) if the
     * permission check returns false.
     */
    hasPermission("unlimited_interviews").then(
      (bool) => bool || Promise.reject(),
    ),

    /*
     * Tier 2: Single Interview Access
     * ---------------------------------
     * Concurrently checks:
     *  - Whether the user holds the `1_interview` permission.
     *  - The user's current interview count from the database.
     *
     * Resolves with `true` only if both:
     *  a) The `1_interview` permission is granted.
     *  b) The user has created fewer than 1 interview.
     *
     * Otherwise, rejects to signal this tier's condition is not met.
     */
    Promise.all([hasPermission("1_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 1) return true;
        return Promise.reject();
      },
    ),
  ]).catch(() => false); // Fallback: deny access if all permission checks fail
};

/**
 * Retrieves the total number of interviews created by the currently
 * authenticated user.
 *
 * @description
 * Fetches the current user's ID from the active Clerk session and uses it
 * to query the database for their interview count. This count only includes
 * interviews that are fully initialized (i.e., linked to a Hume chat session).
 *
 * @returns {Promise<number>}
 *  - The number of interviews associated with the current user.
 *  - Returns `0` if no authenticated user is found (unauthenticated session).
 *
 * @see {@link getInterviewCount} for the underlying database query.
 * @see {@link getCurrentUser} for how the current user's session is resolved.
 */
const getUserInterviewCount = async (): Promise<number> => {
  const { userId } = await getCurrentUser();

  /*
   * Guard: Unauthenticated User
   * ----------------------------
   * If no userId is present in the session (e.g., user is logged out or
   * the session has expired), return 0 to safely handle the unauthenticated
   * state without throwing an error.
   */
  if (userId == null) return 0;

  return getInterviewCount(userId);
};

/**
 * Queries the database for the number of completed/active interviews
 * associated with a specific user.
 *
 * @description
 * Performs a SQL COUNT query by joining `InterviewTable` with `JobInfoTable`
 * on the job info foreign key. The query applies two filters:
 *
 * 1. **User Filter** (`JobInfoTable.userId = userId`):
 *    Ensures only interviews belonging to the specified user are counted.
 *
 * 2. **Hume Chat Filter** (`InterviewTable.humeChatId IS NOT NULL`):
 *    Only counts interviews that have been fully initialized with a Hume AI
 *    chat session. Interviews without a `humeChatId` are considered incomplete
 *    or pending, and are excluded from the count.
 *
 * @param {string} userId - The unique identifier of the user (from Clerk) whose
 *                          interview count is being retrieved.
 *
 * @returns {Promise<number>} The total count of valid interviews for the given user.
 *
 * @example
 * const count = await getInterviewCount("user_2abc123xyz");
 * console.log(`User has ${count} interview(s).`);
 */
const getInterviewCount = async (userId: string): Promise<number> => {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    /*
     * JOIN: Link interviews to their associated job information.
     * This is required to filter interviews by the owning user,
     * since `userId` is stored on `JobInfoTable`, not `InterviewTable`.
     */
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(
        // Filter 1: Only retrieve interviews owned by the specified user
        eq(JobInfoTable.userId, userId),

        // Filter 2: Exclude incomplete interviews (those lacking a Hume chat session)
        isNotNull(InterviewTable.humeChatId),
      ),
    );

  return c;
};
