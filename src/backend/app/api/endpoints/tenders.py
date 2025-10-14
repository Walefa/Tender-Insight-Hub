import os
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional
import httpx
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path
import json
from app.schemas.schemas import (
    TenderSearchRequest,
    TenderSummary,
    ReadinessCheckRequest,
    ReadinessResult,
    CompanyProfile as CompanyProfileSchema,
)
from app.services.ocds_service import OCDSService
from app.services.ai_service import AIService
from app.services.scoring_service import ScoringService
from app.api.dependencies import get_current_user, get_current_active_user
from app.models.sql_models import User, Team, WorkspaceItem
from app.core.database import get_db
import httpx
import logging
from httpx import TimeoutException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tenders")

router = APIRouter()
@router.get("/tenders/search", response_model=List[dict], summary="Search tenders by keyword and province")
async def search_tenders_by_keyword(
    keyword: Optional[str] = Query(None, description="Keyword to search in tender title or description"),
    province: Optional[str] = Query(None, description="Province to filter tenders by province (case-insensitive)"),
    page: int = Query(1, ge=1, description="Page number for pagination (default 1)"),
    page_size: int = Query(50, ge=1, le=100, description="Number of tenders per page (max 100)"),
    date_from: Optional[str] = Query(None, description="Start date in YYYY-MM-DD format (optional)"),
    date_to: Optional[str] = Query(None, description="End date in YYYY-MM-DD format (optional)")
):
    """
    Search tenders by keyword and filter by province. This endpoint fetches tenders from the eTenders API and filters them locally.
    """
    base_url = "https://ocds-api.etenders.gov.za/api/OCDSReleases"
    params = {
        "PageNumber": page,
        "PageSize": page_size,
    }

    # Set default dateFrom (start of current year) and dateTo (today) if not provided
    today = datetime.now().strftime("%Y-%m-%d")
    if not date_from:
        date_from = f"{datetime.now().year}-01-01"
    if not date_to:
        date_to = today
    params["dateFrom"] = date_from
    params["dateTo"] = date_to

    used_offline = False
    try:
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.get(base_url, params=params)
            response.raise_for_status()
            data = response.json()
    except (httpx.ConnectError, httpx.HTTPError, TimeoutException) as e:
        # Try offline sample fallback
        logger.warning(f"eTenders API unavailable or failed: {e}. Falling back to offline sample.")
        try:
            sample_path = Path(__file__).resolve().parents[3] / "app" / "services" / "offline_data" / "sample_releases.json"
            if sample_path.exists():
                with sample_path.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                used_offline = True
            else:
                logger.warning("Offline sample not found at %s", sample_path)
                return []
        except Exception as offline_exc:
            logger.error(f"Failed to load offline sample: {offline_exc}")
            return []
    except Exception as e:
        logger.error(f"Unexpected error calling eTenders API: {e}")
        return []

    # The eTenders API returns a list of releases in 'releases' key
    releases = data.get("releases", [])
    if used_offline:
        # Annotate releases to signal frontend that these are sample records
        for rel in releases:
            rel["_offline"] = True
    filtered = []

    for tender in releases:
        tender_data = tender.get("tender", {})
        title = tender_data.get("title", "") or ""
        # Prefer nested tender.description if present, fall back to top-level
        description = tender_data.get("description", "") or tender.get("description", "") or ""
        tender_province = tender_data.get("province", "") or ""
        main_category = tender_data.get("mainProcurementCategory", "") or ""
        addl_categories = tender_data.get("additionalProcurementCategories", []) or []

        # Normalize fields for flexible matching
        title_norm = title.strip().lower()
        description_norm = description.strip().lower()
        province_norm = tender_province.strip().lower()
        main_category_norm = main_category.strip().lower()
        addl_categories_norm = [str(cat).strip().lower() for cat in addl_categories]

        # Keyword filter (partial, in multiple fields, allow first 3 letters match)
        if keyword:
            keyword_norm = keyword.strip().lower()
            keyword_prefix = keyword_norm[:3] if len(keyword_norm) >= 3 else keyword_norm

            def word_starts_with(text, prefix):
                return any(word.startswith(prefix) for word in text.split())

            found = (
                keyword_norm in title_norm
                or keyword_norm in description_norm
                or keyword_norm in main_category_norm
                or any(keyword_norm in cat for cat in addl_categories_norm)
                or word_starts_with(title_norm, keyword_prefix)
                or word_starts_with(description_norm, keyword_prefix)
                or word_starts_with(main_category_norm, keyword_prefix)
                or any(word_starts_with(cat, keyword_prefix) for cat in addl_categories_norm)
            )
            if not found:
                continue

        # Province filter (partial, ignore if province missing)
        if province:
            province_search = province.strip().lower()
            if not province_norm or province_search not in province_norm:
                continue

        filtered.append(tender)

    return filtered
ocds_service = OCDSService()
ai_service = AIService()
scoring_service = ScoringService()

async def fetch_tenders_from_etender(tender_id: str):
    """Temporary static response for testing."""
    return {
        "ocid": "ocds-9t57fa-123456",
        "tender": {
            "id": tender_id,
            "title": "Static Response",
            "status": "active"
        }
    }

