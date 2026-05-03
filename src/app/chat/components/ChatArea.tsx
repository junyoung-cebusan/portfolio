import { type ChangeEvent, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

import {
  createDetailJDSnapshot,
  saveDetailJDSnapshot,
} from "@/app/detail/[id]/utils/detailSessionStorage";
import { EmptyHero } from "@/components/career-ui";
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
  const [input, setInput] = useState("");
  const [presetsOpen, setPresetsOpen] = useState(false);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isReadingDocument, setIsReadingDocument] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { scrollContainerRef, scrollToBottom } =
    useScrollToBottom<HTMLDivElement>();
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
    ? "✨ JD Detected! Choose an analysis perspective to see your fit score."
    : "To start, please upload a Job Description (PDF/Word) or paste the JD text below.";
  const guidanceHint = hasJDContext
    ? "Analysis Tools are active. Click a card for structured scoring, or press send for natural chat."
    : "Once a JD is detected, the Analysis Tools below will be activated.";

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
        timestamp: "Just now",
        messages: nextMessages,
      };
    });
  };

  const updateJDContext = (nextJDText: string, title: string) => {
    saveDetailJDSnapshot(createDetailJDSnapshot(nextJDText, title));

    onSessionChange((currentSession) => ({
      ...currentSession,
      title,
      timestamp: "Just now",
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
        "JD detected! Which perspective should I analyze first?",
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
      updateJDContext(trimmedInput, "Pasted Job Description");
    }
    saveDetailJDSnapshot(
      createDetailJDSnapshot(
        nextJDText,
        session.jdTitle ?? "Pasted Job Description",
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
          assistantContent ||
            "I could not generate a response. Please try again.",
        ),
      );
    } catch (error) {
      console.error("[chat] failed to send career chat message", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Sorry, I could not reach the AI service. Please try again in a moment.";
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
      fileName ? `Uploaded: ${fileName}` : "Uploaded unsupported file",
    );
    const errorMessage = createMessage(
      "assistant",
      "Sorry, I can only read PDF or .docx files.",
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
    const uploadMessage = createMessage("user", `Uploaded: ${file.name}`);
    const readingMessage = createMessage("assistant", "Reading uploaded JD...");

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
            `JD ready: extracted ${document.text.length.toLocaleString()} characters from ${file.name}.`,
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
          : "Sorry, I could not read that document. Please upload a PDF or .docx file.";

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
      updateJDContext(activeJDText, "Pasted Job Description");
    }
    saveDetailJDSnapshot(
      createDetailJDSnapshot(
        activeJDText,
        session.jdTitle ?? "Pasted Job Description",
      ),
    );

    onSessionChange((currentSession) => ({
      ...currentSession,
      hasPerformedAnalysis: true,
    }));
    const assistantMessage = createMessage(
      "assistant",
      "Analyzing fit score...",
      undefined,
      "analysis",
      presetId,
    );
    const userMessage = createMessage("user", `Analyze: ${preset}`);

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
          : "Sorry, I could not generate the structured analysis. Please try again in a moment.";
      updateSessionMessages((currentMessages) =>
        updateMessageContent(
          currentMessages,
          assistantMessage.id,
          errorMessage,
        ),
      );
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
            title="AI Career Agent"
            description="AI-powered portfolio-to-role fit analysis for Junyoung Hwang."
            className="h-auto min-h-full justify-start py-8 sm:justify-center"
          >
            <div className="mb-5 text-center">
              <p className="text-base font-semibold text-slate-100">
                {guidanceTitle}
              </p>
              <p className="mt-2 text-sm text-slate-400">{guidanceHint}</p>
              <p className="mx-auto mt-4 max-w-2xl rounded-md border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm leading-6 text-cyan-100 shadow-sm shadow-cyan-950/20">
                Built as Junyoung Hwang&apos;s portfolio assistant. For your privacy,
                all resumes and JDs are processed securely within your browser
                session and are never saved to our servers.
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
