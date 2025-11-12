import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interface/product.interface';

@Component({
  selector: 'app-product-listings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const sellerId = this.authService.getSellerId();
    console.log('=== LOAD PRODUCTS DEBUG ===');
    console.log('Seller ID from localStorage:', sellerId);
    console.log('User ID from localStorage:', this.authService.getUserId());
    console.log('User Role from localStorage:', this.authService.getRole());
    
    if (!sellerId) {
      console.error('❌ No seller ID found in localStorage');
      window.alert('Please log in as a seller first');
      return;
    }

    console.log('✓ Valid seller ID found');
    console.log('📡 Making API request to: http://localhost:8080/api/dashboard/seller/' + sellerId);
    
    this.productService.getProductBySellerId(sellerId)
      .subscribe({
        next: (products) => {
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
          this.filterProducts();
          console.log('✓ Products loaded and filtered successfully');
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
    this.productService.markAsSold(product.id)
      .subscribe({
        next: (updatedProduct) => {
          product.status = updatedProduct.status as 'available' | 'sold' | 'draft';
          window.alert('Product marked as sold successfully');
        },
        error: (error) => {
          console.error('Error marking product as sold:', error);
          window.alert('Failed to mark product as sold');
        }
      });
  }

  editProduct(product: Product) {
    // Navigate to edit page
    // This will be implemented when we create the edit component
    console.log('Edit product:', product.id);
  }

  deleteProduct(product: Product) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(product.id)
        .subscribe({
          next: () => {
            this.products = this.products.filter(p => p.id !== product.id);
            this.filterProducts();
            window.alert('Product deleted successfully');
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            window.alert('Failed to delete product');
          }
        });
    }
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
}
