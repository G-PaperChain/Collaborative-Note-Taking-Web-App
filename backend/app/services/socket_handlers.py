from flask_socketio import join_room, leave_room, emit
from app import socketio, db
from flask_login import current_user
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Permission
from flask import request
import sys

# In-memory mapping: sid -> {note_id, can_edit}
user_sessions = {}

@socketio.on('connect')
def handle_connect():
    """Handle socket connection"""
    print(f"🔌Client connected: {request.sid}")
    print(f"Authenticated: {current_user.is_authenticated}")
    if current_user.is_authenticated:
        print(f"User: {current_user.email}")
    sys.stdout.flush()

@socketio.on('disconnect')
def handle_disconnect():
    """Handle socket disconnection"""
    sid = request.sid
    sess = user_sessions.pop(sid, None)
    print(f"❌ Client disconnected: {sid}")
    
    if sess:
        note_id = sess['note_id']
        user_name = sess.get('user_name', 'Unknown User')
        print(f"Was in note: {note_id} as {user_name}")
        
        # Notify others that user left
        emit('user_left', {
            'user': user_name
        }, room=note_id)
    
    sys.stdout.flush()

@socketio.on('join_note')
def handle_join_note(data):
    """Handle user joining a note room"""
    print(f"📥 join_note event from {request.sid}")
    print(f"   Data: {data}")
    print(f"   User authenticated: {current_user.is_authenticated}")
    sys.stdout.flush()

    # Check authentication
    if not current_user.is_authenticated:
        print("❌ Not authenticated")
        emit('join_error', {'error': 'Authentication required'})
        return

    # Validate data
    if not data or 'note_id' not in data or 'token' not in data:
        print("❌ Missing required fields")
        emit('join_error', {'error': 'Missing required fields: note_id and token'})
        return

    note_id = data.get('note_id')
    token = data.get('token')
    
    print(f"Looking for note: {note_id}")
    
    # Get note from database
    note = Note.query.get(note_id)
    if not note:
        print(f"❌ Note not found: {note_id}")
        emit('join_error', {'error': 'Note not found'})
        return
    
    print(f"✅ Note found: {note_id}")
    print(f"   Owner: {note.owner_id}")
    print(f"   Current user: {current_user.user_id}")
    print(f"   Token provided: {token}")
    print(f"   Write token: {note.write_token}")
    print(f"   Read token: {note.read_token}")

    # Determine permission
    can_edit = False
    
    if note.owner_id == current_user.user_id:
        can_edit = True
        print("✅ User is owner - can edit")
    elif token == note.write_token:
        can_edit = True
        print("✅ Valid write token - can edit")
    elif token == note.read_token:
        can_edit = False
        print("ℹ️ Valid read token - read only")
    else:
        # Check database collaborator record
        collab = NoteCollaborator.query.filter_by(
            note_id=note_id, 
            user_id=current_user.user_id
        ).first()
        if collab:
            can_edit = collab.permission in [Permission.WRITE, Permission.ADMIN]
            print(f"✅ Collaborator with {collab.permission} permission")
        else:
            print("❌ No access to this note")
            emit('join_error', {'error': 'No access to this note'})
            return

    # Store session info
    sid = request.sid
    user_sessions[sid] = {
            'note_id': note_id,
            'can_edit': can_edit,
            'user_name': current_user.name
          }
    
    # Join the room
    join_room(note_id)
    print(f"✅ User joined room {note_id} (can_edit: {can_edit})")
    
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
    sess = user_sessions.pop(sid, None)
    print(f"👋 leave_note from {sid}")
    
    if sess:
        note_id = sess['note_id']
        leave_room(note_id)
        print(f"   Left room: {note_id}")

        user_name = "Unknown User"
        if current_user.is_authenticated:
            user_name = current_user.name
        elif sess.get('user_name'):
            user_name = sess['user_name']

        emit('user_left', {
            'user': user_name
        }, room=note_id)

    sys.stdout.flush()

@socketio.on('note_update')
def handle_note_update(data):
    """Handle note content updates"""
    sid = request.sid
    sess = user_sessions.get(sid)
    
    print(f"📝 note_update from {sid}")
    
    if not sess:
        print("❌ Not in a session")
        emit('update_error', {'error': 'Not joined to any note'})
        return
    
    if sess.get('note_id') != data.get('note_id'):
        print("❌ Note ID mismatch")
        emit('update_error', {'error': 'Invalid session'})
        return

    if not sess.get('can_edit'):
        print("❌ No edit permission")
        emit('update_error', {'error': 'Permission denied'})
        return

    note_id = data.get('note_id')
    content = data.get('content')
    
    if not content:
        print("❌ No content provided")
        emit('update_error', {'error': 'No content provided'})
        return

    # Get note and update
    note = Note.query.get(note_id)
    if not note:
        print(f"❌ Note not found: {note_id}")
        emit('update_error', {'error': 'Note not found'})
        return
    
    import json
    content = data.get('content')
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
        print(f"✅ Note saved: {note_id}")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Save failed: {e}")
        emit('update_error', {'error': 'Failed to save'})
        return

    emit('note_updated', {
        'note_id': note_id, 
        'content': content,
        'updated_by': current_user.name if current_user.is_authenticated else 'Anonymous'
    }, room=note_id, include_self=False)
    
    print(f"✅ Broadcasted update to room {note_id}")
    sys.stdout.flush()