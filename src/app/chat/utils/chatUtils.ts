import type { Message } from "../types";

/**
 * Derive a display title from the session's messages.
 * Uses the first user message content (trimmed to 64 chars) if the title is still "New Chat".
 */
export function getSessionTitle(title: string, messages: Message[]): string {
  if (title !== "New Chat") return title;

  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage?.content.trim()) return title;

  return firstUserMessage.content.trim().slice(0, 64);
}

/**
 * Try to parse a JSON string into a partial JDMatchAnalysis.
 * Returns null if parsing fails.
 */
export function tryParseAnalysis(
  rawContent: string,
): Record<string, unknown> | null {
  try {
    return JSON.parse(rawContent) as Record<string, unknown>;
  } catch {
    return null;
  }
}
