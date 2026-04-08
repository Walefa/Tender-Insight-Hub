from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import create_access_token, verify_password
from app.crud.user import get_user_by_email, create_user, create_team
from app.schemas.schemas import UserCreate, Token, User
from pydantic import BaseModel, ValidationError
from app.api.dependencies import get_current_user
from sqlalchemy.future import select
from app.models.sql_models import Team
from sqlalchemy.exc import IntegrityError
from app.utils.sanitizer import InputSanitizer, InputValidator, SanitizationError
import logging

logger = logging.getLogger(__name__)

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
    try:
        user_data = registration.user_data
        team_name = registration.team_name
        
        # Sanitize and validate inputs
        try:
            sanitized_email = InputSanitizer.sanitize_email(user_data.email)
            if not InputValidator.validate_email(sanitized_email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid email format"
                )
            
            sanitized_full_name = InputSanitizer.sanitize_string(user_data.full_name, max_length=100)
            if not InputValidator.validate_full_name(sanitized_full_name):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid full name format"
                )
            
            if not InputValidator.validate_password(user_data.password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Password does not meet security requirements"
                )
            
            sanitized_team_name = InputSanitizer.sanitize_string(team_name, max_length=100).strip()
            if not InputValidator.validate_team_name(sanitized_team_name):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid team name format"
                )
        except SanitizationError as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e)
            )
        
        # Check if user already exists
        existing_user = await get_user_by_email(db, sanitized_email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Check if team name already exists
        existing_team_q = await db.execute(select(Team).where(Team.name == sanitized_team_name))
        existing_team = existing_team_q.scalar_one_or_none()
        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name already taken"
            )
        
        # Create team
        try:
            team = await create_team(db, sanitized_team_name)
        except IntegrityError:
            await db.rollback()
            raise HTTPException(status_code=400, detail="Team name already taken")
        
        # Create user with sanitized data
        user_create = UserCreate(
            email=sanitized_email,
            full_name=sanitized_full_name,
            password=user_data.password
        )
        user = await create_user(db, user_create, team.id)
        return user
        
    except ValidationError as e:
        logger.warning(f"Validation error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid input data"
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login user and return access token"""
    try:
        # Sanitize email input
        sanitized_email = InputSanitizer.sanitize_email(form_data.username)
        
        user = await get_user_by_email(db, sanitized_email)
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred"
        )

@router.get("/me", response_model=User)
async def get_current_user(
    current_user: User = Depends(get_current_user),
):
    """Retrieve the currently authenticated user's details."""
    return current_user