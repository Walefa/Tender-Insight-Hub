# Tender Insight Hub Backend

A FastAPI-based backend for a SaaS tender management platform supporting team workspaces, company profiles, tender search, AI document summarization, readiness scoring, SaaS plan restrictions, team member management, and invitations.

## Features
- User registration, login, JWT authentication
- Team and company profile management
- Tender search and AI-powered document summarization
- Readiness scoring for tenders
- SaaS plan enforcement (free, basic, pro)
- Team member management (invite, remove, list)
- Invitation system with email support
- Workspace for tracking tenders
- OpenAPI/Swagger docs at `/docs`

## Requirements
- Python 3.10+
- PostgreSQL database
- (Optional) Docker & Docker Compose

## Setup

### 1. Clone the repository
```
git clone <repo-url>
cd tender-insight-hub
```

### 2. Create and activate a virtual environment
```
python -m venv venv
.\venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

### 3. Install dependencies
```
pip install -r requirements.txt
```

### 4. Configure environment variables
Create a `.env` file with your database URL and secret key:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/dbname
SECRET_KEY=your-secret-key
```

### 5. Run database migrations
```
alembic upgrade head
```

### 6. Start the backend server
```
uvicorn app.main:app --reload
```

## API Usage
- Visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API docs.
- Authenticate by registering and logging in to get a JWT token, then use the `Authorize` button in Swagger UI or add the token to the `Authorization: Bearer <token>` header in your requests.

## Key Endpoints
- `POST /auth/register` — Register a new user and team
- `POST /auth/login` — Login and get JWT token
- `GET/POST/PUT /api/company-profile` — Manage company profile
- `POST /api/team/invitations` — Invite a team member
- `POST /api/team/invitations/accept` — Accept an invitation
- `GET /api/team/members` — List team members
- `DELETE /api/team/members/{user_id}` — Remove a team member
- `POST /api/summary/extract` — AI document summarization
- `POST /api/readiness-check` — Readiness scoring
- `POST /api/search` — Tender search

## SaaS Plan Logic
- Free plan: Limited features (no AI, no readiness check, limited search)
- Basic/Pro plans: Full access

## Development
- Code is organized in the `app/` directory by feature (api, models, schemas, crud, services, utils).
- Alembic is used for migrations (`alembic/` directory).

## License
MIT
