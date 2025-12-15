package com.example.SnapCart.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private boolean success;
    private String message;
    private String orderId;
    private String clientSecret; // For Stripe payment confirmation
    private String paymentIntentId;
    private double totalAmount;
}