import { eq } from "drizzle-orm";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";

import { revalidateUserCache } from "./dbCache";

/**
 * Upserts a user record in the database.
 *
 * This function attempts to insert a new user or update an existing one based
 * on the user's `id`. It handles a specific edge case where a duplicate email
 * conflict (PostgreSQL error code `23505`) occurs with a **different** `id`,
 * which typically indicates stale or conflicting data (e.g., a user re-created
 * with the same email but a new ID from an auth provider).
 *
 * ### Behavior:
 * 1. **Normal upsert:** Inserts the user record. If a conflict on `id` occurs,
 *    it updates the existing record with the new data.
 * 2. **Duplicate email conflict (`23505`):** If the insert fails due to a
 *    duplicate email belonging to a different `id`, the old record is deleted
 *    and the insert is retried.
 * 3. **Other errors:** Any other database errors are re-thrown as-is.
 *
 * After a successful upsert, the user cache is invalidated to ensure
 * fresh data is served on subsequent requests.
 *
 * @param {typeof UserTable.$inferInsert} user - The user data to insert or update.
 *   Must conform to the `UserTable` insert schema inferred from Drizzle ORM.
 * @returns {Promise<void>} Resolves when the upsert and cache revalidation are complete.
 *
 * @throws {unknown} Re-throws any database error that is not a handled
 *   duplicate email conflict (`23505`).
 *
 * @example
 * await upsertUser({
 *   id: "user_abc123",
 *   email: "jane@example.com",
 *   name: "Jane Doe",
 * });
 */
export async function upsertUser(user: typeof UserTable.$inferInsert) {
  const { id, ...updateData } = user;

  try {
    // Attempt a standard upsert: insert the user or update on conflicting `id`
    await db
      .insert(UserTable)
      .values(user)
      .onConflictDoUpdate({
        target: [UserTable.id],
        set: updateData,
      });
  } catch (error: unknown) {
    const dbError = error as { cause?: { code?: string } };

    if (dbError?.cause?.code === "23505" && user.email) {
      /*
       * Edge case: A unique constraint violation on the email column occurred
       * (PostgreSQL error code 23505), but the conflicting record has a
       * different `id`. This can happen when an auth provider re-creates a
       * user with the same email but assigns a new ID (stale data scenario).
       *
       * Resolution: Delete the stale record by email, then retry the insert.
       */
      await db.delete(UserTable).where(eq(UserTable.email, user.email));

      await db
        .insert(UserTable)
        .values(user)
        .onConflictDoUpdate({
          target: [UserTable.id],
          set: updateData,
        });
    } else {
      // Re-throw any unhandled database errors
      throw error;
    }
  }

  // Invalidate the cached user data to reflect the latest changes
  revalidateUserCache(user.id);
}

/**
 * Deletes a user record from the database by their unique ID.
 *
 * After deletion, the user's cache entry is invalidated to prevent stale
 * data from being served on subsequent requests.
 *
 * @param {string} id - The unique identifier of the user to delete.
 * @returns {Promise<void>} Resolves when the deletion and cache revalidation are complete.
 *
 * @example
 * await deleteUser("user_abc123");
 */
export async function deleteUser(id: string) {
  await db.delete(UserTable).where(eq(UserTable.id, id));

  // Invalidate the cached user data for the deleted user
  revalidateUserCache(id);
}
