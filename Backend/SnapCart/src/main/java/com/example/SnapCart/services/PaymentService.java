package com.example.SnapCart.services;

import com.example.SnapCart.dto.CheckoutRequest;
import com.example.SnapCart.dto.PaymentResponse;
import com.example.SnapCart.entity.Order;

public interface PaymentService {
    PaymentResponse createPaymentIntent(CheckoutRequest checkoutRequest, Order order);
    boolean confirmPayment(String paymentIntentId);
    PaymentResponse processRefund(String orderId, double amount);
    boolean validateWebhook(String rawBody, String signature);
    void handleWebhookEvent(String eventType, String paymentIntentId);
}   