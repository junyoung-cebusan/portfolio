import type { ChatSession, Message } from "../types";

const STORAGE_KEY = "young-portfolio:chat-sessions";
const STORAGE_EVENT = "chat-session-storage-change";
const STORAGE_VERSION = 1;

export type StoredChatSessionState = {
  version: number;
  activeSessionId: string;
  sessions: ChatSession[];
};

function canUseSessionStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeMessages(value: unknown): Message[] {
  if (!Array.isArray(value)) return [];

  return value.filter((message): message is Message => {
    if (!isRecord(message)) return false;
    return (
      typeof message.id === "string" &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      typeof message.timestamp === "string"
    );
  });
}

function normalizeSession(value: unknown): ChatSession | null {
  if (!isRecord(value) || typeof value.id !== "string") return null;

  const title = typeof value.title === "string" ? value.title : "New Chat";

  return {
    id: value.id,
    title: title.trim() || "New Chat",
    timestamp:
      typeof value.timestamp === "string" ? value.timestamp : "Just now",
    messages: normalizeMessages(value.messages),
    jdTitle: typeof value.jdTitle === "string" ? value.jdTitle : null,
    jdText: typeof value.jdText === "string" ? value.jdText : "",
    hasSeenPopup:
      typeof value.hasSeenPopup === "boolean" ? value.hasSeenPopup : false,
    hasPerformedAnalysis:
      typeof value.hasPerformedAnalysis === "boolean"
        ? value.hasPerformedAnalysis
        : false,
  };
}

export function createChatSession(title = "New Chat", id?: string): ChatSession {
  return {
    id:
      id ??
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Date.now().toString()),
    title,
    timestamp: "Just now",
    messages: [],
    jdTitle: null,
    jdText: "",
    hasSeenPopup: false,
    hasPerformedAnalysis: false,
  };
}

export function parseChatSessionState(
  rawState: string | null,
): StoredChatSessionState | null {
  try {
    if (!rawState) return null;

    const parsed = JSON.parse(rawState) as unknown;
    if (!isRecord(parsed) || !Array.isArray(parsed.sessions)) return null;

    const sessions = parsed.sessions
      .map(normalizeSession)
      .filter((session): session is ChatSession => Boolean(session));

    if (!sessions.length) return null;

    const storedActiveSessionId =
      typeof parsed.activeSessionId === "string"
        ? parsed.activeSessionId
        : sessions[0].id;

    return {
      version:
        typeof parsed.version === "number" ? parsed.version : STORAGE_VERSION,
      activeSessionId: sessions.some(
        (session) => session.id === storedActiveSessionId,
      )
        ? storedActiveSessionId
        : sessions[0].id,
      sessions,
    };
  } catch {
    return null;
  }
}

export function loadChatSessionState(): StoredChatSessionState | null {
  if (!canUseSessionStorage()) return null;

  return parseChatSessionState(window.sessionStorage.getItem(STORAGE_KEY));
}

export function getChatSessionStorageSnapshot() {
  if (!canUseSessionStorage()) return null;

  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function getServerChatSessionStorageSnapshot() {
  return null;
}

export function subscribeToChatSessionStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

export function saveChatSessionState(
  sessions: ChatSession[],
  activeSessionId: string,
) {
  if (!canUseSessionStorage()) return;

  window.sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: STORAGE_VERSION,
      activeSessionId,
      sessions,
    } satisfies StoredChatSessionState),
  );
  window.dispatchEvent(new Event(STORAGE_EVENT));
}
