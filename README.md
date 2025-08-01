![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.68.0-green.svg)
![React](https://img.shields.io/badge/react-17.0.2-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

# Tender Insight Hub

A cloud-native SaaS platform designed to assist South African SMEs in navigating public procurement opportunities.

![Tender Insight Hub Logo](https://placeholder.com/logo.png)  <!-- Add actual logo later -->

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [Team Structure](#team-structure)
- [Development Process](#development-process)
- [License](#license)

- ## Features

### Core Functionality
- **AI-Powered Tender Search**: NLP-enhanced search with keyword matching and filtering
- **Company Profile System**: Comprehensive profile management for readiness scoring
- **Document Summarization**: AI-generated plain-language summaries of tender documents
- **Readiness Scoring**: Automated suitability assessment with detailed criteria matching
- **Collaborative Workspace**: Team-based tender tracking with status management

### API Endpoints
- Public API for third-party integration (OpenAPI/Swagger documentation)
- AI summarization and readiness check endpoints
- Analytics endpoints for government spending data

### SaaS Features
- Multi-tenant architecture with tiered access
- Team-based collaboration tools
- Plan-based feature restrictions

- ## Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: 
  - SQL: PostgreSQL (for structured data)
  - NoSQL: MongoDB (for unstructured data and logs)
- **Authentication**: JWT with OAuth2
- **AI Integration**: HuggingFace Transformers (open-source models)

### Frontend
- React.js with TypeScript
- Material-UI component library
- Chart.js for analytics visualization

### DevOps
- GitHub Actions for CI/CD
- Docker for containerization
- AWS EC2 for deployment (or alternative cloud provider)

- ## Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- Docker (optional)
- PostgreSQL and MongoDB instances

### Backend Setup
```bash
# Clone repository
git clone https://github.com/your-team/tender-insight-hub.git
cd tender-insight-hub/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload

cd ../frontend
npm install
npm start

docker-compose up --build

```
## API Documentation

```markdown


Our API follows OpenAPI 3.0 specification. Interactive documentation is available when running the backend at:

`http://localhost:8000/docs`

Key endpoints:
- `GET /api/enriched-releases` - Filtered tenders with metadata
- `GET /api/analytics/spend-by-buyer` - Government spending analytics
- `POST /api/summary/extract` - Document summarization endpoint
- `POST /api/readiness/check` - Tender suitability assessmentmarkdown
```
## Team Structure

Our team of 6 follows an agile development process with rotating leadership:

| Name            | Primary Role          | Lead Weeks  |
|-----------------|-----------------------|-------------|
| Team Member 1   | Backend Development   | Sprint 1    |
| Team Member 2   | Frontend Development  | Sprint 2    |
| Team Member 3   | Database Design       | Sprint 3    |
| Team Member 4   | AI Integration        | Sprint 4    |
| Team Member 5   | DevOps & Security     | Sprint 5    |
| Team Member 6   | QA & Documentation    | Sprint 6    |

## Development Process

### Version Control
- Feature branches with pull requests
- Conventional commits
- Weekly sprint reviews

### CI/CD Pipeline
- Automated testing on push
- Linting with flake8 (Python) and ESLint (JavaScript)
- Deployment to staging on merge to main

### AI Integration Approach
1. Document processing with PyPDF2 and python-docx
2. Text extraction and cleaning
3. Summarization with HuggingFace's DistilBART model
4. Readiness scoring with custom algorithm based on profile matching

## Team Lead Reports

Each sprint lead will add their report here:

### Sprint 1 Report - [Team Member 1]
**Key Decisions:**
- Chose FastAPI over Flask for better async support
- Established database schema for user management

**Challenges:**
- Initial JWT implementation issues
- Resolved with better token refresh strategy

**Reflections:**
- Need clearer task breakdowns for complex features
- Improved our daily standup format

... [Additional sprint reports to be added]

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
