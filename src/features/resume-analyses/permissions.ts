import { hasPermission } from "@/services/clerk/lib/has-permission";

export const canRunResumeAnalysis = async () =>
  hasPermission("unlimited_resume_analysis");
