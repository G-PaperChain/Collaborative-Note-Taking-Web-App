from app import ma
from .User import User
from .Note import Note
from .NoteCollaborator import NoteCollaborator
from .Task import Task

class UserSchema(ma.SQLAlchemySchema):
    class Meta:
        model = User
        load_instance = True

    user_id = ma.auto_field()
    google_id = ma.auto_field()
    picture = ma.auto_field()
    email = ma.auto_field()
    name = ma.auto_field()
    role = ma.auto_field()

class NoteSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Note
        load_instance = True

user_schema = UserSchema()
users_schema = UserSchema(many=True)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)


class NoteCollaboratorSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = NoteCollaborator
        include_fk = True
        load_instance = True
        
    user_name = ma.Function(lambda obj: obj.user.name if obj.user else None)
    user_email = ma.Function(lambda obj: obj.user.email if obj.user else None)

collaborator_schema = NoteCollaboratorSchema(many=True)

class TaskSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Task
        include_fk = True
        load_instance = True

task_schema = TaskSchema()
tasks_schema = TaskSchema(many=True)