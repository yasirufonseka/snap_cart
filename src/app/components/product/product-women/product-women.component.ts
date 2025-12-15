import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { NgStyle } from "@angular/common";


export interface Product {
  id: string;
  images: string[];
  description: string;
  collection: string;
  items: string;
  condition: string;
  brand: string;
  serialNo: string;
  colour: string;
  size: string;
  age: number;
  city: string;
  price: number;
  discount: number;
  sellerId?: string;
  sellerName?: string;
  sellerEmail?: string;
  sellerPhone?: string;
  location?: string;
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
  selector: 'app-product-women',
  imports: [NgIf, NgFor, NgStyle],
  templateUrl: './product-women.component.html',
  styleUrl: './product-women.component.scss',
  
})
export class ProductWomenComponent implements OnInit {

   
 
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  Category_Name = 'Women';
  search_result = '';
  Popular_brands: String[] = [];

  private readonly apiUrl = 'http://localhost:8080/api/GetProduct/ByCollection/women';

  constructor(private http: HttpClient) {
    console.log('ProductMenComponent initialized');
    console.log('Fetching products from:', this.apiUrl);
    
  }

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading = true;
    this.error = null;
    this.http.get<Product[]>(this.apiUrl)
      .pipe(
        catchError(err => {
          console.error('Failed to load products', err);
          this.error = 'Failed to load products';
          this.loading = false;
          return of([] as Product[]);
        })
      )
      .subscribe((data: Product[]) => {
        this.products = data || [];
        this.products = this.products.filter((product: any) => { return product.status === 'approved' });
       // console.log('Products received:', this.products);
        this.loading = false;
        this.search_result = `${this.products.length} results`;
        console.log('Initial products:', this.products);
        this.Popular_brands = this.products.map((product)=>{
          return product.brand;
        });
      });
     
  }

  selectedProduct: Product | null = null;
    
  openModal(product: Product) {
    this.selectedProduct = product;
    // Optionally, reset carousel to first image (Bootstrap handles this by default)
  }

  openSellerModal() {
    if (this.selectedProduct && this.selectedProduct.sellerId) {
      console.log('Fetching seller info for sellerId:', this.selectedProduct.sellerId);
      this.fetchSellerInfo(this.selectedProduct.sellerId);
    } else {
      console.warn('No seller ID found for selected product');
    }
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
