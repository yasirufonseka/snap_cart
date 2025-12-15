import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, Stats } from '../interface/product.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/products`, product);
  }

  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/dashboard/${id}`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dashboard/${id}`);
  }

  markAsSold(id: string): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/dashboard/${id}/sold`, {});
  }

  getStats(sellerId: string): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/dashboard/stats/seller/${sellerId}`);
  }
  getProductBySellerId(sellerId: string): Observable<Product[]> {   
    return this.http.get<Product[]>(`${this.apiUrl}/dashboard/seller/${sellerId}`);  
}
}