from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.models.sql_models import User
from app.api.dependencies import get_current_active_user, get_mongo_db
from app.services.document_processor import DocumentProcessor
from app.services.ai_service import AIService
from app.services.scoring_service import ScoringService
from app.schemas.schemas import ReadinessResult, CompanyProfileBase
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter()
document_processor = DocumentProcessor()
ai_service = AIService()
scoring_service = ScoringService()

@router.get("/enriched-releases")
async def get_enriched_releases(
    keywords: str = "",
    province: str = "",
    buyer: str = "",
    db: AsyncIOMotorClient = Depends(get_mongo_db)
):
    """Public endpoint for enriched tender data"""
    # Query MongoDB for tenders
    query = {}
    if keywords:
        query["description"] = {"$regex": keywords, "$options": "i"}
    if province:
        query["province"] = province
    if buyer:
        query["buyer"] = buyer

    tenders = await db["tenders"].find(query).to_list(100)

    # Rank tenders by relevance (example: keyword match count)
    for tender in tenders:
        tender["match_score"] = tender["description"].lower().count(keywords.lower()) if keywords else 0

    # Sort tenders by match score (descending)
    tenders.sort(key=lambda x: -x["match_score"])

    return {"tenders": tenders}

@router.get("/analytics/spend-by-buyer")
async def get_spend_analytics():
    """Public endpoint for analytics data"""
    # This would aggregate data from MongoDB
    return {"analytics": "spend_by_buyer_data"}

@router.post("/summary/extract")
async def extract_summary(file: UploadFile = File(...), current_user: User = Depends(get_current_active_user)):
    """Extract summary from uploaded document. Only for basic/pro plans."""
    from app.utils.plan_utils import require_plan
    team = current_user.team
    require_plan(team, ["basic", "pro"])
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    file_extension = os.path.splitext(file.filename)[1]
    allowed_extensions = ['.pdf', '.docx', '.zip']
    if file_extension.lower() not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    content = await file.read()
    text = await document_processor.process_document(content, file_extension)
    summary = await ai_service.summarize_text(text, max_length=120)
    return {"summary": summary, "original_length": len(text), "summary_length": len(summary)}

@router.post("/readiness-check", operation_id="unique_readiness_check")
async def check_readiness_public(tender_data: dict, company_profile: dict):
    """Public endpoint for readiness check"""
    validated_profile = CompanyProfileBase(**company_profile)
    result = scoring_service.calculate_readiness_score(tender_data, validated_profile.dict())
    return ReadinessResult(**result)