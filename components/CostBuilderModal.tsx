"use client";

import { useEffect, useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CopyPlus, TrendingDown, Info, X } from "lucide-react";

type FeatureToggle = {
  id: string;
  name: string;
  category: string;
  cost_setup: number;
  cost_monthly: number;
  justification: string;
};

type CostBuilderResponse = {
  toggles: FeatureToggle[];
};

type CostBuilderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ideaHook: string;
  ideaFeatures: string[];
  ideaTools: string[];
  niche: string;
  platform: string;
  baseSetupCost: number;
  baseMonthlyCost: number;
};

export function CostBuilderModal({
  isOpen,
  onClose,
  ideaHook,
  ideaFeatures,
  ideaTools,
  niche,
  platform,
  baseSetupCost,
  baseMonthlyCost,
}: CostBuilderModalProps) {
  const [toggles, setToggles] = useState<FeatureToggle[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && toggles.length === 0 && !loading) {
      void fetchCostBuilder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchCostBuilder = async () => {
    setLoading(true);
    setError("");
    try {
      const url = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
      const res = await fetch(`${url}/build-costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_hook: ideaHook,
          idea_features: ideaFeatures,
          idea_tools: ideaTools,
          niche,
          platform,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate cost building model");
      const data = (await res.json()) as CostBuilderResponse;
      setToggles(data.toggles);
      
      // Auto-select Core Requirements if generated
      const coreIds = data.toggles
        .filter(t => t.category.toLowerCase().includes("core") || t.cost_setup === 0)
        .map(t => t.id);
      setSelectedIds(new Set(coreIds));
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addedSetup = useMemo(() => {
    return toggles.filter(t => selectedIds.has(t.id)).reduce((sum, t) => sum + t.cost_setup, 0);
  }, [toggles, selectedIds]);

  const addedMonthly = useMemo(() => {
    return toggles.filter(t => selectedIds.has(t.id)).reduce((sum, t) => sum + t.cost_monthly, 0);
  }, [toggles, selectedIds]);

  const totalSetup = baseSetupCost + addedSetup;
  const totalMonthly = baseMonthlyCost + addedMonthly;

  const categories = useMemo(() => {
    const cats = new Set(toggles.map(t => t.category));
    return Array.from(cats);
  }, [toggles]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[60] flex w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] flex-col border border-white/10 bg-slate-900 shadow-2xl shadow-sky-900/20 max-h-[90vh] overflow-hidden sm:rounded-3xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex-shrink-0 flex items-start justify-between gap-3 sm:gap-4 border-b border-white/10 p-4 sm:p-6 lg:px-10 lg:pt-10 lg:pb-6">
            <div className="space-y-2 sm:space-y-3 min-w-0">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400/10 px-2 sm:px-3 py-1 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-400 border border-indigo-400/20">
                <CopyPlus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Interactive Cost Builder
              </span>
              <Dialog.Title className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight text-white tracking-tight line-clamp-2">
                Customize: {ideaHook}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-full border border-white/10 p-2 sm:p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white flex-shrink-0"
                aria-label="Close"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-10" style={{scrollbarWidth: 'thin', scrollbarColor: 'rgba(148, 163, 184, 0.5) transparent'}}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-indigo-400 space-y-4">
                 <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <p className="font-medium animate-pulse">Generating custom toggles for your idea...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-200">
                {error}
              </div>
            ) : toggles.length > 0 ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 py-6">
                {categories.map((category) => (
                  <section key={category} className="space-y-3 sm:space-y-4">
                    <h3 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 border-b border-white/5 pb-2 sticky top-0 bg-slate-900 z-10">
                       {category}
                    </h3>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {toggles.filter(t => t.category === category).map(toggle => {
                         const isSelected = selectedIds.has(toggle.id);
                         return (
                           <div 
                             key={toggle.id}
                             onClick={() => handleToggle(toggle.id)}
                             className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 h-full flex flex-col ${
                               isSelected 
                                ? "bg-indigo-500/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]" 
                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                             }`}
                           >
                              <div className="flex justify-between items-start mb-2 gap-1.5">
                                 <strong className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-indigo-300' : 'text-slate-200'} line-clamp-2`}>
                                    {toggle.name}
                                 </strong>
                                 <div className={`shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600 bg-slate-900/50'
                                 }`}>
                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                 </div>
                              </div>
                              <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-3 flex-grow" title={toggle.justification}>
                                {toggle.justification}
                              </p>
                              <div className="flex flex-col gap-2 text-xs font-medium mt-auto">
                                 <div className="flex flex-wrap gap-2">
                                    {toggle.cost_setup > 0 && (
                                      <span className="text-emerald-400/90 bg-emerald-400/10 px-2 py-0.5 rounded whitespace-nowrap">
                                        +${toggle.cost_setup.toLocaleString()} setup
                                      </span>
                                    )}
                                    {toggle.cost_monthly > 0 && (
                                      <span className="text-sky-400/90 bg-sky-400/10 px-2 py-0.5 rounded whitespace-nowrap">
                                        +${toggle.cost_monthly.toLocaleString()}/mo
                                      </span>
                                    )}
                                    {toggle.cost_setup === 0 && toggle.cost_monthly === 0 && (
                                       <span className="text-slate-500">Included</span>
                                    )}
                                 </div>
                              </div>
                           </div>
                         );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex-shrink-0 bg-gradient-to-t from-slate-900 to-slate-900/90 border-t border-white/10 p-4 sm:p-6 lg:px-10 lg:py-6 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
             <div className="w-full sm:w-auto">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2 text-center sm:text-left">Total Configuration Estimate</p>
                <div className="flex flex-col sm:flex-row items-center sm:items-baseline gap-2 sm:gap-4">
                   <div className="text-xl sm:text-2xl font-bold text-white">
                      ${totalSetup.toLocaleString()} <span className="text-xs sm:text-sm text-slate-400 font-normal">setup</span>
                   </div>
                   <div className="hidden sm:block text-slate-600">/</div>
                   <div className="text-lg sm:text-xl font-semibold text-white">
                      ${totalMonthly.toLocaleString()} <span className="text-xs sm:text-sm text-slate-400 font-normal">monthly</span>
                   </div>
                </div>
             </div>
             
             <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="flex-1 sm:flex-none rounded-lg sm:rounded-xl bg-white/5 border border-white/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none rounded-lg sm:rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold shadow-lg shadow-indigo-500/20 transition"
                >
                  Save Configuration
                </button>
             </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
