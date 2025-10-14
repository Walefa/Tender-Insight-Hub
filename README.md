# Tender Insight Hub

Tender Insight Hub is a SaaS platform for managing tenders, designed for teams and companies to search, analyze, and collaborate on tender opportunities with AI-powered insights.

## Features

 - **User Authentication**: Secure JWT-based login and registration.
 - **Team & Company Management**: Create teams, invite members, manage company profiles.
 - **Tender Search**: Search tenders with advanced filters and AI-powered document summarization.
 - **Readiness Scoring**: Automated scoring to assess your team's readiness for each tender.
 - **Plan Enforcement**: SaaS plans (Free, Basic, Pro) with feature gating.
 - **Activity Feed**: Track team actions and tender updates.

## Architecture

 - **Frontend**: React + Vite
	 - Located in `src/frontend`
	 - Modern UI with Material UI, custom themes, and responsive design
 - **Backend**: FastAPI + PostgreSQL
	 - Located in `src/backend`
	 - Async API endpoints, SQLAlchemy ORM, Alembic migrations
 - **AI Services**: Document summarization and scoring in `src/backend/app/services/ai_service.py`

## Directory Structure

 - `src/frontend`: React app (UI, pages, components, context)
 - `src/backend`: FastAPI app (API, models, services, migrations)
 - `src/backend/app/api/endpoints`: API routes
 - `src/backend/app/models`: Database models
 - `src/backend/app/services`: Business logic & AI
 - `src/backend/app/utils`: Utility functions

## Getting Started

### Prerequisites
 - Node.js & npm (for frontend)
 - Python 3.10+ & pip (for backend)
 - PostgreSQL (production) or SQLite (dev)

### Frontend Setup
```powershell
cd src/frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

### Backend Setup
```powershell
cd src/backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
API docs: `http://localhost:8000/docs`

### Database Migrations
```powershell
cd src/backend
alembic upgrade head
```

### Running Tests
 - Backend: `pytest src/backend/tests`
 - Frontend: (manual, no framework specified)

## Environment Variables

Create a `.env` file in `src/backend` with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/tender_db
SECRET_KEY=your_secret_key
```

## Contributing

1. Fork the repo and create a feature branch.
2. Follow code style and commit conventions.
3. Submit a pull request with a clear description.

## License

MIT License. See `LICENSE` for details.

---
For more details, see [DESIGN.md](DESIGN.md) and [TEAM.md](TEAM.md).
# Tender Insight Hub

