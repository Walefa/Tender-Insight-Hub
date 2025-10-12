from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team_id = Column(Integer, ForeignKey("teams.id"))
    team = relationship("Team", back_populates="members")
    activities = relationship("UserActivity", back_populates="user")

class Team(Base):
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    plan = Column(String, default="free")  # free, basic, pro
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    members = relationship("User", back_populates="team")
    company_profile = relationship("CompanyProfile", back_populates="team", uselist=False)
    workspace_items = relationship("WorkspaceItem", back_populates="team")

class CompanyProfile(Base):
    __tablename__ = "company_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String)
    industry_sector = Column(String)
    services_provided = Column(JSON)  # List of services
    certifications = Column(JSON)  # {cidb: "level", bbbee: "level"}
    geographic_coverage = Column(JSON)  # List of provinces
    years_experience = Column(Integer)
    contact_info = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    team_id = Column(Integer, ForeignKey("teams.id"), unique=True)
    team = relationship("Team", back_populates="company_profile")

class WorkspaceItem(Base):
    __tablename__ = "workspace_items"
    
    id = Column(Integer, primary_key=True, index=True)
    tender_id = Column(String, index=True)  # OCDS tender ID
    status = Column(String, default="pending")  # pending, interested, not_eligible, submitted
    suitability_score = Column(Float)
    notes = Column(Text)
    last_updated_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    team_id = Column(Integer, ForeignKey("teams.id"))
    team = relationship("Team", back_populates="workspace_items")

class UserActivity(Base):
    __tablename__ = "user_activities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    resource_type = Column(String)
    resource_id = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="activities")