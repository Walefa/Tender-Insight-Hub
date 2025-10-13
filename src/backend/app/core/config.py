from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tender Insight Hub"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database
    SQL_DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost/tender_hub"
    MONGODB_URL: str = "mongodb://localhost:27017/tender_hub"
    MONGO_DB_NAME: str = "tender_hub"  # Default MongoDB database name
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # OCDS API
    OCDS_API_URL: str = "https://ocds-api.etenders.gov.za/api/OCDSReleases"
    
    # AI Services
    HUGGINGFACE_API_KEY: Optional[str] = None
    SUMMARIZATION_MODEL: str = "facebook/bart-large-cnn"
    
    # Rate Limiting
    FREE_TIER_SEARCH_LIMIT: int = 3
    
    class Config:
        env_file = ".env"

settings = Settings()