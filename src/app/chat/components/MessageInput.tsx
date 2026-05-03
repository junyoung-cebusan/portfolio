import {
  FileText,
  Maximize2,
  Minimize2,
  Paperclip,
  Send,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { Button } from "@/components/button";
import { CareerPanel, GradientIcon } from "@/components/career-ui";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { cn } from "@/lib/shadcn/utils";
import type { PresetId } from "@/lib/llm/preset-analysis-schema";

import { JD_FILE_ACCEPT } from "../hooks/useJDFileDrop";
import PresetButtons from "./PresetButtons";

const COLLAPSED_MAX_ROWS = 10;
const EXPANDED_MAX_ROWS = COLLAPSED_MAX_ROWS * 2;

type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onPresetClick: (preset: string, presetId: PresetId) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  presetsOpen: boolean;
  onPresetsOpenChange: (open: boolean) => void;
  disabled?: boolean;
  canSend?: boolean;
  canAnalyze?: boolean;
  isDraggingFile?: boolean;
  canDropFile?: boolean;
};

function getTextareaMaxHeight(textarea: HTMLTextAreaElement, maxRows: number) {
  const styles = window.getComputedStyle(textarea);
  const lineHeight = Number.parseFloat(styles.lineHeight);
  const paddingTop = Number.parseFloat(styles.paddingTop);
  const paddingBottom = Number.parseFloat(styles.paddingBottom);

  return lineHeight * maxRows + paddingTop + paddingBottom;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  onFileUpload,
  onPresetClick,
  fileInputRef,
  presetsOpen,
  onPresetsOpenChange,
  disabled,
  canSend,
  canAnalyze,
  isDraggingFile,
  canDropFile,
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [textareaMaxHeight, setTextareaMaxHeight] = useState<number>();

  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const maxRows = isExpanded ? EXPANDED_MAX_ROWS : COLLAPSED_MAX_ROWS;
    const maxHeight = getTextareaMaxHeight(textarea, maxRows);
    setTextareaMaxHeight(maxHeight);

    textarea.style.height = "auto";

    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    setHasOverflow(textarea.scrollHeight > maxHeight + 1);
  }, [isExpanded]);

  useLayoutEffect(() => {
    resizeTextarea();
  }, [resizeTextarea, value]);

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  const showExpandButton = isExpanded || hasOverflow;
  const ExpandIcon = isExpanded ? Minimize2 : Maximize2;

  return (
    <div className="shrink-0 bg-transparent pb-6">
      <div className="mx-auto max-w-4xl">
        <CareerPanel
          className={cn(
            "group relative flex w-full flex-col rounded-2xl bg-slate-900/80 p-3 shadow-2xl transition-all focus-within:border-cyan-500 focus-within:shadow-cyan-500/20 hover:border-slate-600",
            isDraggingFile &&
              (canDropFile
                ? "border-cyan-300 shadow-cyan-500/30"
                : "border-slate-500 shadow-slate-950/30"),
          )}
        >
          {showExpandButton && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded((current) => !current)}
              className="absolute right-3 top-3 z-10 h-8 w-8 rounded-lg bg-slate-950/80 text-slate-300 shadow-lg hover:bg-slate-800 hover:text-cyan-300"
              aria-label={
                isExpanded ? "Collapse message input" : "Enlarge message input"
              }
              title={isExpanded ? "Collapse" : "Enlarge"}
            >
              <ExpandIcon className="h-4 w-4" />
            </Button>
          )}

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Paste a JD or ask about your career fit..."
            className={cn(
              "w-full resize-none bg-transparent px-3 py-2 text-sm leading-5 text-slate-100 outline-none placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60",
              showExpandButton && "pr-12",
              isExpanded && "overscroll-contain",
            )}
            style={{ maxHeight: textareaMaxHeight }}
            rows={1}
          />

          {isDraggingFile && (
            <div
              className={cn(
                "pointer-events-none absolute inset-2 z-20 flex items-center justify-center rounded-xl border-2 border-dashed bg-slate-950/80 backdrop-blur-sm",
                canDropFile
                  ? "border-cyan-300/90 shadow-lg shadow-cyan-950/30"
                  : "border-slate-500/80 shadow-lg shadow-slate-950/30",
              )}
            >
              <div className="flex items-center gap-3 rounded-xl border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-left shadow-xl">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                    canDropFile
                      ? "border-cyan-300/40 bg-cyan-400/15 text-cyan-100"
                      : "border-slate-500/50 bg-slate-800 text-slate-300",
                  )}
                >
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-50">
                    {canDropFile ? "Drop file to upload" : "Upload in progress"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                    <FileText className="h-3.5 w-3.5 text-cyan-300" />
                    PDF or DOCX only
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept={JD_FILE_ACCEPT}
                className="hidden"
                onChange={onFileUpload}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className="h-9 w-9 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-cyan-400"
                title="Upload JD"
                aria-label="Upload JD"
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              <Popover open={presetsOpen} onOpenChange={onPresetsOpenChange}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    className="h-9 w-9 rounded-lg text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
                    title="Analysis Tools"
                    aria-label="Open analysis tools"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-96 rounded-2xl border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl"
                  sideOffset={12}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <GradientIcon
                      icon={Sparkles}
                      tone="amber"
                      className="h-7 w-7 shadow-none"
                    />
                    <h3 className="font-semibold text-slate-100">
                      Quick Actions
                    </h3>
                  </div>
                  <PresetButtons
                    disabled={!canAnalyze}
                    onPresetClick={onPresetClick}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="button"
              onClick={onSend}
              disabled={!canSend || disabled}
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 p-0 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:shadow-none"
              aria-label={disabled ? "Sending message" : "Send message"}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CareerPanel>
      </div>
    </div>
  );
}
