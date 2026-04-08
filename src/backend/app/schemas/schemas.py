from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import re

# User Schemas
class UserBase(BaseModel):
    email: EmailStr = Field(..., max_length=254)
    full_name: str = Field(..., min_length=2, max_length=100)
    
    @validator('full_name')
    def validate_full_name(cls, v):
        # Only allow letters, spaces, hyphens, and apostrophes
        if not re.match(r"^[a-zA-Z\s'-]+$", v):
            raise ValueError('Full name can only contain letters, spaces, hyphens, and apostrophes')
        return v.strip()

class TeamPlanUpdate(BaseModel):
    new_plan: str = Field(..., min_length=1, max_length=50)
    
    @validator('new_plan')
    def validate_plan(cls, v):
        allowed_plans = ['free', 'basic', 'pro']
        if v.lower() not in allowed_plans:
            raise ValueError(f'Plan must be one of: {", ".join(allowed_plans)}')
        return v.lower()

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('password')
    def validate_password(cls, v):
        # Must contain uppercase, lowercase, number, special character
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one digit')
        if not re.search(r'[!@#$%^&*()_+\-=\[\]{};:\'"|,.<>\/?]', v):
            raise ValueError('Password must contain at least one special character')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = Field(None, max_length=254)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    
    @validator('full_name')
    def validate_full_name(cls, v):
        if v is None:
            return v
        if not re.match(r"^[a-zA-Z\s'-]+$", v):
            raise ValueError('Full name can only contain letters, spaces, hyphens, and apostrophes')
        return v.strip()

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str = Field(...)
    token_type: str = Field(...)

class TokenData(BaseModel):
    email: Optional[str] = None

# Company Profile Schemas
class CompanyProfileBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    industry_sector: str = Field(..., min_length=1, max_length=100)
    services_provided: List[str] = Field(default_factory=list, max_items=50)
    certifications: Dict[str, Any] = Field(default_factory=dict)
    geographic_coverage: List[str] = Field(default_factory=list, max_items=50)
    years_experience: int = Field(..., ge=0, le=100)
    contact_info: Dict[str, Any] = Field(default_factory=dict)
    
    @validator('company_name')
    def validate_company_name(cls, v):
        if not re.match(r'^[a-zA-Z0-9\s\-_.&()]+$', v):
            raise ValueError('Company name contains invalid characters')
        return v.strip()
    
    @validator('industry_sector')
    def validate_industry(cls, v):
        if not re.match(r'^[a-zA-Z\s\-]+$', v):
            raise ValueError('Industry sector contains invalid characters')
        return v.strip()
    
    @validator('services_provided')
    def validate_services(cls, v):
        if not isinstance(v, list):
            raise ValueError('Services must be a list')
        validated = []
        for service in v:
            if not isinstance(service, str) or len(service) < 1 or len(service) > 100:
                raise ValueError('Each service must be a non-empty string with max 100 chars')
            validated.append(service.strip())
        return validated
    
    @validator('geographic_coverage')
    def validate_coverage(cls, v):
        if not isinstance(v, list):
            raise ValueError('Geographic coverage must be a list')
        validated = []
        for location in v:
            if not isinstance(location, str) or len(location) < 1 or len(location) > 100:
                raise ValueError('Each location must be a non-empty string with max 100 chars')
            validated.append(location.strip())
        return validated
    
    @validator('certifications', 'contact_info', pre=True, always=True)
    def validate_dict_fields(cls, v):
        if v is None:
            return {}
        if not isinstance(v, dict):
            raise ValueError('Must be a dictionary')
        # Limit dict size
        if len(v) > 20:
            raise ValueError('Dictionary cannot exceed 20 key-value pairs')
        # Sanitize keys and values
        cleaned = {}
        for key, value in v.items():
            clean_key = str(key).strip()[:50]
            if isinstance(value, str):
                clean_value = value.strip()[:500]
            else:
                clean_value = value
            cleaned[clean_key] = clean_value
        return cleaned

class CompanyProfileCreate(CompanyProfileBase):
    pass

