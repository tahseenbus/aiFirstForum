"use client";

import { startTransition, useEffect, useState } from "react";

import { BlueprintCard } from "@/components/BlueprintCard";
import { ChatPanel } from "@/components/ChatPanel";
import { FilterForm } from "@/components/FilterForm";
import { IdeaDetailModal } from "@/components/IdeaDetailModal";
import { IdeaSkeleton } from "@/components/IdeaSkeleton";
import {
  type ChatPanelIdeaContext,
  type ChatThread,
  type ChatThreadMessage,
} from "@/lib/chat-types";
import { type IdeaCardData, type BudgetStatus } from "@/lib/idea-data";

type GenerateResponse = {
  ideas: Array<{
    hook: string;
    features: string[];
    tools: string[];
    path_a: { setup: number; monthly: number };
    path_b: { setup: number; monthly: number };
    generated_with: "code" | "no-code";
    budget_status?: BudgetStatus | null;
  }>;
};

type ChatResponse = {
  response: string;
  follow_up_suggestions: string[];
};

const STORAGE_KEY = "appidea-blueprint:v1";
const FAVORITES_STORAGE_KEY = `${STORAGE_KEY}:favorites`;
const BUDGET_STORAGE_KEY = `${STORAGE_KEY}:budget`;
const MONTHLY_BUDGET_STORAGE_KEY = `${STORAGE_KEY}:monthlyBudget`;
const RISK_STORAGE_KEY = `${STORAGE_KEY}:risk`;
const FLEX_STORAGE_KEY = `${STORAGE_KEY}:flex`;
const CONTEXT_STORAGE_KEY = `${STORAGE_KEY}:context`;
const NICHE_STORAGE_KEY = `${STORAGE_KEY}:niche`;
const PLATFORM_STORAGE_KEY = `${STORAGE_KEY}:platform`;
const CODE_MODE_STORAGE_KEY = `${STORAGE_KEY}:codeMode`;
const CHAT_STORAGE_PREFIX = `${STORAGE_KEY}:chatHistory:`;
const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

