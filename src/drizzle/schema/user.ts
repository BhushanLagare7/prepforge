import { pgTable, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/relations";

import { createdAt, updatedAt } from "../schema-helpers";

import { JobInfoTable } from "./job-info";

export const UserTable = pgTable("users", {
  id: varchar().primaryKey(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  imageUrl: varchar().notNull(),
  createdAt,
  updatedAt,
});

export const userRelations = relations(UserTable, ({ many }) => ({
  jobInfos: many(JobInfoTable),
}));
