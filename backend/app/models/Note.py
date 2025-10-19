from app import db
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSON, ARRAY
from datetime import datetime
import random
import string
import secrets

def generate_identifier():
    """Generate an ID like aZr-QweR-uIt (Uppercase + lowercase)"""
    letters = string.ascii_letters  # A–Z + a–z
    part1 = ''.join(random.choices(letters, k=3))
    part2 = ''.join(random.choices(letters, k=4))
    part3 = ''.join(random.choices(letters, k=3))
    return f"{part1}-{part2}-{part3}"

class Note(db.Model):
    __tablename__ = "notes"

    id = db.Column(db.String(36), primary_key=True, default=generate_identifier)
    title = db.Column(db.String(150), default="Untitled")
    content = db.Column(JSON, default={})
    owner_id = db.Column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    read_token = db.Column(db.String(32), default=lambda: secrets.token_urlsafe(16), unique=True)
    write_token = db.Column(db.String(32), default=lambda: secrets.token_urlsafe(16), unique=True)

    # Add this relationship
    collaborations = db.relationship('NoteCollaborator', backref='note', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f"<Note {self.title}>"