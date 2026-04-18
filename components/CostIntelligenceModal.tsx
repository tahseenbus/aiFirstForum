"use client";

import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DollarSign, ShieldAlert, TrendingDown, Info, X } from "lucide-react";

type CostBreakdownItem = {
  category: string;
  item: string;
  amount: number;
  cost_type: "one-time" | "monthly" | "annual";
  justification: string;
  optimization_potential: string | null;
};

type CostAnalysisResponse = {
  breakdown: CostBreakdownItem[];
  total_one_time: number;
  total_monthly: number;
  cost_ranges: Record<string, { setup: number; monthly: number }>;
  optimization_suggestions: string[];
  risk_assessment: string;
  market_comparison: string;
};

type CostIntelligenceModalProps = {
  isOpen: boolean;
  onClose: () => void;
  ideaHook: string;
  ideaFeatures: string[];
  ideaTools: string[];
  niche: string;
  platform: string;
  budget: number;
  pathType: "code" | "no-code";
  currentSetupCost: number;
  currentMonthlyCost: number;
};

export function CostIntelligenceModal({
  isOpen,
  onClose,
  ideaHook,
  ideaFeatures,
  ideaTools,
  niche,
  platform,
  budget,
  pathType,
  currentSetupCost,
  currentMonthlyCost,
}: CostIntelligenceModalProps) {
  const [analysis, setAnalysis] = useState<CostAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && !analysis && !loading) {
      void fetchCostAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const fetchCostAnalysis = async () => {
    setLoading(true);
    setError("");
    try {
      const url = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
      const res = await fetch(`${url}/analyze-costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea_hook: ideaHook,
          idea_features: ideaFeatures,
          idea_tools: ideaTools,
          current_setup_cost: currentSetupCost,
          current_monthly_cost: currentMonthlyCost,
          niche,
          platform,
          budget,
          path_type: pathType,
        }),
      });
      if (!res.ok) throw new Error("Failed to analyze costs");
      const data = await res.json();
      setAnalysis(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-[60] grid w-full max-w-5xl translate-x-[-50%] translate-y-[-50%] gap-6 border border-white/10 bg-slate-900 p-6 shadow-2xl shadow-sky-900/20 max-h-[90vh] overflow-y-auto sm:rounded-3xl lg:p-10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300 border border-emerald-400/20">
                <DollarSign className="w-3.5 h-3.5" />
                Cost Intelligence Dashboard
              </span>
              <Dialog.Title className="text-2xl lg:text-3xl font-bold leading-tight text-white tracking-tight">
                {ideaHook}
              </Dialog.Title>
              <div className="text-slate-400 text-sm flex gap-4 items-center">
                <span>Path: <strong className="text-white capitalize">{pathType}</strong></span>
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-full border border-white/10 p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-emerald-400 space-y-4">
               <svg className="h-10 w-10 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="font-medium animate-pulse">Analyzing cost components & market rates...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-5 text-sm text-rose-200">
              {error}
            </div>
          ) : analysis ? (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
              <section className="overflow-x-auto rounded-3xl border border-white/10 bg-slate-950/20">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase bg-white/5 text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-semibold tracking-wider">Cost Component</th>
                      <th className="px-6 py-4 font-semibold tracking-wider w-32">Amount</th>
                      <th className="px-6 py-4 font-semibold tracking-wider w-24">Type</th>
                      <th className="px-6 py-4 font-semibold tracking-wider">Justification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {analysis.breakdown.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5 transition">
                        <td className="px-6 py-5">
                          <div className="font-semibold text-white text-base mb-1">{item.item}</div>
                          <div className="text-xs font-medium text-sky-400/80 uppercase tracking-widest">{item.category}</div>
                        </td>
                        <td className="px-6 py-5 font-mono text-base font-semibold">${item.amount.toLocaleString()}</td>
                        <td className="px-6 py-5 capitalize text-slate-400 font-medium">{item.cost_type.replace('-', ' ')}</td>
                        <td className="px-6 py-5">
                          <div className="text-slate-300 leading-relaxed font-medium">{item.justification}</div>
                          {item.optimization_potential && (
                            <div className="text-xs text-emerald-400 flex items-start gap-1.5 mt-3 bg-emerald-400/10 p-2.5 rounded-xl border border-emerald-400/20">
                              <TrendingDown className="w-4 h-4 shrink-0" />
                              <span className="leading-snug">{item.optimization_potential}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t border-white/10 bg-sky-950/30 text-white font-semibold shadow-inner">
                    <tr>
                      <td className="px-6 py-5 text-sm uppercase tracking-widest text-sky-200/80">Total Estimate</td>
                      <td colSpan={3} className="px-6 py-5">
                        <div className="flex gap-6 items-baseline">
                          <span className="text-xl text-emerald-400 border-b border-emerald-400/30 pb-0.5">${analysis.total_one_time.toLocaleString()} <span className="text-emerald-400/60 font-medium text-xs uppercase tracking-widest ml-1">one-time setup</span></span>
                          <span className="text-slate-600">|</span>
                          <span className="text-xl text-sky-400 border-b border-sky-400/30 pb-0.5">${analysis.total_monthly.toLocaleString()} <span className="text-sky-400/60 font-medium text-xs uppercase tracking-widest ml-1">monthly recurring</span></span>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </section>

              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-3xl border border-sky-400/20 bg-sky-400/5 p-6 md:p-8 backdrop-blur-sm">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-sky-400 mb-6 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" /> Optimization Opportunities
                  </h3>
                  <ul className="space-y-4 text-sm text-slate-300">
                    {analysis.optimization_suggestions.map((s, i) => (
                      <li key={i} className="flex gap-3 leading-relaxed">
                        <span className="text-sky-400 mt-1">•</span> <span className="flex-1">{s}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-6 md:p-8 backdrop-blur-sm">
                  <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400 mb-6 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> Risk Assessment & Market
                  </h3>
                  <div className="space-y-6 text-sm text-slate-300">
                    <div>
                      <strong className="text-white block mb-2 text-xs uppercase tracking-widest opacity-80 mt-1">Cost Risk Level</strong>
                      <p className="leading-relaxed font-medium">{analysis.risk_assessment}</p>
                    </div>
                    <div>
                      <strong className="text-white block mb-2 text-xs uppercase tracking-widest opacity-80 mt-1">Market Comparison</strong>
                      <p className="leading-relaxed font-medium">{analysis.market_comparison}</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-3xl border border-violet-400/20 bg-violet-400/5 p-6 md:p-8 backdrop-blur-sm">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-violet-400 mb-6 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Alternative Cost Scenarios
                </h3>
                <div className="grid sm:grid-cols-3 gap-6">
                  {Object.entries(analysis.cost_ranges).map(([scenario, costs]) => (
                    <div key={scenario} className="bg-slate-950/40 p-5 rounded-2xl border border-white/5 hover:border-violet-400/30 transition-colors">
                      <h4 className="font-bold text-white mb-3 text-base">{scenario} Estimate</h4>
                      <div className="text-sm font-medium space-y-2">
                        <div className="text-slate-400"><span className="text-emerald-400 font-mono text-lg mr-1">${costs.setup.toLocaleString()}</span> setup</div>
                        <div className="text-slate-400"><span className="text-sky-400 font-mono text-lg mr-1">${costs.monthly.toLocaleString()}</span> / month</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
