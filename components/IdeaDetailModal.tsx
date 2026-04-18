"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Code, LayoutTemplate, Settings2, Sparkles, X } from "lucide-react";

import { type IdeaCardData } from "@/lib/idea-data";
import { CostIntelligenceModal } from "@/components/CostIntelligenceModal";
import { CostBuilderModal } from "@/components/CostBuilderModal";

type IdeaDetailModalProps = {
  idea: IdeaCardData;
  isOpen: boolean;
  niche: string;
  platform: string;
  budget: number;
  isFavorite: boolean;
  onAddToFavorites: () => void;
  onGenerateAlternativePath: () => void;
  onClose: () => void;
  isRegenerating?: boolean;
};

export function IdeaDetailModal({
  idea,
  isOpen,
  niche,
  platform,
  budget,
  isFavorite,
  onAddToFavorites,
  onGenerateAlternativePath,
  onClose,
  isRegenerating = false,
}: IdeaDetailModalProps) {
  const [showCostAnalysis, setShowCostAnalysis] = useState(false);
  const [showCostBuilder, setShowCostBuilder] = useState(false);
  // Show the path that was actually generated
  const currentPath = idea.generatedWith === "code" ? idea.pathB : idea.pathA;
  const budgetStatus = idea.budgetStatus;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-6 border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-sky-900/20 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl lg:p-10 max-h-[90vh] overflow-y-auto">
          
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-sky-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-300 border border-sky-400/20">
                Blueprint Strategy
              </span>
              <Dialog.Title className="text-2xl lg:text-3xl font-bold leading-tight text-white tracking-tight">
                {idea.hook}
              </Dialog.Title>
              {budgetStatus && (
                 <div className={`mt-2 mb-2 inline-flex flex-wrap items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${
                   budgetStatus.within_budget 
                     ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' 
                     : (budgetStatus.overrun_amount ?? 0) > (budget * 0.25)
                       ? 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                       : 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                 }`}>
                    {budgetStatus.within_budget ? '✓ Perfect fit for your budget' : `⚠ Exceeds budget ${budgetStatus.overrun_amount ? `by $${budgetStatus.overrun_amount.toLocaleString()}` : ''}`}
                 </div>
              )}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-semibold text-sky-200">
                  {niche}
                </span>
                <span className="rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-200">
                  {platform}
                </span>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  ${budget} budget
                </span>
                <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-200 capitalize">
                  {idea.generatedWith} Path
                </span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-full border border-white/10 p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-sky-400/50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className={`grid gap-8 lg:grid-cols-2 transition-opacity ${isRegenerating ? 'opacity-50' : 'opacity-100'}`}>
            {/* Left Column */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-sky-400" />
                  <h3 className="text-lg font-semibold text-white">
                    MVP Features
                  </h3>
                </div>
                <ul className="space-y-3">
                  {idea.features.map((feature, i) => (
                    <li key={feature} className="flex gap-3 text-base leading-7 rounded-2xl bg-white/5 border border-white/5 p-4">
                      <span className="text-sky-400 font-bold mt-0.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <LayoutTemplate className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Idea Context
                  </h3>
                </div>
                <p className="rounded-2xl border border-white/5 bg-white/5 p-5 text-base leading-7 text-slate-300">
                  {idea.hook}
                </p>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-violet-400" />
                  <h3 className="text-lg font-semibold text-white">
                    Tool Stack
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {idea.tools.map((tool) => (
                    <span
                      key={tool}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Cost Snapshot
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300 uppercase tracking-wider border border-emerald-400/20">
                      {idea.generatedWith}
                    </span>
                    <button
                      onClick={() => setShowCostAnalysis(true)}
                      className="flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-1.5 text-xs font-bold text-emerald-100 uppercase tracking-wider hover:bg-emerald-400/30 transition shadow-sm border border-emerald-400/30"
                    >
                      💰 Cost Breakdown
                    </button>
                    <button
                      onClick={() => setShowCostBuilder(true)}
                      className="flex items-center gap-1.5 rounded-full bg-indigo-400/20 px-3 py-1.5 text-xs font-bold text-indigo-100 uppercase tracking-wider hover:bg-indigo-400/30 transition shadow-sm border border-indigo-400/30"
                    >
                      ⚙️ Customize Costs
                    </button>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6">
                  <dl className="grid grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-slate-400 mb-1">Setup Cost</dt>
                      <dd className="text-3xl font-bold text-white">${currentPath.setup}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-slate-400 mb-1">Monthly Cost</dt>
                      <dd className="text-3xl font-bold text-white">${currentPath.monthly}</dd>
                    </div>
                  </dl>
                  <p className="mt-6 text-sm text-emerald-200/60 pt-4 border-t border-emerald-400/10">
                    Comprehensive estimates for a {idea.generatedWith}-based ecosystem.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 mt-4 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onGenerateAlternativePath}
              disabled={isRegenerating}
              className="flex items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-6 py-4 text-base font-semibold text-sky-100 transition hover:bg-sky-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRegenerating ? (
                <>
                  <svg className="h-5 w-5 animate-spin text-sky-400" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Regenerating...
                </>
              ) : (
                `Generate ${idea.generatedWith === "code" ? "No Code" : "Code"} Path`
              )}
            </button>

            <button
              type="button"
              onClick={onAddToFavorites}
              disabled={isFavorite}
              aria-pressed={isFavorite}
              className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base font-semibold text-white transition hover:border-emerald-400/40 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:border-emerald-400/30 disabled:bg-emerald-400/10 disabled:text-emerald-100"
            >
              {isFavorite ? (
                <>
                  <Check className="h-5 w-5" />
                  Saved to Favorites
                </>
              ) : (
                "+ Add to Favorites"
              )}
            </button>
          </div>
          
        </Dialog.Content>
      </Dialog.Portal>

      {showCostAnalysis && (
        <CostIntelligenceModal
          isOpen={showCostAnalysis}
          onClose={() => setShowCostAnalysis(false)}
          ideaHook={idea.hook}
          ideaFeatures={idea.features}
          ideaTools={idea.tools}
          niche={niche}
          platform={platform}
          budget={budget}
          pathType={idea.generatedWith}
          currentSetupCost={currentPath.setup}
          currentMonthlyCost={currentPath.monthly}
        />
      )}

      {showCostBuilder && (
        <CostBuilderModal
          isOpen={showCostBuilder}
          onClose={() => setShowCostBuilder(false)}
          ideaHook={idea.hook}
          ideaFeatures={idea.features}
          ideaTools={idea.tools}
          niche={niche}
          platform={platform}
          baseSetupCost={currentPath.setup}
          baseMonthlyCost={currentPath.monthly}
        />
      )}
    </Dialog.Root>
  );
}
