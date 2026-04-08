# Input Validation & Sanitization Implementation Guide

## Overview
This guide documents the comprehensive input validation and sanitization implementation across the Tender Insight Hub application.

## Components Implemented

### 1. Frontend Validation Utilities
**File**: `src/frontend/src/utils/validation.js`

#### Key Features:
- String sanitization (removes HTML, XSS attempts)
- Email validation and sanitization
- Password strength validation
- Full name, team name, and company name validation
- Numeric validation with range checking
- Array and dictionary (object) sanitization
- Complete form validation for registration, company profile, and tender search

#### Key Functions:
```javascript
// Sanitization functions
sanitizeString(input)          // Remove HTML tags and XSS attempts
sanitizeEmail(email)           // Normalize email (lowercase, trim)
sanitizeNumber(input)          // Convert to number, validate type
sanitizeArray(arr)             // Sanitize each array element
sanitizeDictionary(dict)       // Sanitize keys and values

// Validation functions
validateEmail(email)           // Email format validation
validatePassword(password)     // Password strength (8+ chars, uppercase, lowercase, number, special)
validateFullName(fullName)     // Letters/spaces/hyphens only
validateTeamName(teamName)     // Alphanumeric and basic symbols
validateCompanyName(name)      // Company-specific validation
validateKeywords(keywords)     // Search keyword validation (max 500 chars)
validateTenderId(id)           // Tender ID format validation
validateStatus(status)         // Valid status enum check
validateNumber(value)          // Numeric range validation

// Form validators
validateRegistrationForm(data) // Validates all registration fields
validateCompanyProfileForm(data) // Validates company profile fields
validateTenderSearch(data)     // Validates search parameters
```

#### Usage Example:
```javascript
import { validateRegistrationForm, validateEmail, validatePassword } from '@/utils/validation';

// In component:
const { valid, errors, sanitized } = validateRegistrationForm({
  email: userEmail,
  password: userPassword,
  full_name: userName,
  team_name: teamName
});

if (!valid) {
  // Show errors
  console.log(errors);
} else {
  // Use sanitized data
  api.post('/auth/register', {
    user_data: {
      email: sanitized.email,
      full_name: sanitized.full_name,
      password: sanitized.password
    },
    team_name: sanitized.team_name
  });
}
```

---

### 2. Backend Sanitization Utilities
**File**: `src/backend/app/utils/sanitizer.py`

#### Key Classes:

##### InputSanitizer
Handles string, email, numeric, array, and dictionary sanitization.

**Methods:**
```python
# String sanitization
sanitize_string(value, max_length=1000, allow_html=False)
sanitize_email(value)
sanitize_number(value, min_value=None, max_value=None)
sanitize_array(value, max_length=100)
sanitize_dict(value, max_keys=50)
```

##### InputValidator
Validates inputs against regex patterns and business rules.

**Validation Methods:**
```python
validate_email(email)              # Email format
validate_password(password)        # Password strength: 8+ chars, upper, lower, digit, special
validate_full_name(name)          # Name format: letters, spaces, hyphens, apostrophes
validate_team_name(name)          # Team name format
validate_company_name(name)       # Company name format
validate_industry_sector(sector)  # Industry format
validate_tender_id(tender_id)     # Tender ID format: alphanumeric, hyphens, underscores
validate_status(status)           # Status enum validation
validate_string_length(value, min, max)      # String length check
validate_number_range(value, min, max)      # Number range check
validate_date_format(date_string, format)   # Date format validation
validate_array_contents(array, type, min, max) # Array validation
```

##### Unified Function
```python
validate_and_sanitize(value, field_type, **kwargs)
```

Handles both validation and sanitization in one call. Supported field types:
- `email`
- `password`
- `full_name`
- `team_name`
- `company_name`
- `industry`
- `tender_id`
- `status`
- `number`
- `string`
- `array`
- `dict`
- `date`

#### Usage Example:
```python
from app.utils.sanitizer import InputSanitizer, InputValidator, validate_and_sanitize

# Direct sanitization
clean_email = InputSanitizer.sanitize_email(user_input)
clean_string = InputSanitizer.sanitize_string(user_input, max_length=100)

# Validation
is_valid = InputValidator.validate_email(clean_email)

# Combined validation and sanitization
try:
    sanitized_value = validate_and_sanitize(
        user_input,
        'email',
        max_value=254
    )
except SanitizationError as e:
    logger.error(f"Invalid input: {e}")
    raise HTTPException(status_code=400, detail=str(e))
```

