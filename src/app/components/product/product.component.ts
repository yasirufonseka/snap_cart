import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieHandlerService } from '../../services/cookie.handle';
import { CartService } from '../../services/cart.service';

interface Product {
  id: string;
  images: string[];
  description: string;
  collection: string;
  items: string;
  brand: string;
  condition: string;
  serialNo: string;
  age: number;
  colour: string;
  gender: string;
  occasion: string;
  size: string;
  city: string;
  price: number;
  discount: number;
  sellerId: string;
  sellerName: string;
  status: string;
}

interface SellerInfo {
  id: string;
  name: string;
  email: string;
  contact?: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
}

@Component({
  selector: 'app-product',
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent implements OnInit {
  // Display properties
  Category_Name: string = "Search Results";
  search_result: string = "0";
  Popular_brands: string[] = ['Polo', 'H&M', 'Zara', 'Levis'];
  
  // Product data
  products: Product[] = [];
  filteredProducts: Product[] = [];
  singleProduct: Product | null = null;
  loading = false;
  searchQuery = '';
  
  // View mode: 'search' for search results, 'single' for individual product
  viewMode: 'search' | 'single' = 'search';
  
  // Seller modal
  showSellerModal = false;
  selectedSeller: SellerInfo | null = null;
  loadingSeller = false;
  sellerError = '';
  
  // Product detail modal
  showProductModal = false;
  selectedProduct: Product | null = null;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private http: HttpClient,
    private cookieService: CookieHandlerService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
        this.searchProducts(this.searchQuery);
        this.viewMode = 'search';
        this.Category_Name = `Search Results for "${this.searchQuery}"`;
      } else if (params['query']) {
        this.searchQuery = params['query'];
        this.searchProducts(this.searchQuery);
        this.viewMode = 'search';
        this.Category_Name = `Search Results for "${this.searchQuery}"`;
      } else if (params['productId']) {
        this.loadSingleProduct(params['productId']);
        this.viewMode = 'single';
        this.Category_Name = 'Product Details';
      } else {
        this.loadAllProducts();
        this.viewMode = 'search';
        this.Category_Name = 'All Products';
      }
    });
    
    // Load popular brands from backend
    this.loadPopularBrands();
  }

  searchProducts(query: string): void {
    this.loading = true;
    this.searchQuery = query;
    
    // Update category name based on search type
    if (this.Popular_brands.includes(query)) {
      this.Category_Name = `${query} Products`;
    } else {
      this.Category_Name = `Search Results for "${query}"`;
    }
    
    this.http.get<Product[]>(`http://localhost:8080/api/search?query=${encodeURIComponent(query)}`)
      .subscribe({
        next: (results) => {
          this.products = results;
          this.products = this.products.filter((product: any) => { return product.status === 'approved' });
          this.filteredProducts = results;
          this.search_result = results.length.toString();
          this.loading = false;
          console.log('Search results loaded:', results);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.products = [];
          this.filteredProducts = [];
          this.search_result = '0';
          this.loading = false;
        }
      });
  }

  loadSingleProduct(productId: string): void {
    this.loading = true;
    this.http.get<Product>(`http://localhost:8080/api/GetProductById/${productId}`)
      .subscribe({
        next: (product) => {
          this.singleProduct = product;
          this.loading = false;
          console.log('Product loaded:', product);
        },
        error: (error) => {
          console.error('Product load error:', error);
          this.singleProduct = null;
          this.loading = false;
        }
      });
  }

  loadAllProducts(): void {
    this.loading = true;
    this.http.get<Product[]>('http://localhost:8080/api/admin/approved-products')
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filteredProducts = this.products;
          this.search_result = this.products.length.toString();
          this.loading = false;
          console.log('All products loaded:', this.products);
        },
        error: (error) => {
          console.error('Products load error:', error);
          this.products = [];
          this.filteredProducts = [];
          this.search_result = '0';
          this.loading = false;
        }
      });
  }

  loadPopularBrands(): void {
    this.http.get<Product[]>('http://localhost:8080/api/admin/approved-products')
      .subscribe({
        next: (products) => {
          // Extract unique brands from products and get top brands
          const brandCounts = new Map<string, number>();
          products.forEach(product => {
            if (product.brand && product.brand.trim()) {
              const brand = product.brand.trim();
              brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
            }
          });
          
          // Sort brands by popularity and take top 8
          this.Popular_brands = Array.from(brandCounts.entries())
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([brand,]) => brand);
            
          console.log('Popular brands loaded:', this.Popular_brands);
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          // Keep default brands if API fails
          this.Popular_brands = ['Polo', 'H&M', 'Zara', 'Levis', 'Nike', 'Adidas', 'Puma', 'Samsung'];
        }
      });
  }

  getProductImage(product: Product): string {
    return product.images && product.images.length > 0 
      ? product.images[0] 
      : 'assets/images/default-product.svg';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/images/default-product.svg';
  }

  addToCart(product: Product): void {
    const userId = this.cookieService.getUserId();
    if (!userId) {
      alert('Please log in to add items to cart');
      this.router.navigate(['/SignIn']);
      return;
    }

    const cartItem = {
      productId: product.id,
      userId: userId,
      quantity: 1
    };

    this.cartService.addToCart(cartItem).subscribe({
      next: (response) => {
        console.log('Added to cart successfully');
        alert('Product added to cart!');
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add product to cart');
      }
    });
  }

  // Seller Details Methods
  viewSellerDetails(product: Product): void {
    console.log('Viewing seller details for product:', product.description);
    
    if (!product.sellerId) {
      alert('Seller information not available for this product.');
      return;
    }
    
    this.loadingSeller = true;
    this.sellerError = '';
    this.showSellerModal = true;
    
    this.http.get<SellerInfo>(`http://localhost:8080/api/GetUser/${product.sellerId}`)
      .subscribe({
        next: (seller) => {
          console.log('Seller details loaded:', seller);
          this.selectedSeller = seller;
          this.loadingSeller = false;
        },
        error: (error) => {
          console.error('Error loading seller details:', error);
          this.sellerError = 'Failed to load seller information. Please try again.';
          this.loadingSeller = false;
          
          this.selectedSeller = {
            id: product.sellerId || 'N/A',
            name: 'Seller Information',
            email: 'contact@snapcart.com',
            contact: '+1-234-567-8900',
            phoneNumber: '+1-234-567-8900',
            location: 'Available on request',
            address: 'Contact seller for details'
          };
        }
      });
  }

  closeSellerModal(): void {
    this.showSellerModal = false;
    this.selectedSeller = null;
    this.sellerError = '';
    this.loadingSeller = false;
  }

  // Brand filter method
  filterByBrand(brand: string): void {
    console.log('Filtering by brand:', brand);
    this.searchProducts(brand);
  }

  // Clear all filters
  clearFilters(): void {
    this.loadAllProducts();
    this.searchQuery = '';
    this.Category_Name = 'All Products';
  }
  
  // Product detail modal methods
  openProductModal(product: Product): void {
    console.log('Opening product modal for:', product.description);
    this.selectedProduct = product;
    this.showProductModal = true;
  }
  
  closeProductModal(): void {
    this.showProductModal = false;
    this.selectedProduct = null;
  }
  
  openSellerModalFromProduct(): void {
    if (this.selectedProduct) {
      this.closeProductModal();
      this.viewSellerDetails(this.selectedProduct);
    }
  }
}
