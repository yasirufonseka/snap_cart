import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService, AddToCartRequest } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';
import { catchError, of } from 'rxjs';

interface Product {
  id: string;
  items: string;
  description?: string;
  images: string[];
  price: number;
  discount?: number;
  colour: string;
  gender: string;
  occasion: string;
  brand?: string;
  size?: string;
  collection?: string;
  status?: string;
  // Optional seller / product extra fields
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  location?: string;
  city?: string;
  serialNo?: string;
  condition?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  contact?: string;
  address?: string;
  city?: string;
  state?: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  // selectedProduct is used by the modals
  selectedProduct: Product | null = null;
  isLoading = true;
  loadingSeller = false;
  selectedImage = 0;
  quantity = 1;
  addingToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private cookieService: CookieHandlerService
  ) { }

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(productId);
    } else {
      this.router.navigate(['/home']);
    }
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.http.get<Product>(`http://localhost:8080/api/GetProduct/ById/${id}`)
      .subscribe({
        next: (data) => {
          this.product = data;
          this.isLoading = false;
          console.log('Product loaded:', data);
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.isLoading = false;
          alert('Product not found');
          this.router.navigate(['/home']);
        }
      });
  }

  selectImage(index: number): void {
    this.selectedImage = index;
  }

  getDiscountedPrice(price: number, discount: number = 0): number {
    return price - (price * discount / 100);
  }

  addToCart(): void {
    if (!this.product) return;

    const userId = this.cookieService.getCookie('userId');
    if (!userId) {
      alert('Please login to add items to cart');
      this.router.navigate(['/SignIn']);
      return;
    }

    this.addingToCart = true;
    const request: AddToCartRequest = {
      userId: userId,
      productId: this.product.id,
      quantity: this.quantity
    };

    this.cartService.addToCart(request).subscribe({
      next: (response) => {
        console.log('Added to cart:', response);
        alert(`${this.product?.items} added to cart!`);
        this.addingToCart = false;
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart. Please try again.');
        this.addingToCart = false;
      }
    });
  }

  buyNow(): void {
    this.addToCart();
    setTimeout(() => {
      this.router.navigate(['/cart']);
    }, 500);
  }

  increaseQuantity(): void {
    this.quantity++;
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  /**
   * Open the seller info modal. The template uses Bootstrap modal markup;
   * calling this method allows any pre-loading logic if needed.
   */
  openSellerModal(): void {
    this.selectedProduct = this.product;
    this.loadingSeller = true;
    // simulate any loading (e.g., fetching seller details) — replace with real call if available
    setTimeout(() => {
      this.loadingSeller = false;
    }, 200);
  }


   private fetchSellerInfo(sellerId: string): void {
      const sellerApiUrl = `http://localhost:8080/api/GetUser/${sellerId}`;
      console.log('Fetching seller info from:', sellerApiUrl);
      
      this.http.get<any>(sellerApiUrl)
        .pipe(
          catchError(err => {
            console.error('Failed to load seller info for sellerId:', sellerId);
            console.error('Error details:', err);
            console.error('API URL was:', sellerApiUrl);
            
            // Fallback: set basic seller info if API fails
            if (this.selectedProduct) {
              this.selectedProduct.sellerName = 'Seller Information Unavailable';
              this.selectedProduct.sellerEmail = 'contact@snapcart.com';
              this.selectedProduct.sellerPhone = 'Contact Support: +1-800-SNAPCART';
              this.selectedProduct.location = 'Location Unavailable';
            }
            return of(null);
          })
        )
        .subscribe((seller: Seller | null) => {
          console.log('Raw seller response:', seller);
          if (seller && this.selectedProduct) {
            console.log('Processing seller info for product:', this.selectedProduct.id);
            this.selectedProduct.sellerName = seller.name || 'Name not available';
            this.selectedProduct.sellerEmail = seller.email || 'Email not available';
            this.selectedProduct.sellerPhone = seller.contact || 'Phone not provided';
            // Handle location properly
            let location = '';
            if (seller.city && seller.city.trim() !== '') {
              location = seller.city;
              if (seller.state && seller.state.trim() !== '') {
                location += ', ' + seller.state;
              }
            } else if (seller.address && seller.address.trim() !== '') {
              location = seller.address;
            } else {
              location = 'Location not available';
            }
            this.selectedProduct.location = location;
            
            console.log('Updated product with seller info:', {
              sellerName: this.selectedProduct.sellerName,
              sellerEmail: this.selectedProduct.sellerEmail,
              sellerPhone: this.selectedProduct.sellerPhone,
              location: this.selectedProduct.location
            });
          } else {
            console.log('No seller data received or no selected product');
          }
        });
    }


  
}
