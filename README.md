# Grade 5 Food Collection Tracker

A beautiful web app for tracking student food contributions for the Grade 5 potluck event, connected to Google Sheets.

## Features

- 🍽️ Add viands with category selection and food name
- 👨‍🎓 Student name dropdown (populated from Google Sheet)
- 📊 Real-time display of existing entries
- 🎨 Beautiful purple/green gradient design
- 🔄 Auto-refresh every 10 seconds
- ☁️ Direct Google Sheets integration

## Setup Instructions

### 1. Install Python Dependencies

First, create a virtual environment and install packages:

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
# Mac/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Google Sheets API

You need to create a Google Cloud project and enable the Google Sheets API:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Enable APIs and Services"
   - Search for "Google Sheets API"
   - Click "Enable"
4. Create a **Service Account**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and click "Create"
   - Skip optional steps and click "Done"
5. Create a **Service Account Key**:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key"
   - Choose "JSON" format
   - Click "Create" - this downloads a JSON file
6. **Rename the downloaded file to `credentials.json`** and place it in the project root folder

### 3. Share Your Google Sheet

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1nqJ3dcg5H1-dp6ZmA6RLU_yVID0E920ZhCRRBgqMWIE/edit
2. Click "Share" button (top right)
3. Copy the email address from your `credentials.json` file (it looks like: `project-name@project-id.iam.gserviceaccount.com`)
4. Paste it in the share dialog and give it "Editor" access
5. Click "Share"

### 4. Run the Application

```bash
# Make sure virtual environment is activated
python app.py
```

The app will start at: **http://localhost:5000**

Open this URL in your browser to use the app!

## How It Works

- **Backend (Flask)**: Handles Google Sheets connection and API endpoints
- **Frontend (HTML/CSS/JS)**: Beautiful form and real-time entry display
- **Google Sheets Integration**: Reads student names from Column A, writes Category to Column B and Food Name to Column C

## File Structure

```
Grade5WepApp/
├── app.py                 # Flask backend server
├── templates/
│   └── index.html        # Main web page
├── static/
│   ├── styles.css        # Purple/green gradient styling
│   └── script.js         # Real-time updates and form handling
├── credentials.json      # Google Sheets API credentials (DO NOT COMMIT!)
├── requirements.txt      # Python dependencies
├── .env                  # Environment variables
├── .gitignore           # Protects sensitive files
└── README.md            # This file
```

## Troubleshooting

**"Error loading student names"**
- Check that `credentials.json` exists in the project root
- Verify you've shared the Google Sheet with the service account email
- Make sure the Google Sheets API is enabled

**"Student not found"**
- Make sure the student name in the sheet matches exactly (including spaces)
- Check that Column A has the student names

**"Module not found"**
- Make sure virtual environment is activated
- Run `pip install -r requirements.txt`

## Security Notes

- `credentials.json` contains sensitive information - NEVER commit to git
- `.gitignore` is configured to protect your credentials
- Only share the Google Sheet with the service account (not publicly)

