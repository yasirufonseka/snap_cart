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
   * @returns true if loginStatus cookie exists and is valid
   */
  isLoggedIn(): boolean {
    const loginStatus = this.getCookie('loginStatus');
    return !!loginStatus && loginStatus !== 'undefined';
  }

  /**
   * Get seller ID from loginStatus cookie
   * @returns Seller ID or undefined
   */
  getSellerId(): string | undefined {
    const loginStatus = this.getCookie('loginStatus');
    if (loginStatus && loginStatus !== 'undefined') {
      return loginStatus;
    }
    return undefined;
  }

  /**
   * Get user email from cookies (if stored)
   * @returns User email or undefined
   */
  getUserEmail(): string | undefined {
    return this.getCookie('userEmail');
  }

  /**
   * Logout by clearing login cookies
   */
  logout(): void {
    this.deleteCookie('loginStatus');
    this.deleteCookie('userEmail');
  }
}