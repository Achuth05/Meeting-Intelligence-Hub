from flask import Blueprint, request, jsonify
from ..models.db import supabase
from ..services.auth import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Register new user with Supabase Auth"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Email validation
    if '@' not in email or '.' not in email:
        return jsonify({'error': 'Invalid email format'}), 400
    
    # Password validation
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    try:
        # Register with Supabase Auth
        response = supabase.auth.sign_up({
            "email": email,
            "password": password
        })
        
        user = response.user
        session = response.session
        
        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'token': session.access_token if session else None,
            'message': 'Registration successful. Check your email to confirm.'
        }), 201
        
    except Exception as e:
        error_msg = str(e)
        if 'already registered' in error_msg.lower():
            return jsonify({'error': 'Email already registered'}), 400
        return jsonify({'error': error_msg}), 500

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Login user with Supabase Auth"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Login with Supabase Auth
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        user = response.user
        session = response.session
        
        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'token': session.access_token
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Invalid email or password'}), 401

@auth_bp.route('/auth/logout', methods=['POST'])
@token_required
def logout():
    """Logout user"""
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1]
        supabase.auth.sign_out(token)
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/auth/me', methods=['GET'])
@token_required
def get_user():
    """Get current user info"""
    try:
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(' ')[1]
        user = supabase.auth.get_user(token)
        return jsonify({
            'user_id': user.user.id,
            'email': user.user.email
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 401
