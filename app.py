from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import gspread
from google.oauth2.service_account import Credentials
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Google Sheets setup
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

def get_sheets_client():
    """Initialize Google Sheets client"""
    # Try to get credentials from environment variable first (for Render deployment)
    credentials_json = os.getenv('GOOGLE_CREDENTIALS')
    
    if credentials_json:
        # Running on Render - use environment variable
        creds_dict = json.loads(credentials_json)
        creds = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    else:
        # Running locally - use credentials.json file
        creds = Credentials.from_service_account_file('credentials.json', scopes=SCOPES)
    
    return gspread.authorize(creds)

def get_sheet():
    """Get the specific Google Sheet tab"""
    client = get_sheets_client()
    # Extract spreadsheet ID from URL
    sheet_id = "1nqJ3dcg5H1-dp6ZmA6RLU_yVID0E920ZhCRRBgqMWIE"
    spreadsheet = client.open_by_key(sheet_id)
    # Get the specific tab by gid (1047227859)
    # Find worksheet by its ID
    all_worksheets = spreadsheet.worksheets()
    for ws in all_worksheets:
        if ws.id == 1047227859:
            return ws
    # Fallback to first sheet if gid not found
    return spreadsheet.get_worksheet(0)

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/students', methods=['GET'])
def get_students():
    """Get list of all student names from Google Sheet"""
    try:
        worksheet = get_sheet()
        print(f"DEBUG: Found worksheet: {worksheet.title}")
        # Get all values from column A (student names)
        all_values = worksheet.get_all_values()
        print(f"DEBUG: Total rows in sheet: {len(all_values)}")
        
        # Skip header row (row 0) and get student names from column A
        students = []
        for row in all_values[1:]:  # Skip header
            if row and row[0] and row[0].strip():  # Check if name exists
                students.append(row[0].strip())
        
        print(f"DEBUG: Found {len(students)} students")
        return jsonify({'students': students})
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/entries', methods=['GET'])
def get_entries():
    """Get all existing entries (students who have submitted)"""
    try:
        worksheet = get_sheet()
        all_values = worksheet.get_all_values()
        
        entries = []
        # Column A = Student Name, Column B = Category, Column C = Food Name
        for i, row in enumerate(all_values[1:], start=2):  # Skip header, start row count at 2
            if len(row) >= 3 and row[1] and row[2]:  # If both category and food name exist
                entries.append({
                    'student': row[0].strip() if row[0] else '',
                    'category': row[1].strip(),
                    'food_name': row[2].strip(),
                    'row_index': i
                })
        
        return jsonify({'entries': entries})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def format_proper_name(text):
    """Format text in Proper Name format (Title Case)"""
    if not text:
        return ''
    return ' '.join(word.capitalize() for word in text.split())

@app.route('/api/submit', methods=['POST'])
def submit_entry():
    """Submit a new food entry"""
    try:
        data = request.json
        student = data.get('student')
        category = data.get('category')
        food_name = data.get('food_name')
        
        if not all([student, category, food_name]):
            return jsonify({'error': 'All fields are required'}), 400
        
        # Format food name in Proper Name format
        food_name = format_proper_name(food_name)
        
        worksheet = get_sheet()
        all_values = worksheet.get_all_values()
        
        # Find the student's row
        row_index = None
        for i, row in enumerate(all_values[1:], start=2):  # Skip header
            if row[0].strip() == student:
                row_index = i
                break
        
        if row_index is None:
            return jsonify({'error': 'Student not found'}), 404
        
        # Update the row with category (column B) and food name (column C)
        worksheet.update_cell(row_index, 2, category)  # Column B
        worksheet.update_cell(row_index, 3, food_name)  # Column C
        
        return jsonify({
            'success': True,
            'message': 'Entry submitted successfully',
            'entry': {
                'student': student,
                'category': category,
                'food_name': food_name
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)

