"""
CORS and Security Configuration for FastAPI Backend

Add this to your main.py to enable CORS with security headers
"""

# In src/backend/app/main.py, import and use these configurations:

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.gzip import GZIPMiddleware
import logging

# Initialize FastAPI app
app = FastAPI(title="Tender Insight Hub", version="1.0.0")

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# SECURITY MIDDLEWARE - Add these middleware in order
# ============================================================================

# 1. Trusted Host Middleware - Only allow requests from trusted hosts
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1", "your-domain.com", "www.your-domain.com"]
)

# 2. CORS Middleware - Control cross-origin requests
app.add_middleware(
    CORSMiddleware,
    # Allow only specific origins (update these for production)
    allow_origins=[
        "http://localhost:3000",      # Frontend dev server
        "http://localhost:5173",      # Vite dev server
        "https://your-domain.com",
        "https://www.your-domain.com"
    ],
    # Allow specific methods
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    # Allow specific headers
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ],
    # Allow credentials
    allow_credentials=True,
    # Cache preflight requests for 600 seconds
    max_age=600,
)

# 3. GZIP Middleware - Compress responses
app.add_middleware(GZIPMiddleware, minimum_size=1000)

# ============================================================================
# SECURITY HEADERS - Add custom middleware for additional headers
# ============================================================================

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Enable XSS protection (deprecated but good for legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Clickjacking protection
        response.headers["X-Frame-Options"] = "DENY"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions policy (formerly Feature-Policy)
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        # Strict Transport Security (only for HTTPS)
        # Uncomment for production with HTTPS
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        return response

app.add_middleware(SecurityHeadersMiddleware)

# ============================================================================
# REQUEST SIZE LIMITS - Prevent large payload attacks
# ============================================================================

# Set maximum request body size (in bytes) - adjust as needed
MAX_REQUEST_SIZE = 5 * 1024 * 1024  # 5 MB

# This can be configured in FastAPI using RequestValidationError handling
# or by using middleware to check content-length header

# ============================================================================
# API RATE LIMITING (Optional - requires slowapi)
# ============================================================================

# Install: pip install slowapi
# Uncomment to use:

# from slowapi import Limiter
# from slowapi.util import get_remote_address
# from slowapi.errors import RateLimitExceeded
# from fastapi.responses import JSONResponse

# limiter = Limiter(key_func=get_remote_address)
# app.state.limiter = limiter
# app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Then use @limiter.limit("10/minute") on endpoints

# ============================================================================
# ERROR HANDLING - Return safer error messages
# ============================================================================

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=400,
        content={"detail": "Invalid input data"}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle uncaught exceptions - log details but return generic message"""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred"}
    )

# ============================================================================
# USAGE INSTRUCTIONS
# ============================================================================

"""
1. Place this code in your src/backend/app/main.py before importing routes

2. Update allowed_origins for production:
   - Remove localhost entries
   - Add your actual domain(s)
   - Use HTTPS URLs only in production

3. For HTTPS/TLS:
   - Uncomment the Strict-Transport-Security header
   - Ensure your domain uses HTTPS

4. Set environment-specific configs:
   - Development: Allow localhost
   - Production: Only allow your domain
   - Staging: Allow staging domain

5. Request size limits can be adjusted:
   - MAX_REQUEST_SIZE = 1 * 1024 * 1024  # 1 MB for stricter control
   - MAX_REQUEST_SIZE = 10 * 1024 * 1024  # 10 MB for larger uploads

6. For rate limiting (optional):
   - Install: pip install slowapi
   - Uncomment the rate limiting code
   - Apply @limiter.limit decorators to endpoints

7. Example endpoint with rate limiting:
   @app.get("/api/search", response_model=List[dict])
   @limiter.limit("10/minute")
   async def search(request: Request, keyword: str):
       # Your code here
       pass
"""
