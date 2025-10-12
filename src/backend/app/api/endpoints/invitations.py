import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from app.core.database import get_db
from app.models.invitation import Invitation
from app.models.sql_models import Team, User
from app.schemas.invitation import Invitation as InvitationSchema, InvitationCreate, InvitationAccept
from app.schemas.schemas import User as UserSchema
from app.crud.user import get_user_by_email, create_user
from app.api.dependencies import get_current_active_user
from app.utils.email_utils import send_invitation_email

router = APIRouter()

@router.post("/team/invitations", response_model=InvitationSchema, status_code=201)
async def create_invitation(
    invitation: InvitationCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Invite a user to the current user's team by email."""
    team = current_user.team
    # Prevent duplicate/inactive invitations
    result = await db.execute(select(Invitation).where(Invitation.email == invitation.email, Invitation.team_id == team.id, Invitation.status == "pending"))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="An active invitation already exists for this email.")
    # Prevent inviting existing users
    if await get_user_by_email(db, invitation.email):
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    token = secrets.token_urlsafe(32)
    db_invite = Invitation(email=invitation.email, team_id=team.id, token=token)
    db.add(db_invite)
    await db.commit()
    await db.refresh(db_invite)
    # Send invitation email (non-blocking, fire-and-forget)
    try:
        await send_invitation_email(invitation.email, token)
    except Exception as e:
        print(f"Warning: Invitation email failed to send: {e}")
    return db_invite

# List all invitations for the current user's team
from typing import List

@router.get("/team/invitations", response_model=List[InvitationSchema])
async def list_invitations(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    team = current_user.team
    result = await db.execute(select(Invitation).where(Invitation.team_id == team.id))
    return result.scalars().all()

@router.post("/team/invitations/accept", response_model=UserSchema)
async def accept_invitation(
    data: InvitationAccept,
    db: AsyncSession = Depends(get_db)
):
    """Accept an invitation and create a user account."""
    result = await db.execute(select(Invitation).where(Invitation.token == data.token, Invitation.status == "pending"))
    invite = result.scalar_one_or_none()
    if not invite or invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invitation is invalid or expired.")
    # Prevent duplicate users
    if await get_user_by_email(db, invite.email):
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    # Create user and associate with team
    user_in = UserSchema(email=invite.email, full_name=data.full_name, password=data.password)
    user = await create_user(db, user_in, invite.team_id)
    invite.status = "accepted"
    await db.commit()
    return user

@router.delete("/team/invitations/{invitation_id}", status_code=204)
async def revoke_invitation(
    invitation_id: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Revoke a pending invitation for your team."""
    invite = await db.get(Invitation, invitation_id)
    if not invite or invite.team_id != current_user.team.id:
        raise HTTPException(status_code=404, detail="Invitation not found.")
    if invite.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending invitations can be revoked.")
    invite.status = "revoked"
    await db.commit()
    return None
