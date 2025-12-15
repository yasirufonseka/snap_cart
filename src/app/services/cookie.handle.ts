import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class CookieHandlerService {

  /**
   * Get a cookie by name
   * @param name - Cookie name
   * @returns Cookie value or undefined
   */
  getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop();
      return cookieValue ? cookieValue.split(';').shift() : undefined;
    }
    return undefined;
  }

  /**
   * Set a cookie
   * @param name - Cookie name
   * @param value - Cookie value
   * @param days - Expiration days (default: 1)
   */
  setCookie(name: string, value: string, days: number = 1) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${value}; path=/; expires=${expires}; secure`;
  }

  /**
   * Delete a cookie
   * @param name - Cookie name
   */
  deleteCookie(name: string) {
    this.setCookie(name, '', -1);
  }

  /**
   * Get all cookies as an object
   * @returns Object with all cookies
   */
  getAllCookies(): Record<string, string> {
    return document.cookie.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.split('=').map(c => c.trim());
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }

  /**
   * Check if user is logged in
   * @returns true if userId cookie exists and is valid
   */
  isLoggedIn(): boolean {
    const userId = this.getCookie('userId');
    return !!userId && userId !== 'undefined';
  }

  /**
   * Get user ID from cookies
   * @returns User ID or undefined
   */
  getUserId(): string | undefined {
    const userId = this.getCookie('userId');
    if (userId && userId !== 'undefined') {
      return userId;
    }
    return undefined;
  }

  /**
   * Get user role from cookies
   * @returns User role or undefined
   */
  getUserRole(): string | undefined {
    const userRole = this.getCookie('userRole');
    if (userRole && userRole !== 'undefined') {
      return userRole;
    }
    return undefined;
  }

  /**
   * Get seller ID from cookies (alias for getUserId for backward compatibility)
   * @returns Seller ID or undefined
   */
  getSellerId(): string | undefined {
    return this.getUserId();
  }

  /**
   * Get user email from cookies (if stored)
   * @returns User email or undefined
   */
  getUserEmail(): string | undefined {
    return this.getCookie('userEmail');
  }

  /**
   * Get user name from cookies (if stored)
   * @returns User name or undefined
   */
  getUserName(): string | undefined {
    return this.getCookie('userName');
  }

  /**
   * Set login cookies with user ID, username, and role
   * @param userId - User ID
   * @param userRole - User role (admin, seller, customer, etc.)
   * @param userEmail - User email (optional)
   * @param userName - User name (optional)
   * @param days - Expiration days (default: 7)
   */
  setLoginCookies(userId: string, userRole: string, userEmail?: string, userName?: string, days: number = 7): void {
    this.setCookie('userId', userId, days);
    this.setCookie('userRole', userRole, days);
    // Keep loginStatus for backward compatibility
    this.setCookie('loginStatus', userId, days);
    
    if (userEmail) {
      this.setCookie('userEmail', userEmail, days);
    }
    
    if (userName) {
      this.setCookie('userName', userName, days);
    }
  }

  /**
   * Check if user has specific role
   * @param role - Role to check for
   * @returns true if user has the specified role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user is admin
   * @returns true if user role is admin
   */
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  /**
   * Check if user is seller
   * @returns true if user role is seller
   */
  isSeller(): boolean {
    return this.hasRole('seller');
  }

  /**
   * Check if user is customer/regular user
   * @returns true if user role is customer or user
   */
  isCustomer(): boolean {
    return this.hasRole('customer') || this.hasRole('user');
  }

  /**
   * Check if user is regular user (alias for isCustomer)
   * @returns true if user role is customer or user
   */
  isUser(): boolean {
    return this.isCustomer();
  }

  /**
   * Logout by clearing all login cookies
   */
  logout(): void {
    this.deleteCookie('userId');
    this.deleteCookie('userRole');
    this.deleteCookie('userEmail');
    this.deleteCookie('userName');
    this.deleteCookie('loginStatus'); // Keep for backward compatibility
  }
}