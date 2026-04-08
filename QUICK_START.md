# Quick Start - Backend & Testing Guide

## 1️⃣ Start the Backend Server

Open a PowerShell terminal and run:

```powershell
cd src/backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

## 2️⃣ Run Validation Tests

**In a NEW PowerShell terminal** (keep backend running), execute:

```powershell
cd c:\Users\202100860\Documents\Tender-Insight-Hub
.\test-api-validation.ps1
```

This script will:
- ✅ Check backend connection
- ✅ Test invalid email rejection
- ✅ Test weak password rejection
- ✅ Test XSS prevention
- ✅ Test valid registration
- ✅ Test duplicate email prevention
- ✅ Test SQL injection blocking
- ✅ Test field length limits

## 3️⃣ Test Frontend Validation

With backend running, start frontend dev server:

```powershell
cd src/frontend
npm install
npm run dev
```

Visit `http://localhost:5173` and test:

### Register Page
1. **Try invalid email**: Type `test@` and click outside field
   - **Expected**: Red error "Invalid email format"

2. **Try weak password**: Type `password` and click outside field
   - **Expected**: Error "Password must contain at least one uppercase letter"

3. **Try HTML injection**: Full Name = `<script>alert('xss')</script>`
   - **Expected**: Script tags removed before submission

4. **Try valid registration**: Fill all fields correctly
   - **Expected**: Success message, redirect to login

### Login Page
1. **Try invalid email**: `test@` → Error shown
2. **Try valid login**: Use credentials from registration
   - **Expected**: Dashboard loads

## 4️⃣ Check Server Logs

While tests run, check backend terminal for logs:

```
INFO:     POST /api/auth/register HTTP/1.1" 400 Bad Request
WARNING:  Validation error: {"detail": "Invalid input data"}
```

Details are logged server-side (not shown to client for security).

## ✅ What Success Looks Like

### Backend Running
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

### Test Script Passing
```
========================================
✓ [TEST 1] Invalid Email Format - 400 Expected
✓ [TEST 2] Weak Password - 400 Expected
✓ [TEST 3] XSS Attempt - 400 Expected
✓ [TEST 4] Valid Registration - 200 OK
...
Tests Complete!
Your API validation is production-ready! 🎉
```

### Frontend Validation Working
- Field errors appear on blur
- Validation prevents submission with errors
- Sanitized data sent to backend
- Friendly error messages shown

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check Python is installed
python --version

# Check port 8000 is free
Get-NetTcpConnection -LocalPort 8000

# If port in use, kill process
Stop-Process -Name python -Force
```

### Tests fail - connection refused
```powershell
# Verify backend is running
curl http://localhost:8000/health

# Or use PowerShell
Invoke-WebRequest http://localhost:8000/health
```

### Frontend dev server won't start
```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm node_modules -r
npm install
npm run dev
```

### Validation not working
1. Check browser console for JavaScript errors
2. Check backend logs for validation errors
3. Verify validation.js is imported in components
4. Check schemas.py has validators

## 📝 Next Steps

Once tests pass:

1. **For Development**:
   - Keep backend running in one terminal
   - Keep frontend running in another
   - Changes auto-reload

2. **For Production**:
   - Update CORS origins in `main.py` (line 36-43)
   - Uncomment HTTPS header in `main.py` (line 76)
   - Deploy with security headers enabled

3. **Optional Enhancements**:
   - Add rate limiting (see SECURITY_CONFIG.md)
   - Add request logging
   - Set up error monitoring (Sentry, etc.)

## 📚 Documentation Files

- `VALIDATION_GUIDE.md` - Complete implementation details
- `VALIDATION_TEST_CASES.md` - More test examples
- `SECURITY_CONFIG.md` - Security middleware setup
- `test-api-validation.ps1` - Automated test script

## 🎯 Success Criteria

✅ You know validation is working when:
- Invalid emails are rejected at both frontend & backend
- Weak passwords show helpful error messages
- XSS attempts are sanitized/blocked
- SQL injection attempts are rejected
- API returns safe error messages
- Frontend shows field-level validation errors
- Tests pass consistently

**You're ready to deploy! 🚀**
