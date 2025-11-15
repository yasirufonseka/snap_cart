import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { CarousalComponent } from "../carousal/carousal.component";
import { ProductShowcaseComponent } from "../product showcase/product-showcase.component";
import { AdCardComponent } from "../ad-card/ad-card.component";
import { ChatWidgetComponent } from "../chat-widget/chat-widget.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarousalComponent, ProductShowcaseComponent, AdCardComponent, ChatWidgetComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  products: any[] = [];
  featuredProducts: any[] = [];
  
  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.http.get<any[]>('http://localhost:8080/api/GetAllProduct')
      .subscribe({
        next: (data) => {
          console.log('Home component - Products received:', data);
          if (data && data.length > 0) {
            this.products = data;
            // Get first 9 products for the grid
            this.featuredProducts = data.slice(0, 10);
          }
        },
        error: (error) => {
          console.error('Home component - Error fetching products:', error);
          // Fallback to sample data or try alternative endpoint
          this.tryFallbackEndpoint();
        }
      });
  }
  
  tryFallbackEndpoint() {
    this.http.get<any[]>('http://localhost:8080/api/products')
      .subscribe({
        next: (data) => {
          console.log('Home component - Fallback products received:', data);
          this.products = data || [];
          this.featuredProducts = (data || []).slice(0, 10);
        },
        error: (error) => {
          console.error('Home component - Fallback endpoint failed:', error);
          this.products = [];
          this.featuredProducts = [];
        }
      });
  }
  
  getProductImage(product: any): string {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    } else if (product.imgUrl) {
      return product.imgUrl;
    } else if (product.image) {
      return product.image;
    }
    return 'https://via.placeholder.com/200x200?text=No+Image';
  }
  
  getProductName(product: any): string {
    return product.items || product.Item || product.title || product.name || 'Product';
  }
  
  getProductPrice(product: any): number {
    return product.price || product.Price || 0;
  }
  
  onProductClick(product: any) {
    console.log('Product clicked:', product);
    // Navigate to product detail page or open modal
  }
  
  onImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/200x200?text=No+Image';
    }
  }
  
  onFeaturedImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/600x400?text=No+Image';
    }
  }
  
  showOverlay(event: Event) {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.opacity = '1';
    }
  }
  
  hideOverlay(event: Event) {
    const target = event.target as HTMLElement;
    if (target) {
      target.style.opacity = '0';
    }
  }

}
