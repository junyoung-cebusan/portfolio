import type { ChatApiMessage, ChatRole, Message, MessageKind } from "../types";
import type { JDMatchAnalysis } from "@/lib/llm/jd-match-schema";
import type { PresetAnalysis, PresetId } from "@/lib/llm/preset-analysis-schema";

const getTimestamp = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function createMessage(
  role: ChatRole,
  content: string,
  presetType?: string,
  kind: MessageKind = "text",
  presetId?: PresetId,
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    kind,
    presetId,
    presetType,
    timestamp: getTimestamp(),
  };
}

export function toChatApiMessages(messages: Message[]): ChatApiMessage[] {
  return messages
    .filter((message) => !message.presetType && message.content.trim())
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
}

export function updateMessageContent(messages: Message[], messageId: string, content: string) {
  return messages.map((message) => (message.id === messageId ? { ...message, content } : message));
}

export function updateMessageAnalysis(
  messages: Message[],
  messageId: string,
  analysis: Partial<JDMatchAnalysis> | Partial<PresetAnalysis>,
  presetId?: PresetId,
): Message[] {
  return messages.map((message) =>
    message.id === messageId
      ? { ...message, analysis, presetId: presetId ?? message.presetId, kind: "analysis" as const }
      : message,
  );
}
