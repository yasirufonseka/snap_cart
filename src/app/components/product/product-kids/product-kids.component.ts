import { NgFor, NgIf, NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { catchError, of } from 'rxjs';


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
}


@Component({
  selector: 'app-product-kids',
  imports: [NgIf,NgFor,NgStyle],
  templateUrl: './product-kids.component.html',
  styleUrl: './product-kids.component.scss'
})
export class ProductKidsComponent {

  product: any;

  // Function to open modal (to be implemented)
  // Removed duplicate openModal method
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  Category_Name = 'Kids';
  search_result = '';
  Popular_brands: String[] = [];

  private readonly apiUrl = 'http://localhost:8080/api/GetProduct/ByCollection/kids';

  constructor(private http: HttpClient) {
    console.log('ProductKidsComponent initialized');
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
        this.loading = false;
        this.search_result = `${this.products.length} results`;
        console.log('Initial products:', this.products);
        this.Popular_brands = Array.from(new Set(this.products.map(p => p.brand))).filter(Boolean);
      });
     
  }
  selectedProduct: Product | null = null;
  
  openModal(product: Product) {
    this.selectedProduct = product;
    // Optionally, reset carousel to first image (Bootstrap handles this by default)
  }

}
