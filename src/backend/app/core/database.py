from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.core.config import settings
import motor.motor_asyncio

# SQL Database (PostgreSQL)
SQLALCHEMY_DATABASE_URL = settings.SQL_DATABASE_URL

if SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL, echo=True)
else:
    engine = create_async_engine(SQLALCHEMY_DATABASE_URL.replace("postgresql", "postgresql+asyncpg"), echo=True)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# MongoDB
mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
mongodb = mongo_client.tender_hub

# Dependency
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_mongo():
    return mongodb