# Only keep the POST /search endpoint with ocid
@router.post("/search", response_model=Dict[str, Any], operation_id="search_tenders_api_search_post_tenders")
async def search_tenders(
    ocid: str = Query(..., description="OCID to fetch tender release"),
):
    """Fetch a single tender release from eTender platform API by OCID."""
    logger.info(f"Received search request for OCID: {ocid}")
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                f"https://ocds-api.etenders.gov.za/api/OCDSReleases/release/{ocid}",
                headers={"Accept": "application/json"}
            )
            response.raise_for_status()
            tender = response.json()
            logger.info("Fetched tender release: %s", tender)
            return {"result": tender}
    except Exception as e:
        logger.error(f"Error fetching tender release from eTenders API: {e}")
        raise HTTPException(status_code=502, detail="Failed to fetch tender release from eTenders API")

@router.get("/tenders/{tender_id}/summary", response_model=TenderSummary)
async def get_tender_summary(
    tender_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get AI summary of tender document. Only for basic/pro plans."""
    from app.utils.plan_utils import require_plan
    require_plan(current_user.team, ["basic", "pro"])
    tender_data = await ocds_service.get_tender_details(tender_id)
    if not tender_data:
        raise HTTPException(status_code=404, detail="Tender not found")
    # Process document and generate summary
    document_text = await ocds_service.extract_document_text(tender_data)
    key_info = await ai_service.extract_key_info(document_text)
    return TenderSummary(
        tender_id=tender_id,
        title=tender_data.get("title", ""),
        **key_info
    )

@router.post("/readiness-check", response_model=ReadinessResult)
async def check_readiness(
    request: ReadinessCheckRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Check company readiness for a tender. Only for basic/pro plans."""
    from app.utils.plan_utils import require_plan
    require_plan(current_user.team, ["basic", "pro"])
    # Debug: Log incoming request and tender_id
    logger.info(f"[readiness-check] Incoming request: {request}")
    logger.info(f"[readiness-check] Fetching tender_id: {request.tender_id}")
    tender_data = await ocds_service.get_tender_details(request.tender_id)
    logger.info(f"[readiness-check] Fetched tender_data: {tender_data}")
    if not tender_data:
        # Try offline fallback
        logger.warning(f"[readiness-check] Online fetch failed for tender_id: {request.tender_id}, trying offline cache...")
        try:
            offline_data = ocds_service._load_offline_release(request.tender_id)
            logger.info(f"[readiness-check] Offline fallback data: {offline_data}")
            if offline_data:
                tender_data = offline_data
        except Exception as e:
            logger.error(f"[readiness-check] Offline fallback error: {e}")
    if not tender_data:
        logger.error(f"[readiness-check] Tender not found for id: {request.tender_id} (online and offline)")
        raise HTTPException(status_code=404, detail="Tender not found (online and offline)")
    # Reload user with company profile to avoid lazy-loading issues
    user_with_profile = await db.execute(
        select(User)
        .options(selectinload(User.team).selectinload(Team.company_profile))
        .where(User.id == current_user.id)
    )
    user_entity = user_with_profile.scalar_one_or_none()
    if not user_entity or not user_entity.team:
        raise HTTPException(status_code=404, detail="Team not found")

    company_profile = user_entity.team.company_profile
    if not company_profile:
        raise HTTPException(status_code=404, detail="Company profile not found")

    if request.company_profile_id and request.company_profile_id != company_profile.id:
        raise HTTPException(status_code=403, detail="Company profile access denied")
    # Convert ORM model into a plain dict so downstream scoring logic can
    # safely inspect structured fields (lists, dicts, etc.).
    company_profile_dict = CompanyProfileSchema.model_validate(company_profile).model_dump()
    # Extract requirements from tender
    document_text = await ocds_service.extract_document_text(tender_data)
    tender_requirements = await ai_service.extract_key_info(document_text)
    # Calculate score
    result = scoring_service.calculate_readiness_score(
        tender_requirements,
        company_profile_dict
    )
    # Persist readiness score to workspace for quick access on dashboard
    try:
        # Try to match existing workspace items by any known identifier form
        candidate_ids = set()
        if request.tender_id:
            candidate_ids.add(str(request.tender_id))
        # Try to infer IDs from tender data
        try:
            t_inner = tender_data.get("tender", {}) if isinstance(tender_data, dict) else {}
            inner_id = t_inner.get("id")
            ocid = tender_data.get("ocid")
            if inner_id:
                candidate_ids.add(str(inner_id))
            if ocid:
                candidate_ids.add(str(ocid))
        except Exception:
            pass

        ws_result = await db.execute(
            select(WorkspaceItem).where(
                WorkspaceItem.team_id == user_entity.team.id,
                WorkspaceItem.tender_id.in_(list(candidate_ids))
            )
        )
        ws_item = ws_result.scalar_one_or_none()
        if ws_item is None:
            # Create it if not present
            ws_item = WorkspaceItem(
                tender_id=(str(request.tender_id) if request.tender_id else (ocid or inner_id or "")),
                team_id=user_entity.team.id,
                status="pending",
                notes="",
                last_updated_by=current_user.id,
                suitability_score=result.get("suitability_score")
            )
            db.add(ws_item)
        else:
            ws_item.suitability_score = result.get("suitability_score")
            ws_item.last_updated_by = current_user.id
        await db.commit()
    except Exception as e:
        logger.warning(f"Could not persist readiness score to workspace: {e}")
    return ReadinessResult(**result)