import os
from functools import wraps
from flask import request, jsonify
from ..models.db import supabase

def token_required(f):
    """Decorator to protect routes using Supabase JWT"""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        print(f"DEBUG AUTH: Authorization header: {auth_header}")
        
        if not auth_header:
            print("DEBUG AUTH: No authorization header")
            return jsonify({'error': 'Missing authorization header'}), 401
        
        try:
            token = auth_header.split(' ')[1]  # "Bearer <token>"
            print(f"DEBUG AUTH: Token extracted, length: {len(token)}")
        except IndexError:
            print("DEBUG AUTH: Invalid authorization format")
            return jsonify({'error': 'Invalid authorization format'}), 401
        
        try:
            # Verify token with Supabase
            user = supabase.auth.get_user(token)
            request.user_id = user.user.id
            request.user_email = user.user.email
            print(f"DEBUG AUTH: Token verified for user {request.user_id}")
            return f(*args, **kwargs)
        except Exception as e:
            print(f"DEBUG AUTH: Token verification failed: {str(e)}")
            return jsonify({'error': 'Invalid or expired token'}), 401
    
    return decorated
