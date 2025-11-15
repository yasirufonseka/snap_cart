import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CookieHandlerService } from '../../services/cookie.handle';
import { CurrencyPipe, CommonModule } from '@angular/common';

interface RecentProduct {
  id: string;
  images: string;
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
  status: string;
}

interface ProductDisplayItem {
  id: any;
  name: any;
  image: any;
  category: any;
  price: any;
  status: string;
  brand: any;
  description: any;
}

@Component({
  selector: 'app-dashboard-home',
  imports: [CurrencyPipe, CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit{

  constructor(private http: HttpClient, private cookieService: CookieHandlerService) {}
  recentProducts: ProductDisplayItem[] = [];
  private apiurl="http://localhost:8080/api/dashboard";

 stats = {
    totalSales: 0,
   
   
    totalProducts:0 ,
    
  };


  ngOnInit(): void {
    console.log('=== DASHBOARD LOADING ===');
    this.debugBackendData();
    this.countOfProduct();
    this.getTotalSales();
    this.getRecentProducts();
  }

  private debugBackendData() {
    const sellerId = this.cookieService.getCookie('loginStatus');
    console.log('Current seller ID:', sellerId);
    
    // Check what's in the database
    this.http.get<string>('http://localhost:8080/api/dashboard/debug/allproducts').subscribe({
      next: (response) => {
        console.log('All products in database:', response);
      },
      error: (error) => {
        console.log('Debug endpoint not available or error:', error);
      }
    });
  }

  getRecentProducts() {
    const sellerId = this.cookieService.getCookie('loginStatus');
    if (!sellerId) {
      console.error('Seller ID not found in cookies');
      return;
    }

    console.log('=== FETCHING RECENT PRODUCTS ===');
    console.log('Seller ID:', sellerId);

    this.http.get<any[]>(`${this.apiurl}/recent-products`, {
      params: { sellerId: sellerId, limit: '5' }
    }).subscribe({
      next: (response) => {
        console.log('Recent products from backend:', response);
        
        // Backend already returns sorted and limited products
        // Transform backend data to match frontend format
        this.recentProducts = response.map(product => ({
          id: product.id,
          name: product.items || product.collection || 'Unknown Product',
          image: product.images && product.images.length > 0 ? product.images[0] : 'assets/images/default-product.jpg',
          category: product.collection || 'General',
          price: product.price || 0,
          status: this.getProductStatus(product),
          brand: product.brand || '',
          description: product.description || ''
        }));

        console.log('Recent products processed:', this.recentProducts);
      },
      error: (error) => {
        console.error('Error fetching recent products:', error);
        // Keep default products if API fails
      }
    });
  }

  private getProductStatus(product: any): string {
    // You can customize this logic based on your product properties
    if (product.status) {
      return product.status;
    }
    
    // Default status logic
    if (product.price > 0) {
      return 'in-stock';
    } else {
      return 'out-of-stock';
    }
  }



countOfProduct() {
  const sellerId = this.cookieService.getCookie('loginStatus');
  if (!sellerId) {
    console.error('Seller ID not found in cookies');
    return;
  }

  this.http.get<string>('http://localhost:8080/api/dashboard/stats/totalproducts', {
    params: { sellerId: sellerId }
  }).subscribe({
    next: (response) => {
      console.log('Total products:', response);
      const statValueElement = document.querySelector('.stat-value');
      if (statValueElement) {
        statValueElement.textContent = response.toString();
        this.stats.totalProducts = Number(response);
      }
    },
    error: (error) => {
      console.error('Error fetching product count:', error);
    }
  });
}

getTotalSales(){
  const sellerId = this.cookieService.getCookie('loginStatus');
  if (!sellerId) {
    console.error('Seller ID not found in cookies');
    return;
  }

  console.log('=== FETCHING TOTAL SALES ===');
  console.log('Seller ID from cookie:', sellerId);
  
  // First, let's check what products exist for this seller
  this.http.get<any[]>(`http://localhost:8080/api/dashboard/seller`, {
    params: { sellerId: sellerId }
  }).subscribe({
    next: (products) => {
      console.log('Products found for seller:', products.length);
      console.log('Product details:', products);
      
      // Calculate expected total
      let expectedTotal = 0;
      products.forEach((product, index) => {
        console.log(`Product ${index + 1}: ${product.items || product.collection} - Price: $${product.price}`);
        expectedTotal += product.price || 0;
      });
      console.log('Expected total sales:', expectedTotal);
    },
    error: (error) => {
      console.error('Error fetching products:', error);
    }
  });
  
  // Now get the calculated total from backend
  this.http.get<string>('http://localhost:8080/api/dashboard/stats/totalsales', {
    params: { sellerId: sellerId }
  }).subscribe({
    next: (response) => {
      console.log('Backend calculated total sales:', response);
      console.log('Response type:', typeof response);
      
      // Convert string response to number
      const salesValue = Number(response);
      console.log('Final sales value displayed:', salesValue);
      
      this.stats.totalSales = salesValue;
      
      // Alert user if values don't match expectations
      if (salesValue === 2 && this.expectedHigherValue()) {
        console.warn('⚠️  Backend returned 2 but expected higher value. Check backend calculation logic.');
      }
      
    },
    error: (error) => {
      console.error('Error fetching total sales:', error);
      console.error('Error details:', error.error);
    }
  });
}

private expectedHigherValue(): boolean {
  // Helper method to check if we expect a higher value
  return true; // You mentioned expecting 4500
}

// Template helper methods for recent products display
trackByProductId(index: number, product: any): any {
  return product.id || index;
}

getStatusClass(product: any): string {
  const status = product.status || product.availability || 'unknown';
  
  switch (status.toLowerCase()) {
    case 'in-stock':
    case 'available':
      return 'badge bg-success';
    case 'out-of-stock':
    case 'unavailable':
      return 'badge bg-danger';
    case 'low-stock':
    case 'limited':
      return 'badge bg-warning';
    default:
      return 'badge bg-secondary';
  }
}

getAllProducts() {
  const sellerId = this.cookieService.getCookie('loginStatus');
  if (!sellerId) {
    console.error('Seller ID not found in cookies');
    return;
  }

  console.log('=== FETCHING ALL PRODUCTS ===');
  console.log('Seller ID:', sellerId);

  this.http.get<any[]>(`${this.apiurl}/seller`, {
    params: { sellerId: sellerId }
  }).subscribe({
    next: (response) => {
      console.log('All products from database:', response);
      
      // Transform backend data to match frontend format
      this.recentProducts = response.map(product => ({
        id: product.id,
        name: product.items || product.collection || 'Unknown Product',
        image: product.images && product.images.length > 0 ? product.images[0] : 'assets/images/default-product.jpg',
        category: product.collection || 'General',
        price: product.price || 0,
        status: this.getProductStatus(product),
        brand: product.brand || '',
        description: product.description || ''
      }));

      console.log('Products processed:', this.recentProducts);
    },
    error: (error) => {
      console.error('Error fetching products from database:', error);
    }
  });
}

getStatusText(product: any): string {
  const status = product.status || product.availability || 'Unknown';
  // Capitalize first letter
  return status.charAt(0).toUpperCase() + status.slice(1);
}

editProduct(product: any) {
  console.log('Edit product:', product);
  // TODO: Navigate to edit product page or open modal
  // Example: this.router.navigate(['/dashboard/edit-product', product.id]);
  alert(`Edit functionality for "${product.name}" - Coming soon!`);
}

deleteProduct(product: any) {
  if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
    console.log('Delete product:', product);
    
    // TODO: Implement actual delete functionality
    const sellerId = this.cookieService.getCookie('loginStatus');
    this.http.delete(`http://localhost:8080/api/products/${product.id}`, {
      params: { sellerId: sellerId || '' }
    }).subscribe({
      next: (response) => {
        console.log('Product deleted:', response);
        // Refresh the recent products list
        this.getRecentProducts();
        alert('Product deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    });
  }
}
}
