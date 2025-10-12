from typing import Dict, Any, List
from app.schemas.schemas import CompanyProfile

class ScoringService:
    def calculate_readiness_score(self, tender_requirements: Dict, company_profile: dict) -> Dict:
        """Calculate suitability score between tender and company profile"""
        checklist = {}
        total_score = 0
        max_score = 0
        
      # Industry/Sector Match (20 points)
        industry_match = self._check_industry_match(tender_requirements, company_profile["industry_sector"])
        checklist["industry_sector"] = industry_match
        total_score += 20 if industry_match else 0
        max_score += 20

        # Geographic Coverage (20 points)
        geo_match = self._check_geographic_match(tender_requirements, company_profile["geographic_coverage"])
        checklist["geographic_coverage"] = geo_match
        total_score += 20 if geo_match else 0
        max_score += 20

        # Services Match (20 points)
        services_match = self._check_services_match(tender_requirements, company_profile["services_provided"])
        checklist["services_provided"] = services_match
        total_score += 20 if services_match else 0
        max_score += 20

        # Certifications (20 points)
        cert_match = self._check_certifications_match(tender_requirements, company_profile["certifications"])
        checklist["certifications"] = cert_match
        total_score += 20 if cert_match else 0
        max_score += 20

        # Experience (20 points)
        exp_match = self._check_experience_match(tender_requirements, company_profile["years_experience"])
        checklist["experience"] = exp_match
        total_score += 20 if exp_match else 0
        max_score += 20

        suitability_score = (total_score / max_score) * 100 if max_score > 0 else 0
        recommendation = "Suitable" if suitability_score >= 60 else "Not Suitable"
        return {
            "suitability_score": round(suitability_score, 2),
            "checklist": checklist,
            "recommendation": recommendation
        }
    
    def _check_industry_match(self, requirements: Dict, company_industry: str) -> bool:
        # Simplified industry matching
        industry_keywords = requirements.get("industry_keywords", [])
        return any(keyword.lower() in company_industry.lower() for keyword in industry_keywords)
    
    def _check_geographic_match(self, requirements: Dict, company_coverage: List[str]) -> bool:
        required_provinces = requirements.get("provinces", [])
        if not required_provinces:
            return True
        return any(province in company_coverage for province in required_provinces)
    
    def _check_services_match(self, requirements: Dict, company_services: List[str]) -> bool:
        required_services = requirements.get("services", [])
        if not required_services:
            return True
        return any(service in company_services for service in required_services)
    
    def _check_certifications_match(self, requirements: Dict, company_certs: Dict) -> bool:
        required_certs = requirements.get("certifications", {})
        if not required_certs:
            return True
        
        for cert, level in required_certs.items():
            if cert in company_certs:
                if self._compare_cert_levels(company_certs[cert], level):
                    return True
        return False
    
    def _check_experience_match(self, requirements: Dict, company_experience: int) -> bool:
        min_experience = requirements.get("min_experience", 0)
        return company_experience >= min_experience
    
    def _compare_cert_levels(self, company_level: str, required_level: str) -> bool:
        # Simple certification level comparison
        levels = {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9}
        return levels.get(company_level, 0) >= levels.get(required_level, 0)
    
    def _generate_recommendation(self, score: float, checklist: Dict) -> str:
        if score >= 80:
            return "Highly suitable - strong match with requirements"
        elif score >= 60:
            return "Suitable - good match with some areas for improvement"
        elif score >= 40:
            return "Moderately suitable - consider applying with improvements"
        else:
            return "Not suitable - significant gaps in requirements"