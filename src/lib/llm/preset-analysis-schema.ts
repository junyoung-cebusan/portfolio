import { z } from "zod";

export const presetIds = [
  "tech-alignment",
  "domain-transfer",
  "ownership",
  "velocity",
] as const;

export type PresetId = (typeof presetIds)[number];

export function isPresetId(value: unknown): value is PresetId {
  return typeof value === "string" && presetIds.includes(value as PresetId);
}

export const techAlignmentSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Overall Type A technical stack match score based on direct JD/CV overlap.",
    ),
  summary: z
    .string()
    .describe(
      "One concise paragraph explaining identical tech requirements and readiness.",
    ),
  aiInsight: z.object({
    companySituation: z
      .string()
      .describe(
        "Inferred current technical situation from JD signals, such as migration, SEO/performance pressure, or architecture stabilization.",
      ),
    businessNeed: z
      .string()
      .describe("Why the company likely needs the matched stack now."),
    confidence: z
      .number()
      .min(0)
      .max(100)
      .describe("Confidence in the inference."),
  }),
  radarData: z
    .array(
      z.object({
        skill: z
          .string()
          .describe("Concrete technology or practice from the JD."),
        yourLevel: z
          .number()
          .min(0)
          .max(100)
          .describe("Normalized candidate strength from 0 to 100, not years."),
        required: z
          .number()
          .min(0)
          .max(100)
          .describe(
            "Normalized JD requirement strength from 0 to 100, not years.",
          ),
      }),
    )
    .min(3)
    .max(8),
  techStack: z
    .array(
      z.object({
        name: z
          .string()
          .describe("Matched stack item, ideally including years when known."),
        ready: z
          .boolean()
          .describe(
            "True only when direct CV evidence supports immediate use.",
          ),
        note: z
          .string()
          .optional()
          .describe("Short caveat for partial or weaker evidence."),
        jdEvidence: z
          .string()
          .describe("Exact or close JD phrase that requires this stack."),
        candidateEvidence: z
          .string()
          .describe("Specific CV proof for this stack."),
      }),
    )
    .min(3)
    .max(8),
  correlationProof: z
    .array(
      z.object({
        jdRequirement: z
          .string()
          .describe("Identical or strongly overlapping JD requirement."),
        candidateExperience: z
          .string()
          .describe(
            "Specific candidate years, project, architecture, or component design evidence.",
          ),
        proof: z
          .string()
          .describe(
            "Correlation proof explaining how the candidate solves debt, stabilizes architecture, or improves performance.",
          ),
        expectedImpact: z
          .string()
          .describe("Expected business or engineering impact."),
        strength: z
          .number()
          .min(0)
          .max(100)
          .describe("Proof strength based on direct evidence."),
      }),
    )
    .min(2)
    .max(5),
});

export const domainTransferSchema = z.object({
  matchLabel: z.string().describe("Short Type B transferability label."),
  summary: z
    .string()
    .describe(
      "One concise paragraph explaining gaps and why transfer is realistic.",
    ),
  aiInsight: z.object({
    companyNeed: z
      .string()
      .describe(
        "Inferred business or technical need behind the missing skill.",
      ),
    likelyReasonForSkill: z
      .string()
      .describe(
        "Likely reason the JD asks for this skill, such as legacy maintenance, admin tools, reporting, or domain-specific systems.",
      ),
    confidence: z
      .number()
      .min(0)
      .max(100)
      .describe("Confidence in the inference."),
  }),
  gaps: z
    .array(
      z.object({
        skill: z
          .string()
          .describe(
            "JD-required skill with no, minimal, or partial CV evidence.",
          ),
        jdSignal: z.string().describe("JD phrase proving the requirement."),
        candidateCurrentEvidence: z
          .string()
          .describe("Closest CV evidence; state if direct evidence is absent."),
        directExperienceLevel: z.enum(["none", "minimal", "partial"]),
        rampUpWeeks: z
          .number()
          .min(1)
          .max(8)
          .describe(
            "Practical ramp estimate. Use 1-2 weeks only when core knowledge strongly supports it.",
          ),
      }),
    )
    .min(1)
    .max(5),
  mappings: z
    .array(
      z.object({
        gapSkill: z
          .string()
          .describe("The missing or weaker JD skill being transferred into."),
        pastProject: z
          .string()
          .describe("CV project or experience used as transferable proof."),
        jdRequirement: z
          .string()
          .describe("JD requirement being satisfied through transfer."),
        proof: z
          .string()
          .describe(
            "Correlation proof that core knowledge can synchronize to practical output quickly.",
          ),
        rampUpPlan: z
          .string()
          .describe(
            "Concrete 1-2 week ramp plan when justified; otherwise use a realistic longer estimate.",
          ),
        strength: z
          .number()
          .min(0)
          .max(100)
          .describe("Transfer strength, scored conservatively."),
      }),
    )
    .min(2)
    .max(5),
});

