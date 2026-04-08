# Workspace Endpoints for Tender Insight Hub
from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.plan_utils import require_plan
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.sql_models import WorkspaceItem, User, Team
from app.schemas.schemas import WorkspaceItem as WorkspaceItemSchema, WorkspaceItemUpdate, WorkspaceItemCreate
from app.api.dependencies import get_current_active_user
from typing import List
from sqlalchemy import select
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/workspace", response_model=List[WorkspaceItemSchema])
async def list_workspace_items(
	current_user: User = Depends(get_current_active_user)
):
	"""List all workspace items for the current user's team."""
	try:
		team = current_user.team
		items = sorted(team.workspace_items, key=lambda x: (-(x.suitability_score or 0), x.status))
		return items
	except Exception as e:
		logger.error(f"Error listing workspace items: {e}")
		raise HTTPException(status_code=500, detail="An unexpected error occurred")

# Add new workspace item
@router.post("/workspace", response_model=WorkspaceItemSchema, status_code=201)
async def add_workspace_item(
	item: WorkspaceItemCreate,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Add a new workspace item"""
	try:
		team = current_user.team
		db_item = WorkspaceItem(
			tender_id=item.tender_id,
			status=item.status,
			notes=item.notes,
			team_id=team.id,
			last_updated_by=current_user.id
		)
		db.add(db_item)
		await db.commit()
		await db.refresh(db_item)
		return db_item
	except ValidationError as e:
		logger.warning(f"Validation error in add_workspace_item: {e}")
		raise HTTPException(status_code=400, detail="Invalid workspace item data")
	except Exception as e:
		logger.error(f"Error adding workspace item: {e}")
		await db.rollback()
		raise HTTPException(status_code=500, detail="An unexpected error occurred")

@router.put("/workspace/{item_id}", response_model=WorkspaceItemSchema)
async def update_workspace_item(
	item_id: int,
	update: WorkspaceItemUpdate,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Update status or notes for a workspace item. Only for basic/pro plans."""
	try:
		team = current_user.team
		require_plan(team, ["basic", "pro"])
		
		# Fetch using the current session
		result = await db.execute(
			select(WorkspaceItem).where(WorkspaceItem.id == item_id, WorkspaceItem.team_id == team.id)
		)
		item = result.scalar_one_or_none()
		if not item:
			raise HTTPException(status_code=404, detail="Workspace item not found.")
		
		for field, value in update.dict(exclude_unset=True).items():
			if value is not None:
				setattr(item, field, value)
		
		item.last_updated_by = current_user.id
		await db.commit()
		await db.refresh(item)
		return item
	except ValidationError as e:
		logger.warning(f"Validation error in update_workspace_item: {e}")
		raise HTTPException(status_code=400, detail="Invalid workspace item data")
	except HTTPException:
		raise
	except Exception as e:
		logger.error(f"Error updating workspace item: {e}")
		await db.rollback()
		raise HTTPException(status_code=500, detail="An unexpected error occurred")

@router.delete("/workspace/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace_item(
	item_id: int,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Remove a workspace item belonging to the current user's team."""
	try:
		team = current_user.team
		
		result = await db.execute(
			select(WorkspaceItem).where(WorkspaceItem.id == item_id, WorkspaceItem.team_id == team.id)
		)
		item = result.scalar_one_or_none()
		if not item:
			raise HTTPException(status_code=404, detail="Workspace item not found.")
		
		await db.delete(item)
		await db.commit()
		return None
	except HTTPException:
		raise
	except Exception as e:
		logger.error(f"Error deleting workspace item: {e}")
		await db.rollback()
		raise HTTPException(status_code=500, detail="An unexpected error occurred")
