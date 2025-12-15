package com.example.SnapCart.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "orders")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    
    @Id
    private String id;
    
    private String userId;
    private String userEmail;
    private String userName;
    
    // Order items
    private List<OrderItem> items;
    
    // Pricing
    private double subtotal;
    private double tax = 0.0;
    private double shippingCost = 0.0;
    private double totalAmount;
    
    // Shipping address
    private Address shippingAddress;
    
    // Payment info
    private PaymentInfo paymentInfo;
    
    // Order status
    private OrderStatus status = OrderStatus.PENDING;
    private String statusMessage;
    
    // Timestamps
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime estimatedDelivery;
    
    // Tracking
    private String trackingNumber;
    
    // Inner classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private String productName;
        private String productImage;
        private String sellerId;
        private String brand;
        private double price;
        private int quantity;
        private String size;
        private String color;
        
        public double getSubTotal() {
            return price * quantity;
        }
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private String fullName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phoneNumber;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentInfo {
        private String paymentMethod; // "stripe", "paypal", etc.
        private String paymentIntentId; // Stripe payment intent ID
        private String transactionId;
        private PaymentStatus paymentStatus = PaymentStatus.PENDING;
        private LocalDateTime paymentDate;
        private String cardLast4; // Last 4 digits of card
        private String cardBrand; // visa, mastercard, etc.
    }
    
    public enum OrderStatus {
        PENDING,
        CONFIRMED,
        PROCESSING,
        SHIPPED,
        DELIVERED,
        CANCELLED,
        REFUNDED
    }
    
    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        REFUNDED
    }
    
    // Helper methods
    public void calculateTotals() {
        this.subtotal = items.stream()
                             .mapToDouble(OrderItem::getSubTotal)
                             .sum();
        
        // Calculate tax (example: 8.5%)
        this.tax = this.subtotal * 0.085;
        
        // Free shipping for orders over $50
        this.shippingCost = this.subtotal > 50.0 ? 0.0 : 9.99;
        
        this.totalAmount = this.subtotal + this.tax + this.shippingCost;
        this.updatedAt = LocalDateTime.now();
    }
    
    public int getTotalItems() {
        return items.stream().mapToInt(OrderItem::getQuantity).sum();
    }
}