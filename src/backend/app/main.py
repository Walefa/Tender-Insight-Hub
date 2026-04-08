from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
# from starlette.middleware.gzip import GZIPMiddleware  # GZIPMiddleware not available in current Starlette version
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from pydantic import ValidationError
from app.api.endpoints import auth, companies, tenders, public, workspace, users, invitations, team
from app.core.database import engine
from app.models.sql_models import Base
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Tender Insight Hub",
    version="1.0.0",
    description="University Project - Tender Management System"
)

# ============================================================================
# SECURITY MIDDLEWARE - Add in order
# ============================================================================

# 1. Trusted Host Middleware - Only allow requests from trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "*.localhost", "your-domain.com"]
)

# 2. CORS Middleware - Control cross-origin requests with strict settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Frontend dev
        "http://localhost:5173",      # Vite dev
        "http://localhost:5174",      # Alternative Vite port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        # Production URLs - uncomment and update
        # "https://your-domain.com",
        # "https://www.your-domain.com",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    max_age=600,  # Cache preflight for 600 seconds
)

# 3. GZIP Middleware - Compress responses
# app.add_middleware(GZIPMiddleware, minimum_size=1000)  # GZIPMiddleware not available in current Starlette version

# ============================================================================
# CUSTOM SECURITY HEADERS MIDDLEWARE
# ============================================================================

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses"""
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS protection (legacy but good for older browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Clickjacking protection
        response.headers["X-Frame-Options"] = "DENY"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ============================================================================
# EXCEPTION HANDLERS - Return safe error messages
# ============================================================================

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors with safe message"""
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid input data"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions - log details but return generic message"""
    logger.error(f"Unexpected error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )

# Register all routers for full OpenAPI docs
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(companies.router, prefix="/api", tags=["Company Profile"])
app.include_router(tenders.router, prefix="/api", tags=["Tenders"])
app.include_router(public.router, prefix="/api", tags=["Public"])
app.include_router(workspace.router, prefix="/api", tags=["Workspace"])
app.include_router(users.router, prefix="/api", tags=["Team Members"])
app.include_router(invitations.router, prefix="/api", tags=["Invitations"])
app.include_router(team.router, prefix="/api/team", tags=["Team Plan"])

@app.on_event("startup")
async def on_startup() -> None:
    # Auto-create tables for local/dev environments (SQLite) to simplify setup
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        # Avoid crashing the app if migrations are managed elsewhere
        print(f"[startup] Database initialization skipped/failed: {e}")

@app.get("/")
async def root():
    return {"status": "success", "message": "Tender Insight Hub API is running!", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "SQLite", "ai_services": "disabled"}

@app.get("/api/test")
async def test_endpoint():
    return {"message": "API endpoint working", "features": ["Authentication", "Tender Search", "AI Summarization"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
