from fastapi import APIRouter, Depends, HTTPException, Query, Body
from typing import List, Optional
import httpx
from datetime import datetime
from typing import Optional, Dict, Any
from app.schemas.schemas import TenderSearchRequest, TenderSummary, ReadinessCheckRequest, ReadinessResult
from app.services.ocds_service import OCDSService
from app.services.ai_service import AIService
from app.services.scoring_service import ScoringService
from app.api.dependencies import get_current_user, get_current_active_user
from app.models.sql_models import User, Team
import httpx
import logging
from httpx import TimeoutException

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

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.get(base_url, params=params)
        response.raise_for_status()
        data = response.json()

    # The eTenders API returns a list of releases in 'releases' key
    releases = data.get("releases", [])
    filtered = []

    for tender in releases:
        tender_data = tender.get("tender", {})
        title = tender_data.get("title", "") or ""
        description = tender.get("description", "") or ""
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
    current_user: User = Depends(get_current_active_user)
):
    """Check company readiness for a tender. Only for basic/pro plans."""
    from app.utils.plan_utils import require_plan
    require_plan(current_user.team, ["basic", "pro"])
    # Get tender requirements
    tender_data = await ocds_service.get_tender_details(request.tender_id)
    if not tender_data:
        raise HTTPException(status_code=404, detail="Tender not found")
    # Get company profile
    company_profile = current_user.team.company_profile
    if not company_profile:
        raise HTTPException(status_code=404, detail="Company profile not found")
    # Extract requirements from tender
    document_text = await ocds_service.extract_document_text(tender_data)
    tender_requirements = await ai_service.extract_key_info(document_text)
    # Calculate score
    result = scoring_service.calculate_readiness_score(
        tender_requirements, 
        company_profile
    )
    return ReadinessResult(**result)