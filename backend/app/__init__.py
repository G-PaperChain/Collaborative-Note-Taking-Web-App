import os
from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
from authlib.integrations.flask_client import OAuth

load_dotenv()

bcrypt = Bcrypt()
db = SQLAlchemy()
oauth = OAuth()

def create_app():
    app = Flask(__name__)   

    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.secret_key = os.getenv("SECRET_KEY")
    app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
    app.config["GOOGLE_CLIENT_SECRET"] = os.getenv("GOOGLE_CLIENT_SECRET")
    
    CORS(app, 
        origins=["http://localhost:5173"],
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE"],
        allow_headers=["Content-Type", "Authorization"]
    )
    
    bcrypt.init_app(app)
    oauth.init_app(app)
    db.init_app(app)

    oauth.register(
        name="google",
        client_id=app.config["GOOGLE_CLIENT_ID"],
        client_secret=app.config["GOOGLE_CLIENT_SECRET"],
        server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
        client_kwargs={
            'scope': 'openid email profile'
    })

    from app.routes.google_auth import google_auth_bp
    app.register_blueprint(google_auth_bp, url_prefix='/api')
        
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