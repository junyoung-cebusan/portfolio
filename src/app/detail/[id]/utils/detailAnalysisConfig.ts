import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  Database,
  Network,
} from "lucide-react";

export type DetailAnalysisCategory =
  | "Tech Alignment"
  | "Domain Transfer"
  | "Feature Ownership"
  | "Velocity & Pipeline Acceleration"
  | "Risk";

export type DetailAnalysisTone =
  | "cyan"
  | "purple"
  | "emerald"
  | "amber"
  | "red";
export type DetailAnalysisTranslationKey =
  | "techAlignment"
  | "domainTransfer"
  | "featureOwnership"
  | "velocity"
  | "risk";
export type CandidateGraphNodeLabelKey =
  | "frontendMastery"
  | "architectureStability"
  | "domainTranslation"
  | "dataUiExperience"
  | "featureLead"
  | "crossFunctionalCoordination"
  | "aiVelocityWorkflows"
  | "qualityUnderPressure"
  | "riskMitigation";

export type AnalysisResult = {
  id: string;
  keyword: string;
  category: DetailAnalysisCategory;
  badge: string;
  insight: string;
  proof: string;
  source_range: {
    start: number;
    end: number;
  };
  graph_data: {
    connections: string[];
    strength: number;
  };
};

export type DetailAnalysisMeta = {
  title: string;
  label: string;
  translationKey: DetailAnalysisTranslationKey;
  tone: DetailAnalysisTone;
  color: string;
  icon: LucideIcon;
};

export const detailJDText = "";

export const analysisResults: AnalysisResult[] = [];

export const analysisCategoryMeta = {
  "Tech Alignment": {
    title: "Tech Alignment",
    label: "Tech",
    translationKey: "techAlignment",
    tone: "cyan",
    color: "#06b6d4",
    icon: CheckCircle2,
  },
  "Domain Transfer": {
    title: "Domain Transfer",
    label: "Domain",
    translationKey: "domainTransfer",
    tone: "purple",
    color: "#a855f7",
    icon: BriefcaseBusiness,
  },
  "Feature Ownership": {
    title: "Feature Ownership",
    label: "Ownership",
    translationKey: "featureOwnership",
    tone: "emerald",
    color: "#10b981",
    icon: Network,
  },
  "Velocity & Pipeline Acceleration": {
    title: "Velocity & Pipeline Acceleration",
    label: "Velocity",
    translationKey: "velocity",
    tone: "amber",
    color: "#f59e0b",
    icon: Bot,
  },
  Risk: {
    title: "Risk",
    label: "Risk",
    translationKey: "risk",
    tone: "red",
    color: "#ef4444",
    icon: AlertTriangle,
  },
} as const satisfies Record<DetailAnalysisCategory, DetailAnalysisMeta>;
