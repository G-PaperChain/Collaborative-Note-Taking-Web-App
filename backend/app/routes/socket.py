from flask import Blueprint
from flask_socketio import SocketIO, join_room, leave_room, emit
from app import socketio

socketio_bp = Blueprint('socket_io', __name__)

@socketio.on('join_room')
def handle_join_room(data):
    room = data['room']
    join_room(room)
    print(f"User joined room: {room}")

@socketio.on('leave_room')
def handle_leave_room(data):
    room = data['room']
    leave_room(room)
    print(f"User left room: {room}")

@socketio.on('tldraw_update')
def handle_tldraw_update(data):
    room = data['room']
    update_data = data['update']
    emit('tldraw_update', update_data, room=room, include_self=False)