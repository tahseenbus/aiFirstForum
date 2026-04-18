"use client";

import { useEffect, useRef } from "react";

import {
  type ChatPanelIdeaContext,
  type ChatThreadMessage,
} from "@/lib/chat-types";

type ChatPanelProps = {
  activeIdea: ChatPanelIdeaContext | null;
  chatDraft: string;
  errorMessage: string;
  isLoading: boolean;
  messages: ChatThreadMessage[];
  /** "overlay" = fixed modal drawer (legacy/mobile fallback). "inline" = fills its flex container (split-pane). */
  variant?: "overlay" | "inline";
  onClearConversation: () => void;
  onClose: () => void;
  onCopyMessage: (text: string) => void;
  onDraftChange: (value: string) => void;
  onExportChat: () => void;
  onSend: () => void;
  onSuggestionClick: (value: string) => void;
};

const greetingSuggestions = [
  "Ask about MVP scope",
  "Discuss cost paths",
  "Explore tech stack",
  "Get refinement ideas",
  "Review implementation timeline",
];

export function ChatPanel({
  activeIdea,
  chatDraft,
  errorMessage,
  isLoading,
  messages,
  variant = "overlay",
  onClearConversation,
  onClose,
  onCopyMessage,
  onDraftChange,
  onExportChat,
  onSend,
  onSuggestionClick,
}: ChatPanelProps) {
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Escape key to close (overlay mode only)
  useEffect(() => {
    if (variant !== "overlay") return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, variant]);

  if (!activeIdea) return null;

  const chatBody = (
    <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 backdrop-blur">
      {/* ── Header ── */}
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-sky-400">
            AI Idea Chat
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-200"
          >
            ✕ Close
          </button>
        </div>
      </div>

      {/* ── Quick chips + actions ── */}
      <div className="shrink-0 flex items-center justify-between gap-3 border-b border-white/10 px-5 py-2.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex flex-nowrap gap-2">
          {greetingSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
              className="whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-slate-300 transition hover:border-sky-400/40 hover:bg-sky-400/10 hover:text-sky-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="ml-2 flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onClearConversation}
            className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400 transition hover:border-sky-400/40 hover:text-white"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onExportChat}
            className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-slate-400 transition hover:border-sky-400/40 hover:text-white"
          >
            Export
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "ml-auto max-w-[82%] bg-sky-500/15 text-sky-50 ring-1 ring-sky-400/20"
                  : "max-w-[90%] border border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm leading-6">{message.text}</p>
                {message.role === "assistant" ? (
                  <button
                    type="button"
                    onClick={() => onCopyMessage(message.text)}
                    className="shrink-0 text-[11px] text-slate-500 transition hover:text-sky-300"
                  >
                    Copy
                  </button>
                ) : null}
              </div>

              <div className="mt-2.5 flex items-center justify-between gap-3">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    message.role === "user" ? "text-sky-400/60" : "text-slate-500"
                  }`}
                >
                  {message.role}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {message.role === "assistant" &&
              message.followUpSuggestions &&
              message.followUpSuggestions.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.followUpSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => onSuggestionClick(suggestion)}
                      className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] text-sky-100 transition hover:bg-sky-400/20"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {isLoading ? (
            <div className="max-w-[90%] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
                <span className="text-sm">Thinking through the idea…</span>
              </div>
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {errorMessage}
            </div>
          ) : null}

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-white/10 px-5 py-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <textarea
            value={chatDraft}
            onChange={(event) => onDraftChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                onSend();
              }
            }}
            rows={3}
            placeholder="Ask about MVP scope, cost trade-offs, risks, roadmap, or refinements."
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={isLoading || !chatDraft.trim()}
            className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isLoading ? "Sending…" : "Send"}
          </button>
        </div>
      </div>
    </aside>
  );

  // ── Inline variant: just render the aside, caller controls position
  if (variant === "inline") {
    return chatBody;
  }

  // ── Overlay variant: fixed backdrop + slide-in drawer
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="absolute bottom-0 right-0 top-0 flex w-full max-w-2xl flex-col border-l border-white/10 shadow-2xl shadow-black/50 sm:w-[42rem]">
        {chatBody}
      </div>
    </div>
  );
}
