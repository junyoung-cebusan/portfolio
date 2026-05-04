"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import { CareerShell } from "@/components/career-ui";
import {
  createDetailJDSnapshot,
  saveDetailJDSnapshot,
} from "@/app/[locale]/detail/[id]/utils/detailSessionStorage";

import { ChatArea, Header, Sidebar } from "./components";
import { ChatAreaStorageLoading } from "./components/ChatAreaStorageLoading";
import { useClientHydration } from "./hooks/useClientHydration";
import type { ChatSession } from "./types";
import {
  createChatSession,
  getChatSessionStorageSnapshot,
  getServerChatSessionStorageSnapshot,
  loadChatSessionState,
  parseChatSessionState,
  saveChatSessionState,
  subscribeToChatSessionStorage,
  type StoredChatSessionState,
} from "./utils/chatSessionStorage";

type ChatPageState = {
  sessions: ChatSession[];
  activeSessionId: string;
};

const initialSession = createChatSession("New Chat", "default-session");
const fallbackChatState: ChatPageState = {
  sessions: [initialSession],
  activeSessionId: initialSession.id,
};

function toChatPageState(
  storedState: StoredChatSessionState | null,
): ChatPageState {
  if (storedState) {
    return {
      sessions: storedState.sessions,
      activeSessionId: storedState.activeSessionId,
    };
  }

  return fallbackChatState;
}

export default function ChatPage() {
  const tCommon = useTranslations("common");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isStorageReady = useClientHydration();
  const storedStateSnapshot = useClientHydration(
    subscribeToChatSessionStorage,
    getChatSessionStorageSnapshot,
    getServerChatSessionStorageSnapshot,
  );
  const chatState = useMemo(
    () => toChatPageState(parseChatSessionState(storedStateSnapshot)),
    [storedStateSnapshot],
  );
  const { sessions, activeSessionId } = chatState;

  const activeSession = useMemo(
    () =>
      sessions.find((session) => session.id === activeSessionId) ??
      sessions[0] ??
      null,
    [activeSessionId, sessions],
  );

  const currentJD = activeSession?.jdTitle ?? null;

  const updateChatState = (
    updater: (currentState: ChatPageState) => ChatPageState,
  ) => {
    const currentState = toChatPageState(loadChatSessionState());
    const nextState = updater(currentState);

    saveChatSessionState(nextState.sessions, nextState.activeSessionId);
  };

  useEffect(() => {
    if (!activeSession?.jdText) return;

    saveDetailJDSnapshot(
      createDetailJDSnapshot(
        activeSession.jdText,
        activeSession.jdTitle ?? activeSession.title,
      ),
    );
  }, [activeSession]);

  const handleNewChat = () => {
    const newSession = createChatSession();
    updateChatState((currentState) => ({
      sessions: [newSession, ...currentState.sessions],
      activeSessionId: newSession.id,
    }));
    setIsSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    updateChatState((currentState) => ({
      ...currentState,
      activeSessionId: id,
    }));
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    updateChatState((currentState) => {
      const nextSessions = currentState.sessions.filter(
        (session) => session.id !== id,
      );
      const safeSessions = nextSessions.length
        ? nextSessions
        : [createChatSession()];

      return {
        sessions: safeSessions,
        activeSessionId:
          currentState.activeSessionId === id
            ? safeSessions[0].id
            : currentState.activeSessionId,
      };
    });
  };

  const handleSessionChange = (
    updater: (session: ChatSession) => ChatSession,
  ) => {
    updateChatState((currentState) => ({
      ...currentState,
      sessions: currentState.sessions.map((session) =>
        session.id === activeSessionId ? updater(session) : session,
      ),
    }));
  };

  return (
    <CareerShell className="flex h-dvh overflow-hidden">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        isOpen={isSidebarOpen}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Header
          currentJD={currentJD}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((isOpen) => !isOpen)}
        />
        {!isStorageReady ? (
          <ChatAreaStorageLoading />
        ) : activeSession ? (
          <ChatArea
            key={activeSession.id}
            session={activeSession}
            onSessionChange={handleSessionChange}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground dark:text-slate-500">
            {tCommon("createNewAnalysisToStart")}
          </div>
        )}
      </div>
    </CareerShell>
  );
}
