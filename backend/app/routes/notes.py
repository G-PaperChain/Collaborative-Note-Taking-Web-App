from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db, socketio
from flask_socketio import emit, join_room, leave_room
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Permission
from app.models.schemas import NoteSchema
import traceback

notes_bp = Blueprint('notes_bp', __name__)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)

# ---------------------------
# CREATE NOTE
# ---------------------------
@notes_bp.route('/note', methods=['POST'])
@login_required
def create_note():
    try:
        data = request.get_json() or {}
        title = data.get('title', 'Untitled')
        content = data.get('content', {})

        new_note = Note(title=title, content=content, owner_id=current_user.user_id)
        db.session.add(new_note)
        db.session.commit()

        return jsonify({
            'success': True,
            'note': note_schema.dump(new_note)
        }), 201
    except Exception as e:
        print('Error creating note:', e)
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Internal server error'}), 500

# ---------------------------
# GET NOTE
# ---------------------------
@notes_bp.route('/note/<note_id>', methods=['GET'])
@login_required
def get_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        # check ownership or collaborator permissions
        if note.owner_id != current_user.user_id:
            collaborator = NoteCollaborator.query.filter_by(note_id=note.id, user_id=current_user.user_id).first()
            if not collaborator:
                return jsonify({'error': 'Unauthorized'}), 403

        return jsonify({'note': note_schema.dump(note)}), 200
    except Exception as e:
        print('Error getting note:', e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

# ---------------------------
# UPDATE NOTE
# ---------------------------
@notes_bp.route('/note/<note_id>', methods=['POST'])
@login_required
def update_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        # check permissions
        if note.owner_id != current_user.user_id:
            collaborator = NoteCollaborator.query.filter_by(note_id=note.id, user_id=current_user.user_id).first()
            if not collaborator or collaborator.permission != Permission.WRITE:
                return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        note.content = data.get('content', note.content)
        note.title = data.get('title', note.title)
        db.session.commit()

        # broadcast update via SocketIO
        # socketio.emit('note_updated', {
        #     'note_id': note.id,
        #     'content': note.content
        # }, room=note.id)

        return jsonify({'success': True, 'note': note_schema.dump(note)}), 200
    except Exception as e:
        print('Error updating note:', e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

# ---------------------------
# DELETE NOTE
# ---------------------------
@notes_bp.route('/note/<note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        if note.owner_id != current_user.user_id:
            return jsonify({'error': 'Unauthorized'}), 403

        db.session.delete(note)
        db.session.commit()
        return jsonify({'success': True, 'message': 'Note deleted'}), 200
    except Exception as e:
        print('Error deleting note:', e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

# ---------------------------
# PERMISSION / ACCESS CHECK
# ---------------------------
# @notes_bp.route('/note/<note_id>/access', methods=['GET'])
# @login_required
# def note_access(note_id):
#     note = Note.query.get(note_id)
#     if not note:
#         return jsonify({'error': 'Note not found'}), 404

#     if note.owner_id == current_user.user_id:
#         return jsonify({'can_edit': True, 'role': 'owner'}), 200

#     collaborator = NoteCollaborator.query.filter_by(note_id=note.id, user_id=current_user.user_id).first()
#     if collaborator:
#         return jsonify({
#             'can_edit': collaborator.permission == Permission.WRITE,
#             'role': 'collaborator'
#         }), 200

#     return jsonify({'can_edit': False, 'role': 'viewer'}), 200

@notes_bp.route('/note/<note_id>/access', methods=['GET'])
def note_access(note_id):
    token = request.args.get('token')
    note = Note.query.get(note_id)
    if not note:
        return jsonify({'error': 'Note not found'}), 404

    # token-based access (shared links)
    if token == note.write_token:
        return jsonify({'can_edit': True, 'role': 'writer', 'note': note_schema.dump(note)}), 200
    elif token == note.read_token:
        return jsonify({'can_edit': False, 'role': 'reader', 'note': note_schema.dump(note)}), 200

    # owner or collaborators (session-based)
    if current_user.is_authenticated:
        if note.owner_id == current_user.user_id:
            return jsonify({'can_edit': True, 'role': 'owner', 'note': note_schema.dump(note)}), 200
        collab = NoteCollaborator.query.filter_by(note_id=note.id, user_id=current_user.user_id).first()
        if collab:
            return jsonify({'can_edit': collab.permission == Permission.WRITE, 'role': 'collaborator', 'note': note_schema.dump(note)}), 200

    return jsonify({'error': 'Unauthorized'}), 403


# ---------------------------
# SOCKET HANDLERS (COLLABORATION)
# ---------------------------
# @socketio.on('join_note')
# def on_join_note(data):
#     note_id = data.get('note_id')
#     join_room(note_id)
#     print(f"User joined note {note_id}")

# @socketio.on('leave_note')
# def on_leave_note(data):
#     note_id = data.get('note_id')
#     leave_room(note_id)
#     print(f"User left note {note_id}")

# @socketio.on('note_update')
# def on_note_update(data):
#     note_id = data.get('note_id')
#     content = data.get('content')
#     note = Note.query.get(note_id)

#     if not note:
#         emit('error', {'error': 'Note not found'})
#         return

#     # For safety, permission check here would be best added if needed
#     note.content = content
#     db.session.commit()

#     emit('note_updated', {'note_id': note_id, 'content': content}, room=note_id, include_self=False)
