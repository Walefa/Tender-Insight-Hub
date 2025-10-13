from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.crud.user import get_user_by_email, create_user, create_team
from app.schemas.schemas import UserCreate, Token, User
from pydantic import BaseModel
from app.api.dependencies import get_current_user
from sqlalchemy.future import select
from app.models.sql_models import Team
from sqlalchemy.exc import IntegrityError

class RegistrationRequest(BaseModel):
    user_data: UserCreate
    team_name: str
router = APIRouter()

@router.post("/register", response_model=User)
async def register(
    registration: RegistrationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user and create a team"""
    user_data = registration.user_data
    team_name = (registration.team_name or "").strip()
    # Check if user already exists
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Check if team name already exists to avoid 500 on unique constraint
    existing_team_q = await db.execute(select(Team).where(Team.name == team_name))
    existing_team = existing_team_q.scalar_one_or_none()
    if existing_team:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team name already taken"
        )
    # Create team
    try:
        team = await create_team(db, team_name)
    except IntegrityError:
        # Graceful fallback if a race condition happened and the name was taken just now
        await db.rollback()
        raise HTTPException(status_code=400, detail="Team name already taken")
    # Create user
    user = await create_user(db, user_data, team.id)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login user and return access token"""
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user(
    current_user: User = Depends(get_current_user),
):
    """Retrieve the currently authenticated user's details."""
    return current_user