from flask import Blueprint, request, jsonify
from app import db, bcrypt
from app.models.User import User, user_schema
from flask_login import login_user, logout_user, login_required, current_user

auth_bp = Blueprint('auth', __name__)

import re
def validate_email(email):
    return re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email)

def validate_password(password):
    return len(password) >= 8 and \
           re.search(r'[A-Z]', password) and \
           re.search(r'[a-z]', password) and \
           re.search(r'\d', password)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data: return jsonify({'error': 'No data'}), 400

    email = data.get('email', '').lower().strip()
    password = data.get('password', '')
    name = data.get('name', '').strip()

    if not (email and password and name):
        return jsonify({'error': 'Missing fields'}), 400
    if not validate_email(email):
        return jsonify({'error': 'Invalid email'}), 400
    if not validate_password(password):
        return jsonify({'error': 'Weak password'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email exists'}), 409

    password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(email=email, password_hash=password_hash, name=name)
    db.session.add(user)
    db.session.commit()

    login_user(user, remember=True)

    return user_schema.jsonify(user), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').lower().strip()
    password = data.get('password', '')

    user = User.query.filter_by(email=email).first()

    # if not user or not bcrypt.check_password_hash(user.password_hash, password): before was this

    if not user or not user.password_hash or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid credentials'}), 401

    login_user(user, remember=True)
    
    return user_schema.jsonify(user)

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    try:
        logout_user()
        return jsonify(
            {'message': 'Logged out'})
    except Exception as e:
        return jsonify({'error' : str(e)})

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Not authenticated'}), 401
    return user_schema.jsonify(current_user)