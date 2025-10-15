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

router = APIRouter()

@router.get("/workspace", response_model=List[WorkspaceItemSchema])
async def list_workspace_items(
	current_user: User = Depends(get_current_active_user)
):
	"""List all workspace items for the current user's team."""
	team = current_user.team
	items = sorted(team.workspace_items, key=lambda x: (-(x.suitability_score or 0), x.status))
	return items

# Add new workspace item
@router.post("/workspace", response_model=WorkspaceItemSchema, status_code=201)
async def add_workspace_item(
	item: WorkspaceItemCreate,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
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

@router.put("/workspace/{item_id}", response_model=WorkspaceItemSchema)
async def update_workspace_item(
	item_id: int,
	update: WorkspaceItemUpdate,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Update status or notes for a workspace item. Only for basic/pro plans."""
	team = current_user.team
	require_plan(team, ["basic", "pro"])
	# Fetch using the current session to avoid stale relationship state
	result = await db.execute(
		select(WorkspaceItem).where(WorkspaceItem.id == item_id, WorkspaceItem.team_id == team.id)
	)
	item = result.scalar_one_or_none()
	if not item:
		raise HTTPException(status_code=404, detail="Workspace item not found.")
	for field, value in update.dict(exclude_unset=True).items():
		setattr(item, field, value)
	item.last_updated_by = current_user.id
	await db.commit()
	await db.refresh(item)
	return item

@router.delete("/workspace/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workspace_item(
	item_id: int,
	current_user: User = Depends(get_current_active_user),
	db: AsyncSession = Depends(get_db)
):
	"""Remove a workspace item belonging to the current user's team."""
	team = current_user.team
	
	result = await db.execute(
		select(WorkspaceItem).where(WorkspaceItem.id == item_id, WorkspaceItem.team_id == team.id)
	)
	item = result.scalar_one_or_none()
	if not item:
		raise HTTPException(status_code=404, detail="Workspace item not found.")
	await db.delete(item)
	await db.commit()
	return
