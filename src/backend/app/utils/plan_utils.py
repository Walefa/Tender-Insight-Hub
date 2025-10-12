# SaaS plan utility for Tender Insight Hub
from fastapi import HTTPException, status
from app.models.sql_models import Team

def require_plan(team: Team, allowed_plans: list[str]):
    """Raise HTTP 403 if the team's plan is not in allowed_plans."""
    if team.plan not in allowed_plans:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Your current plan ('{team.plan}') does not allow this action. Upgrade required."
        )
