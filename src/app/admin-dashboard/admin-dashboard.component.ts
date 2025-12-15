import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';

interface PendingProduct {
  id: string;
  _id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand: string;
  serialNo: string;
  size: string;
  city: string;
  collection?: string;
  items?: string;
  condition?: string;
  colour?: string;
  discount?: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'declined' | 'sold';
}

interface User {
  id: string;
  username: string;
  email: string;
  role: 'customer' | 'seller' | 'admin';
  createdAt: Date;
  isActive: boolean;
  profileImage?: string;
}

interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalSales: number;
  totalReviews: number;
  dailyProductStats: { date: string; count: number }[];
  userGrowthStats: { date: string; count: number }[];
}
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

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('productChart', { static: false }) productChartRef!: ElementRef<HTMLCanvasElement>;
  private productChart: Chart | null = null;
  // Sidebar navigation
  activeView: 'overview' | 'products' | 'users' | 'orders' | 'analytics' | 'settings' = 'overview';

   apiUrl: string = 'http://localhost:8080/api/dashboard/seller';
  
  // Products
  allProducts: PendingProduct[] = [];
  pendingProducts: PendingProduct[] = [];
  approvedProducts: PendingProduct[] = [];
  declinedProducts: PendingProduct[] = [];
  selectedProduct: PendingProduct | null = null;
   searchQuery: string = '';
  activeTab: string = 'pending';
  
  // Users
  allUsers: User[] = [];
  activeUserTab: string = 'all';
  selectedUser: User | null = null;
  
  // Stats and Overview
  dashboardStats: DashboardStats | null = null;
  chartData: any = null;
  chartOptions: any = {};
  
  // UI State
  isLoading: boolean = false;
  selectedImageIndex: number = 0;
  
  // Settings
  activeSettingsTab: 'profile' | 'security' | 'preferences' | 'system' = 'profile';
  currentUser: any = {
    id: 'admin-1',
    name: 'Admin User',
    username: 'admin',
    email: 'admin@snapcart.com',
    contact: '+1-234-567-8900',
    role: 'admin',
    profileImage: '/api/placeholder/100/100'
  };
  currentDate = new Date();
  profileForm: any = {};
  passwordForm: any = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isUpdatingProfile: boolean = false;
  isUpdatingPassword: boolean = false;
  products: Product[] = [];

  constructor(private http: HttpClient) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.loadDashboardData();
    this.initializeProfileForm();
  }

  ngAfterViewInit() {
    // Chart will be initialized after data is loaded and view is ready
    if (this.dashboardStats) {
      setTimeout(() => {
        this.initializeChart();
      }, 100);
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load all data concurrently
    Promise.all([
      this.loadAllProducts(),
      this.loadAllUsers(),
      this.loadDashboardStats()
    ]).finally(() => {
      this.isLoading = false;
    });
  }

  loadAllProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<PendingProduct[]>('http://localhost:8080/api/admin/all-products')
        .subscribe({
          next: (products) => {
            this.allProducts = products;
            this.categorizeProducts();
            resolve();
          },
          error: (error) => {
            console.error('Error loading products:', error);
            this.loadMockProductData();
            resolve();
          }
        });
    });
  }

  loadAllUsers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.get<User[]>('http://localhost:8080/api/admin/users')
        .subscribe({
          next: (users) => {
            this.allUsers = users;
            resolve();
          },
          error: (error) => {
            console.error('Error loading users:', error);
            this.loadMockUserData();
            resolve();
          }
        });
    });
  }

  loadDashboardStats(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Loading dashboard stats from API...');
      this.http.get<DashboardStats>('http://localhost:8080/api/admin/dashboard-stats')
        .subscribe({
          next: (stats) => {
            console.log('Dashboard stats loaded successfully from API:', stats);
            this.dashboardStats = stats;
            this.updateChartData();
            resolve();
          },
          error: (error) => {
            console.error('Error loading dashboard stats from API, falling back to mock data:', error);
            this.loadMockStatsData();
            resolve();
          }
        });
    });
  }

  categorizeProducts() {
    this.pendingProducts = this.allProducts.filter(p => p.status === 'pending');
    this.approvedProducts = this.allProducts.filter(p => p.status === 'approved');
    this.declinedProducts = this.allProducts.filter(p => p.status === 'declined');
  }

  loadMockProductData() {
    this.allProducts = [
      {
        id: '1',
        name: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 199.99,
        brand: 'SoundMax',
        serialNo: 'SMX-1000',
        size: 'Standard',
        city: 'Colombo',
        category: 'Electronics',
        images: ['/api/placeholder/400/400', '/api/placeholder/400/401'],
        sellerId: 'seller1',
        sellerName: 'Tech Store',
        createdAt: new Date('2024-01-15'),
        status: 'pending'
      },
      {
        id: '2',
        name: 'Summer Dress',
        description: 'Beautiful floral summer dress for women',
        price: 79.99,
         brand: 'SoundMax',
        serialNo: 'SMX-1000',
        size: 'Standard',
        city: 'Colombo',
        category: 'Fashion',
        images: ['/api/placeholder/400/402', '/api/placeholder/400/403'],
        sellerId: 'seller2',
        sellerName: 'Fashion Hub',
        createdAt: new Date('2024-01-16'),
        status: 'approved'
      },
      {
        id: '3',
        name: 'Gaming Mouse',
        description: 'High-performance gaming mouse with RGB lighting',
        price: 59.99,
         brand: 'SoundMax',
        serialNo: 'SMX-1000',
        size: 'Standard',
        city: 'Colombo',
        category: 'Electronics',
        images: ['/api/placeholder/400/404', '/api/placeholder/400/405'],
        sellerId: 'seller1',
        sellerName: 'Tech Store',
        createdAt: new Date('2024-01-17'),
        status: 'declined'
      }
    ];
    this.categorizeProducts();
  }

  loadMockUserData() {
    this.allUsers = [
      {
        id: '1',
        username: 'john_doe',
        email: 'john@example.com',
        role: 'customer',
        createdAt: new Date('2024-01-10'),
        isActive: true,
        profileImage: '/api/placeholder/50/50'
      },
      {
        id: '2',
        username: 'tech_store_admin',
        email: 'admin@techstore.com',
        role: 'seller',
        createdAt: new Date('2024-01-05'),
        isActive: true,
        profileImage: '/api/placeholder/50/51'
      },
      {
        id: '3',
        username: 'fashion_seller',
        email: 'seller@fashion.com',
        role: 'seller',
        createdAt: new Date('2024-01-12'),
        isActive: false,
        profileImage: '/api/placeholder/50/52'
      },
      {
        id: '4',
        username: 'admin_user',
        email: 'admin@snapcart.com',
        role: 'admin',
        createdAt: new Date('2024-01-01'),
        isActive: true,
        profileImage: '/api/placeholder/50/53'
      }
    ];
  }

  loadMockStatsData() {
    const today = new Date();
    const dailyStats = [];
    const userGrowthStats = [];
    
    // Generate last 30 days of data
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats.push({
        date: dateStr,
        count: Math.floor(Math.random() * 15) + 1 // 1-15 products per day
      });
      
      userGrowthStats.push({
        date: dateStr,
        count: Math.floor(Math.random() * 10) + 1 // 1-10 users per day
      });
    }
    
    this.dashboardStats = {
      totalProducts: this.allProducts.length,
      totalUsers: this.allUsers.length,
      totalSales: 45670,
      totalReviews: 1250,
      dailyProductStats: dailyStats,
      userGrowthStats: userGrowthStats
    };
    
 //   console.log('Mock stats loaded:', this.dashboardStats);
    this.updateChartData();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  viewProduct(product: PendingProduct) {
    this.selectedProduct = product;
    this.selectedImageIndex = 0;
  }

  closeProductView() {
    this.selectedProduct = null;
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  approveProduct(productId: string) {
    this.isLoading = true;
    this.http.post(`http://localhost:8080/api/admin/approve-product/${productId}`, {})
      .subscribe({
        next: () => {
          this.closeProductView();
          this.loadAllProducts(); // Refresh all products
          alert('Product approved successfully!');
        },
        error: (error) => {
          console.error('Error approving product:', error);
          this.isLoading = false;
          // Mock approval for development
          this.updateProductStatus(productId, 'approved');
          this.closeProductView();
          alert('Product approved successfully!');
        }
      });
  }

  declineProduct(productId: string, reason?: string) {
    this.isLoading = true;
    const payload = { reason: reason || 'Product does not meet our guidelines' };
    
    this.http.post(`http://localhost:8080/api/admin/decline-product/${productId}`, payload)
      .subscribe({
        next: () => {
          this.closeProductView();
          this.loadAllProducts(); // Refresh all products
          alert('Product declined successfully!');
        },
        error: (error) => {
          console.error('Error declining product:', error);
          this.isLoading = false;
          // Mock decline for development
          this.updateProductStatus(productId, 'declined');
          this.closeProductView();
          alert('Product declined successfully!');
        }
      });
  }

  private updateProductStatus(productId: string, status: 'approved' | 'declined') {
    const product = this.allProducts.find(p => p.id === productId);
    if (product) {
      product.status = status;
      this.categorizeProducts();
    }
  }

  initializeChart() {
    if (!this.productChartRef || !this.dashboardStats) {
      console.log('Chart initialization skipped:', { 
        chartRef: !!this.productChartRef, 
        stats: !!this.dashboardStats 
      });
      return;
    }

    const ctx = this.productChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2d context from canvas');
      return;
    }

   // console.log('Initializing chart with data:', this.dashboardStats.dailyProductStats);

    // Destroy existing chart if it exists
    if (this.productChart) {
      this.productChart.destroy();
    }

    const chartData: ChartData<'line'> = {
      labels: this.dashboardStats.dailyProductStats.map(stat => {
        const date = new Date(stat.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Products Added',
          data: this.dashboardStats.dailyProductStats.map(stat => stat.count),
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(102, 126, 234)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }
      ]
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          },
          title: {
            display: true,
            text: 'Daily Product Additions',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          }
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            display: true,
            title: {
              display: true,
              text: 'Number of Products',
              font: {
                size: 14,
                weight: 'bold'
              }
            },
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        },
        elements: {
          point: {
            hoverRadius: 8
          }
        }
      }
    };

    this.productChart = new Chart(ctx, config);
  }

  updateChartData() {
    if (!this.dashboardStats) return;
    
    // Initialize chart after data is loaded and view is ready
    if (this.productChartRef) {
      setTimeout(() => {
        this.initializeChart();
      }, 100);
    }
  }

  // Navigation methods
  setActiveView(view: 'overview' | 'products' | 'users' | 'orders' | 'analytics' | 'settings') {
    this.activeView = view;
    
    // Initialize chart when switching to overview
    if (view === 'overview' && this.dashboardStats) {
      setTimeout(() => {
        this.initializeChart();
      }, 200);
    }
  }

  // User management methods
  setActiveUserTab(tab: string) {
    this.activeUserTab = tab;
  }

  viewUser(user: User) {
    this.selectedUser = user;
  }

  closeUserView() {
    this.selectedUser = null;
  }

  toggleUserStatus(userId: string) {
    this.http.post(`http://localhost:8080/api/admin/toggle-user-status/${userId}`, {})
      .subscribe({
        next: () => {
          this.loadAllUsers();
          alert('User status updated successfully!');
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          // Mock toggle for development
          const user = this.allUsers.find(u => u.id === userId);
          if (user) {
            user.isActive = !user.isActive;
          }
          alert('User status updated successfully!');
        }
      });
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`http://localhost:8080/api/admin/delete-user/${userId}`)
        .subscribe({
          next: () => {
            this.loadAllUsers();
            this.closeUserView();
            alert('User deleted successfully!');
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            // Mock delete for development
            this.allUsers = this.allUsers.filter(u => u.id !== userId);
            this.closeUserView();
            alert('User deleted successfully!');
          }
        });
    }
  }

  get filteredProducts() {
    switch (this.activeTab) {
      case 'pending':
        return this.pendingProducts;
      case 'approved':
        return this.approvedProducts;
      case 'declined':
        return this.declinedProducts;
      default:
        return this.pendingProducts;
    }
  }

  get filteredUsers() {
    switch (this.activeUserTab) {
      case 'all':
        return this.allUsers;
      case 'customers':
        return this.allUsers.filter(u => u.role === 'customer');
      case 'sellers':
        return this.allUsers.filter(u => u.role === 'seller');
      case 'admins':
        return this.allUsers.filter(u => u.role === 'admin');
      case 'active':
        return this.allUsers.filter(u => u.isActive);
      case 'inactive':
        return this.allUsers.filter(u => !u.isActive);
      default:
        return this.allUsers;
    }
  }

  // Helper methods for counting users
  getCustomersCount(): number {
    return this.allUsers.filter(u => u.role === 'customer').length;
  }

  getSellersCount(): number {
    return this.allUsers.filter(u => u.role === 'seller').length;
  }

  getAdminsCount(): number {
    return this.allUsers.filter(u => u.role === 'admin').length;
  }

  getActiveUsersCount(): number {
    return this.allUsers.filter(u => u.isActive).length;
  }

  getInactiveUsersCount(): number {
    return this.allUsers.filter(u => !u.isActive).length;
  }
  
  // Settings methods
  setActiveSettingsTab(tab: 'profile' | 'security' | 'preferences' | 'system') {
    this.activeSettingsTab = tab;
    if (tab === 'profile') {
      this.initializeProfileForm();
    }
  }
  
  initializeProfileForm() {
    this.profileForm = {
      name: this.currentUser.name,
      username: this.currentUser.username,
      email: this.currentUser.email,
      contact: this.currentUser.contact
    };
  }
  
  updateProfile() {
    if (!this.validateProfileForm()) {
      return;
    }
    
    this.isUpdatingProfile = true;
    
    // Simulate API call - replace with actual endpoint
    setTimeout(() => {
      this.currentUser = {
        ...this.currentUser,
        ...this.profileForm
      };
      this.isUpdatingProfile = false;
      alert('Profile updated successfully!');
    }, 1500);
    
    // Actual API call would be:
    // this.http.put(`http://localhost:8080/api/admin/profile/${this.currentUser.id}`, this.profileForm)
    //   .subscribe({
    //     next: (response) => {
    //       this.currentUser = { ...this.currentUser, ...this.profileForm };
    //       this.isUpdatingProfile = false;
    //       alert('Profile updated successfully!');
    //     },
    //     error: (error) => {
    //       console.error('Error updating profile:', error);
    //       this.isUpdatingProfile = false;
    //       alert('Error updating profile. Please try again.');
    //     }
    //   });
  }
  
  validateProfileForm(): boolean {
    if (!this.profileForm.name || this.profileForm.name.trim().length < 2) {
      alert('Name must be at least 2 characters long');
      return false;
    }
    
    if (!this.profileForm.username || this.profileForm.username.trim().length < 3) {
      alert('Username must be at least 3 characters long');
      return false;
    }
    
    if (!this.profileForm.email || !this.isValidEmail(this.profileForm.email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    if (!this.profileForm.contact || this.profileForm.contact.trim().length < 10) {
      alert('Please enter a valid contact number');
      return false;
    }
    
    return true;
  }
  
  updatePassword() {
    if (!this.validatePasswordForm()) {
      return;
    }
    
    this.isUpdatingPassword = true;
    
    // Simulate API call - replace with actual endpoint
    setTimeout(() => {
      this.isUpdatingPassword = false;
      this.passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      alert('Password updated successfully!');
    }, 1500);
    
    // Actual API call would be:
    // this.http.put(`http://localhost:8080/api/admin/password/${this.currentUser.id}`, {
    //   currentPassword: this.passwordForm.currentPassword,
    //   newPassword: this.passwordForm.newPassword
    // }).subscribe({
    //   next: (response) => {
    //     this.isUpdatingPassword = false;
    //     this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    //     alert('Password updated successfully!');
    //   },
    //   error: (error) => {
    //     console.error('Error updating password:', error);
    //     this.isUpdatingPassword = false;
    //     alert('Error updating password. Please try again.');
    //   }
    // });
  }
  
  validatePasswordForm(): boolean {
    if (!this.passwordForm.currentPassword) {
      alert('Please enter your current password');
      return false;
    }
    
    if (!this.passwordForm.newPassword || this.passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return false;
    }
    
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New password and confirm password do not match');
      return false;
    }
    
    return true;
  }
  
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  resetProfileForm() {
    this.initializeProfileForm();
  }
  
  resetPasswordForm() {
    this.passwordForm = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Logout functionality
  logout() {
    // Clear any stored user data
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    localStorage.removeItem('adminSession');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to login page
    window.location.href = '/sign';
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
  }
    canDeleteProduct(product: Product): boolean {
   // console.log(`Can delete product with status: "${product.status}"`);
    // Allow deletion for declined, pending, and draft products
    return product.status === 'declined' || 
           product.status === 'pending' || 
           product.status === 'draft' ||
           product.status === 'approved' || 
           product.status === undefined;
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
            this.allProducts = this.allProducts.filter(p => (p.id !== productId ));
            
            // Re-categorize products after deletion
            this.categorizeProducts();
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
  canEditProduct(product: any): boolean {
  //  console.log(`Can edit product with status: "${product.status}"`);
    // Allow editing for all statuses except sold
    return product.status !== 'sold';
  }
}
