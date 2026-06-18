import { count, eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { JobInfoTable, QuestionTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/get-current-user";
import { hasPermission } from "@/services/clerk/lib/has-permission";

// Permission Flow Diagram

// canCreateQuestion()
//         │
//         ▼
//   Promise.any([...])
//   ┌─────────────────────────────────────────┐
//   │                                         │
//   ▼                                         ▼
// Has "unlimited_questions"       Has "5_questions" permission?
//   permission?                              │
//   │                              ┌─────────┴──────────┐
//   │                             YES                   NO
//   ▼                              │                    │
//  YES → return true               ▼               Promise.reject()
//   │                    getUserQuestionCount()
//   NO                             │
//   │                              ▼
// Promise.reject()          count < 5?
//                       ┌─────────┴──────────┐
//                      YES                   NO
//                       │                    │
//                  return true          Promise.reject()
//                       │
//                       ▼
//               All strategies failed?
//                       │
//                       ▼
//                 return false

/**
 * Determines if the current user has permission to create a new question.
 *
 * Implements a tiered permission check using Promise.any() to evaluate
 * multiple permission strategies concurrently:
 *
 * 1. **Unlimited Questions**: If the user has the `unlimited_questions`
 *    permission, they can always create questions.
 *
 * 2. **Limited Questions (5)**: If the user has the `5_questions` permission
 *    AND their current question count is less than 5, they can create
 *    a question.
 *
 * @returns {Promise<boolean>} Returns `true` if the user can create a question,
 *                             `false` if they lack the necessary permissions
 *                             or have exceeded their question limit.
 *
 * @example
 * const canCreate = await canCreateQuestion();
 * if (canCreate) {
 *   // Proceed with question creation
 * } else {
 *   // Show permission error or upgrade prompt
 * }
 */
export const canCreateQuestion = async () => {
  return await Promise.any([
    // Strategy 1: Check if user has unlimited question creation permission
    hasPermission("unlimited_questions").then(
      (bool) => bool || Promise.reject(),
    ),
    // Strategy 2: Check if user has the 5-question limit permission
    // and verify they haven't reached their limit yet
    Promise.all([hasPermission("5_questions"), getUserQuestionCount()]).then(
      ([has, c]) => {
        if (has && c < 5) return true;
        return Promise.reject();
      },
    ),
  ]).catch(() => false); // Default to false if all permission checks fail
};

/**
 * Retrieves the total number of questions created by the currently
 * authenticated user.
 *
 * Fetches the current user's ID via Clerk authentication and queries
 * the database for their question count. Returns 0 if no user is
 * authenticated.
 *
 * @returns {Promise<number>} The number of questions created by the current
 *                            user, or `0` if the user is not authenticated.
 *
 * @example
 * const questionCount = await getUserQuestionCount();
 * console.log(`User has created ${questionCount} questions.`);
 */
const getUserQuestionCount = async () => {
  // Retrieve the current authenticated user's ID
  const { userId } = await getCurrentUser();

  // Return 0 if no user is authenticated
  if (userId == null) return 0;

  return getQuestionCount(userId);
};

/**
 * Queries the database to count the total number of questions
 * associated with a specific user.
 *
 * Performs a JOIN between `QuestionTable` and `JobInfoTable` to
 * aggregate all questions linked to the given `userId` through
 * their associated job information records.
 *
 * @param {string} userId - The unique identifier of the user whose
 *                          question count is being retrieved.
 *
 * @returns {Promise<number>} The total number of questions associated
 *                            with the given user.
 *
 * @example
 * const count = await getQuestionCount("user_2abc123");
 * console.log(`Total questions for user: ${count}`);
 */
const getQuestionCount = async (userId: string) => {
  // Query the database, joining QuestionTable with JobInfoTable
  // to filter questions by the owner's userId
  const [{ count: c }] = await db
    .select({ count: count() }) // Select only the count aggregate
    .from(QuestionTable) // Start from the QuestionTable
    .innerJoin(
      // Join with JobInfoTable to access userId
      JobInfoTable,
      eq(QuestionTable.jobInfoId, JobInfoTable.id), // Join condition
    )
    .where(eq(JobInfoTable.userId, userId)); // Filter by the provided userId

  return c; // Return the question count
};
