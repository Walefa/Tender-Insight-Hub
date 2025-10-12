import pytest
from app.services.scoring_service import ScoringService


def test_scoring_full_match():
    ss = ScoringService()
    tender_requirements = {
        "industry_keywords": ["construction"],
        "provinces": ["Gauteng"],
        "services": ["civil works"],
        "certifications": {"cidb": "4"},
        "min_experience": 3
    }
    company_profile = {
        "industry_sector": "Construction and civil works",
        "geographic_coverage": ["Gauteng", "Western Cape"],
        "services_provided": ["civil works", "maintenance"],
        "certifications": {"cidb": "5"},
        "years_experience": 5
    }

    res = ss.calculate_readiness_score(tender_requirements, company_profile)
    assert res["suitability_score"] >= 60
    assert res["recommendation"] in ["Suitable", "Highly suitable", "Moderately suitable"]


def test_scoring_no_match():
    ss = ScoringService()
    tender_requirements = {"industry_keywords": ["it"]}
    company_profile = {
        "industry_sector": "Agriculture",
        "geographic_coverage": ["Limpopo"],
        "services_provided": ["farming"],
        "certifications": {},
        "years_experience": 1
    }
    res = ss.calculate_readiness_score(tender_requirements, company_profile)
    assert res["suitability_score"] < 60
