# Validation Testing Examples

## Quick Test Cases

### Frontend Registration Validation

#### Test 1: Invalid Email
- **Input**: `test@`
- **Expected**: Email error message shown
- **Visual**: Red border on email field, error text below

#### Test 2: Weak Password
- **Input**: `password`
- **Expected**: Password error (missing uppercase, number, special char)
- **Visual**: Helper text shows requirements

#### Test 3: Valid Password
- **Input**: `MyPassword123!`
- **Expected**: No error, form ready to submit
- **Visual**: Green checkmark (or no error state)

#### Test 4: XSS Attempt
- **Input**: Full Name = `<script>alert('xss')</script>`
- **Expected**: Script tags removed, sanitized to `alert('xss')`
- **Visual**: Field shows sanitized text

#### Test 5: Long Team Name
- **Input**: Team Name = "A" × 200 characters
- **Expected**: Field accepts up to ~100 chars, further input ignored or rejected at API
- **Visual**: Field respects maxLength

---

### Backend API Validation

#### Test 6: Invalid Email Format
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "invalid-email",
      "full_name": "Test User",
      "password": "MyPassword123!"
    },
    "team_name": "My Team"
  }'
```
**Expected Response**: 
```json
{
  "detail": "Invalid input data"
}
```
**Status**: 400 Bad Request

---

#### Test 7: Weak Password
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "test@example.com",
      "full_name": "Test User",
      "password": "weak"
    },
    "team_name": "My Team"
  }'
```
**Expected Response**: 
```json
{
  "detail": "Invalid input data"
}
```
**Status**: 400 Bad Request
**Server Log**: "Password must contain at least one uppercase letter"

---

#### Test 8: SQL Injection Attempt
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "test@example.com",
      "full_name": "\"; DROP TABLE users; --",
      "password": "MyPassword123!"
    },
    "team_name": "My Team"
  }'
```
**Expected Response**: 
```json
{
  "detail": "Invalid input data"
}
```
**Status**: 400 Bad Request
**Why Safe**: Pydantic validates format, SQLAlchemy uses parameterized queries

---

#### Test 9: Valid Registration
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "user_data": {
      "email": "newuser@example.com",
      "full_name": "John Smith",
      "password": "MyPassword123!"
    },
    "team_name": "My Team"
  }'
```
**Expected Response**: 
```json
{
  "id": 1,
  "email": "newuser@example.com",
  "full_name": "John Smith",
  "is_active": true,
  "created_at": "2026-04-09T12:00:00Z"
}
```
**Status**: 200 OK

---

#### Test 10: Login Validation
```bash
# Sanitizes email to lowercase
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=NewUser@Example.COM&password=MyPassword123!'
```
**Backend Action**: 
1. Sanitizes `NewUser@Example.COM` → `newuser@example.com`
2. Looks up user with sanitized email
3. Verifies password matches

**Expected Response**: Token issued or "Incorrect email or password"

---

### Frontend Company Profile Validation

#### Test 11: Invalid Industry Sector
- **Input**: Industry Sector = `Tech & Media (2024)`
- **Expected**: Error message (special chars not allowed)
- **Validation Rule**: Only letters, spaces, hyphens

#### Test 12: Valid Company Profile
- **Input**: 
  - Company Name: `ACME Corporation`
  - Industry Sector: `Software Development`
  - Years Experience: `15`
  - Services: `Consulting, Development`
- **Expected**: Form submits successfully

#### Test 13: Invalid Years Experience
- **Input**: Years Experience = `-5`
- **Expected**: Error (must be 0-100)
- **Validation Rule**: `ge=0, le=100`

---

### Frontend Login Validation

#### Test 14: Email Blur Validation
1. Focus on email field
2. Type: `invalid`
3. Click outside (blur)
4. **Expected**: Error message "Please enter a valid email address"

#### Test 15: Successful Login
1. Email: `newuser@example.com`
2. Password: `MyPassword123!`
3. Click Login
4. **Expected**: Redirected to dashboard

#### Test 16: Failed Login
1. Email: `newuser@example.com`
2. Password: `wrongpassword`
3. Click Login
4. **Expected**: Error message "Incorrect email or password" (safe, non-specific)

---

## Automated Testing (Optional)

### Using Postman
1. Import API docs from `http://localhost:8000/docs`
2. Set up variables: `{{email}}`, `{{password}}`
3. Create test scripts using Postman's test runner

### Using Python
```python
import requests

BASE_URL = "http://localhost:8000/api"

# Test invalid email
response = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "user_data": {
            "email": "invalid",
            "full_name": "Test",
            "password": "MyPassword123!"
        },
        "team_name": "Team"
    }
)
assert response.status_code == 400
print("✓ Invalid email rejected")

# Test XSS
response = requests.post(
    f"{BASE_URL}/auth/register",
    json={
        "user_data": {
            "email": "test@example.com",
            "full_name": "<script>alert('xss')</script>",
            "password": "MyPassword123!"
        },
        "team_name": "Team"
    }
)
assert response.status_code == 400
print("✓ XSS attempt blocked")
```

---

## Validation Rules Reference

### Email
- Pattern: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- Max Length: 254
- Validation: RFC format

### Password
- Min Length: 8 characters
- Max Length: 128 characters
- Requires: 1 uppercase, 1 lowercase, 1 digit, 1 special char

### Full Name
- Min Length: 2 characters
- Max Length: 100 characters
- Allowed: Letters, spaces, hyphens, apostrophes
- Pattern: `^[a-zA-Z\s'-]+$`

### Team Name
- Min Length: 1 character
- Max Length: 100 characters
- Allowed: Letters, numbers, spaces, hyphens, underscores, dots
- Pattern: `^[a-zA-Z0-9\s\-_.]+$`

### Company Name
- Min Length: 1 character
- Max Length: 200 characters
- Allowed: Letters, numbers, spaces, hyphens, dots, ampersand, parentheses

### Industry Sector
- Min Length: 1 character
- Max Length: 100 characters
- Allowed: Letters, spaces, hyphens
- Pattern: `^[a-zA-Z\s\-]+$`

### Notes/Text Fields
- Max Length: 5000 characters
- Allowed: Any text (sanitized for XSS)

### Tender ID
- Min Length: 1 character
- Max Length: 100 characters
- Allowed: Letters, numbers, hyphens, underscores
- Pattern: `^[a-zA-Z0-9\-_]+$`

### Status
- Allowed Values: `pending`, `under_review`, `shortlisted`, `declined`, `archived`
- Enum validation

### Numeric Fields
- Range: 0-100 (default)
- Customizable per field

---

## Security Verification Checklist

- [ ] Can't register with invalid email
- [ ] Can't register with weak password
- [ ] HTML/XSS attempts are sanitized
- [ ] SQL injection attempts are rejected
- [ ] Long strings are truncated/rejected
- [ ] API returns safe error messages
- [ ] Server logs contain detailed errors
- [ ] CORS only allows expected origins
- [ ] Security headers are present in responses
- [ ] Field errors display on frontend
- [ ] Form can't submit with validation errors
- [ ] Email is sanitized (lowercased) on backend

Once all tests pass, you're ready for production! 🎉