export default function Home() {
  const [niche, setNiche] = useState("Finance");
  const [budget, setBudget] = useState(200);
  const [monthlyBudget, setMonthlyBudget] = useState<number | "">("");
  const [riskTolerance, setRiskTolerance] = useState("balanced");
  const [flexibility, setFlexibility] = useState("flexible");
  const [codeMode, setCodeMode] = useState(false);
  const [platform, setPlatform] = useState("Web");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [favorites, setFavorites] = useState<IdeaCardData[]>([]);
  const [ideas, setIdeas] = useState<IdeaCardData[]>([]);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [chatIdeaId, setChatIdeaId] = useState<string | null>(null);
  const [chatDraft, setChatDraft] = useState("");
  const [chatThreads, setChatThreads] = useState<Record<string, ChatThread>>({});
  const [chatErrorMessage, setChatErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // ── Storage hydration ──────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const savedNiche = window.localStorage.getItem(NICHE_STORAGE_KEY);
      const savedBudget = window.localStorage.getItem(BUDGET_STORAGE_KEY);
      const savedMonthlyBudget = window.localStorage.getItem(MONTHLY_BUDGET_STORAGE_KEY);
      const savedRisk = window.localStorage.getItem(RISK_STORAGE_KEY);
      const savedFlex = window.localStorage.getItem(FLEX_STORAGE_KEY);
      const savedCodeMode = window.localStorage.getItem(CODE_MODE_STORAGE_KEY);
      const savedPlatform = window.localStorage.getItem(PLATFORM_STORAGE_KEY);
      const savedContext = window.localStorage.getItem(CONTEXT_STORAGE_KEY);
      const savedFavorites = window.localStorage.getItem(FAVORITES_STORAGE_KEY);

      if (savedNiche) setNiche(savedNiche);
      if (savedBudget) setBudget(Number(savedBudget));
      if (savedMonthlyBudget) setMonthlyBudget(Number(savedMonthlyBudget));
      if (savedRisk) setRiskTolerance(savedRisk);
      if (savedFlex) setFlexibility(savedFlex);
      if (savedCodeMode) setCodeMode(savedCodeMode === "true");
      if (savedPlatform) setPlatform(savedPlatform);
      if (savedContext) setAdditionalInfo(savedContext);
      if (savedFavorites) {
        const parsedFavorites = JSON.parse(savedFavorites) as IdeaCardData[];
        setFavorites(parsedFavorites);
      }
    } catch {
      // Ignore storage errors and fall back to the static UI.
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(NICHE_STORAGE_KEY, niche);
      window.localStorage.setItem(BUDGET_STORAGE_KEY, String(budget));
      window.localStorage.setItem(MONTHLY_BUDGET_STORAGE_KEY, String(monthlyBudget));
      window.localStorage.setItem(RISK_STORAGE_KEY, riskTolerance);
      window.localStorage.setItem(FLEX_STORAGE_KEY, flexibility);
      window.localStorage.setItem(CODE_MODE_STORAGE_KEY, String(codeMode));
      window.localStorage.setItem(PLATFORM_STORAGE_KEY, platform);
      window.localStorage.setItem(CONTEXT_STORAGE_KEY, additionalInfo);
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage write failures.
    }
  }, [additionalInfo, budget, monthlyBudget, riskTolerance, flexibility, codeMode, favorites, hydrated, niche, platform]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      Object.values(chatThreads).forEach((thread) => {
        window.localStorage.setItem(
          `${CHAT_STORAGE_PREFIX}${thread.ideaId}`,
          JSON.stringify(thread),
        );
      });
    } catch {
      // Ignore chat persistence failures.
    }
  }, [chatThreads, hydrated]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleAddToFavorites = (idea: IdeaCardData) => {
    setFavorites((current) =>
      current.some((saved) => saved.id === idea.id) ? current : [...current, idea],
    );
  };

  const createIdeaId = (prefix: string, index: number) =>
    `${prefix}-${Date.now()}-${index}`;

  const normalizeIdeas = (
    payload: GenerateResponse,
    prefix: string,
  ): IdeaCardData[] =>
    payload.ideas.map((idea, index) => ({
      id: createIdeaId(prefix, index),
      hook: idea.hook,
      features: idea.features,
      tools: idea.tools,
      pathA: { setup: idea.path_a.setup, monthly: idea.path_a.monthly },
      pathB: { setup: idea.path_b.setup, monthly: idea.path_b.monthly },
      generatedWith: idea.generated_with,
      budgetStatus: idea.budget_status,
    }));

  const createMessage = (
    role: ChatThreadMessage["role"],
    text: string,
    followUpSuggestions?: string[],
  ): ChatThreadMessage => ({
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    timestamp: new Date().toISOString(),
    followUpSuggestions,
  });

  const getDefaultThread = (idea: IdeaCardData): ChatThread => ({
    ideaId: idea.id,
    messages: [
      createMessage(
        "assistant",
        "I can help you refine this idea, compare Path A vs Path B, reduce launch risk, and shape a realistic MVP.",
        ["Ask about MVP scope", "Discuss cost paths", "Explore tech stack"],
      ),
    ],
  });

  const loadStoredThread = (idea: IdeaCardData): ChatThread => {
    try {
      const saved = window.localStorage.getItem(`${CHAT_STORAGE_PREFIX}${idea.id}`);
      if (!saved) return getDefaultThread(idea);
      const parsed = JSON.parse(saved) as ChatThread;
      if (!parsed.messages || parsed.messages.length === 0) return getDefaultThread(idea);
      return parsed;
    } catch {
      return getDefaultThread(idea);
    }
  };

  const handleGenerateAlternativePath = async (idea: IdeaCardData) => {
    setIsRegenerating(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          budget,
          platform,
          code_mode: codeMode,
          regenerate_idea_hook: idea.hook,
          regenerate_from_code_mode: idea.generatedWith === "code",
          favorite_ideas: favorites.map((i) => i.hook),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate alternative path");
      }

      const payload = (await response.json()) as GenerateResponse;
      const [newIdea] = normalizeIdeas(payload, "regen");

      if (newIdea) {
        setIdeas((current) =>
          current.map((i) => {
            if (i.id === idea.id) {
              // Ensure we don't change the ID so the panel stays open
              return { ...newIdea, id: i.id };
            }
            return i;
          }),
        );
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Regeneration failed");
    } finally {
      setIsRegenerating(false);
    }
  };

  // ── Generate ideas ─────────────────────────────────────────────────────────
  const requestIdeas = async (mode: "replace" | "append") => {
    setIsLoading(true);
    setErrorMessage("");

    const duplicateGuard =
      mode === "append" && ideas.length > 0
        ? `Avoid overlap with these existing ideas: ${ideas.map((i) => i.hook).join(" | ")}`
        : "";

    const contextParts = [additionalInfo, duplicateGuard].filter(Boolean);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          niche,
          budget,
          monthly_budget: monthlyBudget === "" ? null : monthlyBudget,
          risk_tolerance: riskTolerance,
          flexibility,
          platform,
          code_mode: codeMode,
          additional_context: contextParts.length > 0 ? contextParts.join("\n\n") : null,
          favorite_ideas: favorites.map((idea) => idea.hook),
        }),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as
          | { detail?: string }
          | null;
        throw new Error(
          errorBody?.detail ??
          "The backend returned an unexpected error while generating ideas.",
        );
      }

      const payload = (await response.json()) as GenerateResponse;
      const nextIdeas = normalizeIdeas(payload, mode);

      startTransition(() => {
        setIdeas((current) =>
          mode === "append" ? [...current, ...nextIdeas] : nextIdeas,
        );
        setExpandedIdeaId(nextIdeas[0]?.id ?? null);
        setChatIdeaId(null); // close chat when new ideas load
        setChatErrorMessage("");
        setHasGenerated(true);
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not connect to the backend.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────
  const activeChatIdea = ideas.find((idea) => idea.id === chatIdeaId) ?? null;
  const activeChatThread = activeChatIdea
    ? chatThreads[activeChatIdea.id] ?? getDefaultThread(activeChatIdea)
    : null;

  const activeExpandedIdea = expandedIdeaId
    ? ideas.find((idea) => idea.id === expandedIdeaId) ?? favorites.find((idea) => idea.id === expandedIdeaId) ?? null
    : null;

  const handleOpenChat = (idea: IdeaCardData, quickQuestion = "") => {
    setChatIdeaId(idea.id);
    setChatErrorMessage("");
    setChatDraft(quickQuestion);

    setChatThreads((current) => {
      if (current[idea.id]) return current;
      return { ...current, [idea.id]: loadStoredThread(idea) };
    });
  };

  const handleCloseChat = () => {
    setChatIdeaId(null);
    setChatDraft("");
    setChatErrorMessage("");
  };

  // ── Streaming ──────────────────────────────────────────────────────────────
  const streamAssistantMessage = async (
    ideaId: string,
    messageId: string,
    fullText: string,
    followUpSuggestions: string[],
  ) => {
    const words = fullText.split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      setChatThreads((current) => ({
        ...current,
        [ideaId]: {
          ideaId,
          messages:
            current[ideaId]?.messages.map((message) =>
              message.id === messageId ? { ...message, followUpSuggestions } : message,
            ) ?? [],
        },
      }));
      return;
    }

    for (let index = 0; index < words.length; index += 1) {
      const nextText = words.slice(0, index + 1).join(" ");
      setChatThreads((current) => ({
        ...current,
        [ideaId]: {
          ideaId,
          messages:
            current[ideaId]?.messages.map((message) =>
              message.id === messageId
                ? {
                  ...message,
                  text: nextText,
                  followUpSuggestions:
                    index === words.length - 1 ? followUpSuggestions : undefined,
                }
                : message,
            ) ?? [],
        },
      }));
      await new Promise((resolve) => window.setTimeout(resolve, 18));
    }
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendChatMessage = async (rawQuestion: string) => {
    if (!activeChatIdea || isChatLoading) return;

    const question = rawQuestion.trim();
    if (!question) return;

    const currentThread = chatThreads[activeChatIdea.id] ?? loadStoredThread(activeChatIdea);
    const userMessage = createMessage("user", question);
    const assistantMessage = createMessage("assistant", "");

    setChatErrorMessage("");
    setIsChatLoading(true);
    setChatDraft("");
    setChatThreads((current) => ({
      ...current,
      [activeChatIdea.id]: {
        ideaId: activeChatIdea.id,
        messages: [...(currentThread.messages ?? []), userMessage, assistantMessage],
      },
    }));

    const requestBody = {
      idea_hook: activeChatIdea.hook,
      idea_features: activeChatIdea.features,
      idea_tools: activeChatIdea.tools,
      user_question: question,
      conversation_history: [...currentThread.messages, userMessage].map((msg) => ({
        role: msg.role,
        text: msg.text,
      })),
      niche,
      budget,
      platform,
      favorite_ideas: favorites.map((idea) => idea.hook),
    };

    try {
      let response: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        response = await fetch(`${API_URL}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        if (response.ok) break;
      }

      if (!response || !response.ok) {
        const errorBody = (await response?.json().catch(() => null)) as
          | { detail?: string }
          | null;
        throw new Error(
          errorBody?.detail ??
          "The AI chat endpoint could not answer right now. Please try again.",
        );
      }

      const payload = (await response.json()) as ChatResponse;
      await streamAssistantMessage(
        activeChatIdea.id,
        assistantMessage.id,
        payload.response,
        payload.follow_up_suggestions ?? [],
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not connect to the AI chat endpoint.";
      setChatThreads((current) => ({
        ...current,
        [activeChatIdea.id]: {
          ideaId: activeChatIdea.id,
          messages:
            current[activeChatIdea.id]?.messages.filter(
              (msg) => msg.id !== assistantMessage.id,
            ) ?? [],
        },
      }));
      setChatErrorMessage(message);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleSuggestionClick = (value: string) => {
    setChatDraft(value);
    void sendChatMessage(value);
  };

  const handleCopyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setChatErrorMessage("Could not copy that response to the clipboard.");
    }
  };

  const handleExportChat = async () => {
    if (!activeChatIdea || !activeChatThread) return;
    const exportBody = [
      activeChatIdea.hook,
      "",
      ...activeChatThread.messages.map(
        (msg) =>
          `[${new Date(msg.timestamp).toLocaleString()}] ${msg.role.toUpperCase()}: ${msg.text}`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(exportBody);
    } catch {
      setChatErrorMessage("Could not export the chat right now.");
    }
  };

  const handleClearConversation = () => {
    if (!activeChatIdea) return;
    const nextThread = getDefaultThread(activeChatIdea);
    setChatThreads((current) => ({
      ...current,
      [activeChatIdea.id]: nextThread,
    }));
    setChatErrorMessage("");
    setChatDraft("");
  };

  const activeChatContext: ChatPanelIdeaContext | null = activeChatIdea
    ? {
      id: activeChatIdea.id,
      hook: activeChatIdea.hook,
      features: activeChatIdea.features,
      tools: activeChatIdea.tools,
      niche,
      budget,
      platform,
    }
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-6 py-10 lg:px-10">
      {/* Page header */}
      <section className="mb-8 flex flex-col gap-4">

        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            App idea generator
          </h1>
          <p className="text-base leading-7 text-slate-300 sm:text-lg">
            Architect custom app blueprints with detailed feature sets, 
            technical stacks, and comprehensive cost management strategies.
          </p>
        </div>
      </section>

      {/* ── ALWAYS VISIBLE FILTER TOP SECTION ── */}
      <section className="w-full max-w-5xl mx-auto mb-12">
        <FilterForm
          additionalInfo={additionalInfo}
          budget={budget}
          monthlyBudget={monthlyBudget}
          riskTolerance={riskTolerance}
          flexibility={flexibility}
          codeMode={codeMode}
          niche={niche}
          platform={platform}
          isSubmitting={isLoading}
          onAdditionalInfoChange={setAdditionalInfo}
          onBudgetChange={setBudget}
          onMonthlyBudgetChange={setMonthlyBudget}
          onRiskToleranceChange={setRiskTolerance}
          onFlexibilityChange={setFlexibility}
          onCodeModeChange={setCodeMode}
          onNicheChange={setNiche}
          onPlatformChange={setPlatform}
          onSubmit={() => { void requestIdeas("replace"); }}
        />
      </section>

      {/* ── CONDITIONAL CONTENT: Chat Pane OR Normal Results Grid ── */}
      {chatIdeaId && activeChatIdea ? (
        <section className="w-full max-w-4xl mx-auto flex flex-col gap-6 lg:items-center pb-12">
          {/* Top context bar for the active idea */}
          <div className="w-full rounded-3xl border border-sky-400/20 bg-slate-900/80 p-5 md:p-6 shadow-xl backdrop-blur flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400 border border-sky-400/20 mb-3">
                Active Context
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white max-w-2xl line-clamp-2 md:line-clamp-1" title={activeChatIdea.hook}>
                {activeChatIdea.hook}
              </h2>
            </div>
            <button
              onClick={() => setExpandedIdeaId(activeChatIdea.id)}
              className="shrink-0 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-2.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 w-full md:w-auto"
            >
              View Full Implementation
            </button>
          </div>

          {/* Chat panel */}
          <div className="w-full h-[600px] lg:h-[calc(100vh-10rem)] lg:sticky lg:top-8 z-10 shadow-2xl">
            <ChatPanel
              variant="inline"
              activeIdea={activeChatContext}
              chatDraft={chatDraft}
              errorMessage={chatErrorMessage}
              isLoading={isChatLoading}
              messages={activeChatThread?.messages ?? []}
              onClearConversation={handleClearConversation}
              onClose={handleCloseChat}
              onCopyMessage={(text) => { void handleCopyMessage(text); }}
              onDraftChange={setChatDraft}
              onExportChat={() => { void handleExportChat(); }}
              onSend={() => { void sendChatMessage(chatDraft); }}
              onSuggestionClick={handleSuggestionClick}
            />
          </div>
        </section>
      ) : (
        /* ── NORMAL BROWSING LAYOUT — no active chat ── */
        <section className="w-full max-w-5xl mx-auto space-y-6">
          <div className="w-full">
            {/* Results header */}
            <div className="flex flex-col gap-2 border-b border-white/10 pb-6 mb-8 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white">Blueprint Results</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Review your generated application strategies and cost breakdowns.
                </p>
              </div>
              <div className="flex flex-col sm:items-end gap-2 mt-4 sm:mt-0">
                <button
                  type="button"
                  onClick={() => { void requestIdeas("append"); }}
                  disabled={isLoading || !hasGenerated}
                  className="rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-2.5 text-sm font-medium text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:border-slate-600 disabled:bg-slate-800 disabled:text-slate-500"
                >
                  Generate More Ideas
                </button>

              </div>
            </div>

            {errorMessage ? (
              <div className="mb-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-100">
                {errorMessage}
              </div>
            ) : null}

            {/* Idea cards grid (1 col default for supreme readability) */}
            <div className="grid gap-6 grid-cols-1">
              {isLoading
                ? Array.from({ length: 2 }, (_, index) => (
                  <IdeaSkeleton key={`skeleton-${index}`} />
                ))
                : ideas.map((idea) => (
                  <BlueprintCard
                    key={idea.id}
                    {...idea}
                    niche={niche}
                    platform={platform}
                    budget={budget}
                    hasActiveChat={
                      Boolean(chatThreads[idea.id]) &&
                      (chatThreads[idea.id]?.messages.length ?? 0) > 1
                    }
                    isExpanded={false}
                    isFavorite={favorites.some((saved) => saved.id === idea.id)}
                    onAddToFavorites={() => handleAddToFavorites(idea)}
                    onQuickAsk={() => handleOpenChat(idea, "Ask about MVP scope")}
                    onToggleDetails={() => setExpandedIdeaId(idea.id)}
                    onOpenChat={() => handleOpenChat(idea)}
                  />
                ))}
            </div>

            {!isLoading && ideas.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">
                Run the generator to see tailored app ideas and blueprints based on your vision.
              </div>
            ) : null}

            {/* Favorites */}
            <div className="mt-12 rounded-3xl border border-white/10 bg-slate-950/40 p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-4 mb-5">
                <div>
                  <h3 className="text-xl font-semibold text-white">Favorite Collection</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Curate your preferred concepts and keep track of ideas that inspire your next project.
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-400 bg-white/5 rounded-full px-3 py-1">
                  {favorites.length} saved
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {favorites.length > 0 ? (
                  favorites.map((idea) => (
                    <div
                      key={idea.id}
                      onClick={() => setExpandedIdeaId(idea.id)}
                      className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-5 flex flex-col justify-between cursor-pointer transition hover:bg-emerald-400/10"
                    >
                      <p className="text-sm font-medium text-white line-clamp-2" title={idea.hook}>
                        {idea.hook}
                      </p>
                      <p className="mt-4 text-xs leading-5 text-emerald-100/70 line-clamp-2">
                        {idea.features[0]}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-slate-500 md:col-span-2 lg:col-span-3 text-center">
                    No favorites yet. Tap the plus button under any idea to add it here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Idea Detail Modal */}
      {activeExpandedIdea && (
        <IdeaDetailModal
          idea={activeExpandedIdea}
          isOpen={!!expandedIdeaId}
          niche={niche}
          platform={platform}
          budget={budget}
          isFavorite={favorites.some((saved) => saved.id === activeExpandedIdea.id)}
          onAddToFavorites={() => handleAddToFavorites(activeExpandedIdea)}
          onGenerateAlternativePath={() => handleGenerateAlternativePath(activeExpandedIdea)}
          onClose={() => setExpandedIdeaId(null)}
          isRegenerating={isRegenerating}
        />
      )}
    </main>
  );
}
