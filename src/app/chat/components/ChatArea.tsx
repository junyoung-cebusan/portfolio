import { type ChangeEvent, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  createDetailJDSnapshot,
  saveDetailJDSnapshot,
} from "@/app/detail/[id]/utils/detailSessionStorage";
import { EmptyHero } from "@/components/career-ui";
import { useAppLocale } from "@/lib/i18n/use-app-locale";
import type { JDMatchAnalysis } from "@/lib/llm/jd-match-schema";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";

import PresetButtons from "./PresetButtons";
import MessageList, { type Message } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useAnalyzeJDMutation } from "../hooks/useAnalyzeJDMutation";
import { isAcceptedJDFile, useJDFileDrop } from "../hooks/useJDFileDrop";
import { useReadJDDocumentMutation } from "../hooks/useReadJDDocumentMutation";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import type { ChatSession } from "../types";
import {
  createMessage,
  updateMessageAnalysis,
  updateMessageContent,
} from "../utils/messageUtils";

interface ChatAreaProps {
  session: ChatSession;
  onSessionChange: (updater: (session: ChatSession) => ChatSession) => void;
}

function getSessionTitle(title: string, messages: Message[]) {
  if (title !== "New Chat") return title;

  const firstUserMessage = messages.find((message) => message.role === "user");
  if (!firstUserMessage?.content.trim()) return title;

  return firstUserMessage.content.trim().slice(0, 64);
}

export function ChatArea({ session, onSessionChange }: ChatAreaProps) {
  const tCommon = useTranslations("common");
  const tChat = useTranslations("chat");
  const { locale } = useAppLocale();
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
  const guidanceTitle = hasJDContext
    ? tChat("guidanceDetected")
    : tChat("guidanceStart");
  const guidanceHint = hasJDContext
    ? tChat("hintActive")
    : tChat("hintInactive");

  const tryParseAnalysis = (rawContent: string) => {
    try {
      return JSON.parse(rawContent) as Partial<JDMatchAnalysis>;
    } catch {
      return null;
    }
  };

  const updateSessionMessages = (
    updater: Message[] | ((messages: Message[]) => Message[]),
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

  const shouldAppendQuickActions = !hasSeenPopup && !hasPerformedAnalysis;

  const appendQuickActions = (nextMessages: Message[]) => {
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
        error instanceof Error
          ? error.message
          : tChat("aiServiceError");
      updateSessionMessages((currentMessages) =>
        updateMessageContent(
          currentMessages,
          assistantMessage.id,
          errorMessage,
        ),
      );
    }
  };

  const showInvalidUploadMessage = (fileName?: string) => {
    const uploadMessage = createMessage(
      "user",
      fileName
        ? tCommon("uploadedFile", { fileName })
        : tCommon("unsupportedFileUpload"),
    );
    const errorMessage = createMessage(
      "assistant",
      tChat("invalidFile"),
    );

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
        error instanceof Error
          ? error.message
          : tChat("readDocumentError");

      updateSessionMessages((currentMessages) =>
        updateMessageContent(currentMessages, readingMessage.id, errorMessage),
      );
      scrollToBottom();
    } finally {
      setIsReadingDocument(false);
    }
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
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
              analysis,
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
              analysis,
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

  return (
    <div
      ref={dropRef}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      data-session-id={session.id}
    >
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyHero
            icon={Sparkles}
            title={tCommon("aiCareerAgent")}
            description={tChat("heroDescription")}
            className="h-auto min-h-full justify-start py-8 sm:justify-center"
          >
            <div className="mb-5 text-center">
              <p className="text-base font-semibold text-foreground dark:text-slate-100">
                {guidanceTitle}
              </p>
              <p className="mt-2 text-sm text-muted-foreground dark:text-slate-400">
                {guidanceHint}
              </p>
              <p className="mx-auto mt-4 max-w-2xl rounded-md border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-700 shadow-sm shadow-cyan-950/10 dark:text-cyan-100 dark:shadow-cyan-950/20">
                {tChat("privacy")}
              </p>
            </div>
            <PresetButtons
              disabled={!hasJDContext}
              onPresetClick={(preset, presetId) =>
                void handlePresetClick(preset, presetId)
              }
            />
          </EmptyHero>
        ) : (
          <MessageList
            messages={messages}
            canAnalyze={hasJDContext}
            loadingAnalysisMessageId={
              analyzeJDMutation.isPending ? activeAnalysisMessageId : null
            }
            onPresetClick={(preset, presetId) =>
              void handlePresetClick(preset, presetId)
            }
          />
        )}
      </div>

      <MessageInput
        value={input}
        onChange={setInput}
        onSend={() => void handleSend()}
        onFileUpload={(event) => void handleFileUpload(event)}
        onPresetClick={(preset, presetId) =>
          void handlePresetClick(preset, presetId)
        }
        fileInputRef={fileInputRef}
        presetsOpen={presetsOpen}
        onPresetsOpenChange={setPresetsOpen}
        disabled={isBusy}
        canSend={Boolean(input.trim())}
        canAnalyze={hasJDContext}
        isDraggingFile={isDraggingFile}
        canDropFile={canDropFile}
      />
    </div>
  );
}

export default ChatArea;
