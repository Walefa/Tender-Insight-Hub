# Tender Insight Hub

![Project Logo](https://via.placeholder.com/150)

A cloud-native SaaS platform designed to assist South African SMEs in navigating public procurement opportunities.

## Project Overview

Tender Insight Hub simplifies complex tender documents, enables meaningful analysis, and helps SMEs assess their readiness to apply for tenders.

## Key Features

- Keyword search, filtering & match ranking
- Company profile management  
- AI-powered tender document summarization
- Readiness scoring and suitability checks
- Workspace & tender tracking
- Public API endpoints

## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Databases**: PostgreSQL (SQL), MongoDB (NoSQL)
- **Authentication**: JWT
- **AI**: HuggingFace Transformers/LLMs

### Frontend
- React.js
- Tailwind CSS

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- Docker

### Installation

```bash
git clone https://github.com/your-username/tender-insight-hub.git
cd tender-insight-hub

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend 
cd ../frontend
npm install
```
### Running
```bash
# Backend
cd backend
uvicorn app.main:app --reload
```
# Frontend
```bash
cd ../frontend
npm start
```
