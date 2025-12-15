# Cookie Authentication - Quick Reference

## 🚀 Quick Start

### 1. Inject Service
```typescript
constructor(private cookieAuthService: CookieAuthService) {}
```

### 2. Check if Logged In
```typescript
if (this.cookieAuthService.isLoggedIn()) {
  // User logged in
}
```

### 3. Get Seller ID
```typescript
const sellerId = this.cookieAuthService.getSellerId();
```

### 4. Logout
```typescript
this.cookieAuthService.logout();
```

---

## 📚 CookieAuthService API

| Method | Returns | Purpose |
|--------|---------|---------|
| `isLoggedIn()` | `boolean` | Check if user is authenticated |
| `getSellerId()` | `string \| null` | Get current seller's ID |
| `getCookie(name)` | `string \| null` | Get any cookie by name |
| `setCookie(name, value, days?)` | `void` | Set a cookie (default 1 day) |
| `deleteCookie(name)` | `void` | Remove a cookie |
| `getAllCookies()` | `Record<string, string>` | Get all cookies as object |
| `getUserEmail()` | `string \| null` | Get stored user email |
| `logout()` | `void` | Clear all auth cookies |

---

## 📍 Where It's Used

1. **ProductEditComponent** - Verify seller can edit products
2. **SellerComponent** - Verify seller can add products
3. **SignInComponent** - Set cookie on login
4. Can be used in any component that needs auth

---

## 🔐 Cookie Details

**Name:** `loginStatus`
**Value:** Seller ID (e.g., "user123")
**Expiration:** 24 hours (configurable)
**Secure Flag:** Yes (HTTPS only in production)

---

## ✅ Features Implemented

- ✅ Centralized cookie management
- ✅ Simple login/logout
- ✅ Automatic expiration
- ✅ Secure flag support
- ✅ Used in ProductEditComponent
- ✅ Used in SellerComponent

