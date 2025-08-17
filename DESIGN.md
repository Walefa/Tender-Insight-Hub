

# System Design


## Architecture


## Core Services

1. **User Management**
   - Authentication & team management
   - SaaS tier restrictions
   - PostgreSQL storage

2. **Tender Processing**  
   - OCDS eTenders API integration
   - Search/filter/rank functionality
   - PostgreSQL storage

3. **AI Processing**
   - Document extraction (PyPDF2/pdfminer)
   - Summarization (HuggingFace BART/T5)
   - Readiness scoring
   - MongoDB storage

## Database Schema

### PostgreSQL
- `users`, `teams`, `profiles`, `tenders`, `workspaces`

### MongoDB  
- `summaries`, `scores`, `activity_logs`, `cached_analytics`

## API Endpoints

### Public
- `GET /api/enriched-releases`
- `GET /api/analytics/spend-by-buyer`  
- `POST /api/summary/extract`
- `POST /api/readiness/check`

### Internal
- User auth
- Tender search  
- Workspace ops
- AI queue mgmt

## AI Pipeline

1. **Extraction**:
   - PDF/DOCX/ZIP processing

2. **Summarization**:
   - 120-word summaries
   - Key aspects: scope, deadline, criteria

3. **Scoring**:
   - Rule-based profile matching
   - NLP semantic matching
   - Checklist & recommendations

## Security
- JWT authentication  
- Role-based access
- Input validation
- CORS
- Rate limiting

## Deployment
- Docker containers
- GitHub Actions CI/CD
- Scalable backend
- Static frontend
