import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_login import LoginManager
from flask_dance.contrib.google import make_google_blueprint
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv

load_dotenv()

bcrypt = Bcrypt()
db = SQLAlchemy()
ma = Marshmallow()
login_manager = LoginManager()
csrf = CSRFProtect()

def create_app():
    app = Flask(__name__)

    # Secrets & Config
    app.secret_key = os.getenv("SECRET_KEY")
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL")
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
    app.config["GOOGLE_CLIENT_SECRET"] = os.getenv("GOOGLE_CLIENT_SECRET")
    app.config["REMEMBER_COOKIE_DURATION"] = 60 * 60 * 24 * 7 

    CORS(app, 
         origins=["http://localhost:5173"], 
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE"],
         allow_headers=["Content-Type", "Authorization"])

    db.init_app(app)
    bcrypt.init_app(app)
    ma.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    login_manager.login_view = 'auth.login'

    google_bp = make_google_blueprint(
        client_id=app.config["GOOGLE_CLIENT_ID"],
        client_secret=app.config["GOOGLE_CLIENT_SECRET"],
        scope=[
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile"
        ],
    )

    app.register_blueprint(google_bp, url_prefix="/login")

    from app.models.User import User

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(user_id)

    from app.routes.auth import auth_bp
    from app.routes.google_auth import google_auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(google_auth_bp, url_prefix="/api")

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
