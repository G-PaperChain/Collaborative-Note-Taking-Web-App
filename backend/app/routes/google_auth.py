from flask import Blueprint, redirect, url_for, session
from flask_dance.contrib.google import google
from flask_login import login_user, logout_user
from app.models.User import User, db

google_auth_bp = Blueprint('google_auth', __name__)

@google_auth_bp.route('/login/google')
def login():
    if not google.authorized:
        return redirect(url_for("google.login"))
    return redirect(url_for('google_auth.callback'))

@google_auth_bp.route('/login/google/callback')
def callback():
    if not google.authorized:
        return redirect(url_for("google.login"))

    resp = google.get("/oauth2/v2/userinfo")
    if not resp.ok:
        return {"error": "Failed to fetch user info"}, 400

    info = resp.json()
    email = info["email"]
    name = info.get("name", "")
    picture = info.get("picture", "")

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(email=email, name=name, picture=picture)
        db.session.add(user)
        db.session.commit()

    login_user(user, remember=True)
    return redirect("http://localhost:5173?login=success")

# @google_auth_bp.route('/logout', methods=['POST'])
# def logout():
#     logout_user()
#     session.clear()
#     return {"message": "Logged out"}