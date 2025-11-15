import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  
  cart: Cart = {
    userId: '',
    items: [],
    totalAmount: 0,
    totalItems: 0
  };
  
  loading = false;
  userId: string | null = null;

  constructor(
    private cartService: CartService,
    private cookieService: CookieHandlerService
  ) {}

  ngOnInit(): void {
    console.log('=== CART PAGE LOADED ===');
    
    // Get user ID from cookies
    this.userId = this.cookieService.getCookie('loginStatus') || null;
    
    if (!this.userId || this.userId === 'undefined') {
      console.log('User not logged in, redirecting or showing message');
      return;
    }
    
    this.loadCart();
    
    // Subscribe to cart updates
    this.cartService.cart$.subscribe(cart => {
      this.cart = cart;
      console.log('Cart updated:', cart);
    });
  }

  loadCart(): void {
    if (!this.userId) return;
    
    this.loading = true;
    console.log('Loading cart for user:', this.userId);
    
    this.cartService.getCart(this.userId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.loading = false;
        console.log('Cart loaded:', cart);
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    if (!this.userId || newQuantity < 0) return;
    
    console.log(`Updating quantity for ${item.productName} to ${newQuantity}`);
    
    this.cartService.updateCartItem({
      productId: item.productId,
      userId: this.userId,
      quantity: newQuantity
    }).subscribe({
      next: (cart) => {
        console.log('Quantity updated successfully');
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
        alert('Failed to update quantity');
      }
    });
  }

  removeItem(item: CartItem): void {
    if (!this.userId) return;
    
    if (confirm(`Remove "${item.productName}" from cart?`)) {
      console.log('Removing item:', item.productName);
      
      this.cartService.removeFromCart(this.userId, item.productId).subscribe({
        next: (cart) => {
          console.log('Item removed successfully');
        },
        error: (error) => {
          console.error('Error removing item:', error);
          alert('Failed to remove item');
        }
      });
    }
  }

  clearCart(): void {
    if (!this.userId) return;
    
    if (confirm('Clear all items from cart?')) {
      console.log('Clearing cart');
      
      this.cartService.clearCart(this.userId).subscribe({
        next: (cart) => {
          console.log('Cart cleared successfully');
        },
        error: (error) => {
          console.error('Error clearing cart:', error);
          alert('Failed to clear cart');
        }
      });
    }
  }

  incrementQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  getItemSubtotal(item: CartItem): number {
    return item.price * item.quantity;
  }

  continueShopping(): void {
    // Navigate back to products or home page
    window.history.back();
  }

  proceedToCheckout(): void {
    console.log('Proceeding to checkout with cart:', this.cart);
    
    if (!this.cart.items || this.cart.items.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Navigate to checkout page
    window.location.href = '/checkout';
  }

  isLoggedIn(): boolean {
    return this.userId !== null && this.userId !== 'undefined';
  }

  trackByProductId(index: number, item: CartItem): string {
    return item.productId;
  }
}