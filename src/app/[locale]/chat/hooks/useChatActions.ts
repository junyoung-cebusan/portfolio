import { ChangeEvent, RefObject, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import {
  clearDetailAnalysisResults,
  createDetailJDSnapshot,
  saveDetailJDSnapshot,
} from "@/app/[locale]/detail/[id]/utils/detailSessionStorage";
import type { JDMatchAnalysis } from "@/lib/llm/jd-match-schema";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";

import type { ChatSession } from "../types";
import {
  createMessage,
  updateMessageAnalysis,
  updateMessageContent,
} from "../utils/messageUtils";
import { getSessionTitle, tryParseAnalysis } from "../utils/chatUtils";
import { useAnalyzeJDMutation } from "./useAnalyzeJDMutation";
import { isAcceptedJDFile, useJDFileDrop } from "./useJDFileDrop";
import { useReadJDDocumentMutation } from "./useReadJDDocumentMutation";
import { useScrollToBottom } from "./useScrollToBottom";
import { useDetailCacheReset } from "@/app/[locale]/detail/[id]/hooks/useDetailCacheReset";

interface UseChatActionsProps {
  session: ChatSession;
  onSessionChange: (updater: (session: ChatSession) => ChatSession) => void;
}

interface UseChatActionsReturn {
  // State
  input: string;
  setInput: (value: string) => void;
  presetsOpen: boolean;
  setPresetsOpen: (value: boolean) => void;
  jdFile: File | null;
  isReadingDocument: boolean;
  activeAnalysisMessageId: string | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isSending: boolean;
  isBusy: boolean;
  messages: ChatSession["messages"];
  jdText: string | undefined;
  hasJDContext: boolean;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  dropRef: RefObject<HTMLDivElement | null>;
  isDraggingFile: boolean;
  canDropFile: boolean;

  // Actions
  handleSend: () => Promise<void>;
  handleFileUpload: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePresetClick: (preset: string, presetId: PresetId) => Promise<void>;
  markQuickActionsSeen: () => void;
}

export function useChatActions({
  session,
  onSessionChange,
}: UseChatActionsProps): UseChatActionsReturn {
  const tCommon = useTranslations("common");
  const tChat = useTranslations("chat");
  const locale = useLocale();
  const { resetDetailCache } = useDetailCacheReset();

  const [input, setInput] = useState("");
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isReadingDocument, setIsReadingDocument] = useState(false);
  const [activeAnalysisMessageId, setActiveAnalysisMessageId] = useState<
    string | null
  >(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAnalysisMessage = session.messages.some(
    (message) => message.kind === "analysis",
  );

  const { scrollContainerRef, scrollToBottom } =
    useScrollToBottom<HTMLDivElement>({
      scrollOnMountWhen: hasAnalysisMessage,
    });

  const analyzeJDMutation = useAnalyzeJDMutation(session.id);
  const readJDDocumentMutation = useReadJDDocumentMutation();

  const isSending = analyzeJDMutation.isPending;
  const isBusy =
    isSending || isReadingDocument || readJDDocumentMutation.isPending;

  const messages = session.messages;
  const jdText = session.jdText;
  const hasSeenPopup = session.hasSeenPopup;
  const hasPerformedAnalysis = session.hasPerformedAnalysis;
  const hasJDContext = Boolean(jdText || input.trim());

  // --- Session update helpers ---

  const updateSessionMessages = (
    updater:
      | ChatSession["messages"]
      | ((messages: ChatSession["messages"]) => ChatSession["messages"]),
  ) => {
    onSessionChange((currentSession) => {
      const nextMessages =
        typeof updater === "function"
          ? updater(currentSession.messages)
          : updater;

      return {
        ...currentSession,
        title: getSessionTitle(currentSession.title, nextMessages),
        timestamp: tCommon("justNow"),
        messages: nextMessages,
      };
    });
  };

  const updateJDContext = (nextJDText: string, title: string) => {
    saveDetailJDSnapshot(createDetailJDSnapshot(nextJDText, title));

    onSessionChange((currentSession) => ({
      ...currentSession,
      title,
      timestamp: tCommon("justNow"),
      jdTitle: title,
      jdText: nextJDText,
    }));
  };

  // --- Quick actions ---

  const shouldAppendQuickActions = !hasSeenPopup && !hasPerformedAnalysis;

  const appendQuickActions = (nextMessages: ChatSession["messages"]) => {
    if (hasSeenPopup || hasPerformedAnalysis) return nextMessages;

    return [
      ...nextMessages,
      createMessage(
        "assistant",
        tChat("quickActionQuestion"),
        undefined,
        "quick-actions",
      ),
    ];
  };

  const markQuickActionsSeen = () => {
    if (!shouldAppendQuickActions) return;

    onSessionChange((currentSession) => ({
      ...currentSession,
      hasSeenPopup: true,
    }));
  };

  // --- Send message ---

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isBusy) return;

    const nextJDText = jdFile ? jdText : jdText || trimmedInput;
    if (!jdFile && !jdText) {
      updateJDContext(trimmedInput, tCommon("pastedJobDescription"));
    }

    saveDetailJDSnapshot(
      createDetailJDSnapshot(
        nextJDText,
        session.jdTitle ?? tCommon("pastedJobDescription"),
      ),
    );

    const userMessage = createMessage("user", trimmedInput);
    const assistantMessage = createMessage("assistant", "");
    const nextMessages = appendQuickActions([
      ...messages,
      userMessage,
      assistantMessage,
    ]);

    markQuickActionsSeen();
    updateSessionMessages(nextMessages);
    setInput("");
    scrollToBottom();

    try {
      const assistantContent = await analyzeJDMutation.mutateAsync({
        mode: "chat",
        jdText: nextJDText,
        file: jdFile ?? undefined,
        locale,
        message: trimmedInput,
        onChunk: (content) => {
          updateSessionMessages((currentMessages) =>
            updateMessageContent(currentMessages, assistantMessage.id, content),
          );
        },
      });

      updateSessionMessages((currentMessages) =>
        updateMessageContent(
          currentMessages,
          assistantMessage.id,
          assistantContent || tChat("responseFallback"),
        ),
      );
    } catch (error) {
      console.error("[chat] failed to send career chat message", error);
      const errorMessage =
        error instanceof Error ? error.message : tChat("aiServiceError");
      updateSessionMessages((currentMessages) =>
        updateMessageContent(
          currentMessages,
          assistantMessage.id,
          errorMessage,
        ),
      );
    }
  };

  // --- File upload helpers ---

  const showInvalidUploadMessage = (fileName?: string) => {
    const uploadMessage = createMessage(
      "user",
      fileName
        ? tCommon("uploadedFile", { fileName })
        : tCommon("unsupportedFileUpload"),
    );
    const errorMessage = createMessage("assistant", tChat("invalidFile"));

    updateSessionMessages((currentMessages) => [
      ...currentMessages,
      uploadMessage,
      errorMessage,
    ]);
    scrollToBottom();
  };

  const readDocumentFile = async (file: File) => {
    if (isBusy) return;

    if (!isAcceptedJDFile(file)) {
      showInvalidUploadMessage(file.name);
      return;
    }

    // Clear previous analysis results when uploading a new file
    // to prevent stale data from being displayed
    clearDetailAnalysisResults();

    // Reset React Query cache for detail analysis queries
    // so that loading state is properly shown
    if (jdText) {
      resetDetailCache(jdText);
    }

    setIsReadingDocument(true);
    setJdFile(file);

    const uploadMessage = createMessage(
      "user",
      tCommon("uploadedFile", { fileName: file.name }),
    );
    const readingMessage = createMessage("assistant", tChat("readingJd"));

    updateSessionMessages((currentMessages) => [
      ...currentMessages,
      uploadMessage,
      readingMessage,
    ]);
    scrollToBottom();

    try {
      const document = await readJDDocumentMutation.mutateAsync(file);

      setJdFile(null);
      updateJDContext(document.text, document.title);
      markQuickActionsSeen();
      updateSessionMessages((currentMessages) =>
        appendQuickActions(
          updateMessageContent(
            currentMessages,
            readingMessage.id,
            tChat("jdReady", {
              count: document.text.length.toLocaleString(locale),
              fileName: file.name,
            }),
          ),
        ),
      );
      scrollToBottom();
    } catch (error) {
      console.error("[chat] failed to read uploaded JD", error);
      setJdFile(null);
      const errorMessage =
        error instanceof Error ? error.message : tChat("readDocumentError");

      updateSessionMessages((currentMessages) =>
        updateMessageContent(currentMessages, readingMessage.id, errorMessage),
      );
      scrollToBottom();
    } finally {
      setIsReadingDocument(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    await readDocumentFile(file);
  };

  const { dropRef, isDraggingFile, canDropFile } = useJDFileDrop({
    disabled: isBusy,
    onDropFile: (file) => {
      void readDocumentFile(file);
    },
  });

  // --- Preset click ---

  const handlePresetClick = async (preset: string, presetId: PresetId) => {
    const activeJDText = jdText || input.trim();
    if ((!jdFile && !activeJDText) || isBusy) return;

    if (!jdFile && !jdText) {
      updateJDContext(activeJDText, tCommon("pastedJobDescription"));
    }

    saveDetailJDSnapshot(
      createDetailJDSnapshot(
        activeJDText,
        session.jdTitle ?? tCommon("pastedJobDescription"),
      ),
    );

    onSessionChange((currentSession) => ({
      ...currentSession,
      hasPerformedAnalysis: true,
    }));

    const assistantMessage = createMessage(
      "assistant",
      "",
      undefined,
      "analysis",
      presetId,
    );
    const userMessage = createMessage(
      "user",
      tChat("analyzePrefix", { preset }),
    );

    setActiveAnalysisMessageId(assistantMessage.id);
    updateSessionMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
    setInput("");
    setPresetsOpen(false);
    scrollToBottom();

    try {
      const content = await analyzeJDMutation.mutateAsync({
        mode: "analyze",
        jdText: activeJDText,
        file: jdFile ?? undefined,
        locale,
        preset: presetId,
        onChunk: (nextContent) => {
          const analysis = tryParseAnalysis(nextContent);
          if (!analysis) return;

          updateSessionMessages((currentMessages) =>
            updateMessageAnalysis(
              currentMessages,
              assistantMessage.id,
              analysis as Partial<JDMatchAnalysis>,
              presetId,
            ),
          );
        },
      });

      const analysis = tryParseAnalysis(content);
      updateSessionMessages((currentMessages) =>
        analysis
          ? updateMessageAnalysis(
              currentMessages,
              assistantMessage.id,
              analysis as Partial<JDMatchAnalysis>,
              presetId,
            )
          : updateMessageContent(currentMessages, assistantMessage.id, content),
      );
    } catch (error) {
      console.error("[chat] failed to analyze JD perspective", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : tChat("structuredAnalysisError");
      updateSessionMessages((currentMessages) =>
        updateMessageContent(
          currentMessages,
          assistantMessage.id,
          errorMessage,
        ),
      );
    } finally {
      setActiveAnalysisMessageId(null);
    }
  };

  return {
    // State
    input,
    setInput,
    presetsOpen,
    setPresetsOpen,
    jdFile,
    isReadingDocument,
    activeAnalysisMessageId,
    fileInputRef,
    isSending,
    isBusy,
    messages,
    jdText,
    hasJDContext,
    scrollContainerRef,
    dropRef,
    isDraggingFile,
    canDropFile,

    // Actions
    handleSend,
    handleFileUpload,
    handlePresetClick,
    markQuickActionsSeen,
  };
}
