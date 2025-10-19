from app import ma
from .User import User
from .Note import Note

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

# Schema instances
user_schema = UserSchema()
users_schema = UserSchema(many=True)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)
