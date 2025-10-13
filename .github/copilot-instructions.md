# Copilot Instructions for Tender Insight Hub

Welcome to the Tender Insight Hub codebase! This document provides essential guidelines for AI coding agents to be productive in this project. Below, you'll find an overview of the architecture, workflows, and conventions.

## Project Overview

Tender Insight Hub is a SaaS platform for managing tenders, featuring:
- **Frontend**: React + Vite for the user interface.
- **Backend**: FastAPI for APIs, PostgreSQL for data storage.
- **Key Features**:
  - User authentication (JWT-based).
  - Team and company management.
  - Tender search and AI-powered document summarization.
  - Readiness scoring for tenders.
  - SaaS plan enforcement (free, basic, pro).

### Key Directories
- **Frontend**: `src/frontend`
  - Entry point: `src/frontend/src/main.jsx`
  - Components: `src/frontend/src/components`
  - Pages: `src/frontend/src/pages`
  - Utilities: `src/frontend/src/utils`
- **Backend**: `src/backend`
  - API Endpoints: `src/backend/app/api/endpoints`
  - Database Models: `src/backend/app/models`
  - Services: `src/backend/app/services`
  - Utilities: `src/backend/app/utils`

## Developer Workflows

### Frontend
1. **Install dependencies**:
   ```powershell
   npm install
   ```
2. **Run the development server**:
   ```powershell
   npm run dev
   ```
   If `vite` is not recognized, ensure it is installed globally or locally in `node_modules/.bin`.
3. **Build for production**:
   ```powershell
   npm run build
   ```

### Backend
1. **Setup virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. **Install dependencies**:
   ```powershell
   pip install -r requirements.txt
   ```
3. **Run the server**:
   ```powershell
   uvicorn app.main:app --reload
   ```
4. **Run tests**:
   ```powershell
   pytest
   ```

## Project-Specific Conventions

### Backend
- **API Documentation**: OpenAPI/Swagger available at `/docs`.
- **Database Migrations**: Managed with Alembic. Migration scripts are in `src/backend/alembic/versions`.
- **Service Layer**: Business logic resides in `src/backend/app/services`.

### Frontend
- **Routing**: Managed with React Router in `src/frontend/src/main.jsx`.
- **State Management**: Context API is used for authentication and plan management.
- **Styling**: CSS modules and `App.css`.

## Integration Points
- **Frontend-Backend Communication**: REST API endpoints are defined in `src/backend/app/api/endpoints`.
- **Database**: PostgreSQL, configured in `src/backend/app/core/database.py`.
- **AI Services**: Document summarization and scoring logic in `src/backend/app/services/ai_service.py`.

## External Dependencies
- **Frontend**:
  - React, Vite, React Router.
- **Backend**:
  - FastAPI, SQLAlchemy, Alembic.
- **Testing**:
  - `pytest` for backend, no specific framework for frontend tests.

---

Feel free to update this document as the project evolves!