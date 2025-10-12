import os
from flask import Flask, request, jsonify, redirect, url_for 
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_login import LoginManager
from flask_dance.contrib.google import make_google_blueprint
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
from flask_socketio import SocketIO, emit, join_room, leave_room

load_dotenv()

bcrypt = Bcrypt()
db = SQLAlchemy()
ma = Marshmallow()
login_manager = LoginManager()
socketio = SocketIO()
# csrf = CSRFProtect()
# removed csrf because 
# Not bad if you have proper CORS (restricting origins) + credentials, which you do - CSRF tokens are redundant when your API only accepts requests from trusted origins with session cookies


def create_app():
    app = Flask(__name__)

    # Secrets & Config
    app.secret_key = os.getenv("SECRET_KEY")
    app.config['SESSION_COOKIE_SECURE'] = False  # True in production ####
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
    app.config["GOOGLE_CLIENT_SECRET"] = os.getenv("GOOGLE_CLIENT_SECRET")
    app.config["REMEMBER_COOKIE_DURATION"] = 60 * 60 * 24 * 7 


    CORS(app, 
         origins=["http://localhost:5173"], 
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE"],
         allow_headers=["Content-Type", "Authorization"],
         expose_headers=["Set-Cookie", "X-CSRFToken"],)

    db.init_app(app)
    bcrypt.init_app(app)
    ma.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'
    socketio.init_app(app, cors_allowed_origins="*")

    @login_manager.unauthorized_handler
    def unauthorized():
        if request.path.startswith('/api/'):
            return jsonify({'error': 'Not authenticated'}), 401
        return redirect(url_for('auth.login', next=request.path))

    google_bp = make_google_blueprint(
    client_id=app.config["GOOGLE_CLIENT_ID"],
    client_secret=app.config["GOOGLE_CLIENT_SECRET"],
    scope=[
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ],
    redirect_url="http://127.0.0.1:5000/oauth/google/authorized"  # 👈 force the correct redirect URI
    )

    app.register_blueprint(google_bp, url_prefix="/oauth")

    from app.models.User import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    from app.routes.auth import auth_bp
    from app.routes.google_auth import google_auth_bp
    from app.routes.socket import socketio_bp
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(google_auth_bp, url_prefix="/api")
    app.register_blueprint(socketio_bp, url_prefix="/api")

    # testing the api
    @app.route('/api/test')
    def test():
        return jsonify({"api": "Working"})
    
    @app.route('/api/debug-routes')
    def debug_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            if rule.endpoint != 'static':
                routes.append({
                    'endpoint': rule.endpoint,
                    'path': str(rule),
                    'methods': list(rule.methods)
                })
        return {'routes': routes}

    return app
