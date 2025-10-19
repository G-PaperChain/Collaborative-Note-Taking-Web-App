from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Permission
from app import db
from app.models.schemas import NoteSchema
import os

notes_share_bp = Blueprint("notes_share_bp", __name__)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)

#TODO:whenever a not-owner user enter check the token type if it is read or write and give permissions accordingly 

# to create a url that the owner of the note could share and the url should contain permissions like one is read only one is write only and so
@notes_share_bp.route("/note/<note_id>/create-url", methods=["POST"])
@login_required
def create_url(note_id):
    try: 
        data = request.get_json()
        note = Note.query.get(note_id)
        if not data: return jsonify({'error': 'No data'}), 400

        if current_user.user_id != note.owner_id:
            return jsonify({"error": "Unauthorized"}), 403
        
        # base_url = request.host_url.rstrip('/')

        CLIENT_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        base_url = CLIENT_URL.rstrip('/')

        if data['isChecked']:
            return jsonify({
                'success' : True,
                'url' : f"{base_url}/{note.read_token}/{note_id}"
            }), 201
        else:
            return jsonify({
                'success' : True,
                'url' : f"{base_url}/{note.write_token}/{note_id}"
            }), 201
        
    except Exception as e:
        print(e)
        return jsonify({
                'success' : False,
                'error' : "Internal Server error"
            }), 500