from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.sql_models import User, Team
from app.schemas.schemas import UserCreate
from app.core.security import get_password_hash

async def get_user_by_email(db: AsyncSession, email: str):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.team).selectinload(Team.members),
            selectinload(User.team).selectinload(Team.workspace_items)
        )
        .where(User.email == email)
    )
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, user: UserCreate, team_id: int = None):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        team_id=team_id
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def create_team(db: AsyncSession, name: str, plan: str = "free"):
    db_team = Team(name=name, plan=plan)
    db.add(db_team)
    await db.commit()
    await db.refresh(db_team)
    return db_team