import json
import os
from typing import Any

from dotenv import load_dotenv
from fastapi import HTTPException
from google import genai


load_dotenv()


def _without_broken_proxy() -> dict[str, str | None]:
    original: dict[str, str | None] = {}
    for key in [
        "HTTP_PROXY",
        "HTTPS_PROXY",
        "ALL_PROXY",
        "http_proxy",
        "https_proxy",
        "all_proxy",
    ]:
        original[key] = os.environ.get(key)
        os.environ.pop(key, None)
    return original


def _restore_proxy(original: dict[str, str | None]) -> None:
    for key, value in original.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


def _get_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_key_here":
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY is missing. Add it to backend/.env before calling the API.",
        )

    return genai.Client(api_key=api_key)


def _build_prompt(
    niche: str,
    budget: int,
    platform: str,
    additional_context: str | None,
    favorite_ideas: list[str],
    code_mode: bool = False,
    monthly_budget: int | None = None,
    risk_tolerance: str = "balanced",
    flexibility: str = "flexible",
    regenerate_idea_hook: str | None = None,
    regenerate_from_code_mode: bool | None = None,
) -> str:
    if regenerate_idea_hook:
        return f"""
You are an app idea generator. The user wants to see an alternative implementation path for an existing idea.

Original idea: "{regenerate_idea_hook}"
Original implementation approach: {"code-based with developers" if regenerate_from_code_mode else "no-code tools"}
Niche: {niche}
Budget: ${budget}
Platform: {platform}

Generate an alternative implementation of the SAME idea concept using {"no-code tools" if regenerate_from_code_mode else "custom code with developers"}.

Return a JSON object with:
- hook: string (same core concept as original, but emphasizing the alternative approach)
- features: array of exactly 3 strings (same MVP features, adapted for alternative tools)
- tools: array of 3-5 specific tool names (completely different from original - use {"no-code platforms" if not regenerate_from_code_mode else "development frameworks/libraries"})
- setup: number (one-time setup cost in USD for {"no-code" if not regenerate_from_code_mode else "code"} approach)
- monthly: number (monthly cost in USD for {"no-code" if not regenerate_from_code_mode else "code"} approach)

Constraints:
- Keep the core idea the same - only change HOW it's implemented
- Be realistic about costs for this implementation approach
- Ensure all tools actually support the features described
- Keep it within the ${budget} budget if possible, but prioritize realistic costing
"""

    prompt_lines = [
        f"Generate 3 distinct MVP app ideas for the {niche} niche.",
        f"Max total setup budget: ${budget}.",
    ]

    if monthly_budget is not None:
        prompt_lines.append(f"Max expected monthly budget: ${monthly_budget}.")

    prompt_lines.extend([
        f"Target platform: {platform}.",
        f"Budget risk tolerance: {risk_tolerance}.",
        f"Budget flexibility constraints: {flexibility}.",
    ])

    if flexibility == "strict":
        prompt_lines.append("Requirement: Keep ALL ideas strictly within the budget constraints. Do not exceed the budget under any condition.")
    elif flexibility == "aspirational":
        prompt_lines.append("Requirement: Include at least one 'stretch' idea that notably exceeds the budget but unlocks significant business value/growth velocity. Provide clear reasoning.")
    else:
        prompt_lines.append("Requirement: Generate at least 2 ideas within the budget constraints. Included 1 'stretch' idea that slightly exceeds the budget if it provides significant additional value, explaining the overrun.")

    if code_mode:
        prompt_lines.extend([
            "Generate app ideas requiring programming expertise, incorporating technologies like Flutter, JavaScript, React, Python.",
            "CRITICAL: The `tools` array MUST exclusively list software development frameworks, languages, APIs, and databases (e.g., Next.js, PostgreSQL, Node.js, React Native, AWS). Do NOT include any no-code builders like Bubble, Glide, or Adalo.",
        ])
    else:
        prompt_lines.extend([
            "Generate app ideas that can be built without coding skills, using platforms like Bubble, Glide, Zapier, Make, and Webflow.",
            "CRITICAL: The `tools` array MUST exclusively list no-code or low-code platforms. Do NOT include programming languages or frameworks.",
            "Focus on ease of use, visual builders, drag-and-drop interfaces, and low technical barriers."
        ])

    prompt_lines.extend([
        "For each idea return a JSON object with:",
        " hook: string (1 sentence value proposition)",
        " features: array of exactly 3 strings (MVP must-haves only)",
        " tools: array of 3-5 specific tool names",
        " budget_status: object with {within_budget: boolean, overrun_amount: number | null, confidence_level: 'high'|'medium'|'low', recommendations: array of strings}",
    ])

    if code_mode:
        prompt_lines.extend([
            " path_a_monthly: number (indie dev/open-source hosting monthly cost in USD)",
            " path_b_monthly: number (enterprise/managed services monthly cost in USD)",
            " path_a_setup: number (bootstrapped one-time setup cost)",
            " path_b_setup: number (agency/contractor one-time setup cost)",
        ])
    else:
        prompt_lines.extend([
            " path_a_monthly: number (no-code monthly cost in USD)",
            " path_b_monthly: number (custom code monthly cost in USD)",
            " path_a_setup: number (no-code one-time setup cost)",
            " path_b_setup: number (custom code one-time setup cost)",
        ])

    prompt_lines.extend([
        "Rules: no hardware ideas if budget < 200. Keep features concrete.",
    ])

    if additional_context:
        prompt_lines.append(f"Additional user context: {additional_context}")

    if favorite_ideas:
        prompt_lines.append(
            "Saved favorite ideas to learn from: " + " | ".join(favorite_ideas)
        )
        prompt_lines.append(
            "Use the favorites as taste guidance, but still return fresh and distinct ideas."
        )

    return "\n".join(prompt_lines)


