export type BudgetStatus = {
  within_budget: boolean;
  overrun_amount: number | null;
  confidence_level: 'high' | 'medium' | 'low';
  recommendations: string[];
};

export type IdeaCardData = {
  id: string;
  hook: string;
  features: string[];
  tools: string[];
  pathA: { setup: number; monthly: number };
  pathB: { setup: number; monthly: number };
  generatedWith: "code" | "no-code";
  budgetStatus?: BudgetStatus | null;
};
