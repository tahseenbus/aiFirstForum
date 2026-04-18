"use client";

import { useState } from "react";
import { type IdeaCardData, type BudgetStatus } from "@/lib/idea-data";
import { CostIntelligenceModal } from "@/components/CostIntelligenceModal";
import { CostBuilderModal } from "@/components/CostBuilderModal";

type CostPath = {
  setup: number;
  monthly: number;
};

export type BlueprintCardProps = {
  id: string;
  hook: string;
  features: string[];
  tools: string[];
  pathA: CostPath;
  pathB: CostPath;
  generatedWith: "code" | "no-code";
  niche: string;
  platform: string;
  budget: number;
  budgetStatus?: BudgetStatus | null;
  hasActiveChat?: boolean;
  isExpanded: boolean;
  isFavorite?: boolean;
  onAddToFavorites?: () => void;
  onToggleDetails: () => void;
  onOpenChat: () => void;
  onQuickAsk?: () => void;
};

export function BlueprintCard({
  id,
  hook,
  features,
  tools,
  pathA,
  pathB,
  generatedWith,
  niche,
  platform,
  budget,
  budgetStatus,
  hasActiveChat = false,
  isExpanded,
  isFavorite = false,
  onAddToFavorites,
  onToggleDetails,
  onOpenChat,
  onQuickAsk,
}: BlueprintCardProps) {
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showCostBuilder, setShowCostBuilder] = useState(false);
  const currentPath = generatedWith === "code" ? pathB : pathA;

  return (
    <article className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-900/80 p-6 sm:p-8 shadow-lg shadow-slate-950/20 backdrop-blur">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="space-y-3 min-w-0">
          {hasActiveChat ? (
            <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-100">
              1 active chat
            </span>
          ) : null}
          <h3 className={`text-xl font-bold text-white ${isExpanded ? '' : 'line-clamp-2'}`} title={hook}>
            {hook}
          </h3>
          {budgetStatus && (
             <div className={`inline-flex flex-wrap items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium leading-none tracking-wide ${
               budgetStatus.within_budget 
                 ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                 : (budgetStatus.overrun_amount ?? 0) > (budget * 0.25)
                   ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                   : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
             }`}>
                {budgetStatus.within_budget ? '✓ Within Budget' : `⚠ ${budgetStatus.overrun_amount ? `+$${budgetStatus.overrun_amount.toLocaleString()}` : 'Exceeds budget'}`}
             </div>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleDetails}
          className="shrink-0 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20"
        >
          {isExpanded ? "Hide details" : "View details"}
        </button>
      </div>

      <div className="space-y-6 flex-1 flex flex-col">
        {!isExpanded ? (
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between flex-1">
            <div className="rounded-2xl bg-white/5 border border-white/10 px-5 py-5 text-sm leading-6 text-slate-300 flex-1 md:max-w-2xl w-full h-full">
              <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400 mb-2">Core MVP Feature</span>
              <p className="line-clamp-3 md:line-clamp-4">{features[0]}</p>
            </div>
            
            <div className="flex shrink-0 w-full md:w-auto flex-col sm:flex-row md:flex-col gap-3 mt-auto md:mt-0 lg:pt-0">
              <button
                type="button"
                onClick={onOpenChat}
                className="w-full md:w-40 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10"
              >
                AI Chat
              </button>
              <button
                type="button"
                onClick={onQuickAsk ?? onOpenChat}
                className="w-full md:w-40 rounded-2xl border border-sky-400/20 bg-sky-400/10 px-6 py-3.5 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20 hover:text-sky-50"
              >
                Quick Ask
              </button>
            </div>
          </div>
        ) : (
          <>
            <section>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                MVP Features
              </h4>
              <ul className="space-y-2 text-sm leading-6 text-slate-300">
                {features.map((feature, idx) => (
                  <li key={idx} className="rounded-xl bg-white/5 px-4 py-2.5 flex items-start gap-3">
                    <span className="text-sky-400/60 font-mono text-[10px] mt-1 shrink-0">{(idx + 1).toString().padStart(2, '0')}</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Tool Stack
              </h4>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-200"
                  >
                    {tool}
                  </span>
               ))}
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                  Cost Snapshot
                </h4>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-300/10 px-2 py-0.5 text-[10px] font-bold text-emerald-100 uppercase tracking-wider border border-emerald-400/20">
                    {generatedWith}
                  </span>
                  <button
                    onClick={() => setShowCostAnalysis(true)}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-[10px] font-bold text-emerald-100 uppercase tracking-wider hover:bg-emerald-400/30 transition shadow-sm border border-emerald-400/30 w-fit"
                  >
                    💰 Breakdown
                  </button>
                  <button
                    onClick={() => setShowCostBuilder(true)}
                    className="flex items-center gap-1.5 rounded-full bg-indigo-400/20 px-3 py-1.5 text-[10px] font-bold text-indigo-100 uppercase tracking-wider hover:bg-indigo-400/30 transition shadow-sm border border-indigo-400/30 w-fit"
                  >
                    ⚙️ Build Costs
                  </button>
                </div>
              </div>

              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl bg-slate-950/40 p-4">
                  <dt className="text-xs text-slate-400 font-medium tracking-wide">Setup</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">
                    ${currentPath.setup}
                  </dd>
                </div>
                <div className="rounded-xl bg-slate-950/40 p-4">
                  <dt className="text-xs text-slate-400 font-medium tracking-wide">Monthly</dt>
                  <dd className="mt-1 text-2xl font-semibold text-white">
                    ${currentPath.monthly}
                  </dd>
                </div>
              </dl>
            </section>

            <div className="space-y-4 pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={onOpenChat}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-sky-400/40 hover:bg-sky-400/10"
                >
                  Chat with AI
                </button>
                <button
                  type="button"
                  onClick={onAddToFavorites}
                  aria-pressed={isFavorite}
                  disabled={isFavorite || !onAddToFavorites}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:bg-sky-400/10 disabled:cursor-not-allowed disabled:border-emerald-400/30 disabled:bg-emerald-400/10 disabled:text-emerald-100"
                >
                  {isFavorite ? "✓ Saved Idea" : "+ Add to Favorites"}
                </button>
              </div>
              <p className="text-xs leading-5 text-slate-500 text-center">
                Saved concepts are available for further refinement and comparison within your browser.
              </p>
            </div>
          </>
        )}

        <span className="sr-only">{id}</span>
      </div>

      {showCostAnalysis && (
        <CostIntelligenceModal
          isOpen={showCostAnalysis}
          onClose={() => setShowCostAnalysis(false)}
          ideaHook={hook}
          ideaFeatures={features}
          ideaTools={tools}
          niche={niche}
          platform={platform}
          budget={budget}
          pathType={generatedWith}
          currentSetupCost={currentPath.setup}
          currentMonthlyCost={currentPath.monthly}
        />
      )}

      {showCostBuilder && (
        <CostBuilderModal
          isOpen={showCostBuilder}
          onClose={() => setShowCostBuilder(false)}
          ideaHook={hook}
          ideaFeatures={features}
          ideaTools={tools}
          niche={niche}
          platform={platform}
          baseSetupCost={currentPath.setup}
          baseMonthlyCost={currentPath.monthly}
        />
      )}
    </article>
  );
}
