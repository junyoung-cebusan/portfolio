import { Plus, MessageSquare, Trash2 } from "lucide-react";

import { Button } from "@/components/button";
import { ScrollArea } from "@/components/scroll-area";
import { cn } from "@/lib/shadcn/utils";

import type { ChatSession } from "../types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  isOpen?: boolean;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onClose?: () => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  isOpen = false,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  onClose,
}: SidebarProps) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden="true"
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed bottom-0 left-0 top-16 z-40 flex w-[min(20rem,calc(100vw-3rem))] flex-col border-r border-slate-800 bg-slate-900 shadow-2xl shadow-slate-950/50 transition-transform duration-200 ease-out lg:static lg:z-auto lg:h-auto lg:w-80 lg:translate-x-0 lg:bg-slate-900/50 lg:shadow-none lg:backdrop-blur-sm",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Chat sessions"
      >
        <div className="border-b border-slate-800 p-4">
          <div className="mb-4 flex items-center gap-3">
            <div>
              <h1 className="text-base font-bold text-slate-100">
                AI Career Agent
              </h1>
              <p className="text-xs text-slate-500">JD Matching Assistant</p>
            </div>
          </div>

          <Button
            type="button"
            onClick={onNewChat}
            className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 hover:shadow-cyan-500/40"
          >
            <Plus className="h-4 w-4" />
            New Analysis
          </Button>
        </div>

        <ScrollArea className="flex-1 overflow-hidden">
          <div className="space-y-1 p-3">
            <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Recent Sessions
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group flex w-full items-start gap-2 rounded-lg pr-2 transition-colors",
                  session.id === activeSessionId
                    ? "bg-slate-800"
                    : "hover:bg-slate-800/50",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className={cn(
                    "flex h-auto min-w-0 flex-1 cursor-pointer items-center justify-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors",
                    session.id === activeSessionId
                      ? "text-slate-100"
                      : "text-slate-400 group-hover:text-slate-200",
                  )}
                >
                  <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-cyan-500" />
                  <span className="min-w-0 flex-1 overflow-hidden">
                    <span className="block truncate text-sm font-medium">
                      {session.title}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {session.timestamp}
                    </span>
                  </span>
                </button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteSession(session.id)}
                  className="mt-2.5 h-6 w-6 shrink-0 rounded text-slate-500 opacity-0 hover:bg-slate-700 hover:text-red-400 group-hover:opacity-100"
                  aria-label={`Delete ${session.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

export default Sidebar;
