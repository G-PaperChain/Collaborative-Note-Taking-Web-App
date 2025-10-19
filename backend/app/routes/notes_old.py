from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Permission
from app import db
from app.models.schemas import NoteSchema

notes_bp = Blueprint("notes_bp", __name__)
note_schema = NoteSchema()
notes_schema = NoteSchema(many=True)

@notes_bp.route("/create-note", methods=["POST"]) # to create a note
@login_required
def create_note():
    try:
        note = Note(owner_id=current_user.user_id)
        db.session.add(note)
        db.session.commit()
        return note_schema.jsonify(note), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create note'}), 500
    
@notes_bp.route("/note/<note_id>", methods=["GET"])
@login_required
def get_note(note_id):
    try:
        note = Note.query.get(note_id)
        if not note:
            return jsonify({"error": "Note not found"})
        
        if note.owner_id == current_user.user_id:
            return jsonify({
                'success' : True,
                'owner': True,
                'note': note_schema.dump(note)  
            })
        else:
            # check if it read_only or write user
            # TODO: Add sharing logic here
            return jsonify({
                'success' : True,
                'owner': False,
                'note': note_schema.dump(note)
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500

# Update note content
@notes_bp.route("/note/<note_id>", methods=["POST"])
@login_required
def update_note(note_id):    

    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({"error": "Note not found"}), 404
    
    # FIll haal key lia owner only
    if note.owner_id != current_user.user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    # For collaboration: allow any authenticated user to write
    # TODO: Implement proper sharing/permissions system
    
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    note.content = data.get("content", note.content)
    
    try:
        db.session.commit()
        return note_schema.jsonify(note)
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@notes_bp.route("/notes", methods=["GET"])
@login_required
def get_user_notes():
    print(f"Getting all notes for user: {current_user.user_id}")
    notes = Note.query.filter_by(owner_id=current_user.user_id).all()
    print(f"Found {len(notes)} notes")
    return notes_schema.jsonify(notes)

# Delete a note
@notes_bp.route("/note/<note_id>", methods=["DELETE"])
@login_required
def delete_note(note_id):
    print(f"User {current_user.user_id} deleting note: {note_id}")
    
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({"error": "Note not found"}), 404
    
    # Only owner can delete
    if note.owner_id != current_user.user_id:
        return jsonify({"error": "Unauthorized"}), 403
    
    db.session.delete(note)
    db.session.commit()
    print(f"Note {note_id} deleted successfully")
    return jsonify({"message": "Note deleted"}), 200

# routes to create
# get my permission for a note route
# add permission to the user for a note route
# delete it


@notes_bp.route("/note/<note_id>/my-permission")
@login_required
def my_permission(note_id):
    note = Note.query.get(note_id)
    
    if not note:
        return jsonify({"error": "Note not found"}), 404
    
    if current_user.user_id == note.owner_id:
        return jsonify({
            "permission": Permission.ADMIN,
            "can_edit": True,
            "can_share": True,
            "can_delete": True
        })
    
    collaborator = NoteCollaborator.query.filter_by(
        note_id=note_id, 
        user_id=current_user.user_id
    ).first()
    
    if collaborator:
        return jsonify({
            "permission": collaborator.permission,
            "can_edit": collaborator.permission in [Permission.WRITE, Permission.ADMIN],
            "can_share": collaborator.permission == Permission.ADMIN,
            "can_delete": False
        })
    
    return jsonify({"error": "No access to this note"}), 403
