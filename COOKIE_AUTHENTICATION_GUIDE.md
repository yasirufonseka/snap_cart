# Authentication via Cookies - Implementation Guide

## 📋 Overview

SnapCart uses cookie-based authentication to manage seller sessions. A `loginStatus` cookie stores the seller's ID after successful login, allowing the app to identify the user across different components without requiring repeated login.

## 🔐 Architecture

### 1. **CookieAuthService** (`src/app/services/cookie-auth.service.ts`)

A centralized service that manages all cookie-related operations:

```typescript
// Service Methods

// Get a specific cookie
getCookie(name: string): string | null

// Set a cookie
setCookie(name: string, value: string, days?: number): void

// Delete a cookie
deleteCookie(name: string): void

// Get all cookies
getAllCookies(): Record<string, string>

// Check if user is logged in
isLoggedIn(): boolean

// Get seller ID
getSellerId(): string | null

// Get user email
getUserEmail(): string | null

// Logout (clear cookies)
logout(): void
```

### 2. **How It Works**

#### Login Flow:
1. User enters credentials in `SignInComponent`
2. Credentials sent to backend (`/api/login`)
3. Backend returns seller ID/username
4. Frontend stores response in `loginStatus` cookie:
   ```typescript
   document.cookie = `loginStatus=${response}; path=/; expires=${expirationDate}; secure`;
   ```
5. User redirected to home page
6. Cookie persists across page refreshes and browser restarts (within expiration)

#### Authentication Check Flow:
1. Component needs to verify user is logged in
2. Call `CookieAuthService.isLoggedIn()`
3. Service checks if `loginStatus` cookie exists and is valid
4. Returns `true` or `false`
5. Component acts accordingly (allow action or redirect to login)

---

## 🛠️ Implementation

### In SignInComponent
```typescript
constructor(private http: HttpClient) {}

onSubmit() {
  this.http.post('http://localhost:8080/api/login', login, { 
    responseType: "text" 
  }).subscribe({
    next: (response) => {
      // Set cookie with expiration date (1 day default)
      const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString();
      document.cookie = `loginStatus=${response}; path=/; expires=${expirationDate}; secure`;
      
      // Redirect to home
      window.location.href = '/home';
    },
    error: (error) => { 
      console.log("Failed login", error); 
    }
  });
}
```

### In ProductEditComponent
```typescript
constructor(
  private cookieAuthService: CookieAuthService,
  private router: Router
) {}

ngOnInit() {
  this.getSellerId();
}

private getSellerId(): void {
  if (!this.cookieAuthService.isLoggedIn()) {
    window.alert('Please login to edit products');
    this.router.navigate(['/sign-in']);
    return;
  }
  this.sellerId = this.cookieAuthService.getSellerId();
}
```

### In SellerComponent
```typescript
constructor(
  private cookieAuthService: CookieAuthService,
  private http: HttpClient
) {}

onSubmit() {
  if (!this.cookieAuthService.isLoggedIn()) {
    window.alert('Please login to add product');
    return;
  }

  const sellerId = this.cookieAuthService.getSellerId();
  
  const payload = {
    // ... other fields
    sellerId: sellerId
  };
  
  this.http.post('http://localhost:8080/api/SaveProduct', payload).subscribe({
    next: (response) => { /* ... */ }
  });
}
```

---

## 📦 Using CookieAuthService

### 1. **Import the Service**
```typescript
import { CookieAuthService } from '../../services/cookie-auth.service';
```

### 2. **Inject in Constructor**
```typescript
constructor(private cookieAuthService: CookieAuthService) {}
```

### 3. **Check if Logged In**
```typescript
if (this.cookieAuthService.isLoggedIn()) {
  // User is logged in, proceed
} else {
  // Redirect to login
  this.router.navigate(['/sign-in']);
}
```

### 4. **Get Seller ID**
```typescript
const sellerId = this.cookieAuthService.getSellerId();
// Use sellerId in API calls
```

### 5. **Handle Logout**
```typescript
onLogout() {
  this.cookieAuthService.logout();
  this.router.navigate(['/sign-in']);
}
```

---

## 🔒 Security Considerations

### Current Implementation
- ✅ `secure` flag: Cookie only sent over HTTPS in production
- ✅ `path=/`: Cookie available across entire site
- ✅ `expires`: Automatic expiration after specified time
- ✅ Centralized management: All cookie operations in one service

