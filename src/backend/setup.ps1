# setup.ps1 - Windows Setup Script for Tender Insight Hub

Write-Host "Setting up Tender Insight Hub on Windows..." -ForegroundColor Green

# Check if Python is installed
$pythonVersion = python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Python is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "Python version: $pythonVersion" -ForegroundColor Green

# Create virtual environment
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
python -m venv venv

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
.\venv\Scripts\Activate

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

# Create necessary directories
Write-Host "Creating project structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "app"
New-Item -ItemType Directory -Force -Path "app/core"
New-Item -ItemType Directory -Force -Path "app/models"
New-Item -ItemType Directory -Force -Path "app/schemas"
New-Item -ItemType Directory -Force -Path "app/crud"
New-Item -ItemType Directory -Force -Path "app/api"
New-Item -ItemType Directory -Force -Path "app/api/endpoints"
New-Item -ItemType Directory -Force -Path "app/services"
New-Item -ItemType Directory -Force -Path "app/utils"
New-Item -ItemType Directory -Force -Path "tests"
New-Item -ItemType Directory -Force -Path "alembic"
New-Item -ItemType Directory -Force -Path "alembic/versions"

# Create .env file
Write-Host "Creating environment file..." -ForegroundColor Yellow
@"
# Database
SQL_DATABASE_URL=postgresql+asyncpg://postgres:password@localhost/tender_hub
MONGODB_URL=mongodb://localhost:27017

# Security
SECRET_KEY=your-super-secret-key-change-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
OCDS_API_URL=https://api.etenders.gov.za/api/ocds
HUGGINGFACE_API_KEY=your-huggingface-key-optional

# Application
PROJECT_NAME=Tender Insight Hub
VERSION=1.0.0
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Setup completed successfully!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Install Docker Desktop and start it" -ForegroundColor White
Write-Host "2. Run: docker-compose up -d" -ForegroundColor White
Write-Host "3. Run: python -m alembic upgrade head" -ForegroundColor White
Write-Host "4. Run: uvicorn app.main:app --reload" -ForegroundColor White