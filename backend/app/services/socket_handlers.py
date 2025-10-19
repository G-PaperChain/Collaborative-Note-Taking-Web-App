# app/socket_handlers.py
from flask_socketio import join_room, leave_room, emit
from app import socketio, db
from flask_login import current_user, login_required
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator
from flask import request
import sys
from flask import Blueprint

# In-memory mapping: sid -> {note_id, can_edit}
# NOTE: ephemeral; if you scale to multiple processes use Redis pubsub + socketio message queue
user_sessions = {}

@socketio.on('join_note')
def handle_join_note(data):
    print("🔹 Received event: join_note", data)
    sys.stdout.flush()

    # data: {
    #         note_id: "...",
    #         token: "..." 
    #     }
    if not current_user.is_authenticated:
        emit('join_error', {'error': 'Authentication required'})
        return

    required_fields = ['note_id', 'token']

    if not all(field in data for field in required_fields):
        emit('data_error', {'error': 'Missing required fields'})
        return

    note_id = data.get('note_id')
    token = data.get('token')
    note = Note.query.get(note_id)

    if not note:
        emit('join_error', {'error': 'Note not found'})
        return
    
    print(">>> TOKEN COMPARE:", token, note.write_token, token == note.write_token)

    # Determine permission
    if note.owner_id == current_user.user_id:
        can_edit = True
    elif token and token == note.write_token:
        can_edit = True
    elif token and token == note.read_token:
        can_edit = False
    else:
        # If no valid token and not owner, check DB collaborator record
        collab = NoteCollaborator.query.filter_by(note_id=note_id, user_id=current_user.user_id).first()
        if collab:
            can_edit = collab.permission in [collab.Permission.WRITE, collab.Permission.ADMIN]
        else:
            emit('join_error', {'error': 'No access to this note'})
            return

    sid = request.sid
    user_sessions[sid] = {'note_id': note_id, 'can_edit': can_edit}
    # join_room(note_id)
    join_room(note_id)

    # Send current note content and permission to the client
    emit('joined', {'note_id': note_id, 'content': note.content, 'can_edit': can_edit})

@socketio.on('leave_note')
def handle_leave_note(data):
    sid = request.sid
    sess = user_sessions.pop(sid, None)
    print(data)
    if sess:
        leave_room(sess['note_id'])


@socketio.on('note_update')
def handle_note_update(data):
    # data: { note_id, content }
    sid = request.sid
    sess = user_sessions.get(sid)
    if not sess or sess.get('note_id') != data.get('note_id'):
        emit('update_error', {'error': 'Not joined or invalid session'})
        return

    if not sess.get('can_edit'):
        emit('update_error', {'error': 'Permission denied'})
        return

    note_id = data.get('note_id')
    content = data.get('content')

    # Persist
    note = Note.query.get(note_id)
    if not note:
        emit('update_error', {'error': 'Note not found'})
        return
    
    print("EMITTING note_updated", type(content), content.__class__.__name__)

    note.content = content
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        emit('update_error', {'error': 'Failed to save'})
        print(e)
        return

    # Broadcast to other clients in same room (do not echo back to sender)
    emit('note_updated', {'note_id': note_id, 'content': content}, room=note_id, include_self=False)