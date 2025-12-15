import { HttpClient } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CookieHandlerService } from '../../services/cookie.handle';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

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
  imports: [CurrencyPipe, CommonModule,RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  @ViewChild('soldProductsChart', { static: false }) soldProductsChartRef!: ElementRef<HTMLCanvasElement>;

  constructor(private http: HttpClient, private cookieService: CookieHandlerService) {
    Chart.register(...registerables);
  }
  
  recentProducts: ProductDisplayItem[] = [];
  private apiurl="http://localhost:8080/api/dashboard";
  private soldProductsChart: Chart | null = null;
  dailySoldProductsData: any[] = [];
  soldProductsStats = {
    today: 0,
    thisWeek: 0,
    total: 0
  };

  
    totalSales:number = 0;
    totalProducts:number = 0;
  


  ngOnInit(): void {
    console.log('=== DASHBOARD LOADING ===');
    this.debugBackendData();
    this.countOfProduct();
    this.getTotalSales();
    this.getRecentProducts();
    this.getDailySoldProducts();
  }

  ngAfterViewInit(): void {
    // Initialize chart after view is rendered
    setTimeout(() => {
      if (this.dailySoldProductsData.length > 0) {
        this.createSoldProductsChart();
      }
      // Chart will be created when data is loaded from API
    }, 500);
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
          image: product.images && product.images.length > 0 ? product.images[0] : 'assets/images/default-product.svg',
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
        this.totalProducts = Number(response);
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

  console.log('=== FETCHING TOTAL SALES FROM SOLD PRODUCTS ===');
  console.log('Seller ID from cookie:', sellerId);
  
  // Get products and calculate total sales from SOLD products only
  this.http.get<any[]>(`http://localhost:8080/api/dashboard/seller`, {
    params: { sellerId: sellerId }
  }).subscribe({
    next: (products) => {
      console.log('Total products found for seller:', products.length);
      
      // Filter only SOLD products and calculate total revenue
      let soldProductsRevenue = 0;
      let soldProductsCount = 0;
      
      products.forEach((product, index) => {
        const status = product.status ? product.status.toLowerCase() : '';
        const price = product.price || 0;
        
        console.log(`Product ${index + 1}: ${product.items || product.collection} - Status: "${product.status}" - Price: $${price}`);
        
        // Only count products with status "sold"
        if (status === 'sold') {
          soldProductsRevenue += price;
          soldProductsCount++;
          console.log(`✅ SOLD Product: ${product.items || product.collection} - Added $${price} to revenue`);
        }
      });
      
      // Set the total sales from sold products only
      this.totalSales = soldProductsRevenue;
      
      console.log('🎯 SOLD PRODUCTS SUMMARY:');
      console.log(`📦 Total products: ${products.length}`);
      console.log(`💰 Sold products: ${soldProductsCount}`);
      console.log(`💵 Total revenue from sold products: $${soldProductsRevenue}`);
      console.log('✅ Total sales updated:', this.totalSales);
      
      if (soldProductsCount === 0) {
        console.warn('⚠️  No products with status="sold" found. Make sure to mark products as sold in product listings.');
      }
    },
    error: (error) => {
      console.error('❌ Error fetching products:', error);
      this.totalSales = 0;
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

getDailySoldProducts() {
  const sellerId = this.cookieService.getCookie('loginStatus');
  if (!sellerId) {
    console.error('Seller ID not found in cookies');
    return;
  }

  console.log('=== FETCHING DAILY SOLD PRODUCTS ===');
  console.log('Seller ID:', sellerId);

  this.http.get<any[]>(`${this.apiurl}/stats/daily-sold-products`, {
    params: { sellerId: sellerId, days: '7' }
  }).subscribe({
    next: (response) => {
      console.log('Daily sold products data from backend:', response);
      this.dailySoldProductsData = response;
      this.calculateSoldProductsStats();
      
      // Create chart if view is already initialized
      if (this.soldProductsChartRef) {
        this.createSoldProductsChart();
      }
    },
    error: (error) => {
      console.error('Error fetching daily sold products:', error);
      // Initialize empty data if API fails
      this.dailySoldProductsData = [];
      this.soldProductsStats = { today: 0, thisWeek: 0, total: 0 };
    }
  });
}

calculateSoldProductsStats() {
  if (!this.dailySoldProductsData || this.dailySoldProductsData.length === 0) {
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // Calculate today's sold products
  const todayData = this.dailySoldProductsData.find(item => item.date === today);
  this.soldProductsStats.today = todayData ? todayData.soldCount : 0;

  // Calculate this week's sold products
  this.soldProductsStats.thisWeek = this.dailySoldProductsData
    .filter(item => new Date(item.date) >= oneWeekAgo)
    .reduce((sum, item) => sum + (item.soldCount || 0), 0);

  // Calculate total sold products
  this.soldProductsStats.total = this.dailySoldProductsData
    .reduce((sum, item) => sum + (item.soldCount || 0), 0);
}

private createDummySoldProductsData() {
  const today = new Date();
  this.dailySoldProductsData = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    this.dailySoldProductsData.push({
      date: date.toISOString().split('T')[0],
      soldCount: Math.floor(Math.random() * 10) + 1 // Random sold products between 1-10
    });
  }
  
  console.log('Created dummy sold products data:', this.dailySoldProductsData);
}

createSoldProductsChart() {
  if (!this.soldProductsChartRef) {
    console.log('Chart ref not ready');
    return;
  }

  // Handle empty data case - show empty chart with message
  if (!this.dailySoldProductsData || this.dailySoldProductsData.length === 0) {
    console.log('No sold products data available, showing empty chart');
  }

  const ctx = this.soldProductsChartRef.nativeElement.getContext('2d');
  if (!ctx) {
    console.error('Could not get chart context');
    return;
  }

  // Destroy existing chart if it exists
  if (this.soldProductsChart) {
    this.soldProductsChart.destroy();
  }

  // Generate labels and data, handle empty data case
  const labels = this.dailySoldProductsData && this.dailySoldProductsData.length > 0 
    ? this.dailySoldProductsData.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })
    : ['No Data'];

  const data = this.dailySoldProductsData && this.dailySoldProductsData.length > 0 
    ? this.dailySoldProductsData.map(item => item.soldCount)
    : [0];

  const config: ChartConfiguration = {
    type: 'bar' as ChartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'Products Sold',
        data: data,
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
        borderColor: '#1976d2',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        title: {
          display: true,
          text: 'Daily Sold Products Overview',
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return Number(value) + ' products';
            }
          }
        },
        x: {
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  };

  this.soldProductsChart = new Chart(ctx, config);
  console.log('Sold products chart created successfully');
}

// Chart period selection methods
selectChartPeriod(period: string, event?: Event) {
  console.log('Selected chart period:', period);
  
  // Remove active class from all buttons
  const buttons = document.querySelectorAll('.chart-actions .btn-outline');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  // Add active class to clicked button
  if (event?.target) {
    (event.target as HTMLElement).classList.add('active');
  }
  
  // Update chart data based on period
  let days = 7;
  switch (period) {
    case 'weekly':
      days = 7;
      break;
    case 'monthly':
      days = 30;
      break;
    case 'yearly':
      days = 365;
      break;
  }
  
  // Fetch new data
  const sellerId = this.cookieService.getCookie('loginStatus');
  if (sellerId) {
    this.http.get<any[]>(`${this.apiurl}/stats/daily-sold-products`, {
      params: { sellerId: sellerId, days: days.toString() }
    }).subscribe({
      next: (response) => {
        this.dailySoldProductsData = response;
        this.calculateSoldProductsStats();
        this.createSoldProductsChart();
      },
      error: (error) => {
        console.error('Error fetching daily sold products for period:', error);
        // Initialize empty data if API fails
        this.dailySoldProductsData = [];
        this.soldProductsStats = { today: 0, thisWeek: 0, total: 0 };
        this.createSoldProductsChart();
      }
    });
  }
}
}
