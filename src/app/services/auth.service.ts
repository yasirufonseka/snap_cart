import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  getSellerId(): string | null {
    return localStorage.getItem('sellerId');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  setUserData(userId: string, role: string): void {
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    if (role === 'seller') {
      localStorage.setItem('sellerId', userId);
    }
  }

  clearUserData(): void {
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    localStorage.removeItem('sellerId');
  }
}