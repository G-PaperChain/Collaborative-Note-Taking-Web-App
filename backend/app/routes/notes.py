from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db, socketio
from flask_socketio import emit, join_room, leave_room
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Permission
from app.models.schemas import NoteSchema
import sys
import traceback

notes_bp = Blueprint('notes_bp', __name__)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)

@notes_bp.route('/notes')
@login_required
def get_notes():
    try:
        notes = Note.query.filter_by(owner_id=current_user.user_id).all()

        if not notes:
            return jsonify({
            "success" : False,
            "error" : 'You have no notes',
        }), 404

        return jsonify({
            "success" : True,
            "notes" : notes_schema.dump(notes),
        }), 200
    
    except Exception as e:
        print(e)
        return jsonify({
            "success" : False,
            "error" : 'Unable to fetch Notes',
        }), 500


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

@notes_bp.route('/note/<note_id>/access', methods=['GET'])
def note_access(note_id):
    """Check user's access level to a note"""
    token = request.args.get('token')
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({'error': 'Note not found'}), 404

    print(f"🔍 Checking access for note {note_id}")
    print(f"   Token provided: {token}")
    print(f"   User authenticated: {current_user.is_authenticated}")
    if current_user.is_authenticated:
        print(f"   User ID: {current_user.user_id}")
        print(f"   Owner ID: {note.owner_id}")

    # Priority 1: Check if user is the owner (if authenticated)
    if current_user.is_authenticated and note.owner_id == current_user.user_id:
        print("✅ User is owner")
        return jsonify({
            'success' : True,
            'can_edit': True, 
            'role': 'Owner',
            'note': note_schema.dump(note)
        }), 200

    # Priority 2: Check token-based access (shared links)
    if token:
        if token == note.write_token:
            print("   ✅ Valid write token")
            return jsonify({
                'success' : True,
                'can_edit': True, 
                'role': 'Writer', 
                'note': note_schema.dump(note)
            }), 200
        elif token == note.read_token:
            print("   ✅ Valid read token")
            return jsonify({
                'success' : True,
                'can_edit': False, 
                'role': 'Reader', 
                'note': note_schema.dump(note)
            }), 200
        else:
            print("❌ Invalid token")
            return jsonify({
                'success' : False,
                'error' : "Link not Found OR Invalid Link", 
            }), 404  # added by me

    # Priority 3: Check if user is a collaborator (if authenticated)
    if current_user.is_authenticated:
        collab = NoteCollaborator.query.filter_by(
            note_id=note.id, 
            user_id=current_user.user_id
        ).first()
        if collab:
            can_edit = collab.permission == Permission.WRITE # true or false
            print(f"✅ User is collaborator with {collab.permission} permission")
            return jsonify({
                'success' : True,
                'can_edit': can_edit, 
                'role': 'Writer' if can_edit else 'Reader', 
                'note': note_schema.dump(note)
            }), 200

    # No access
    print("❌ No access")
    return jsonify({
        'success' : False,
        'error': 'Unauthorized'
    }), 403