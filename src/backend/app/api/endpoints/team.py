from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sql_models import Team, User
import logging
from app.schemas.schemas import TeamPlanUpdate
from app.api.dependencies import get_current_active_user

router = APIRouter()

from sqlalchemy.future import select

@router.get("/plan", response_model=dict)
async def get_team_plan(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(select(Team).where(Team.id == current_user.team_id))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"plan": team.plan}

@router.put("/plan", response_model=dict)
async def update_team_plan(update: TeamPlanUpdate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_active_user)):
    result = await db.execute(select(Team).where(Team.id == current_user.team_id))
    team = result.scalar_one_or_none()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    logging.warning(f"Received plan update payload: {update}")
    team.plan = update.new_plan
    await db.commit()
    await db.refresh(team)
    logging.warning(f"Plan successfully updated to: {team.plan}")
    return {"plan": team.plan}
