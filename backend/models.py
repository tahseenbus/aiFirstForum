from pydantic import BaseModel, Field


class CostPath(BaseModel):
    setup: float
    monthly: float


class CostBreakdownItem(BaseModel):
    category: str
    item: str
    amount: float
    cost_type: str
    justification: str
    optimization_potential: str | None = None


class CostAnalysisRequest(BaseModel):
    idea_hook: str
    idea_features: list[str]
    idea_tools: list[str]
    current_setup_cost: float
    current_monthly_cost: float
    niche: str
    platform: str
    budget: int
    path_type: str
    i_code_it_myself: bool = False
    user_skills: list[str] = Field(default_factory=list)


class CostAnalysisResponse(BaseModel):
    breakdown: list[CostBreakdownItem]
    total_one_time: float
    total_monthly: float
    cost_ranges: dict[str, dict[str, float]]
    optimization_suggestions: list[str]
    risk_assessment: str
    market_comparison: str


class BudgetStatus(BaseModel):
    within_budget: bool
    overrun_amount: float | None
    confidence_level: str
    recommendations: list[str]


class IdeaCard(BaseModel):
    hook: str
    features: list[str] = Field(..., min_length=3, max_length=3)
    tools: list[str] = Field(..., min_length=3, max_length=5)
    path_a: CostPath
    path_b: CostPath
    generated_with: str | None = None
    budget_status: BudgetStatus | None = None


class GenerateRequest(BaseModel):
    niche: str
    budget: int
    monthly_budget: int | None = None
    risk_tolerance: str = "balanced"
    flexibility: str = "flexible"
    platform: str
    additional_context: str | None = None
    favorite_ideas: list[str] = Field(default_factory=list)
    code_mode: bool = False
    regenerate_idea_hook: str | None = None
    regenerate_from_code_mode: bool | None = None
    i_code_it_myself: bool = False
    user_skills: list[str] = Field(default_factory=list)


class FeatureToggle(BaseModel):
    id: str
    name: str
    category: str
    cost_setup: float
    cost_monthly: float
    justification: str


class CostBuilderRequest(BaseModel):
    idea_hook: str
    idea_features: list[str]
    idea_tools: list[str]
    niche: str
    platform: str


class CostBuilderResponse(BaseModel):
    toggles: list[FeatureToggle]


class GenerateResponse(BaseModel):
    ideas: list[IdeaCard]


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    idea_hook: str
    idea_features: list[str] = Field(..., min_length=1)
    idea_tools: list[str] = Field(..., min_length=1)
    user_question: str
    conversation_history: list[ChatMessage] = Field(default_factory=list)
    niche: str | None = None
    budget: int | None = None
    platform: str | None = None
    favorite_ideas: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str
    follow_up_suggestions: list[str] = Field(default_factory=list)
