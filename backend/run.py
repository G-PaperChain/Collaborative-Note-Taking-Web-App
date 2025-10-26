import os
from app import create_app, db, socketio

flask_app = create_app()

if __name__ == '__main__':
    with flask_app.app_context():
        db.create_all()
    port = int(os.getenv('PORT', 8080))
    socketio.run(flask_app, host='0.0.0.0', port=port, debug=False)