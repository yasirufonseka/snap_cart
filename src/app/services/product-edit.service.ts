import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductEditModel, ProductResponseModel } from '../shared/models/product-edit.model';

@Injectable({
  providedIn: 'root'
})
export class ProductEditService {

  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  /**
   * Save a new product
   */
  saveProduct(product: ProductEditModel): Observable<string> {
    return this.http.post(`${this.apiUrl}/SaveProduct`, product, { responseType: 'text' });
  }

  /**
   * Update an existing product
   */
  updateProduct(product: ProductEditModel): Observable<string> {
    return this.http.put(`${this.apiUrl}/UpdateProduct`, product, { responseType: 'text' });
  }

  /**
   * Get product by ID
   */
  getProductById(productId: string): Observable<ProductResponseModel> {
    return this.http.get<ProductResponseModel>(`${this.apiUrl}/GetProduct/${productId}`);
  }

  /**
   * Get all products by seller ID
   */
  getProductsBySeller(sellerId: string): Observable<ProductResponseModel[]> {
    return this.http.get<ProductResponseModel[]>(`${this.apiUrl}/GetProductsBySeller/${sellerId}`);
  }

  /**
   * Delete a product
   */
  deleteProduct(productId: string): Observable<string> {
    return this.http.delete(`${this.apiUrl}/DeleteProduct/${productId}`, { responseType: 'text' });
  }
}
