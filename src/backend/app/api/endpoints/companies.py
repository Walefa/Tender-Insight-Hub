# Company Profile Endpoints for Tender Insight Hub

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sql_models import CompanyProfile, Team, User
from app.schemas.schemas import CompanyProfileCreate, CompanyProfileUpdate, CompanyProfile as CompanyProfileSchema
from app.api.dependencies import get_current_active_user
from typing import List
from app.utils.plan_utils import require_plan

router = APIRouter()

@router.post("/company-profile", response_model=CompanyProfileSchema, status_code=201)
async def create_company_profile(
	profile: CompanyProfileCreate,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Create a company profile for the current user's team. Only for basic/pro plans."""
	from sqlalchemy.orm import selectinload
	from sqlalchemy.future import select
	# Eagerly load the team relationship
	result = await db.execute(
		select(User)
		.options(
			selectinload(User.team).selectinload(Team.company_profile)
		)
		.where(User.id == current_user.id)
	)
	user_with_team = result.scalar_one()
	team = user_with_team.team
	require_plan(team, ["basic", "pro"])
	if team.company_profile:
		raise HTTPException(status_code=400, detail="Company profile already exists for this team.")
	db_profile = CompanyProfile(
		**profile.dict(),
		team_id=team.id
	)
	db.add(db_profile)
	await db.commit()
	await db.refresh(db_profile)
	return db_profile

@router.get("/company-profile", response_model=CompanyProfileSchema)
async def get_company_profile(
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Get the company profile for the current user's team."""
	from sqlalchemy.orm import selectinload
	from sqlalchemy.future import select
	result = await db.execute(
		select(User)
		.options(
			selectinload(User.team).selectinload(Team.company_profile)
		)
		.where(User.id == current_user.id)
	)
	user_with_team = result.scalar_one()
	team = user_with_team.team
	if not team.company_profile:
		raise HTTPException(status_code=404, detail="Company profile not found.")
	return team.company_profile

@router.put("/company-profile", response_model=CompanyProfileSchema)
async def update_company_profile(
	profile_update: CompanyProfileUpdate,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Update the company profile for the current user's team. Only for basic/pro plans."""
	from sqlalchemy.orm import selectinload
	from sqlalchemy.future import select
	result = await db.execute(
		select(User)
		.options(
			selectinload(User.team).selectinload(Team.company_profile)
		)
		.where(User.id == current_user.id)
	)
	user_with_team = result.scalar_one()
	team = user_with_team.team
	require_plan(team, ["basic", "pro"])
	db_profile = team.company_profile
	if not db_profile:
		raise HTTPException(status_code=404, detail="Company profile not found.")
	for field, value in profile_update.dict(exclude_unset=True).items():
		setattr(db_profile, field, value)
	await db.commit()
	await db.refresh(db_profile)
	return db_profile
