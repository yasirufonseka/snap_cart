import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CheckoutRequest {
  userId: string;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface CheckoutItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  orderId: string;
  clientSecret?: string;
  paymentIntentId?: string;
  totalAmount: number;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentInfo: PaymentInfo;
  status: string;
  statusMessage: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery: string;
  trackingNumber: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sellerId: string;
  brand: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

export interface PaymentInfo {
  paymentMethod: string;
  paymentIntentId: string;
  transactionId: string;
  paymentStatus: string;
  paymentDate: string;
  cardLast4: string;
  cardBrand: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private apiUrl = 'http://localhost:8080/api/checkout';

  constructor(private http: HttpClient) {
    console.log('CheckoutService initialized');
  }

  /**
   * Create order and initiate payment
   */
  createOrder(checkoutRequest: CheckoutRequest): Observable<PaymentResponse> {
    console.log('=== CREATING ORDER ===');
    console.log('Request:', checkoutRequest);
    
    return this.http.post<PaymentResponse>(`${this.apiUrl}/create-order`, checkoutRequest);
  }

  /**
   * Confirm payment after Stripe confirmation
   */
  confirmPayment(paymentIntentId: string): Observable<any> {
    console.log('=== CONFIRMING PAYMENT ===');
    console.log('Payment Intent ID:', paymentIntentId);
    
    return this.http.post(`${this.apiUrl}/confirm-payment/${paymentIntentId}`, {});
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/order/${orderId}`);
  }

  /**
   * Get user's orders
   */
  getUserOrders(userId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/user/${userId}`);
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: string, message?: string): Observable<Order> {
    const params: any = { status };
    if (message) {
      params.message = message;
    }
    
    return this.http.put<Order>(`${this.apiUrl}/order/${orderId}/status`, null, { params });
  }

  /**
   * Process refund
   */
  processRefund(orderId: string, amount: number): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${this.apiUrl}/refund/${orderId}`, null, {
      params: { amount: amount.toString() }
    });
  }

  /**
   * Get seller's orders
   */
  getSellerOrders(sellerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/orders/seller/${sellerId}`);
  }
}