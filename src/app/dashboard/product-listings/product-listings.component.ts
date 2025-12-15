import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CookieHandlerService} from '../../services/cookie.handle';
import { RouterLink } from '@angular/router';

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
  size: string;
  city: string;
  price: number;
  discount: number;
  status: 'pending' | 'approved' | 'declined' | 'available' | 'sold' | 'draft';
  sellerId: string;
  sellerName?: string;
  declineReason?: string;
  createdAt?: Date;
  approvedAt?: Date;
}
 interface Stats {
  totalProducts: number;
  soldProducts: number;
  draftProducts: number;
  pendingProducts: number;
  approvedProducts: number;
  declinedProducts: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-product-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './product-listings.component.html',
  styleUrls: ['./product-listings.component.scss']
})
export class ProductListingsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery: string = '';
  selectedCategory: string = '';
  selectedStatus: string = '';
  sortBy: string = 'newest';
  activeApprovalTab: string = 'all'; // all, pending, approved, declined
  approvalStats = {
    pending: 0,
    approved: 0,
    declined: 0
  };

  apiUrl: string = 'http://localhost:8080/api/dashboard/seller';
  isedit: boolean=false;

  constructor(
    private http: HttpClient,
    private cookiehandler: CookieHandlerService,
    private router: Router
   
  ) {}

  //get sellerId from cookie and load products
  getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop();
      return cookieValue ? cookieValue.split(';').shift() : undefined;
    }
    return undefined;
  }

  ngOnInit() {
   const token = this.cookiehandler.getCookie('loginStatus');
   const sellerId = token ? token : '';
    console.log('Seller ID from cookie:', sellerId);
    this.loadProducts();
  }

  loadProducts() {
    const sellerId = this.cookiehandler.getCookie('loginStatus');
    console.log('=== LOAD PRODUCTS DEBUG ===');
    console.log('Seller ID from cookie:', sellerId);
    console.log('User ID from cookie:', this.cookiehandler.getCookie('loginStatus'));
    

    if (!sellerId) {
      console.error('❌ No seller ID found in localStorage');
      window.alert('Please log in as a seller first');
      return;
    }

    console.log('✓ Valid seller ID found');
    console.log('📡 Making API request to: http://localhost:8080/api/seller/products/' + sellerId);

    this.http.get<Product[]>(`http://localhost:8080/api/seller/products/${sellerId}`)
      .subscribe({
        next: (products: Product[]) => {
          console.log('✓ API Response Status: 200 OK');
          console.log('📦 Products received from backend:', products);
          console.log('📊 Number of products:', products.length);
          
          if (products.length === 0) {
            console.warn('⚠️ Empty array returned - this seller may have no products in the database');
            console.log('💡 Next steps:');
            console.log('  1. Check MongoDB: db.products.find({ sellerId: "' + sellerId + '" })');
            console.log('  2. Create a test product if none exist');
            console.log('  3. Verify product was saved with correct sellerId');
          
            
          }
          
          this.products = products;
          this.calculateApprovalStats();
          this.filterProducts();
          console.log('✓ Products loaded and filtered successfully',);
        },
        error: (error) => {
          console.error('❌ Error loading products:');
          console.error('Error object:', error);
          console.error('Status:', error.status);
          console.error('Message:', error.message);
          console.error('URL:', error.url);
          window.alert('Failed to load products. Check console for details.');
        }
      });
  }

  filterProducts() {
    let filtered = [...this.products];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.brand.toLowerCase().includes(query) ||
        product.items.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(product =>
        product.collection.toLowerCase() === this.selectedCategory.toLowerCase()
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(product =>
        product.status === this.selectedStatus
      );
    }

    this.filteredProducts = filtered;
    this.sortProducts();
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'newest':
        this.filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'oldest':
        this.filteredProducts.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
    }
  }

  markAsSold(product: Product) {
    // Create ProductDto with all required fields for the backend
    const productDto = {
      id: product.id,
      images: product.images,
      description: product.description,
      collection: product.collection,
      items: product.items,
      brand: product.brand,
      condition: product.condition,
      serialNo: product.serialNo,
      age: product.age,
      colour: product.colour,
      occasion: '', // Default value since this property doesn't exist in Product interface
      size: product.size,
      city: product.city,
      price: product.price,
      discount: product.discount,
      sellerId: product.sellerId,
      sellerName: product.sellerName || '',
      status: 'sold' // This is what we're updating
    };

    this.http.put<any>('http://localhost:8080/api/dashboard/UpdateProduct', productDto)
      .subscribe({
        next: (response) => {
          console.log('Product marked as sold successfully:', response);
          product.status = 'sold' as 'available' | 'sold' | 'draft';
          window.alert('Product marked as sold successfully');
        },
        error: (error) => {
          console.error('Error marking product as sold:', error);
          console.error('Error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            url: error.url,
            error: error.error
          });
          window.alert(`Failed to mark product as sold. Error: ${error.status} - ${error.statusText || error.message}`);
        }
      });
  }

  editProduct(product: any) {
    try {
      // Navigate to product edit route with the product id
      const id = (typeof product === 'string' || typeof product === 'number') ? product : product?.id;
      if (!id) {
        console.warn('editProduct called without an id', product);
        return;
      }
      this.router.navigate(['/product-edit', id]);
    } catch (error) {
      console.error('Error navigating to edit product page:', error);
      window.alert('Failed to navigate to edit product page');
    }
  }

  deleteProduct(product: any) {
    if (confirm('Are you sure you want to delete this product?')) {
      const productId = product.id  // Handle both id formats
      console.log('Deleting product with ID:', productId);
      
      this.http.delete(`http://localhost:8080/api/dashboard/delete-product?productId=${productId}`)
        .subscribe({
          next: (response: any) => {
            console.log('Delete response:', response);
            
            // Remove from both products array and allProducts array
            this.products = this.products.filter(p => (p.id !== productId ));
            
            
            // Re-categorize products after deletion
            
            this.filterProducts();
            
            window.alert(response.message || 'Product deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            
            // Check for specific error messages
            if (error.status === 0) {
              window.alert('Connection error. Please check if the server is running.');
            } else if (error.status === 404) {
              window.alert('Product not found. It may have already been deleted.');
            } else if (error.error && error.error.message) {
              window.alert('Failed to delete product: ' + error.error.message);
            } else {
              window.alert('Failed to delete product. Please try again.');
            }
          }
        });
    }
  }

  // Helper methods for button visibility
  canEditProduct(product: Product): boolean {
   // console.log(`Can edit product with status: "${product.status}"`);
    // Allow editing for all statuses except sold
    return product.status !== 'sold';
  }

  canDeleteProduct(product: Product): boolean {
    //console.log(`Can delete product with status: "${product.status}"`);
    // Allow deletion for declined, pending, and draft products
    return product.status === 'declined' || 
           product.status === 'pending' || 
           product.status === 'draft' ||
           product.status === 'approved' || 
           product.status === undefined;
  }

  getEmptyStateMessage(): string {
    if (this.products.length === 0) {
      return "You haven't listed any products yet.";
    }
    if (this.searchQuery || this.selectedCategory || this.selectedStatus) {
      return "No products match your current filters.";
    }
    return "No products found.";
  }

  setActiveApprovalTab(tab: string) {
    this.activeApprovalTab = tab;
    this.filterProducts();
  }

  calculateApprovalStats() {
    this.approvalStats = {
      pending: this.products.filter(p => p.status === 'pending').length,
      approved: this.products.filter(p => p.status === 'approved').length,
      declined: this.products.filter(p => p.status === 'declined').length
    };
  }

  get filteredProductsByApproval() {
    let filtered = [...this.filteredProducts];
    
    if (this.activeApprovalTab !== 'all') {
      filtered = filtered.filter(product => product.status === this.activeApprovalTab);
    }
    
    return filtered;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved': return 'badge-success';
      case 'declined': return 'badge-danger';
      case 'available': return 'badge-info';
      case 'sold': return 'badge-secondary';
      default: return 'badge-light';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'pending': return 'Pending Review';
      case 'approved': return 'Approved';
      case 'declined': return 'Declined';
      case 'available': return 'Available';
      case 'sold': return 'Sold';
      default: return status;
    }
  }
}
