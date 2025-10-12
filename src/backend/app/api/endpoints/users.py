

from fastapi import APIRouter, Depends, HTTPException, Body, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sql_models import User, Team
from app.schemas.schemas import User as UserSchema, UserCreate, UserUpdate
from app.api.dependencies import get_current_active_user
from typing import List
from pydantic import BaseModel
from app.utils.email_utils import send_invitation_email
import secrets

router = APIRouter()

@router.get("/accept-invite")
async def accept_invite(token: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    from app.models.invitation import Invitation
    result = await db.execute(select(Invitation).where(Invitation.token == token))
    invitation = result.scalar_one_or_none()
    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    if invitation.status != "pending":
        raise HTTPException(status_code=400, detail=f"Invitation already {invitation.status}.")
    from datetime import datetime
    if invitation.expires_at < datetime.utcnow():
        invitation.status = "expired"
        await db.commit()
        raise HTTPException(status_code=400, detail="Invitation expired.")
    # Mark as accepted
    invitation.status = "accepted"
    await db.commit()
    return {"message": "Invitation accepted. You can now join the team.", "team_id": invitation.team_id}

class TeamInviteResponse(BaseModel):
    message: str

class InviteMemberRequest(BaseModel):
    email: str

@router.post("/team/invite", status_code=201)
async def invite_team_member(
    request: InviteMemberRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Invite a new member to the team by email. Admin only.
    Sends an email with a unique invite link.
    """
    # Eagerly load team relationship
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    result = await db.execute(
        select(User).options(selectinload(User.team)).where(User.id == current_user.id)
    )
    user_with_team = result.scalar_one()
    team = user_with_team.team
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    # Check if user already exists
    from app.crud.user import get_user_by_email
    existing = await get_user_by_email(db, request.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists.")
    # Generate token and create invitation
    token = secrets.token_urlsafe(32)
    from app.models.invitation import Invitation
    db_invite = Invitation(email=request.email, team_id=team.id, token=token)
    db.add(db_invite)
    await db.commit()
    await db.refresh(db_invite)
    # Send invitation email
    invite_link = f"https://your-backend.com/accept-invite?token={token}"
    await send_invitation_email(request.email, token)
    return {"message": f"Invitation sent to {request.email}", "invite_link": invite_link}
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sql_models import User, Team
from app.schemas.schemas import User as UserSchema, UserCreate, UserUpdate
from app.api.dependencies import get_current_active_user
from typing import List
from pydantic import BaseModel

router = APIRouter()


class PlanUpgradeRequest(BaseModel):
    new_plan: str

class PlanUpgradeResponse(BaseModel):
    message: str
    plan: str

@router.put("/team/plan", response_model=PlanUpgradeResponse, status_code=200)
async def upgrade_team_plan(
    request: PlanUpgradeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upgrade the current user's team plan.
    Only authenticated users can upgrade their team's plan.
    Allowed values for new_plan: "free", "basic", "pro".
    """
    allowed_plans = ["free", "basic", "pro"]
    if request.new_plan not in allowed_plans:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {request.new_plan}")
    # Load user's team
    from sqlalchemy.orm import selectinload
    from sqlalchemy.future import select
    result = await db.execute(
        select(User).options(selectinload(User.team)).where(User.id == current_user.id)
    )
    user_with_team = result.scalar_one()
    team = user_with_team.team
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    # Update plan
    team.plan = request.new_plan
    await db.commit()
    await db.refresh(team)
    return PlanUpgradeResponse(message=f"Team plan upgraded to {request.new_plan}", plan=team.plan)
@router.get("/team/members", response_model=List[UserSchema])
async def list_team_members(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List all members of the current user's team.
    """
    team = current_user.team
    if not team:
        raise HTTPException(status_code=404, detail="Team not found.")
    return team.members
# Add missing import for APIRouter
from fastapi import APIRouter, Depends, HTTPException, status
