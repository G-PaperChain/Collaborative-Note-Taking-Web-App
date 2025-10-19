from app import db
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from datetime import datetime

class Permission:
    READ = 'read'
    WRITE = 'write'
    ADMIN = 'admin'

class NoteCollaborator(db.Model):
    __tablename__ = 'note_collaborators'
    
    id = db.Column(db.Integer, primary_key=True)
    note_id = db.Column(db.String(36), db.ForeignKey('notes.id'), nullable=False)
    user_id = db.Column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    permission = db.Column(db.String(10), default=Permission.READ)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='collaborations')

    def __repr__(self):
        return f"<NoteCollaborator note_id={self.note_id} user_id={self.user_id}>"