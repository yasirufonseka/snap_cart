import { NgFor, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CartService, AddToCartRequest } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';


@Component({
  selector: 'app-product-showcase',
  imports: [NgFor, CommonModule, FormsModule],
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
  selectedProduct: any = null;
  selectedImageIndex: number = 0;
  modalQuantity: number = 1;
  showAllProducts: boolean = false;
  initialProductCount: number = 8; // Show 2 rows (4 products per row = 8 total)

  ngOnInit() {
    // this.loadProducts();
    this.tryFallbackEndpoint();
  }

  // loadProducts() {
  //   console.log('=== LOADING PRODUCTS ===');

  //   // Try the main products endpoint first
  //   this.http.get<any[]>('http://localhost:8080/api/GetAllProduct')
  //     .subscribe({
  //       next: (data) => {
  //         // console.log('Products received:', data);
  //         // console.log('Number of products:', data?.length || 0);

  //         if (data && data.length > 0) {
  //           this.products = data;
  //          // console.log('First product structure:', data[0]);
  //         } else {
  //          // console.warn('No products received from API');
  //           // Try fallback endpoint if main one is empty
  //           this.tryFallbackEndpoint();
  //         }
  //         data.filter((product: any) => { return product.status === 'approved'
  //         });
  //       },
  //       error: (error) => {
  //         // console.error('Error fetching products:', error);
  //         // console.error('Error status:', error.status);
  //         // console.error('Error message:', error.message);

  //         // Try fallback endpoint on error
  //         this.tryFallbackEndpoint();
  //       }
  //     });
  // }

  tryFallbackEndpoint() {
    console.log('Trying fallback endpoint...');
    this.http.get<any[]>('http://localhost:8080/api/products')
      .subscribe({
        next: (data) => {
        //  console.log('Fallback products received:', data);
          this.products = data || [];
          this.products = this.products.filter((product: any) => { return product.status === 'approved'
          });
          
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
    return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect width=%22400%22 height=%22400%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2224%22 fill=%22%23999%22%3EProduct%3C/text%3E%3C/svg%3E';
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

    // Check if user is logged in using the enhanced cookie service
    if (!this.cookieService.isLoggedIn()) {
      const userName = this.cookieService.getUserName() || 'User';
      alert(`Please log in to add items to cart, ${userName}!`);
      // Optionally redirect to login page
      // this.router.navigate(['/sign-in']);
      return;
    }

    const userId = this.cookieService.getUserId();
    if (!userId) {
      alert('Please log in to add items to cart');
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

  // Modal functionality methods
  openProductModal(product: any) {
    console.log('Opening modal for product:', product);
    this.selectedProduct = product;
    this.selectedImageIndex = 0;
    this.modalQuantity = 1;
  }

  getProductImages(product: any): string[] {
    const images: string[] = [];
    
    // Handle different possible image property structures
    if (product.images && Array.isArray(product.images)) {
      images.push(...product.images);
    } else if (product.imgUrl) {
      images.push(product.imgUrl);
    } else if (product.image) {
      images.push(product.image);
    }
    
    // If no images found, return a default placeholder
    if (images.length === 0) {
      images.push('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22500%22 height=%22500%22%3E%3Crect width=%22500%22 height=%22500%22 fill=%22%23f0f0f0%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-family=%22Arial%22 font-size=%2230%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E');
    }
    
    return images;
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  calculateDiscount(product: any): number {
    if (product.originalPrice && product.price) {
      const discount = ((product.originalPrice - product.price) / product.originalPrice) * 100;
      return Math.round(discount);
    }
    return 0;
  }

  getDefaultDescription(): string {
    return `Experience premium quality with this carefully selected product. 
            Crafted with attention to detail and designed for modern lifestyles. 
            Perfect for those who appreciate quality and style. 
            
            • High-quality materials
            • Modern design
            • Excellent value for money
            • Fast and secure delivery
            • Customer satisfaction guaranteed`;
  }

  hasProductSpecs(product: any): boolean {
    return !!(product.brand || product.model || product.size || product.weight || 
             product.warranty || product.shipping || product.material || product.color);
  }

  increaseQuantity() {
    if (this.modalQuantity < 99) {
      this.modalQuantity++;
    }
  }

  decreaseQuantity() {
    if (this.modalQuantity > 1) {
      this.modalQuantity--;
    }
  }

  getTotalPrice(): string {
    if (this.selectedProduct && this.selectedProduct.price) {
      const total = this.selectedProduct.price * this.modalQuantity;
      return total.toFixed(2);
    }
    return '0.00';
  }

  addToCartFromModal() {
    if (!this.selectedProduct) return;
    
    console.log('=== ADD TO CART FROM MODAL ===');
    console.log('Product:', this.selectedProduct);
    console.log('Quantity:', this.modalQuantity);

    // Check if user is logged in using the enhanced cookie service
    if (!this.cookieService.isLoggedIn()) {
      const userName = this.cookieService.getUserName() || 'User';
      alert(`Please log in to add items to cart, ${userName}!`);
      return;
    }

    const userId = this.cookieService.getUserId();
    if (!userId) {
      alert('Please log in to add items to cart');
      return;
    }

    const addToCartRequest: AddToCartRequest = {
      productId: this.selectedProduct.id,
      userId: userId,
      quantity: this.modalQuantity
    };

    console.log('Add to cart request:', addToCartRequest);

    this.cartService.addToCart(addToCartRequest).subscribe({
      next: (cart) => {
        console.log('Successfully added to cart:', cart);

        // Show success message
        this.showSuccessMessage(`${this.getProductName(this.selectedProduct)} (×${this.modalQuantity}) added to cart!`);

        // Update button state
        this.updateCartButtonState(this.selectedProduct.id, true);
        
        // Close modal (optional)
        // You can uncomment this if you want to close the modal after adding to cart
        // const modal = document.getElementById('productModal');
        // if (modal) {
        //   const bootstrapModal = bootstrap.Modal.getInstance(modal);
        //   if (bootstrapModal) bootstrapModal.hide();
        // }
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

  buyNow() {
    if (!this.selectedProduct) return;
    
    console.log('=== BUY NOW - SHOW SELLER INFO ===');
    console.log('Product:', this.selectedProduct);
    
    // Get seller contact info using sellerId from the product
    if (this.selectedProduct.sellerId) {
      this.fetchSellerContactInfo(this.selectedProduct.sellerId);
    } else {
      // Fallback to product data if no sellerId
      this.showSellerInfoFromProduct();
    }
  }

  fetchSellerContactInfo(sellerId: string) {
    // Fetch seller contact details from backend
    this.http.get<any>(`http://localhost:8080/api/GetUser/${sellerId}`).subscribe({
      next: (sellerData) => {
        console.log('Seller data received:', sellerData);
        const sellerInfo = {
          name: this.selectedProduct.sellerName || sellerData.name || 'SnapCart Seller',
          contact: sellerData.contact || '+94 77 123 4567',
          email: sellerData.email || 'seller@snapcart.com',
          city: this.selectedProduct.city || sellerData.address || 'Colombo'
        };
        this.showSellerInfo(sellerInfo);
      },
      error: (error) => {
        console.error('Error fetching seller contact:', error);
        // Fallback to product data
        this.showSellerInfoFromProduct();
      }
    });
  }

  showSellerInfoFromProduct() {
    // Extract seller info directly from the selected product
    const sellerInfo = {
      name: this.selectedProduct.sellerName || 'SnapCart Seller',
      contact: '+94 77 123 4567', // Default contact
      email: 'seller@snapcart.com', // Default email
      city: this.selectedProduct.city || 'Colombo'
    };
    
    this.showSellerInfo(sellerInfo);
  }

  showSellerInfo(seller: any) {
    const sellerInfo = `
🛒 SELLER CONTACT INFORMATION

👤 Seller Name: ${seller.name || seller.username || 'Not Available'}
📞 Contact No: ${seller.contact || 'Not Available'}
📧 Email: ${seller.email || 'Not Available'}

💡 You can contact the seller directly using the information above.
    `;

    alert(sellerInfo);
  }

  // Method to get displayed products based on showAllProducts flag
  getDisplayedProducts(): any[] {
    if (this.showAllProducts || this.products.length <= this.initialProductCount) {
      return this.products;
    }

    return this.products.slice(0, this.initialProductCount);
  }

  // Method to toggle show more/show less
  toggleShowMore(): void {
    this.showAllProducts = !this.showAllProducts;
  }

  // Check if there are more products to show
  hasMoreProducts(): boolean {
    return this.products.length > this.initialProductCount;
  }

}