def _extract_json_array(raw_text: str) -> list[dict[str, Any]]:
    text = raw_text.strip()

    if text.startswith("```"):
        lines = [line for line in text.splitlines() if not line.startswith("```")]
        text = "\n".join(lines).strip()

    start = text.find("[")
    end = text.rfind("]")
    if start == -1 or end == -1:
        raise ValueError("Gemini response did not include a JSON array.")

    return json.loads(text[start : end + 1])


def _extract_json_object(raw_text: str) -> dict[str, Any]:
    text = raw_text.strip()

    if text.startswith("```"):
        lines = [line for line in text.splitlines() if not line.startswith("```")]
        text = "\n".join(lines).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("Gemini response did not include a JSON object.")

    return json.loads(text[start : end + 1])


def generate_ideas(
    niche: str,
    budget: int,
    platform: str,
    monthly_budget: int | None = None,
    risk_tolerance: str = "balanced",
    flexibility: str = "flexible",
    additional_context: str | None = None,
    favorite_ideas: list[str] | None = None,
    code_mode: bool = False,
    regenerate_idea_hook: str | None = None,
    regenerate_from_code_mode: bool | None = None,
) -> list[dict[str, Any]]:
    favorite_ideas = favorite_ideas or []
    prompt = _build_prompt(
        niche=niche,
        budget=budget,
        platform=platform,
        additional_context=additional_context,
        favorite_ideas=favorite_ideas,
        code_mode=code_mode,
        monthly_budget=monthly_budget,
        risk_tolerance=risk_tolerance,
        flexibility=flexibility,
        regenerate_idea_hook=regenerate_idea_hook,
        regenerate_from_code_mode=regenerate_from_code_mode,
    )

    original_proxy = _without_broken_proxy()
    try:
        client = _get_client()
        system_instruction = "You are an app idea generator. Respond ONLY with a valid JSON array. No markdown. No explanation. No backticks."
        if regenerate_idea_hook:
            system_instruction = "You are an app idea generator. Respond ONLY with a valid JSON object. No markdown. No explanation. No backticks."

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": system_instruction,
                "temperature": 0.8,
            },
        )
        
        if regenerate_idea_hook:
            result = _extract_json_object(response.text or "")
            # Map single setup/monthly back to path_a/path_b for consistent internal processing
            # If original was code, new is no-code (path_a)
            # If original was no-code, new is code (path_b)
            if regenerate_from_code_mode:
                # new is no-code
                result["path_a_setup"] = result.get("setup", 0)
                result["path_a_monthly"] = result.get("monthly", 0)
                result["path_b_setup"] = 0
                result["path_b_monthly"] = 0
            else:
                # new is code
                result["path_b_setup"] = result.get("setup", 0)
                result["path_b_monthly"] = result.get("monthly", 0)
                result["path_a_setup"] = 0
                result["path_a_monthly"] = 0
            return [result]

        return _extract_json_array(response.text or "")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini generation failed: {exc}",
        ) from exc
    finally:
        _restore_proxy(original_proxy)