export const roSynergySchema = z.object({
  fitLabel: z.string().describe("Short Type C ownership fit label."),
  summary: z
    .string()
    .describe(
      "One concise paragraph evaluating end-to-end lifecycle ownership.",
    ),
  aiInsight: z.object({
    organizationNeed: z
      .string()
      .describe(
        "Inferred need for proactive Tech Lead or Senior Engineer ownership.",
      ),
    ownershipExpectation: z
      .string()
      .describe("Expected lifecycle responsibility without micro-management."),
    riskIfMissing: z
      .string()
      .describe(
        "Risk to the company if the hire only takes tasks instead of owning features.",
      ),
    confidence: z
      .number()
      .min(0)
      .max(100)
      .describe("Confidence in the inference."),
  }),
  areas: z
    .array(
      z.object({
        lifecycleStage: z
          .string()
          .describe(
            "Stage such as spec-in, API design, implementation, testing, release, or post-release.",
          ),
        title: z.string().describe("Ownership capability title."),
        description: z.string().describe("How this capability maps to the JD."),
        alignment: z
          .number()
          .min(0)
          .max(100)
          .describe("Ownership alignment score."),
        evidence: z
          .string()
          .describe("Specific CV proof of end-to-end ownership."),
        crossFunctionalImpact: z
          .string()
          .describe(
            "How this helps product, design, backend, QA, or stakeholders.",
          ),
      }),
    )
    .min(3)
    .max(5),
  lifecycleProof: z
    .array(
      z.object({
        stage: z.string().describe("Lifecycle stage."),
        candidateAction: z
          .string()
          .describe("Candidate action from CV evidence."),
        businessOutcome: z
          .string()
          .describe("Outcome proving independent feature ownership."),
      }),
    )
    .min(3)
    .max(6),
});

export const velocitySchema = z.object({
  velocityLabel: z.string().describe("Short Type D velocity label."),
  workflowSummary: z
    .string()
    .describe(
      "One concise paragraph summarizing capacity margin, learning gap, and SDLC acceleration.",
    ),
  widget1_capacity: z
    .array(
      z.object({
        label: z
          .string()
          .describe(
            "Comparable requirement such as React, TypeScript, frontend, leadership, or CI/CD.",
          ),
        jd_required: z
          .number()
          .min(0)
          .describe(
            "Raw numeric JD requirement, usually years. Use 0 only when JD has no numeric baseline.",
          ),
        candidate_actual: z
          .number()
          .min(0)
          .describe("Raw numeric candidate experience from CV evidence."),
        unit: z.string().describe("Unit label, usually Years."),
        velocity_margin: z.number().describe("candidate_actual - jd_required."),
        status: z.enum([
          "Efficiency Surplus",
          "Learning Gap",
          "Exact Match",
          "No JD Baseline",
        ]),
        rationale: z
          .string()
          .describe("Short explanation of surplus or gap impact."),
      }),
    )
    .min(1)
    .max(5),
  widget2_pipeline: z
    .array(
      z.object({
        stage: z
          .string()
          .describe("Exactly one of the three required SDLC stages."),
        jd_context: z
          .string()
          .describe("JD phrase or need mapped to this stage."),
        accelerator_title: z
          .string()
          .describe("Concise uppercase accelerator label."),
        cv_evidence: z
          .string()
          .describe("Specific CV proof for this pipeline stage."),
        impact: z
          .string()
          .describe(
            "Velocity impact, such as less rework, faster component design, or high-speed quality control.",
          ),
      }),
    )
    .length(3),
  featureOwnershipProof: z.object({
    lifecycleScope: z
      .string()
      .describe("Scope from spec-in to deployment/release."),
    evidence: z.string().describe("Specific end-to-end ownership evidence."),
    velocityImpact: z
      .string()
      .describe("How ownership accelerates pipeline delivery."),
  }),
  metrics: z
    .array(
      z.object({
        label: z.string().describe("Short dashboard metric label."),
        value: z.string().describe("Short display value."),
        comparison: z.string().describe("Short comparison or rationale."),
      }),
    )
    .min(3)
    .max(4),
  widget3_multipliers: z.array(z.string()).min(3).max(8),
  overallSynergyScore: z.number().min(0).max(100),
  overallSynergyNote: z.string(),
});

export const presetAnalysisSchemas = {
  "tech-alignment": techAlignmentSchema,
  "domain-transfer": domainTransferSchema,
  ownership: roSynergySchema,
  velocity: velocitySchema,
} as const;

export type TechAlignmentAnalysis = z.infer<typeof techAlignmentSchema>;
export type DomainTransferAnalysis = z.infer<typeof domainTransferSchema>;
export type ROSynergyAnalysis = z.infer<typeof roSynergySchema>;
export type VelocityAnalysis = z.infer<typeof velocitySchema>;

export type PresetAnalysis =
  | TechAlignmentAnalysis
  | DomainTransferAnalysis
  | ROSynergyAnalysis
  | VelocityAnalysis;
