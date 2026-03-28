from flask import Blueprint, request, jsonify, send_file
from ..models.db import supabase
import pandas as pd
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4

export_bp = Blueprint('export', __name__)

@export_bp.route('/meetings/<meeting_id>/export', methods=['GET'])
def export_items(meeting_id):
    format = request.args.get('format', 'csv')  
    result = supabase.table('action_items') \
        .select('*').eq('meeting_id', meeting_id) \
        .execute()

    items = result.data
    if not items:
        return jsonify({'error': 'No items found'}), 404

    if format == 'csv':
        return export_csv(items)
    elif format == 'pdf':
        return export_pdf(items)
    else:
        return jsonify({'error': 'Unsupported format'}), 422


def export_csv(items):
    df = pd.DataFrame(items)
    cols = ['type', 'description', 'owner', 'due_date']
    df = df[[c for c in cols if c in df.columns]]
    df['type'] = df['type'].replace({
        'action_item': 'Action Item',
        'decision': 'Decision'
    })
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    return send_file(
        io.BytesIO(buffer.getvalue().encode()),
        mimetype='text/csv',
        as_attachment=True,
        download_name='meeting_actions.csv'
    )


def export_pdf(items):
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, "Meeting Action Items & Decisions")

    decisions = [i for i in items if i['type'] == 'decision']
    actions = [i for i in items if i['type'] == 'action_item']
    y = height - 90  

    def write_section(title, rows, fields):
        nonlocal y
        c.setFont("Helvetica-Bold", 13)
        c.drawString(50, y, title)
        y -= 25

        if not rows:
            c.setFont("Helvetica", 11)
            c.drawString(60, y, "None found.")
            y -= 20
            return

        for row in rows:
            c.setFont("Helvetica-Bold", 11)
            desc = row.get('description', '')[:90] 
            c.drawString(60, y, f"• {desc}")
            y -= 18

            for field in fields:
                val = row.get(field)
                if val:
                    c.setFont("Helvetica", 10)
                    c.drawString(75, y, f"{field.replace('_', ' ').title()}: {val}")
                    y -= 15

            y -= 8  

            if y < 80:
                c.showPage()
                y = height - 50

    write_section("Decisions", decisions, [])
    y -= 10
    write_section("Action Items", actions, ['owner', 'due_date'])

    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name='meeting_actions.pdf'
    )