---

### 3. Enhanced Pydantic Schemas
**File**: `src/backend/app/schemas/schemas.py`

#### Schema Improvements:
All schemas now include:
- Field length constraints using `Field(min_length=..., max_length=...)`
- Type validation with proper Pydantic types
- Custom validators using `@validator` decorator
- Enum validation for status fields
- Regex pattern validation
- Input sanitization within validators
- Range validation for numeric fields

#### Updated Schemas:

##### UserBase & UserCreate
```python
# Constraints
email: EmailStr = Field(..., max_length=254)
full_name: str = Field(..., min_length=2, max_length=100)
password: str = Field(..., min_length=8, max_length=128)

# Validations
- Full name: letters, spaces, hyphens, apostrophes only
- Password: uppercase, lowercase, digit, special character required
```

##### CompanyProfileBase
```python
company_name: str = Field(..., min_length=1, max_length=200)
industry_sector: str = Field(..., min_length=1, max_length=100)
services_provided: List[str] = Field(default_factory=list, max_items=50)
certifications: Dict[str, Any] = Field(default_factory=dict)  # Max 20 keys
geographic_coverage: List[str] = Field(default_factory=list, max_items=50)
years_experience: int = Field(..., ge=0, le=100)

# Validations
- Company name: alphanumeric, spaces, hyphens, dots, ampersand, parentheses
- Industry: letters, spaces, hyphens only
- Each service: 1-100 characters
- Each location: 1-100 characters
- Dict values: max 500 chars per entry
```

##### TenderSearchRequest
```python
keywords: str = Field(..., min_length=1, max_length=500)
filters: Optional[Dict[str, Any]] = None

# Sanitization strips whitespace
```

##### WorkspaceItemBase
```python
tender_id: str = Field(..., min_length=1, max_length=100)
status: str = Field(default='pending')  # 'pending', 'under_review', 'shortlisted', 'declined', 'archived'
notes: Optional[str] = Field(None, max_length=5000)

# Tender ID: alphanumeric, hyphens, underscores only
# Status: enum validation
# Notes: trimmed and length checked
```

---

### 4. Enhanced API Endpoints

#### Authentication Endpoint
**File**: `src/backend/app/api/endpoints/auth.py`

**Changes:**
- Input sanitization for email, password, and names
- Validation error handling with descriptive messages
- Password validation before database operations
- Email uniqueness check with sanitized email
- Logging of validation errors (without sensitive data)
- Try-catch blocks for security

**Example:**
```python
@router.post("/register", response_model=User)
async def register(registration: RegistrationRequest, db: AsyncSession = Depends(get_db)):
    try:
        # Sanitize inputs
        sanitized_email = InputSanitizer.sanitize_email(user_data.email)
        sanitized_full_name = InputSanitizer.sanitize_string(user_data.full_name, max_length=100)
        
        # Validate
        if not InputValidator.validate_email(sanitized_email):
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Continue with sanitized data...
    except ValidationError as e:
        raise HTTPException(status_code=400, detail="Invalid input data")
```

#### Company Profile Endpoints
**File**: `src/backend/app/api/endpoints/companies.py`

**Changes:**
- Validation error handling
- Exception logging
- Database transaction rollback on errors
- Safe error messages (no internal details)

#### Workspace Endpoints
**File**: `src/backend/app/api/endpoints/workspace.py`

**Changes:**
- Validation of status and notes fields
- Tender ID format validation
- Error handling for all operations
- Logging without sensitive data

---

## Security Measures Implemented

### 1. XSS Prevention (Cross-Site Scripting)
- **Frontend**: HTML tags and JavaScript protocol handlers removed
- **Backend**: HTML escaping in sanitization
- **Pydantic**: Field constraints prevent large injections
- **Response**: Security headers prevent inline scripts

### 2. SQL Injection Prevention
- **Pydantic**: Type validation prevents malicious SQL
- **SQLAlchemy**: Parameterized queries (not used directly)
- **Validators**: Input pattern validation

### 3. Input Size Limits
- **Email**: Max 254 characters
- **Names**: Max 50-200 characters
- **Text fields**: Max 1000-5000 characters
- **Notes**: Max 5000 characters
- **Arrays**: Max 50 items
- **Dictionaries**: Max 20 key-value pairs

