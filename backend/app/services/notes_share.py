# app/routes/notes_share.py
from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models.Note import Note
import os

notes_share_bp = Blueprint("notes_share_bp", __name__)

@notes_share_bp.route("/note/<note_id>/create-url", methods=["POST"])
@login_required
def create_url(note_id):
    try:
        data = request.get_json()
        note = Note.query.get(note_id)
        if not data:
            return jsonify({'error': 'No data'}), 400

        if not note:
            return jsonify({'error': 'Note not found'}), 404

        if current_user.user_id != note.owner_id:
            return jsonify({"error": "Unauthorized"}), 403

        CLIENT_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        base_url = CLIENT_URL.rstrip('/')

        if data.get('isChecked'):
            return jsonify({
                'success': True,
                'url': f"{base_url}/note/{note.read_token}/{note.id}"
            }), 201
        else:
            return jsonify({
                'success': True,
                'url': f"{base_url}/note/{note.write_token}/{note.id}"
            }), 201

    except Exception as e:
        print(e)
        return jsonify({'success': False, 'error': 'Internal Server error'}), 500