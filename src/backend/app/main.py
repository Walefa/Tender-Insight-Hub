from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import auth, companies, tenders, public, workspace, users, invitations, team

app = FastAPI(
    title="Tender Insight Hub",
    version="1.0.0",
    description="University Project - Tender Management System"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
