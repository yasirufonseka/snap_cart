import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink,RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, CommonModule, RouterLinkActive, FormsModule],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {


  // track which bottom nav item is active; use route names or simple keys
  active: string = '';
  cartItemCount: number = 0;
  private cartSubscription?: Subscription;
  
  // Search properties
  searchQuery: string = '';
  searchResults: any[] = [];
  showSearchResults: boolean = false;
  isSearching: boolean = false;

  constructor(
    private cartService: CartService,
    public cookieService: CookieHandlerService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to cart updates to show item count
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.totalItems || 0;
    });

    // Initialize cart for logged in user and debug login status
    const userId = this.cookieService.getUserId();
    const userRole = this.cookieService.getUserRole();
    const isLoggedIn = this.cookieService.isLoggedIn();
    
    // console.log("=== NAV-BAR INIT DEBUG ====");
    // console.log("User ID:", userId);
    // console.log("User Role:", userRole);
    // console.log("Is Logged In:", isLoggedIn);
    // console.log("All Cookies:", this.cookieService.getAllCookies());
    // console.log("=== END DEBUG ====");
    
    if (userId) {
      this.cartService.initializeCart(userId);
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();

    }
    
    
  }



navigateToDashboard() {
  const userRole = this.getUserRole();
  const isLoggedIn = this.isLoggedIn();
  
 // console.log('Navigate to dashboard - Role:', userRole, 'Logged In:', isLoggedIn);
  
  if (!isLoggedIn) {
   // console.log('User not logged in, redirecting to login');
    this.router.navigate(['/SignIn']);
    return;
  }
  
  if (userRole === 'admin') {
    // console.log('Navigating to admin dashboard');
    this.router.navigate(['/admin-dashboard']);
  } else if (userRole === 'seller') {
    // console.log('Navigating to seller dashboard');
    this.router.navigate(['/dashboard']);
  } else {
    // console.log('Invalid role for dashboard access:', userRole);
    alert('You do not have permission to access the dashboard.');
  }
}

  setActive(key: string) {
   this.active = key;
  }

  getUserRole() {
    const role = this.cookieService.getUserRole();
   // console.log("Current user role from cookie:", role);
    return role;
  }

  getUserId() {
    const userId = this.cookieService.getUserId();
    //console.log("Current user ID from cookie:", userId);
    return userId;
  }

  getUserName() {
    const userName = this.cookieService.getUserName();
   // console.log("Current user name from cookie:", userName);
    return userName;
  }

  getUserEmail() {
    const userEmail = this.cookieService.getUserEmail();
  // console.log("Current user email from cookie:", userEmail);
    return userEmail;
  }

  isLoggedIn() {
    const loggedIn = this.cookieService.isLoggedIn();
  // console.log("Is user logged in:", loggedIn);
    return loggedIn;
  }

  // Check if account is a regular user/customer
  isUser() {
    return this.cookieService.isCustomer();
  }

  // Check if account is admin
  isAdmin() {
    return this.cookieService.isAdmin();
  }

  // Check if account is seller
  isSeller() {
    return this.cookieService.isSeller();
  }

  // Get account type as string
  getAccountType(): string {
    const role = this.getUserRole();
    if (!role) return 'Guest';
    
    switch(role.toLowerCase()) {
      case 'admin': return 'Administrator';
      case 'seller': return 'Seller';
      case 'customer': return 'Customer';
      case 'user': return 'User';
      default: return 'User';
    }
  }

  // Search functionality
  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.showSearchResults = false;
      this.searchResults = [];
      return;
    }

    // Add delay for better UX
    if (this.searchQuery.length < 2) {
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.showSearchResults = true;
    
    this.http.get<any[]>(`http://localhost:8080/api/search?query=${encodeURIComponent(this.searchQuery)}`)
      .subscribe({
        next: (results) => {
          this.searchResults = results || [];
          this.isSearching = false;
          console.log('Search results:', results);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.searchResults = [];
          this.isSearching = false;
        }
      });
  }

  onSearchEnter(): void {
    if (this.searchQuery.trim()) {
      this.showSearchResults = false;
      // Navigate to product-kids component with search query
      this.router.navigate(['/product-kids'], { 
        queryParams: { search: this.searchQuery } 
      });
    }
  }

  onSearchFocus(): void {
    if (this.searchResults.length > 0) {
      this.showSearchResults = true;
    }
  }

  onSearchBlur(): void {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      this.showSearchResults = false;
    }, 200);
  }

  selectProduct(product: any): void {
    this.showSearchResults = false;
    this.searchQuery = product.description || product.items || '';
    console.log('Selected product:', product);
    
    // Navigate to product-kids component with search parameter
    this.router.navigate(['/product-detail', product], { queryParams: { search: product.description || product.items } });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  // Enhanced logout method
  logout(): void {
    // console.log('=== LOGOUT PROCESS ===');
    // console.log('Current user before logout:', {
    //   id: this.getUserId(),
    //   name: this.getUserName(),
    //   email: this.getUserEmail(),
    //   role: this.getUserRole()
    // });
    
    // Get user ID before clearing cookies
    const userId = this.getUserId();
    
    // Clear cart service (if user was logged in)
    if (userId) {
      this.cartService.clearCart(userId).subscribe({
        next: () => console.log('Cart cleared successfully'),
        error: (error) => console.error('Error clearing cart:', error)
      });
    }
    
    // Clear all cookies
    this.cookieService.logout();
    
    // Reset cart count
    this.cartItemCount = 0;
    
    // Redirect to home page
    this.router.navigate(['/']);
    
    // Show success message
    console.log('Logout completed, cookies cleared');
  }
}