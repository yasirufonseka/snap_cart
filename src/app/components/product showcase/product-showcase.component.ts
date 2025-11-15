import { NgFor, CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CartService, AddToCartRequest } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';


@Component({
  selector: 'app-product-showcase',
  imports: [NgFor, CommonModule],
  templateUrl: './product-showcase.component.html',
  styleUrl: './product-showcase.component.scss'
})
export class ProductShowcaseComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private cookieService: CookieHandlerService
  ) { }

  products: any[] = [];
  
ngOnInit() {
  this.loadProducts();
}

loadProducts() {
  console.log('=== LOADING PRODUCTS ===');
  
  // Try the main products endpoint first
  this.http.get<any[]>('http://localhost:8080/api/GetAllProduct')
    .subscribe({
      next: (data) => {
        console.log('Products received:', data);
        console.log('Number of products:', data?.length || 0);
        
        if (data && data.length > 0) {
          this.products = data;
          console.log('First product structure:', data[0]);
        } else {
          console.warn('No products received from API');
          // Try fallback endpoint if main one is empty
          this.tryFallbackEndpoint();
        }
      },
      error: (error) => {
        console.error('Error fetching products:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Try fallback endpoint on error
        this.tryFallbackEndpoint();
      }
    });
}

tryFallbackEndpoint() {
  console.log('Trying fallback endpoint...');
  this.http.get<any[]>('http://localhost:8080/api/products')
    .subscribe({
      next: (data) => {
        console.log('Fallback products received:', data);
        this.products = data || [];
      },
      error: (error) => {
        console.error('Fallback endpoint also failed:', error);
        // Set some mock data for testing
        this.products = [
          {
            id: 1,
            items: 'Sample Product 1',
            images: ['assets/images/product1.jpg'],
            price: 29.99,
            City: 'Sample City',
            title: 'Sample Title 1',
            imgUrl: 'assets/images/product1.jpg'
          },
          {
            id: 2,
            items: 'Sample Product 2', 
            images: ['assets/images/product2.jpg'],
            price: 39.99,
            City: 'Sample City 2',
            title: 'Sample Title 2',
            imgUrl: 'assets/images/product2.jpg'
          }
        ];
        console.log('Using mock data:', this.products);
      }
    });
}

// Template helper methods
trackByProductId(index: number, product: any): any {
  return product.id || index;
}

getProductImage(product: any): string {
  // Handle different possible image property names
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  } else if (product.imgUrl) {
    return product.imgUrl;
  } else if (product.image) {
    return product.image;
  }
  return 'assets/images/default-product.jpg';
}

getProductName(product: any): string {
  // Handle different possible name property names
  return product.items || product.Item || product.title || product.name || 'Unknown Product';
}

// Cart functionality methods
addToCart(product: any, event?: Event) {
  if (event) {
    event.stopPropagation(); // Prevent modal from opening
  }
  
  console.log('=== ADD TO CART CLICKED ===');
  console.log('Product:', product);
  
  // Get user ID from cookies (login status)
  const userId = this.cookieService.getCookie('loginStatus');
  
  if (!userId || userId === 'undefined') {
    alert('Please log in to add items to cart');
    // Optionally redirect to login page
    // this.router.navigate(['/sign-in']);
    return;
  }
  
  const addToCartRequest: AddToCartRequest = {
    productId: product.id,
    userId: userId,
    quantity: 1
  };
  
  console.log('Add to cart request:', addToCartRequest);
  
  this.cartService.addToCart(addToCartRequest).subscribe({
    next: (cart) => {
      console.log('Successfully added to cart:', cart);
      
      // Show success message
      this.showSuccessMessage(`${this.getProductName(product)} added to cart!`);
      
      // Update button state or show feedback
      this.updateCartButtonState(product.id, true);
    },
    error: (error) => {
      console.error('Error adding to cart:', error);
      
      let errorMessage = 'Failed to add item to cart';
      if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    }
  });
}

addToCartFromOverlay(product: any, event: Event) {
  this.addToCart(product, event);
}

private showSuccessMessage(message: string) {
  // You can implement a toast notification here
  // For now, using alert
  alert(message);
  
  // Alternative: Create a toast service
  // this.toastService.showSuccess(message);
}

private updateCartButtonState(productId: string, added: boolean) {
  // Update UI to show item was added
  // You can implement visual feedback here
  console.log(`Product ${productId} cart state updated: ${added}`);
}

// Check if product is in cart (for UI state)
isProductInCart(product: any): boolean {
  if (!product.id) return false;
  return this.cartService.isProductInCart(product.id);
}

// Get cart item count for a product
getProductCartQuantity(product: any): number {
  if (!product.id) return 0;
  return this.cartService.getProductQuantityInCart(product.id);
}

  }



