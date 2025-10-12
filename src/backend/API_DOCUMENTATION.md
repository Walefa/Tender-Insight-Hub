# Tender Insight Hub API Documentation

This documentation provides an overview of all available API endpoints in the Tender Insight Hub backend, generated from your FastAPI application. For interactive documentation, visit `/docs` (Swagger UI) or `/redoc` after running the backend.

---

## Root & Health

### `GET /`
- **Description:** Health check root endpoint.
- **Response:**
  - `status`: success
  - `message`: API is running
  - `version`: API version

### `GET /health`
- **Description:** Simple health check.
- **Response:**
  - `status`: healthy
  - `database`: SQLite
  - `ai_services`: disabled

### `GET /api/test`
- **Description:** Test endpoint for API features.
- **Response:**
  - `message`: API endpoint working
  - `features`: List of features

### `POST /api/search`
- **Description:** Search tenders (sample endpoint).
- **Request:**
  - `keywords`: string
- **Response:**
  - `keywords`: string
  - `results`: List of tenders

---

## Auth Endpoints (`/auth`)

### `POST /auth/register`
- **Description:** Register a new user and create a team.
- **Request:**
  - `user_data`: UserCreate
  - `team_name`: string
- **Response:** User

### `POST /auth/login`
- **Description:** Login and get access token.
- **Request:**
  - `username`: string
  - `password`: string
- **Response:** Token

---

## Tender Endpoints (`/tenders`)

### `POST /tenders/search`
- **Description:** Search tenders with keywords and filters (requires authentication).
- **Request:** TenderSearchRequest
- **Response:**
  - `tenders`: List
  - `total_count`: int
  - `search_metadata`: dict

### `GET /tenders/{tender_id}/summary`
- **Description:** Get AI summary of a tender (requires authentication, not available for free plan).
- **Response:** TenderSummary

### `POST /tenders/readiness-check`
- **Description:** Check company readiness for a tender (requires authentication, not available for free plan).
- **Request:** ReadinessCheckRequest
- **Response:** ReadinessResult

---

## Public Endpoints

### `GET /enriched-releases`
- **Description:** Public endpoint for enriched tender data.
- **Query Params:**
  - `keywords`, `province`, `buyer`
- **Response:**
  - `message`, `filters`

### `GET /analytics/spend-by-buyer`
- **Description:** Public analytics endpoint.
- **Response:**
  - `analytics`

### `POST /summary/extract`
- **Description:** Extract summary from uploaded document.
- **Request:**
  - `file`: UploadFile (.pdf, .docx, .zip)
- **Response:**
  - `summary`, `original_length`, `summary_length`

### `POST /readiness/check`
  - `tender_data`: dict
  - `company_profile`: dict


## Team Plan Endpoints (`/plan`)

### `PUT /plan`
- **Description:** Upgrade or change your team's subscription plan (requires authentication).
- **Request Body:**
  - `new_plan`: string (required, allowed values: `free`, `basic`, `pro`)
  
  Example:
  ```json
  {
    "new_plan": "pro"
  }
  ```
- **Response:**
  - `plan`: string (the updated plan)

---

## Notes
- All endpoints with `Requires authentication` need a Bearer token in the `Authorization` header.
- For full OpenAPI schema, run the backend and visit `/openapi.json`.
- For interactive docs, visit `/docs` or `/redoc` after starting the server.
