"use client";

type FilterFormProps = {
  additionalInfo: string;
  budget: number;
  monthlyBudget: number | "";
  riskTolerance: string;
  flexibility: string;
  codeMode: boolean;
  niche: string;
  platform: string;
  isSubmitting?: boolean;
  onAdditionalInfoChange: (value: string) => void;
  onBudgetChange: (value: number) => void;
  onMonthlyBudgetChange: (value: number | "") => void;
  onRiskToleranceChange: (value: string) => void;
  onFlexibilityChange: (value: string) => void;
  onCodeModeChange: (value: boolean) => void;
  onNicheChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onSubmit: () => void;
};

export function FilterForm({
  additionalInfo,
  budget,
  monthlyBudget,
  riskTolerance,
  flexibility,
  codeMode,
  niche,
  platform,
  isSubmitting = false,
  onAdditionalInfoChange,
  onBudgetChange,
  onMonthlyBudgetChange,
  onRiskToleranceChange,
  onFlexibilityChange,
  onCodeModeChange,
  onNicheChange,
  onPlatformChange,
  onSubmit,
}: FilterFormProps) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 shadow-2xl shadow-slate-950/30 backdrop-blur w-full">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
          Discovery Filters
        </p>
        <h2 className="text-2xl font-semibold text-white">Shape the idea set</h2>
        <p className="text-sm leading-6 text-slate-400">
          Refine your requirements to generate precise, actionable application blueprints.
        </p>
      </div>

      <form
        className="grid gap-6 md:gap-10 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="niche"
              className="text-sm font-medium text-slate-200"
            >
              Primary Niche
            </label>
            <select
              id="niche"
              name="niche"
              value={niche}
              onChange={(event) => onNicheChange(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
            >
              <option>Productivity</option>
              <option>Education</option>
              <option>Health &amp; Fitness</option>
              <option>Finance</option>
              <option>Social</option>
              <option>E-commerce</option>
              <option>Developer Tools</option>
              <option>Other</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="budget" className="text-sm font-medium text-slate-200">
                  Total Setup Budget ($)
                </label>
                <input
                  id="budget"
                  name="budget"
                  type="number"
                  min="0"
                  max="100000"
                  step="50"
                  value={budget}
                  onChange={(event) => onBudgetChange(Number(event.target.value))}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="monthlyBudget" className="text-sm font-medium text-slate-200">
                  Monthly Budget ($) <span className="opacity-50 font-normal">(Optional)</span>
                </label>
                <input
                  id="monthlyBudget"
                  name="monthlyBudget"
                  type="number"
                  min="0"
                  max="50000"
                  step="10"
                  value={monthlyBudget === "" ? "" : monthlyBudget}
                  onChange={(event) => onMonthlyBudgetChange(event.target.value !== "" ? Number(event.target.value) : "")}
                  placeholder="e.g. 100"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="riskTolerance" className="text-sm font-medium text-slate-200">
                  Risk Tolerance
                </label>
                <select
                  id="riskTolerance"
                  name="riskTolerance"
                  value={riskTolerance}
                  onChange={(event) => onRiskToleranceChange(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                >
                  <option value="conservative">Conservative</option>
                  <option value="balanced">Balanced</option>
                  <option value="ambitious">Ambitious</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="flexibility" className="text-sm font-medium text-slate-200">
                  Flexibility
                </label>
                <select
                  id="flexibility"
                  name="flexibility"
                  value={flexibility}
                  onChange={(event) => onFlexibilityChange(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20"
                >
                  <option value="strict">Strict</option>
                  <option value="flexible">Flexible</option>
                  <option value="aspirational">Aspirational</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">
                Implementation Mode
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={codeMode}
                onClick={() => onCodeModeChange(!codeMode)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-950 ${
                  codeMode ? "bg-sky-500" : "bg-slate-700"
                }`}
              >
                <span className="sr-only">Toggle Code Mode</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    codeMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {codeMode
                ? "Code: Requires programming skills."
                : "No Code: Ideas for non-technical users."}
            </p>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-200">
              Platform
            </legend>
            <div className="grid gap-3 grid-cols-3">
              {["Web", "Mobile", "Extension"].map((platformOption) => (
                <label
                  key={platformOption}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/40 px-2 sm:px-3 py-3 text-sm font-medium text-slate-200 text-center hover:bg-slate-950/60 transition"
                >
                  <input
                    type="radio"
                    name="platform"
                    value={platformOption}
                    checked={platform === platformOption}
                    onChange={(event) => onPlatformChange(event.target.value)}
                    className="h-4 w-4 accent-sky-400"
                  />
                  {platformOption}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="flex-1 space-y-2 flex flex-col">
            <label
              htmlFor="extra-context"
              className="text-sm font-medium text-slate-200"
            >
              Additional Context
            </label>
            <textarea
              id="extra-context"
              name="extra-context"
              value={additionalInfo}
              onChange={(event) => onAdditionalInfoChange(event.target.value)}
              placeholder="Add niche details, specific features, constraints, audience notes, or anything else the generator should remember."
              className="w-full flex-1 resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500/80 focus:border-sky-400 focus:ring-1 focus:ring-sky-400/20 min-h-[120px]"
            />
            <p className="text-xs leading-5 text-slate-500 pt-1">
              Provide specific details to personalize the AI analysis and recommendations for your unique vision.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-sky-500 px-4 py-4 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isSubmitting ? "Generating..." : "Generate Ideas"}
          </button>
        </div>
      </form>
    </section>
  );
}
