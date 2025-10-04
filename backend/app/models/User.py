from app import db
from datetime import date
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy import Uuid
import uuid

class User(db.Model):
    __tablename__ = 'users'

    user_id = db.Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = db.Column(db.String(255), unique=True, nullable=False)
    picture = db.Column(db.String(255))
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)
    role = db.Column(db.String(20), default="user")
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.Date, default=date.today)
    
    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }