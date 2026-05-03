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

export type DetailAnalysisTone = "cyan" | "purple" | "emerald" | "amber" | "red";

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
    tone: "cyan",
    color: "#06b6d4",
    icon: CheckCircle2,
  },
  "Domain Transfer": {
    title: "Domain Transfer",
    label: "Domain",
    tone: "purple",
    color: "#a855f7",
    icon: BriefcaseBusiness,
  },
  "Feature Ownership": {
    title: "Feature Ownership",
    label: "Ownership",
    tone: "emerald",
    color: "#10b981",
    icon: Network,
  },
  "Velocity & Pipeline Acceleration": {
    title: "Velocity & Pipeline Acceleration",
    label: "Velocity",
    tone: "amber",
    color: "#f59e0b",
    icon: Bot,
  },
  Risk: {
    title: "Risk",
    label: "Risk",
    tone: "red",
    color: "#ef4444",
    icon: AlertTriangle,
  },
} as const satisfies Record<DetailAnalysisCategory, DetailAnalysisMeta>;

export const candidateGraphNodes = [
  {
    id: "frontend_mastery",
    label: "8+ Years HTML / CSS / JS, 4+ Years TS",
    category: "Tech Alignment",
    icon: CheckCircle2,
  },
  {
    id: "architecture_stability",
    label: "Tech Debt & Scalable Systems",
    category: "Tech Alignment",
    icon: CheckCircle2,
  },
  {
    id: "domain_translation",
    label: "Domain Challenge Translation",
    category: "Domain Transfer",
    icon: BriefcaseBusiness,
  },
  {
    id: "data_ui_experience",
    label: "Data-Facing UI Readiness",
    category: "Domain Transfer",
    icon: Database,
  },
  {
    id: "feature_lead",
    label: "Feature Lead",
    category: "Feature Ownership",
    icon: Network,
  },
  {
    id: "cross_functional_coordination",
    label: "Cross-functional Coordination",
    category: "Feature Ownership",
    icon: Network,
  },
  {
    id: "ai_velocity_workflows",
    label: "Cursor / AI Agents",
    category: "Velocity & Pipeline Acceleration",
    icon: Bot,
  },
  {
    id: "quality_under_pressure",
    label: "3.5x Quality Pipeline",
    category: "Velocity & Pipeline Acceleration",
    icon: Bot,
  },
  {
    id: "risk_mitigation",
    label: "Risk Mitigation Discipline",
    category: "Risk",
    icon: AlertTriangle,
  },
] as const;
