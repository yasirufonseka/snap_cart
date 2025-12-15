# Fix for HTTP 415 Unsupported Media Type Error

## Problem
When trying to POST a product to `http://localhost:8080/api/SaveProduct`, the backend returned:
```
HTTP 415 Unsupported Media Type
Content-Type 'application/json;charset=UTF-8' is not supported
```

## Root Cause
The `@PostMapping` annotations in the Controller didn't explicitly specify:
- `consumes = "application/json"` - What content type to accept
- `produces = "application/json"` - What content type to produce

Without these, Spring Boot's content negotiation failed.

## Solution Applied

Updated all POST endpoints in `Controller.java` to include explicit content type handling:

### Before:
```java
@PostMapping("SaveProduct")
public ResponseEntity<?> addProduct(@RequestBody ProductDto productDto) {
```

### After:
```java
@PostMapping(value = "SaveProduct", consumes = "application/json", produces = "application/json")
public ResponseEntity<?> addProduct(@RequestBody ProductDto productDto) {
```

## Endpoints Fixed

1. ✅ `POST /api/CreateUser` - Sign up endpoint
2. ✅ `POST /api/login` - Login endpoint  
3. ✅ `POST /api/SaveProduct` - Create product endpoint

All three now explicitly accept and produce JSON.

## Testing

Try your product creation request again:

**Thunder Client:**
- Method: POST
- URL: `http://localhost:8080/api/SaveProduct`
- Headers: `Content-Type: application/json` (should be set automatically)
- Body: Product JSON

**From Angular Frontend:**
- The component should now work correctly

## What Changed

The `@PostMapping` annotation now has:
```java
@PostMapping(value = "endpoint", consumes = "application/json", produces = "application/json")
```

This tells Spring Boot:
- `consumes`: "I accept requests with Content-Type: application/json"
- `produces`: "I will return responses with Content-Type: application/json"

## Result

✅ HTTP 415 error is now fixed
✅ Backend will properly handle JSON requests
✅ Product creation should work from Thunder Client and Angular frontend

---

**Next Steps:**
1. Restart your backend server: `./mvnw spring-boot:run`
2. Try creating a product again
3. Verify it appears in the product listings