### Recommended Improvements
1. **HttpOnly Cookies** (Backend)
   - Set cookies from backend with `HttpOnly` flag
   - Prevents JavaScript access to cookie
   - Requires backend configuration

2. **SameSite Attribute** (Backend)
   ```
   Set-Cookie: loginStatus=value; SameSite=Strict; Secure
   ```
   - Prevents CSRF attacks
   - Only send cookie with same-site requests

3. **Encrypted Storage** (Optional)
   - Instead of plain text, store encrypted token
   - Use library like `crypto-js`

4. **Token Refresh**
   - Implement token refresh mechanism
   - Extend session without re-login
   - Automatic logout on expiration

5. **HTTPS Only** (Production)
   - Ensure all URLs are HTTPS
   - Secure flag ensures cookie isn't sent over HTTP

---

## 🚀 Components Using Cookie Auth

### ProductEditComponent
- ✅ Integrated with `CookieAuthService`
- ✅ Checks login before allowing edits
- ✅ Auto-redirects to login if not authenticated
- ✅ Uses seller ID for product operations

### SellerComponent
- ✅ Updated to use `CookieAuthService`
- ✅ Checks login before adding products
- ✅ Retrieves seller ID cleanly
- ✅ Better error handling with user feedback

### SignInComponent
- ✅ Sets `loginStatus` cookie on successful login
- ✅ Expires in 24 hours (configurable)
- ✅ Uses secure flag for production

---

## 📝 API Integration

### Expected Backend Endpoints

**Login:**
```
POST /api/login
Request: { username, password }
Response: "userId123" (returns seller ID)
```

**Save Product:**
```
POST /api/SaveProduct
Headers: (Cookie: loginStatus=userId123)
Request: { id, images, description, sellerId, ... }
Response: "Product saved successfully"
```

**Update Product:**
```
PUT /api/UpdateProduct
Headers: (Cookie: loginStatus=userId123)
Request: { id, images, description, sellerId, ... }
Response: "Product updated successfully"
```

---

## 🔍 Debugging Cookies

### View Cookies in Browser
1. Open DevTools (F12)
2. Go to **Application** tab
3. Select **Cookies** → Your domain
4. Look for `loginStatus` cookie

### Check Expiration
- Click on the cookie to see:
  - Name: `loginStatus`
  - Value: Seller ID
  - Expires: Date/time
  - Secure: Yes/No
  - SameSite: Strict/Lax/None

### Clear Cookies
```javascript
// In browser console
document.cookie = "loginStatus=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
```

---

## 📋 Checklist for Implementation

- [x] Create `CookieAuthService`
- [x] Update `ProductEditComponent` to use service
- [x] Update `SellerComponent` to use service
- [x] Add service injection in components
- [x] Test login flow
- [x] Test cookie persistence
- [x] Test logout functionality
- [ ] Implement backend HttpOnly cookies (recommended)
- [ ] Add HTTPS/secure configuration (production)
- [ ] Implement token refresh (optional)

---

## 🎯 Usage Examples

### Example 1: Protected Route Component
```typescript
export class AdminComponent implements OnInit {
  constructor(
    private cookieAuthService: CookieAuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.cookieAuthService.isLoggedIn()) {
      this.router.navigate(['/sign-in']);
    }
  }
}
```

### Example 2: Get All Cookies
```typescript
const allCookies = this.cookieAuthService.getAllCookies();
console.log(allCookies);
// Output: { loginStatus: 'user123', sessionId: 'abc...' }
```

### Example 3: Manual Cookie Operations
```typescript
// Set custom cookie
this.cookieAuthService.setCookie('theme', 'dark', 30); // Expires in 30 days

// Get custom cookie
const theme = this.cookieAuthService.getCookie('theme');

// Delete custom cookie
this.cookieAuthService.deleteCookie('theme');
```

---

## 📞 Troubleshooting

| Issue | Solution |
|-------|----------|
| Cookie not persisting | Check browser cookie settings, ensure `secure` flag for HTTPS |
| isLoggedIn() returns false | Verify cookie name is `loginStatus`, check for 'undefined' string |
| Can't access sellerId | Ensure `isLoggedIn()` returns true before calling `getSellerId()` |
| Logout not working | Verify `deleteCookie()` is called with correct cookie name |
| Cookie visible in DevTools but not accessible | May be HttpOnly cookie (backend setting) |

---

**Last Updated:** November 13, 2025