def generate_chat_response(
    *,
    idea_hook: str,
    idea_features: list[str],
    idea_tools: list[str],
    user_question: str,
    conversation_history: list[dict[str, str]] | None = None,
    niche: str | None = None,
    budget: int | None = None,
    platform: str | None = None,
    favorite_ideas: list[str] | None = None,
) -> dict[str, Any]:
    favorite_ideas = favorite_ideas or []
    conversation_history = conversation_history or []

    context_lines = [
        "You are the AI product advisor inside AppIdea Blueprint.",
        "Answer only about the selected app idea and keep advice practical, specific, and startup-aware.",
        f"Idea hook: {idea_hook}",
        "Idea MVP features:",
        *[f"- {feature}" for feature in idea_features],
        "Suggested tools:",
        *[f"- {tool}" for tool in idea_tools],
    ]

    if niche:
        context_lines.append(f"Niche context: {niche}")
    if budget is not None:
        context_lines.append(f"Budget context: ${budget}")
    if platform:
        context_lines.append(f"Platform context: {platform}")
    if favorite_ideas:
        context_lines.append("Favorite ideas for taste guidance: " + " | ".join(favorite_ideas))

    history_lines = []
    for message in conversation_history[-8:]:
        role = message.get("role", "user").upper()
        text = message.get("text", "").strip()
        if text:
            history_lines.append(f"{role}: {text}")

    prompt_sections = [
        "\n".join(context_lines),
        "Return a JSON object with:",
        'response: string',
        'follow_up_suggestions: array of 3 short strings',
        "Focus areas you can discuss: MVP prioritization, Path A vs Path B cost trade-offs, tech stack suitability, roadmap, risks, refinements, and budget optimization.",
    ]

    if history_lines:
        prompt_sections.append("Conversation history:\n" + "\n".join(history_lines))

    prompt_sections.append(f"Latest user question: {user_question}")

    original_proxy = _without_broken_proxy()
    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="\n\n".join(prompt_sections),
            config={
                "system_instruction": "You are a focused product strategist. Respond ONLY with a valid JSON object. No markdown. No backticks. No explanation outside the JSON.",
                "temperature": 0.7,
            },
        )
        parsed = _extract_json_object(response.text or "")
        suggestions = parsed.get("follow_up_suggestions") or []
        return {
            "response": str(parsed.get("response", "")).strip(),
            "follow_up_suggestions": [
                str(item).strip() for item in suggestions if str(item).strip()
            ][:3],
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini chat failed: {exc}",
        ) from exc
    finally:
        _restore_proxy(original_proxy)


def generate_cost_analysis(
    *,
    idea_hook: str,
    idea_features: list[str],
    idea_tools: list[str],
    current_setup_cost: float,
    current_monthly_cost: float,
    niche: str,
    platform: str,
    budget: int,
    path_type: str,
) -> dict[str, Any]:
    prompt = f"""
You are a cost estimation expert for software development. Analyze the following app idea and provide a detailed, realistic cost breakdown.

Idea: "{idea_hook}"
Features: {idea_features}
Tools: {idea_tools}
Platform: {platform}
Niche: {niche}
Budget constraint: ${budget}
Implementation path: {path_type}
Current Estimate: ${current_setup_cost} setup, ${current_monthly_cost}/month

Provide a detailed cost breakdown with:
1. Specific cost components (don't use generic categories)
2. Realistic pricing based on current market rates
3. Clear justification for each cost
4. Distinction between one-time and recurring costs
5. Cost optimization opportunities
6. Risk assessment for cost estimates

Return carefully formatted JSON EXACTLY matching this structure:
{{
  "breakdown": [
    {{
      "category": "Development",
      "item": "Senior Developer",
      "amount": 8500,
      "cost_type": "one-time",
      "justification": "3 developers x 4 weeks x $850/day",
      "optimization_potential": "Use offshore dev team to save 30%"
    }}
  ],
  "total_one_time": 8500,
  "total_monthly": 120,
  "cost_ranges": {{
    "Conservative": {{"setup": 6000, "monthly": 80}},
    "Balanced": {{"setup": 8500, "monthly": 120}},
    "Aggressive": {{"setup": 12000, "monthly": 200}}
  }},
  "optimization_suggestions": [
     "Use no-code tools"
  ],
  "risk_assessment": "Medium risk on hosting",
  "market_comparison": "In line with market average"
}}
"""

    original_proxy = _without_broken_proxy()
    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": "You are a cost estimation expert. Respond ONLY with a valid JSON object. No markdown. No backticks. No explanation outside the JSON.",
                "temperature": 0.5,
            },
        )
        parsed = _extract_json_object(response.text or "")
        return parsed
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini cost analysis failed: {exc}",
        ) from exc
    finally:
        _restore_proxy(original_proxy)


def generate_cost_builder(
    *,
    idea_hook: str,
    idea_features: list[str],
    idea_tools: list[str],
    niche: str,
    platform: str,
) -> dict[str, Any]:
    prompt = f"""
You are a software cost architect. Generate an interactive cost model (feature toggles) for the following app:

Idea: "{idea_hook}"
Features: {idea_features}
Tools: {idea_tools}
Platform: {platform}
Niche: {niche}

Generate 8-12 relevant, independent feature toggles the user can add to the MVP.
Group them logically by category ("Core Requirements", "Enhanced Features", "Advanced Features", "Scaling").
Provide realistic setup block costs and monthly costs for each. Make sure ID is unique and camelCase.

Return JSON EXACTLY matching this structure:
{{
  "toggles": [
    {{
      "id": "teamCollab",
      "name": "Team Collaboration",
      "category": "Enhanced Features",
      "cost_setup": 0,
      "cost_monthly": 75,
      "justification": "Adds real-time sockets and collaborative editing"
    }}
  ]
}}
"""

    original_proxy = _without_broken_proxy()
    try:
        client = _get_client()
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": "You are a cost architectural expert. Respond ONLY with a valid JSON object. No markdown. No backticks. No explanation outside the JSON.",
                "temperature": 0.6,
            },
        )
        parsed = _extract_json_object(response.text or "")
        return parsed
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Gemini cost builder failed: {exc}",
        ) from exc
    finally:
        _restore_proxy(original_proxy)
