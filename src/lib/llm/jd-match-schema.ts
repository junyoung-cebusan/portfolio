import { z } from "zod";

export const jdMatchSchema = z.object({
  overallMatchScore: z.number().min(0).max(100),
  summary: z.string(),
  matchedSkills: z.array(z.string()),
  missingSkills: z.array(z.string()),
});

export type JDMatchAnalysis = z.infer<typeof jdMatchSchema>;
