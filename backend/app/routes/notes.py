from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db, socketio
from flask_socketio import emit, join_room, leave_room
from app.models.User import User
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Role
from app.models.schemas import NoteSchema, NoteCollaboratorSchema
import sys
import traceback

notes_bp = Blueprint('notes_bp', __name__)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)
collaborator_schema = NoteCollaboratorSchema(many=True)

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

# CREATE NOTE
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

# GET NOTE
@notes_bp.route('/note/<note_id>', methods=['GET'])
@login_required
def get_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        if note.owner_id != current_user.user_id:
            collaborator = NoteCollaborator.query.filter_by(note_id=note.id, user_id=current_user.user_id).first()
            if not collaborator:
                return jsonify({'error': 'Unauthorized'}), 403

        return jsonify({'note': note_schema.dump(note)}), 200
    except Exception as e:
        print('Error getting note:', e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

# UPDATE NOTE
@notes_bp.route('/note/<note_id>', methods=['POST'])
@login_required
def update_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        if note.owner_id != current_user.user_id:
            collaborator = NoteCollaborator.query.filter_by(note_id=note.id, user_id=current_user.user_id).first()
            if not collaborator or collaborator.role != Role.WRITE:
                return jsonify({'error': 'Unauthorized'}), 403

        data = request.get_json()
        note.content = data.get('content', note.content)
        note.title = data.get('title', note.title)
        db.session.commit()

        return jsonify({'success': True, 'note': note_schema.dump(note)}), 200
    except Exception as e:
        print('Error updating note:', e)
        traceback.print_exc()
        return jsonify({'error': 'Internal server error'}), 500

# DELETE NOTE
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
@login_required
def note_access(note_id):
    """Check user's access level to a note"""
    token = request.args.get('token')
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({'error': 'Note not found'}), 404

    # Owner always has full access
    if note.owner_id == current_user.user_id:
        return jsonify({
            'success': True,
            'can_edit': True,
            'role': 'owner',
            'note': note_schema.dump(note)
        }), 200

    # Handle token-based access (for read/write links)
    if token:
        role = None
        if token == note.write_token:
            role = Role.WRITE
        elif token == note.read_token:
            role = Role.READ

        # If token is valid and user is logged in, add them as collaborator
        if role and current_user.is_authenticated:
            existing_collab = NoteCollaborator.query.filter_by(
                note_id=note.id,
                user_id=current_user.user_id
            ).first()
            if not existing_collab:
                collaborator = NoteCollaborator(
                    note_id=note.id,
                    user_id=current_user.user_id,
                    role=role
                )
                db.session.add(collaborator)
                db.session.commit()

        # Return based on token role (even for unauthenticated users)
        if role == Role.WRITE:
            return jsonify({
                'success': True,
                'can_edit': True,
                'role': 'writer',
                'note': note_schema.dump(note)
            }), 200
        elif role == Role.READ:
            return jsonify({
                'success': True,
                'can_edit': False,
                'role': 'reader',
                'note': note_schema.dump(note)
            }), 200

    # If no valid token, check if user is a collaborator
    if current_user.is_authenticated:
        collab = NoteCollaborator.query.filter_by(
            note_id=note.id,
            user_id=current_user.user_id
        ).first()
        if collab:
            can_edit = collab.role == Role.WRITE
            return jsonify({
                'success': True,
                'can_edit': can_edit,
                'role': 'writer' if can_edit else 'reader',
                'note': note_schema.dump(note)
            }), 200

    # Default: unauthorized
    return jsonify({
        'success': False,
        'error': 'Unauthorized'
    }), 403

@notes_bp.route('/<note_id>/collaborators')
@login_required
def get_collaborators(note_id):
    try:
        note = Note.query.filter_by(id=note_id, owner_id=current_user.user_id).first()
        if not note:
            return jsonify({'error': 'Note not found'}), 404

        collaborators = NoteCollaborator.query.filter_by(note_id=note_id).all()

        if not collaborators:
            return jsonify({
                "success": False,
                "error": "You have no Collaborators",
            }), 404

        return jsonify({
            "success": True,
            "notes": collaborator_schema.dump(collaborators)
        }), 200

    except Exception as e:
        print(e)
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500