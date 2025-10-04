from flask import Blueprint, redirect, url_for, session, jsonify
from app import oauth, db
from app.models.User import User

google_auth_bp = Blueprint('auth', __name__)

@google_auth_bp.route('/login/google')
def google_login():
    try:
        redirect_uri = url_for('auth.google_authorized', _external=True)

        return oauth.google.authorize_redirect(
            redirect_uri, 
            prompt="select_account"
        )
    except Exception as e:
        print(f"❌ OAuth error: {e}")
        return jsonify({"error": "OAuth configuration error"}), 500

@google_auth_bp.route('/login/google/callback')
def google_authorized():
    try:        
        token = oauth.google.authorize_access_token()
        if not token:
            return jsonify({"error": "Failed to get access token"}), 400
                
        userinfo_response = oauth.google.get('https://www.googleapis.com/oauth2/v3/userinfo')

        if userinfo_response.status_code == 200:
            user_info = userinfo_response.json()
            
            # Check if user already exists in database
            user = User.query.filter_by(email=user_info["email"]).first()
            
            if not user:
                # Create new user
                user = User(
                    google_id=user_info["sub"],
                    email=user_info["email"],
                    name=user_info.get("name", ""),
                    picture=user_info.get("picture", "")
                )
                db.session.add(user)
            else:
                # Optionally update existing user info
                user.name = user_info.get("name", user.name)
                user.picture = user_info.get("picture", user.picture)

            db.session.commit()

            # Store user id in session
            session["user"] = {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "picture": user.picture
            }
            
            return redirect("http://localhost:5173?login=success")
        else:
            return jsonify({"error": "Failed to get user information from Google"}), 400
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 400