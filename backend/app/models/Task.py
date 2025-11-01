from app import db
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from datetime import datetime

class Task(db.Model):
    __tablename__ = "tasks"

    task_id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(300))
    owner_id = db.Column(PG_UUID(as_uuid=True), db.ForeignKey('users.user_id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    status = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Task {self.task}>"