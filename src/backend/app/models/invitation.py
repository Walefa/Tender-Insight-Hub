from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from app.models.sql_models import Base, Team

class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"))
    token = Column(String, unique=True, index=True)
    status = Column(String, default="pending")  # pending, accepted, revoked, expired
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7))

    team = relationship("Team")
