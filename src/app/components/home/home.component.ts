import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { CarousalComponent } from "../carousal/carousal.component";
import { ProductShowcaseComponent } from "../product showcase/product-showcase.component";
import { AdCardComponent } from "../ad-card/ad-card.component";
import { ChatWidgetComponent } from "../chat-widget/chat-widget.component";
import { AiChatbotComponent } from "../ai-chatbot/ai-chatbot.component";

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarousalComponent, ProductShowcaseComponent, AdCardComponent, ChatWidgetComponent, AiChatbotComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  
  
  filteredProducts: any[] = [];
  selectedPriceRange: number = 0;

  
  products: any[] = [];
  featuredProducts: any[] = [];
  
  constructor(private http: HttpClient) { }
  
  ngOnInit() {
    //this.loadProducts();
    this.tryFallbackEndpoint();
  }
  
  // loadProducts() {
  //   this.http.get<any[]>('http://localhost:8080/api/GetAllProduct')
  //     .subscribe({
  //       next: (data) => {
  //         console.log('Home component - Products received:', data);
  //         if (data && data.length > 0) {
  //           this.products = data;
  //           // Get first 9 products for the grid
  //           this.featuredProducts = data.slice(0, 10);
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Home component - Error fetching products:', error);
  //         // Fallback to sample data or try alternative endpoint
  //         this.tryFallbackEndpoint();
  //       }
  //     });
  // }

   

  getProductDescription(product: any): string {
    return product?.description || 'No description available';
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
  
  filterProductsByPrice(maxPrice: number): void {
    console.log('Filtering products by price:', maxPrice);
    this.selectedPriceRange = maxPrice;
    
    // If products are already loaded, filter from existing data
    if (this.products && this.products.length > 0) {
      this.filteredProducts = this.products.filter(product => {
        const price = this.getProductPrice(product);
        console.log(`Product: ${this.getProductName(product)}, Price: ${price}, Include: ${price <= maxPrice}`);
        return price > 0 && price <= maxPrice; // Only include products with valid prices
      });
      console.log('Filtered products:', this.filteredProducts.length);
    } else {
      // If products not loaded yet, fetch them first
      this.http.get<any[]>('http://localhost:8080/api/GetAllProduct').subscribe({
        next: (products) => {
          console.log('Fetched products for filtering:', products.length);
          this.products = products;
          this.filteredProducts = products.filter(product => {
            const price = this.getProductPrice(product);
            console.log(`Product: ${this.getProductName(product)}, Price: ${price}, Include: ${price <= maxPrice}`);
            return price > 0 && price <= maxPrice;
          });
          console.log('Filtered products:', this.filteredProducts.length);
        },
        error: (error) => {
          console.error('Error filtering products:', error);
          this.filteredProducts = [];
        }
      });
    }
  }

  clearFilter(): void {
    this.filteredProducts = [];
    this.selectedPriceRange = 0;
  }

}
