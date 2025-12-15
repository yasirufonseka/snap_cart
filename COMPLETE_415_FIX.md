# HTTP 415 Error - Complete Fix Guide

## Changes Made

### 1. ✅ Controller.java - Added Content Type Handling
- Updated `@PostMapping` for `SaveProduct` endpoint
- Added `consumes = "application/json"` and `produces = "application/json"`
- Applied to all POST endpoints (CreateUser, login, SaveProduct)

### 2. ✅ WebConfig.java - Added Spring Configuration
- Created new `WebConfig.java` class for proper content negotiation
- Configured CORS for all `/api/**` endpoints
- Set default content type to JSON
- Added Jackson HTTP message converter

### 3. ✅ application.properties - Fixed Configuration
- Fixed MongoDB URI property (was using `>` instead of `=`)
- Added HTTP encoding settings
- Added Jackson configuration

## CRITICAL: Restart Backend

**You MUST completely restart the backend for these changes to take effect:**

### Option 1: Kill and Restart (Recommended)
```powershell
# In your backend terminal, press Ctrl+C to stop the running process
Ctrl+C

# Wait for it to fully stop (you should see "stopped" message)

# Then restart
cd Backend/SnapCart
./mvnw spring-boot:run
```

### Option 2: Maven Clean Build
```powershell
cd Backend/SnapCart
./mvnw clean package -DskipTests
./mvnw spring-boot:run
```

### Option 3: Check if Backend is Running Correctly
```powershell
# Kill any Java processes
Get-Process java -ErrorAction SilentlyContinue | Stop-Process -Force

# Start fresh
cd Backend/SnapCart
./mvnw spring-boot:run
```

## Verify Backend Started Successfully

Look for these messages in your terminal:
```
...
INFO ... - Started SnapCartApplication
Tomcat started on port(s): 8080 (http)
```

If you see errors, your pom.xml or configuration is wrong.

## Test the Fix

### Using Thunder Client
1. Create POST request to `http://localhost:8080/api/SaveProduct`
2. Set body to JSON with product data
3. Send request
4. Should get 200 OK (not 415)

### Using Frontend
1. Navigate to Dashboard or Seller page
2. Create a product
3. Check browser console
4. Should show success, not error

## Troubleshooting

### Still Getting 415 Error
1. Make sure backend is completely restarted
2. Check backend console for startup errors
3. Verify `WebConfig.java` is in the correct package: `com.example.SnapCart.config`
4. Check Spring Boot logs for: `Registering message converters`

### Backend Won't Start
1. Check for Java compilation errors in terminal
2. Verify pom.xml is valid
3. Try: `./mvnw clean install`
4. Check MongoDB is running if needed

### Error: "WebConfig not found"
- Make sure the file is at: `Backend/SnapCart/src/main/java/com/example/SnapCart/config/WebConfig.java`
- Package must be exactly: `com.example.SnapCart.config`

## Files Modified

- ✅ `Backend/SnapCart/src/main/java/com/example/SnapCart/controller/Controller.java`
- ✅ `Backend/SnapCart/src/main/java/com/example/SnapCart/config/WebConfig.java` (NEW)
- ✅ `Backend/SnapCart/src/main/resources/application.properties`

## What Should Happen

After proper restart:
1. ✓ Backend starts with message about registering message converters
2. ✓ POST requests to `/api/SaveProduct` return 200, not 415
3. ✓ Products are created and appear in the database
4. ✓ Frontend can create, read, update, delete products

## Still Not Working?

Run these diagnostic commands:

```bash
# Check if backend is listening on port 8080
netstat -ano | findstr :8080

# Test with curl (Windows - use WSL or Git Bash)
curl -X POST http://localhost:8080/api/SaveProduct \
  -H "Content-Type: application/json" \
  -d '{"brand":"Test","price":100}'

# Or with PowerShell
$body = @{
    brand = "Test"
    items = "Shoes"
    price = 100
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8080/api/SaveProduct" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

---

**After restarting and testing, report back with:**
- Backend startup message
- Response status when posting product
- Any error messages
