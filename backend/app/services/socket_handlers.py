from flask_socketio import join_room, leave_room, emit
from app import socketio, db
from flask_login import current_user
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Role
from flask import request, session
import sys

@socketio.on('connect')
def handle_connect():
    """Handle socket connection"""
    if current_user.is_authenticated:
        print(f"User: {current_user.email}")
    sys.stdout.flush()

@socketio.on('disconnect')
def handle_disconnect():
    """Handle socket disconnection"""
    sid = request.sid
    note_id = session.get('note_id')
    user_name = session.get('user_name', 'Unknown User')
    
    if note_id:        
        # Notify others that user left
        emit('user_left', {
            'user': user_name
        }, room=note_id)
        
        # Clear session data
        session.pop('note_id', None)
        session.pop('can_edit', None)
        session.pop('user_name', None)
    
    sys.stdout.flush()

@socketio.on('join_note')
def handle_join_note(data):
    """Handle user joining a note room"""
    sys.stdout.flush()

    # Check authentication
    if not current_user.is_authenticated:
        emit('join_error', {'error': 'Authentication required'})
        return

    # Validate data
    if not data or 'note_id' not in data or 'token' not in data:
        emit('join_error', {'error': 'Missing required fields: note_id and token'})
        return

    note_id = data.get('note_id')
    token = data.get('token')
        
    # Get note from database
    note = Note.query.get(note_id)
    if not note:
        emit('join_error', {'error': 'Note not found'})
        return

    # Determine permission
    can_edit = False
    
    if note.owner_id == current_user.user_id:
        can_edit = True
    elif token == note.write_token:
        can_edit = True
    elif token == note.read_token:
        can_edit = False
    else:
        # Check database collaborator record
        collab = NoteCollaborator.query.filter_by(
            note_id=note_id, 
            user_id=current_user.user_id
        ).first()
        if collab:
            can_edit = collab.role == Role.WRITE
        else:
            emit('join_error', {'error': 'No access to this note'})
            return

    # Store session info
    session['note_id'] = note_id
    session['can_edit'] = can_edit
    session['user_name'] = current_user.name
    
    # Join the room
    join_room(note_id)
    
    # Send confirmation with current content
    emit('joined', {
        'note_id': note_id, 
        'content': note.content,
        'can_edit': can_edit
    })
    
    # Notify others in the room
    emit('user_joined', {
        'user': current_user.name,
        'can_edit': can_edit
    }, room=note_id, include_self=False)
    
    sys.stdout.flush()

@socketio.on('leave_note')
def handle_leave_note(data):
    """Handle user leaving a note room"""
    sid = request.sid
    note_id = session.get('note_id')
    user_name = session.get('user_name', 'Unknown User')
        
    if note_id:
        leave_room(note_id)
        emit('user_left', {
            'user': user_name
        }, room=note_id)
        
        # Clear session data
        session.pop('note_id', None)
        session.pop('can_edit', None)
        session.pop('user_name', None)

    sys.stdout.flush()

@socketio.on('note_update')
def handle_note_update(data):
    """Handle note content updates"""
    sid = request.sid
    note_id = session.get('note_id')
    can_edit = session.get('can_edit')
        
    if not note_id:
        emit('update_error', {'error': 'Not joined to any note'})
        return
    
    if note_id != data.get('note_id'):
        emit('update_error', {'error': 'Invalid session'})
        return

    if not can_edit:
        emit('update_error', {'error': 'Permission denied'})
        return

    content = data.get('content')
    
    if not content:
        emit('update_error', {'error': 'No content provided'})
        return

    # Get note and update
    note = Note.query.get(note_id)
    if not note:
        emit('update_error', {'error': 'Note not found'})
        return
    
    import json
    if isinstance(content, str):
        content = json.loads(content)
    
    # Remove session/pageStates
    content.pop('session', None)
    if content.get('document', {}).get('session'):
        content['document'].pop('session')
        
    # Save to database
    note.content = content
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        emit('update_error', {'error': 'Failed to save'})
        return

    emit('note_updated', {
        'note_id': note_id, 
        'content': content,
        'updated_by': current_user.name if current_user.is_authenticated else 'Anonymous'
    }, room=note_id, include_self=False)
    
    sys.stdout.flush()