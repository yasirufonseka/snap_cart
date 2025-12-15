package com.example.SnapCart.controller;

import com.example.SnapCart.dto.CheckoutRequest;
import com.example.SnapCart.dto.PaymentResponse;
import com.example.SnapCart.entity.Order;
import com.example.SnapCart.services.OrderService;
import com.example.SnapCart.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private PaymentService paymentService;

    /**
     * Create order and initiate payment
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody CheckoutRequest checkoutRequest) {
        try {
            System.out.println("=== CHECKOUT REQUEST ===");
            System.out.println("User ID: " + checkoutRequest.getUserId());
            System.out.println("Items: " + checkoutRequest.getItems().size());
            
            PaymentResponse response = orderService.createOrder(checkoutRequest);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            System.err.println("Checkout error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PaymentResponse(false, "Checkout failed: " + e.getMessage(), null, null, null, 0));
        }
    }

    /**
     * Confirm payment (called after Stripe confirmation on frontend)
     */
    @PostMapping("/confirm-payment/{paymentIntentId}")
    public ResponseEntity<?> confirmPayment(@PathVariable String paymentIntentId) {
        try {
            boolean confirmed = paymentService.confirmPayment(paymentIntentId);
            
            if (confirmed) {
                return ResponseEntity.ok().body("{\"success\": true, \"message\": \"Payment confirmed\"}");
            } else {
                return ResponseEntity.badRequest().body("{\"success\": false, \"message\": \"Payment confirmation failed\"}");
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"success\": false, \"message\": \"Error confirming payment: " + e.getMessage() + "\"}");
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable String orderId) {
        try {
            Optional<Order> orderOpt = orderService.getOrderById(orderId);
            
            if (orderOpt.isPresent()) {
                return ResponseEntity.ok(orderOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving order: " + e.getMessage());
        }
    }

    /**
     * Get user's orders
     */
    @GetMapping("/orders/user/{userId}")
    public ResponseEntity<?> getUserOrders(@PathVariable String userId) {
        try {
            List<Order> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving orders: " + e.getMessage());
        }
    }

    /**
     * Update order status (for admin/seller use)
     */
    @PutMapping("/order/{orderId}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam Order.OrderStatus status,
            @RequestParam(required = false) String message) {
        try {
            Order updatedOrder = orderService.updateOrderStatus(orderId, status, message);
            return ResponseEntity.ok(updatedOrder);
            
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating order status: " + e.getMessage());
        }
    }

    /**
     * Process refund
     */
    @PostMapping("/refund/{orderId}")
    public ResponseEntity<?> processRefund(
            @PathVariable String orderId,
            @RequestParam double amount) {
        try {
            PaymentResponse response = paymentService.processRefund(orderId, amount);
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new PaymentResponse(false, "Refund failed: " + e.getMessage(), orderId, null, null, 0));
        }
    }

    /**
     * Stripe webhook endpoint
     */
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String rawBody,
            @RequestHeader("Stripe-Signature") String signature) {
        try {
            System.out.println("=== STRIPE WEBHOOK ===");
            
            if (!paymentService.validateWebhook(rawBody, signature)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
            }

            // Parse the event (simplified - in production, use proper JSON parsing)
            // For now, just acknowledge receipt
            System.out.println("Webhook received and validated");
            
            return ResponseEntity.ok("Webhook handled");
            
        } catch (Exception e) {
            System.err.println("Webhook error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }

    /**
     * Get seller's orders
     */
    @GetMapping("/orders/seller/{sellerId}")
    public ResponseEntity<?> getSellerOrders(@PathVariable String sellerId) {
        try {
            List<Order> orders = orderService.getOrdersBySellerId(sellerId);
            return ResponseEntity.ok(orders);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving seller orders: " + e.getMessage());
        }
    }
}