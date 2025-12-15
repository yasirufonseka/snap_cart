package com.example.SnapCart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    private String userId;
    private List<CheckoutItem> items;
    private ShippingAddress shippingAddress;
    private String paymentMethod = "stripe"; // Default to Stripe
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckoutItem {
        private String productId;
        private int quantity;
        private String size;
        private String color;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingAddress {
        private String fullName;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phoneNumber;
    }
}