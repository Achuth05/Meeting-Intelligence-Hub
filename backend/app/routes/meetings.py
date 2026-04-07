# meetings.py
from flask import Blueprint, jsonify, request
from ..models.db import supabase
from ..services.auth import token_required

meetings_bp = Blueprint('meetings', __name__)

@meetings_bp.route('/meetings', methods=['GET'])
@token_required
def get_user_meetings():
    try:
        # Fetch meetings only for the logged-in user
        # request.user_id comes from your @token_required decorator
        result = supabase.table('meetings') \
            .select('*') \
            .eq('user_id', request.user_id) \
            .order('created_at', desc=True) \
            .execute()
            
        return jsonify(result.data) # This returns the list your Dashboard needs
    except Exception as e:
        print(f"Error fetching meetings: {e}")
        return jsonify({'error': str(e)}), 500

@meetings_bp.route('/meetings/<meeting_id>', methods=['DELETE'])
@token_required
def delete_meeting(meeting_id):
    supabase.table('action_items').delete().eq('meeting_id', meeting_id).execute()
    supabase.table('transcript_chunks').delete().eq('meeting_id', meeting_id).execute()
    supabase.table('meetings').delete().eq('id', meeting_id).execute()
    return jsonify({'success': True})