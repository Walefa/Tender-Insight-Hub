from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
import logging
from app.api.endpoints import auth, companies, tenders, public, workspace, users, invitations, team
from pydantic import BaseModel


app = FastAPI(
    title="Tender Insight Hub",
    version="1.0.0",
    description="University Project - Tender Management System"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific origins if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers for full OpenAPI docs
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    try:
        body = await request.body()
        body_content = body.decode() if hasattr(body, 'decode') else str(body)
    except Exception:
        body_content = "Unable to retrieve body (client disconnected or other issue)"

    logging.error(f"Validation error for request {request.url}: {exc.errors()} | Body: {body_content}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body_content},
    )

# Register all routers for full OpenAPI docs
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(companies.router, prefix="/api", tags=["Company Profile"])
app.include_router(tenders.router, prefix="/api", tags=["Tenders"])
app.include_router(public.router, prefix="/api", tags=["Public"])
app.include_router(workspace.router, prefix="/api", tags=["Workspace"])
app.include_router(users.router, prefix="/api", tags=["Team Members"])
app.include_router(invitations.router, prefix="/api", tags=["Invitations"])
app.include_router(team.router, prefix="/api/team", tags=["Team Plan"])


class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

@app.get("/", response_model=HealthResponse)
async def root():
    return {
        "status": "success", 
        "message": "Tender Insight Hub API is running!",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "SQLite", "ai_services": "disabled"}

@app.get("/api/test")
async def test_endpoint():
    return {"message": "API endpoint working", "features": ["Authentication", "Tender Search", "AI Summarization"]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
