import os
from app import create_app, db, socketio

flask_app = create_app()

if __name__ == '__main__':
    with flask_app.app_context():
        db.create_all()
    socketio.run(flask_app, port=5000)