class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=1, max_length=200)
    industry_sector: Optional[str] = Field(None, min_length=1, max_length=100)
    services_provided: Optional[List[str]] = None
    certifications: Optional[Dict[str, Any]] = None
    geographic_coverage: Optional[List[str]] = None
    years_experience: Optional[int] = Field(None, ge=0, le=100)
    contact_info: Optional[Dict[str, Any]] = None
    
    @validator('company_name')
    def validate_company_name(cls, v):
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z0-9\s\-_.&()]+$', v):
            raise ValueError('Company name contains invalid characters')
        return v.strip()
    
    @validator('industry_sector')
    def validate_industry(cls, v):
        if v is None:
            return v
        if not re.match(r'^[a-zA-Z\s\-]+$', v):
            raise ValueError('Industry sector contains invalid characters')
        return v.strip()

class CompanyProfile(CompanyProfileBase):
    id: int
    team_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Tender Schemas
class TenderSearchRequest(BaseModel):
    keywords: str = Field(..., min_length=1, max_length=500)
    filters: Optional[Dict[str, Any]] = None
    
    @validator('keywords')
    def validate_keywords(cls, v):
        # Remove potential malicious content
        sanitized = v.strip()
        if len(sanitized) > 500:
            raise ValueError('Keywords must not exceed 500 characters')
        return sanitized

class TenderSummary(BaseModel):
    tender_id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=500)
    summary: str = Field(..., min_length=1, max_length=5000)
    objective: str = Field(..., min_length=1, max_length=2000)
    scope: str = Field(..., min_length=1, max_length=2000)
    deadline: Optional[datetime] = None
    eligibility_criteria: List[str] = Field(default_factory=list, max_items=20)
    
    @validator('tender_id')
    def validate_tender_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9\-_]+$', v):
            raise ValueError('Invalid tender ID format')
        return v

class ReadinessCheckRequest(BaseModel):
    tender_id: str = Field(..., min_length=1, max_length=100)
    company_profile_id: int = Field(..., gt=0)
    
    @validator('tender_id')
    def validate_tender_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9\-_]+$', v):
            raise ValueError('Invalid tender ID format')
        return v

class ReadinessResult(BaseModel):
    suitability_score: float = Field(..., ge=0, le=100)
    checklist: Dict[str, bool] = Field(default_factory=dict)
    recommendation: str = Field(..., max_length=1000)

# Workspace Schemas
class WorkspaceItemBase(BaseModel):
    tender_id: str = Field(..., min_length=1, max_length=100)
    status: str = Field(default='pending', min_length=1, max_length=50)
    notes: Optional[str] = Field(None, max_length=5000)
    
    @validator('tender_id')
    def validate_tender_id(cls, v):
        if not re.match(r'^[a-zA-Z0-9\-_]+$', v):
            raise ValueError('Invalid tender ID format')
        return v
    
    @validator('status')
    def validate_status(cls, v):
        allowed = {'pending', 'under_review', 'shortlisted', 'declined', 'archived'}
        if v not in allowed:
            raise ValueError(f'Status must be one of: {", ".join(allowed)}')
        return v
    
    @validator('notes')
    def validate_notes(cls, v):
        if v is None:
            return v
        if len(v) > 5000:
            raise ValueError('Notes must not exceed 5000 characters')
        return v.strip()

class WorkspaceItemCreate(WorkspaceItemBase):
    pass

class WorkspaceItemUpdate(BaseModel):
    status: Optional[str] = Field(None, min_length=1, max_length=50)
    notes: Optional[str] = Field(None, max_length=5000)
    
    @validator('status')
    def validate_status(cls, v):
        if v is None:
            return v
        allowed = {'pending', 'under_review', 'shortlisted', 'declined', 'archived'}
        if v not in allowed:
            raise ValueError(f'Status must be one of: {", ".join(allowed)}')
        return v
    
    @validator('notes')
    def validate_notes(cls, v):
        if v is None:
            return v
        if len(v) > 5000:
            raise ValueError('Notes must not exceed 5000 characters')
        return v.strip()

class WorkspaceItem(WorkspaceItemBase):
    id: int
    team_id: int
    suitability_score: Optional[float] = None
    last_updated_by: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

