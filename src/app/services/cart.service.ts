import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  sellerId: string;
  brand?: string;
  size?: string;
  color?: string;
  subTotal?: number;
}

export interface Cart {
  id?: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
  totalItems?: number;
}

export interface AddToCartRequest {
  productId: string;
  userId: string;
  quantity?: number;
  size?: string;
  color?: string;
}

export interface UpdateCartItemRequest {
  productId: string;
  userId: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';
  
  // Observable cart state
  private cartSubject = new BehaviorSubject<Cart>({
    userId: '',
    items: [],
    totalAmount: 0,
    totalItems: 0
  });
  
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    console.log('CartService initialized');
  }

  /**
   * Add item to cart
   */
  addToCart(request: AddToCartRequest): Observable<Cart> {
    console.log('=== ADDING TO CART ===');
    console.log('Request:', request);
    
    return this.http.post<Cart>(`${this.apiUrl}/add`, request).pipe(
      tap(cart => {
        console.log('Item added to cart:', cart);
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Get user's cart
   */
  getCart(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/user/${userId}`).pipe(
      tap(cart => {
        console.log('Cart retrieved:', cart);
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(request: UpdateCartItemRequest): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/update`, request).pipe(
      tap(cart => {
        console.log('Cart item updated:', cart);
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Remove item from cart
   */
  removeFromCart(userId: string, productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/remove/${userId}/${productId}`).pipe(
      tap(cart => {
        console.log('Item removed from cart:', cart);
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Clear entire cart
   */
  clearCart(userId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/clear/${userId}`).pipe(
      tap(cart => {
        console.log('Cart cleared:', cart);
        this.cartSubject.next(cart);
      })
    );
  }

  /**
   * Get cart item count
   */
  getCartItemCount(userId: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count/${userId}`);
  }

  /**
   * Get current cart state (synchronous)
   */
  getCurrentCart(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Helper method to check if product is in cart
   */
  isProductInCart(productId: string): boolean {
    const currentCart = this.getCurrentCart();
    return currentCart.items.some(item => item.productId === productId);
  }

  /**
   * Helper method to get product quantity in cart
   */
  getProductQuantityInCart(productId: string): number {
    const currentCart = this.getCurrentCart();
    const item = currentCart.items.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  }

  /**
   * Initialize cart for user (call this on app startup)
   */
  initializeCart(userId: string): void {
    if (userId) {
      this.getCart(userId).subscribe({
        next: (cart) => {
          console.log('Cart initialized for user:', userId);
        },
        error: (error) => {
          console.error('Error initializing cart:', error);
        }
      });
    }
  }
}