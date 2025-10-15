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
}


@Component({
  selector: 'app-product-women',
  imports: [NgIf, NgFor, NgStyle],
  templateUrl: './product-women.component.html',
  styleUrl: './product-women.component.scss',
  
})
export class ProductWomenComponent implements OnInit {

   // Function to open modal (to be implemented)
  openModal(product: Product) {
    // Implement modal opening logic here
  }
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
        this.loading = false;
        this.search_result = `${this.products.length} results`;
        console.log('Initial products:', this.products);
        this.Popular_brands = this.products.map((product)=>{
          return product.brand;
        });
      });
     
  }

}
