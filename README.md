# Jotes

A real-time collaborative note-taking and mind-mapping application with multi-user editing, permissions, and instant synchronization.

## Tech Stack

**Frontend:** React + TldDraw  
**Backend:** Flask + Flask-SocketIO  
**Database:** PostgreSQL

## Features

- 🎨 Real-time collaborative drawing and note-taking
- 👥 Multi-user editing with live cursors
- 🔒 Permission controls (read-only/edit access)
- 🔗 Share notes via invite links
- 📝 Task management integration

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python run.py
```

The backend will run on `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

### Environment Variables

Create a `.env` file in the `backend` directory:
```env
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost/dbname
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
```

## Usage

1. Sign up or log in with email/Google
2. Create a new note or task
3. Share collaboration links with others
4. Edit together in real-time

---

Built with ❤️ using React, Flask, and PostgreSQL