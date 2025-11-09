import os, json
from typing import Dict, Any
import httpx
from dotenv import load_dotenv, find_dotenv

# Load .env ONCE, correctly
load_dotenv(find_dotenv(), override=True)


class LLMClient:
    def __init__(self):
        self.provider = (os.getenv("PROVIDER") or "").strip().lower()
        self.api_base = (
            os.getenv("API_BASE") or "https://api.groq.com/openai/v1"
        ).rstrip("/")
        self.api_key = os.getenv("API_KEY") or ""

        # ✅ DEFAULT to supported Groq model
        self.model = os.getenv("MODEL") or "llama-3.3-70b-versatile"

    @property
    def mock(self) -> bool:
        """If no API key, run in mock mode so frontend still works."""
        return not (self.provider and self.api_key)

    async def generate_json(
        self, system: str, user_payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Sends the prompt to the LLM and guarantees a JSON response.
        """
        # ✅ MOCK MODE — no API calls burned
        if self.mock:
            scenario = (user_payload.get("scenario") or "").lower()
            return {
                "product_strategy_ideation": {
                    "problem_summary": "Users struggle with [problem] which impacts [outcome]. This creates [pain point] for [target users].",
                    "opportunity_analysis": "Market research shows [opportunity]. Users need [need]. This aligns with [strategic value].",
                    "strategic_framing": "This initiative supports [business goal] by [how]. It aligns with product strategy to [objective]."
                },
                "requirements_development": {
                    "user_stories": [
                        {
                            "story": "As a target user, I want to accomplish the main feature goal so that I can solve my problem",
                            "acceptance_criteria": [
                                "User can complete primary action",
                                "Feature works as expected",
                                "Performance meets requirements"
                            ]
                        },
                        {
                            "story": "As a user, I want to easily understand the feature so that I can use it effectively",
                            "acceptance_criteria": [
                                "Onboarding flow is clear",
                                "Help documentation is accessible",
                                "UI is intuitive"
                            ]
                        }
                    ],
                    "feature_list": [
                        {
                            "name": "Core Feature",
                            "description": "Main functionality that solves the core problem",
                            "priority": "high"
                        },
                        {
                            "name": "User Onboarding",
                            "description": "Guide users through feature setup and usage",
                            "priority": "medium"
                        },
                        {
                            "name": "Analytics & Tracking",
                            "description": "Track usage and measure success metrics",
                            "priority": "medium"
                        }
                    ],
                    "task_breakdown": [
                        {
                            "task": "Design core feature flow",
                            "description": "Create wireframes and user flow diagrams",
                            "estimated_effort": "medium"
                        },
                        {
                            "task": "Build core functionality",
                            "description": "Implement main feature logic",
                            "estimated_effort": "high"
                        },
                        {
                            "task": "Create onboarding flow",
                            "description": "Build user onboarding experience",
                            "estimated_effort": "medium"
                        },
                        {
                            "task": "Set up analytics",
                            "description": "Implement tracking and measurement",
                            "estimated_effort": "low"
                        }
                    ]
                },
                "customer_market_research": {
                    "competitor_analysis": [
                        {
                            "competitor": "Competitor A",
                            "strengths": "Strong market presence and user base",
                            "weaknesses": "Complex interface, limited customization",
                            "opportunity": "We can differentiate with simpler UX and better customization"
                        },
                        {
                            "competitor": "Competitor B",
                            "strengths": "Innovative features and modern design",
                            "weaknesses": "Higher cost, steeper learning curve",
                            "opportunity": "We can offer better value and easier adoption"
                        }
                    ],
                    "gaps_insights": [
                        "Market gap: Existing solutions lack [specific feature/benefit]",
                        "User insight: Users want [specific need] but current solutions don't address it",
                        "Opportunity: There's demand for [specific solution] in [target market]"
                    ],
                    "feasibility_constraints": [
                        "Timeline constraint: Must launch within [timeline]",
                        "Resource constraint: Limited team size affects development capacity",
                        "Technical constraint: Integration requirements may impact timeline"
                    ]
                },
                "prototype_testing_plan": {
                    "what_to_prototype_first": "Start with core feature flow - the main user journey that solves the primary problem. This allows us to validate the core value proposition before building supporting features.",
                    "quick_validation_tests": [
                        {
                            "test": "User Interview",
                            "purpose": "Validate problem understanding and user needs",
                            "success_criteria": "80% of users confirm the problem is real and important"
                        },
                        {
                            "test": "Clickable Prototype",
                            "purpose": "Test user flow and usability",
                            "success_criteria": "70% of users can complete the flow without guidance"
                        },
                        {
                            "test": "Landing Page Test",
                            "purpose": "Validate messaging and interest",
                            "success_criteria": "5% conversion rate from visitors to sign-ups"
                        }
                    ],
                    "first_round_user_testing": {
                        "approach": "Conduct 1-on-1 user interviews with clickable prototype",
                        "participants": "10 target users who match the persona",
                        "key_questions": [
                            "Does this solve your problem?",
                            "Is this easy to use?",
                            "What would prevent you from using this?",
                            "What's missing?"
                        ],
                        "success_criteria": "80% of users rate it 4+ out of 5 and would use it"
                    }
                },
                "goto_execution": {
                    "persona": {
                        "name": "Primary User",
                        "description": "Target user who faces the core problem",
                        "pain_points": [
                            "Current solutions are too complex",
                            "Lack of time to learn new tools",
                            "Need for better efficiency"
                        ],
                        "goals": [
                            "Solve the core problem quickly",
                            "Improve productivity",
                            "Achieve desired outcome"
                        ]
                    },
                    "messaging_positioning": {
                        "value_proposition": "[Clear benefit] for [target users] - [how we solve it]",
                        "key_messages": [
                            "Solve [problem] in [time/way]",
                            "Built for [target users] who need [benefit]",
                            "Simple, effective, and [differentiator]"
                        ],
                        "positioning": "Position as [category] that [differentiator] for [target market]"
                    },
                    "mini_launch_plan": {
                        "phases": [
                            {
                                "phase": "Beta Launch",
                                "description": "Launch to 100 beta users for initial feedback",
                                "timeline": "Week 1-2"
                            },
                            {
                                "phase": "Iterate",
                                "description": "Collect feedback and make improvements",
                                "timeline": "Week 3-4"
                            },
                            {
                                "phase": "Public Launch",
                                "description": "Launch to all users with marketing campaign",
                                "timeline": "Week 5+"
                            }
                        ],
                        "channels": [
                            "Product blog",
                            "Email newsletter",
                            "Social media",
                            "In-app notifications"
                        ],
                        "success_metrics": [
                            "User sign-ups",
                            "Feature adoption rate",
                            "User satisfaction score"
                        ]
                    },
                    "success_measurements": [
                        {
                            "metric": "Feature Adoption",
                            "target": "40% of active users in first 30 days",
                            "measurement_method": "Analytics dashboard tracking feature usage"
                        },
                        {
                            "metric": "User Satisfaction",
                            "target": "4.5/5 rating",
                            "measurement_method": "In-app survey after feature use"
                        },
                        {
                            "metric": "Problem Resolution",
                            "target": "80% of users report problem solved",
                            "measurement_method": "Follow-up survey 2 weeks after adoption"
                        }
                    ]
                },
                "feature_impact_scores": [
                    {
                        "feature_name": "Core Feature",
                        "impact_score": 85,
                        "reasoning": "High user value as it solves the core problem. Strong business impact through user satisfaction and retention. Feasible with available resources. Low risk due to clear user need validation."
                    },
                    {
                        "feature_name": "User Onboarding",
                        "impact_score": 72,
                        "reasoning": "Important for user adoption but secondary to core functionality. Good business impact through reduced support burden. Feasible with moderate effort. Moderate risk if not done well."
                    },
                    {
                        "feature_name": "Analytics & Tracking",
                        "impact_score": 65,
                        "reasoning": "Necessary for measurement and iteration but doesn't directly solve user problem. Moderate business impact through data-driven decisions. Low effort to implement. Low risk."
                    }
                ]
            }

        # ✅ REAL GROQ MODE
        if self.provider == "groq":
            url = f"{self.api_base}/chat/completions"
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            body = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": json.dumps(user_payload)},
                ],
                "temperature": 0.15,
                "response_format": {"type": "json_object"},
            }

            async with httpx.AsyncClient(timeout=60) as client:
                resp = await client.post(url, headers=headers, json=body)

                # If Groq gives an error, surface it clearly
                if resp.status_code >= 400:
                    raise RuntimeError(
                        f"GROQ ERROR [{resp.status_code}] — model={self.model}\n{resp.text}"
                    )

                content = resp.json()["choices"][0]["message"]["content"]

            # ✅ Parse guaranteed JSON
            try:
                return json.loads(content)
            except:
                # Repair malformed JSON from model (rare)
                start, end = content.find("{"), content.rfind("}")
                if start != -1 and end != -1:
                    return json.loads(content[start : end + 1])
                raise RuntimeError(f"LLM returned invalid JSON:\n{content}")

        raise RuntimeError(f"Provider not supported: {self.provider}")
