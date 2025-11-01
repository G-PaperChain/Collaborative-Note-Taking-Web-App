from flask_socketio import join_room, leave_room, emit
from app import socketio, db
from flask_login import current_user
from app.models.Note import Note
from app.models.NoteCollaborator import NoteCollaborator, Role
from flask import request, session
import sys

connected_users = {}

@socketio.on('connect')
def handle_connect():
    """Handle socket connection"""
    sys.stdout.flush()

@socketio.on('disconnect')
def handle_disconnect():
    """Handle socket disconnection"""
    sid = request.sid
    user_info = connected_users.pop(sid, None)

    if user_info:
        note_id = user_info['note_id']
        user_name = user_info.get('user_name', 'Unknown User')

        emit('user_left', {'user': user_name}, room=note_id)

    sys.stdout.flush()

@socketio.on('join_note')
def handle_join_note(data):
    """Join a note room using token-based auth"""
    import sys
    sys.stdout.flush()

    sid = request.sid  # unique socket connection ID

    if not data or 'note_id' not in data or 'token' not in data:
        emit('join_error', {'error': 'Missing note_id or token'})
        return

    note_id = data['note_id']
    token = data['token']

    note = Note.query.get(note_id)
    if not note:
        emit('join_error', {'error': 'Note not found'})
        return

    if token == note.write_token:
        can_edit = True
        user_name = current_user.name
    elif token == note.read_token:
        can_edit = False
        user_name = current_user.name
    else:
        emit('join_error', {'error': 'Invalid token'})
        return

    # ✅ Store connection info manually
    connected_users[sid] = {
        'note_id': note_id,
        'can_edit': can_edit,
        'user_name': user_name,
    }

    join_room(note_id)
    emit('joined', {'note_id': note_id, 'content': note.content, 'can_edit': can_edit})
    emit('user_joined', {'user': user_name}, room=note_id, include_self=False)


@socketio.on('leave_note')
def handle_leave_note(data):
    """Handle user leaving a note room"""
    sid = request.sid
    user_info = connected_users.pop(sid, None)

    if user_info:
        note_id = user_info['note_id']
        user_name = user_info.get('user_name', 'Unknown User')

        leave_room(note_id)
        emit('user_left', {'user': user_name}, room=note_id)

    sys.stdout.flush()

@socketio.on('note_update')
def handle_note_update(data):
    import sys
    sys.stdout.flush()

    sid = request.sid
    user_info = connected_users.get(sid)

    if not user_info:
        emit('update_error', {'error': 'Not joined to any note'})
        return

    note_id = user_info['note_id']
    can_edit = user_info['can_edit']

    if not can_edit:
        emit('update_error', {'error': 'No edit permission'})
        return

    note = Note.query.get(note_id)
    if not note:
        emit('update_error', {'error': 'Note not found'})
        return

    content = data.get('content')
    if not content:
        emit('update_error', {'error': 'Missing content'})
        return

    # ✅ Save update to DB
    note.content = content
    db.session.commit()

    # ✅ Broadcast to other users
    emit('note_update', {'note_id': note_id, 'content': content}, room=note_id, include_self=False)
