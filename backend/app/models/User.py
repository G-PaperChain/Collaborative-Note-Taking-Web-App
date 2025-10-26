from app import db
from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from datetime import datetime

class User(db.Model, UserMixin):
    __tablename__ = 'users'

    user_id = db.Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = db.Column(db.String(255), unique=True, nullable=True, index=True)
    picture = db.Column(db.String(500))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(128), nullable=True)
    role = db.Column(db.String(20), default="user")
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    notes = db.relationship('Note', backref='owner', lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"

    def get_id(self):
        return str(self.user_id)