### 4. Format Validation
- **Email**: RFC 5322 pattern
- **Names**: Letters, spaces, hyphens, apostrophes
- **Passwords**: Required complexity (8+ chars, uppercase, lowercase, digit, special)
- **Tender ID**: Alphanumeric, hyphens, underscores
- **Status**: Enum validation

### 5. CORS & Security Headers
See `src/backend/SECURITY_CONFIG.md` for:
- CORS configuration
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- Trusted host middleware
- Request size limits (optional)
- Rate limiting (optional)

---

## Integration Steps

### For Developers

1. **Frontend Form Validation**:
   ```jsx
   import { validateRegistrationForm } from '@/utils/validation';
   
   const handleSubmit = (formData) => {
     const { valid, errors, sanitized } = validateRegistrationForm(formData);
     if (!valid) {
       setFormErrors(errors);
       return;
     }
     api.post('/auth/register', {
       user_data: {
         email: sanitized.email,
         full_name: sanitized.full_name,
         password: sanitized.password
       },
       team_name: sanitized.team_name
     });
   };
   ```

2. **Backend Security Headers**:
   - Copy code from `SECURITY_CONFIG.md` to `src/backend/app/main.py`
   - Update CORS origins for your domain
   - Test with development and production URLs

3. **Environment-Specific Configuration**:
   - Development: Allow localhost:3000, localhost:5173
   - Production: HTTPS only, your domain only
   - Staging: Your staging domain

---

## Testing Validation

### Test Cases to Verify

1. **Email Validation**:
   ```javascript
   ✓ valid@example.com → valid
   ✗ invalid.email → invalid
   ✗ test@domain → invalid
   ✗ (long email > 254 chars) → invalid
   ```

2. **Password Strength**:
   ```javascript
   ✓ Password123! → valid
   ✗ password123! → invalid (no uppercase)
   ✗ Password! → invalid (no digit)
   ✗ Password123 → invalid (no special char)
   ✗ Pass1! → invalid (too short)
   ```

3. **XSS Prevention**:
   ```javascript
   Input: "<script>alert('xss')</script>"
   Output: "alert('xss')"  // Script tags removed
   
   Input: "javascript:alert('xss')"
   Output: "alert('xss')"  // Protocol removed
   ```

4. **SQL Injection**:
   ```javascript
   Input: "'; DROP TABLE users; --"
   Output: "'; DROP TABLE users; --"  // Stored safely as string
   // Pydantic validates format, SQL is parameterized in ORM
   ```

5. **Length Validation**:
   ```javascript
   Input: "A".repeat(1000)
   Status: If max_length=100, rejected
   ```

---

## Maintenance & Updates

### Regular Security Checks
1. Review validation rules quarterly
2. Update regex patterns if new attack vectors discovered
3. Monitor error logs for validation failures
4. Keep dependencies updated (Pydantic, FastAPI, etc.)

### Adding New Validations
1. Add validation rule to appropriate utility:
   - Frontend: `src/frontend/src/utils/validation.js`
   - Backend: `src/backend/app/utils/sanitizer.py`
2. Update schemas with Field constraints and validators
3. Update endpoints to use new validation
4. Add tests for new validation
5. Document in this file

### Common Validation Patterns
```python
# Email
email: EmailStr = Field(..., max_length=254)

# Strings with length
name: str = Field(..., min_length=2, max_length=100)

# Optional fields
notes: Optional[str] = Field(None, max_length=5000)

# Numbers with range
age: int = Field(..., ge=0, le=100)

# Collections with limits
items: List[str] = Field(default_factory=list, max_items=50)
```

---

## Troubleshooting

### Validation Errors
If you see "Invalid input data" responses:
1. Check browser console for detailed errors
2. Review validation rules in `validation.js`
3. Ensure frontend sanitization matches backend patterns
4. Check server logs for specific validation failures

### CORS Errors
If you see CORS blocking:
1. Update `SECURITY_CONFIG.md` allowed_origins
2. Include your frontend URL (with protocol)
3. Test with curl: `curl -H "Origin: your-url" ...`

### Database Errors
If you see SQL-related errors:
1. Ensure Pydantic validators are running
2. Check for length violations
3. Verify enum values match database constraints

---

## References
- Pydantic Documentation: https://docs.pydantic.dev/
- OWASP Input Validation: https://cheatsheetseries.owasp.org/
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
