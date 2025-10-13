from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

from pydantic import BaseModel

class TeamPlanUpdate(BaseModel):
    new_plan: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Company Profile Schemas
class CompanyProfileBase(BaseModel):
    company_name: str
    industry_sector: str
    services_provided: List[str]
    certifications: Dict[str, Any]
    geographic_coverage: List[str]
    years_experience: int
    contact_info: Dict[str, Any]

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    industry_sector: Optional[str] = None
    services_provided: Optional[List[str]] = None
    certifications: Optional[Dict[str, Any]] = None
    geographic_coverage: Optional[List[str]] = None
    years_experience: Optional[int] = None
    contact_info: Optional[Dict[str, Any]] = None

class CompanyProfile(CompanyProfileBase):
    id: int
    team_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Tender Schemas
class TenderSearchRequest(BaseModel):
    keywords: str
    filters: Optional[Dict[str, Any]] = None

class TenderSummary(BaseModel):
    tender_id: str
    title: str
    summary: str
    objective: str
    scope: str
    deadline: Optional[datetime]
    eligibility_criteria: List[str]

class ReadinessCheckRequest(BaseModel):
    tender_id: str
    company_profile_id: int

class ReadinessResult(BaseModel):
    suitability_score: float
    checklist: Dict[str, bool]
    recommendation: str

# Workspace Schemas
class WorkspaceItemBase(BaseModel):
    tender_id: str
    status: str = "pending"
    notes: Optional[str] = None

class WorkspaceItemCreate(WorkspaceItemBase):
    pass

class WorkspaceItemUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class WorkspaceItem(WorkspaceItemBase):
    id: int
    team_id: int
    suitability_score: Optional[float]
    last_updated_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

