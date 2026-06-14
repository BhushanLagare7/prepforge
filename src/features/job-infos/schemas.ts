import z from "zod";

import { experienceLevels } from "@/drizzle/schema";

export const jobInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1).nullable(),
  experienceLevel: z.enum(experienceLevels),
  description: z.string().min(1, "Description is required"),
});
