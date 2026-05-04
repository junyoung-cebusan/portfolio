import { EmptyChatArea } from "./EmptyChatArea";
import MessageList from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatActions } from "../hooks/useChatActions";
import type { ChatSession } from "../types";

interface ChatAreaProps {
  session: ChatSession;
  onSessionChange: (updater: (session: ChatSession) => ChatSession) => void;
}

export function ChatArea({ session, onSessionChange }: ChatAreaProps) {
  const {
    input,
    setInput,
    presetsOpen,
    setPresetsOpen,
    fileInputRef,
    isSending,
    isBusy,
    activeAnalysisMessageId,
    messages,
    hasJDContext,
    scrollContainerRef,
    dropRef,
    isDraggingFile,
    canDropFile,
    handleSend,
    handleFileUpload,
    handlePresetClick,
  } = useChatActions({ session, onSessionChange });

  return (
    <div
      ref={dropRef}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
      data-session-id={session.id}
    >
      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyChatArea
            hasJDContext={hasJDContext}
            onPresetClick={async (preset, presetId) =>
              void handlePresetClick(preset, presetId)
            }
          />
        ) : (
          <MessageList
            messages={messages}
            canAnalyze={hasJDContext}
            loadingAnalysisMessageId={
              isSending ? activeAnalysisMessageId : null
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
