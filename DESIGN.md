# Tender Insight Hub – System Design

## Overview

Tender Insight Hub is a SaaS platform for teams and companies to manage, search, and analyze tenders with AI-powered insights. The system is designed for scalability, security, and extensibility.

---

## Architecture

- **Frontend:** React + Vite
  - Modern UI, responsive design, Material UI, custom themes.
  - Routing via React Router.
  - State management with Context API (Auth, Plan).
  - API communication via Axios.

- **Backend:** FastAPI + PostgreSQL
  - Async REST API endpoints.
  - SQLAlchemy ORM, Alembic migrations.
  - JWT authentication.
  - Service layer for business logic.
  - AI-powered document summarization and scoring.

- **Database:** PostgreSQL (production), SQLite (dev)
  - Alembic for migrations.
  - Models for users, teams, companies, tenders, invitations.

---

## Key Modules

### Frontend

- `src/frontend/src/components`: Reusable UI components.
- `src/frontend/src/pages`: Main app pages (Dashboard, PlanManagement, Register, etc.).
- `src/frontend/src/context`: Auth and Plan context providers.
- `src/frontend/src/utils`: API wrapper, analytics.

### Backend

- `src/backend/app/api/endpoints`: API routes (auth, tenders, teams, etc.).
- `src/backend/app/models`: SQLAlchemy models.
- `src/backend/app/services`: Business logic, AI services.
- `src/backend/app/utils`: Helper functions.

---

## Data Flow

1. **User Authentication**
	- Register/Login via frontend forms.
	- Backend issues JWT tokens.
	- Frontend stores token, manages session.

2. **Tender Search & Analysis**
	- User searches tenders.
	- Backend fetches and summarizes documents using AI.
	- Readiness scoring calculated and returned.

3. **Team & Company Management**
	- Users create teams, invite members.
	- Company profiles managed via dedicated endpoints.

4. **Plan Enforcement**
	- Features gated by SaaS plan (Free, Basic, Pro).
	- PlanContext in frontend, plan checks in backend.

---

## Error Handling

- Custom error messages for registration, login, and API failures.
- Frontend surfaces backend error details.
- Backend validates unique constraints before DB commit.

---

## Extensibility

- Modular service layer for business logic.
- Easy to add new endpoints, models, or frontend pages.
- AI services can be extended for new document types or scoring logic.

---

## Security

- JWT-based authentication.
- Secure password hashing.
- Role-based access for team/company features.

---

## Deployment

- Frontend: Vite build, static hosting.
- Backend: Uvicorn server, Docker-ready.
- Database: PostgreSQL recommended for production.

---

## References

- See `README.md` for setup instructions.
- See `TEAM.md` for contributor information.

---
