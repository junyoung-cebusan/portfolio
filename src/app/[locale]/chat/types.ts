import type { JDMatchAnalysis } from "@/lib/llm/jd-match-schema";
import type { PresetAnalysis, PresetId } from "@/lib/llm/preset-analysis-schema";

export type ChatRole = "user" | "assistant";
export type MessageKind = "text" | "analysis" | "quick-actions";

export type Message = {
  id: string;
  role: ChatRole;
  content: string;
  kind?: MessageKind;
  analysis?: Partial<JDMatchAnalysis> | Partial<PresetAnalysis>;
  presetId?: PresetId;
  presetType?: string;
  timestamp: string;
};

export type ChatSession = {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  jdTitle: string | null;
  jdText: string;
  hasSeenPopup: boolean;
  hasPerformedAnalysis: boolean;
};

export type ChatApiMessage = {
  role: ChatRole;
  content: string;
};
