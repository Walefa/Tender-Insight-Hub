from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class InvitationBase(BaseModel):
    email: EmailStr

class InvitationCreate(InvitationBase):
    pass

class InvitationAccept(BaseModel):
    token: str
    full_name: str
    password: str

class Invitation(InvitationBase):
    id: int
    team_id: int
    token: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True
