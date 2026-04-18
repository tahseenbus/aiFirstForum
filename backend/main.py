from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from gemini import generate_chat_response, generate_ideas, generate_cost_analysis, generate_cost_builder
from models import (
    ChatResponse,
    CostPath,
    GenerateRequest,
    GenerateResponse,
    IdeaCard,
    ChatRequest,
    CostAnalysisRequest,
    CostAnalysisResponse,
    CostBuilderRequest,
    CostBuilderResponse,
    BudgetStatus,
)


app = FastAPI(title="AppIdea Blueprint API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest) -> GenerateResponse:
    raw_ideas = generate_ideas(
        niche=payload.niche,
        budget=payload.budget,
        monthly_budget=payload.monthly_budget,
        risk_tolerance=payload.risk_tolerance,
        flexibility=payload.flexibility,
        platform=payload.platform,
        additional_context=payload.additional_context,
        favorite_ideas=payload.favorite_ideas,
        code_mode=payload.code_mode,
        regenerate_idea_hook=payload.regenerate_idea_hook,
        regenerate_from_code_mode=payload.regenerate_from_code_mode,
    )

    ideas = []
    for item in raw_ideas:
        # Determine generated_with based on request or original mode
        # If is regeneration, the new mode is the opposite of regenerate_from_code_mode
        if payload.regenerate_idea_hook:
            generated_with = "no-code" if payload.regenerate_from_code_mode else "code"
        else:
            generated_with = "code" if payload.code_mode else "no-code"

        ideas.append(
            IdeaCard(
                hook=item["hook"],
                features=item["features"],
                tools=item["tools"],
                path_a=CostPath(
                    setup=float(item.get("path_a_setup", 0)),
                    monthly=float(item.get("path_a_monthly", 0)),
                ),
                path_b=CostPath(
                    setup=float(item.get("path_b_setup", 0)),
                    monthly=float(item.get("path_b_monthly", 0)),
                ),
                generated_with=generated_with,
                budget_status=BudgetStatus(**item.get("budget_status")) if item.get("budget_status") else None,
            )
        )

    return GenerateResponse(ideas=ideas)


@app.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest) -> ChatResponse:
    result = generate_chat_response(
        idea_hook=payload.idea_hook,
        idea_features=payload.idea_features,
        idea_tools=payload.idea_tools,
        user_question=payload.user_question,
        conversation_history=[
            {"role": item.role, "text": item.text}
            for item in payload.conversation_history
        ],
        niche=payload.niche,
        budget=payload.budget,
        platform=payload.platform,
        favorite_ideas=payload.favorite_ideas,
    )
    return ChatResponse(**result)


@app.post("/analyze-costs", response_model=CostAnalysisResponse)
def analyze_costs(payload: CostAnalysisRequest) -> CostAnalysisResponse:
    result = generate_cost_analysis(
        idea_hook=payload.idea_hook,
        idea_features=payload.idea_features,
        idea_tools=payload.idea_tools,
        current_setup_cost=payload.current_setup_cost,
        current_monthly_cost=payload.current_monthly_cost,
        niche=payload.niche,
        platform=payload.platform,
        budget=payload.budget,
        path_type=payload.path_type,
    )
    return CostAnalysisResponse(**result)


@app.post("/build-costs", response_model=CostBuilderResponse)
def build_costs(payload: CostBuilderRequest) -> CostBuilderResponse:
    result = generate_cost_builder(
        idea_hook=payload.idea_hook,
        idea_features=payload.idea_features,
        idea_tools=payload.idea_tools,
        niche=payload.niche,
        platform=payload.platform,
    )
    return CostBuilderResponse(**result)
