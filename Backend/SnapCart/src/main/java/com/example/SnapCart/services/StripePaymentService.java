package com.example.SnapCart.services;

import com.example.SnapCart.dto.CheckoutRequest;
import com.example.SnapCart.dto.PaymentResponse;
import com.example.SnapCart.entity.Order;
import com.example.SnapCart.repository.OrderRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.RefundCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class StripePaymentService implements PaymentService {

    @Value("${stripe.secret.key:sk_test_your_stripe_secret_key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook.secret:whsec_your_webhook_secret}")
    private String webhookSecret;

    @Autowired
    private OrderRepository orderRepository;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
        System.out.println("Stripe initialized with key: " + (stripeSecretKey.length() > 10 ? 
            stripeSecretKey.substring(0, 10) + "..." : "NOT_SET"));
    }

    @Override
    public PaymentResponse createPaymentIntent(CheckoutRequest checkoutRequest, Order order) {
        try {
            System.out.println("=== CREATING STRIPE PAYMENT INTENT ===");
            System.out.println("Order ID: " + order.getId());
            System.out.println("Total Amount: $" + order.getTotalAmount());

            // Convert amount to cents (Stripe expects smallest currency unit)
            long amountInCents = Math.round(order.getTotalAmount() * 100);

            // Create metadata for the payment
            Map<String, String> metadata = new HashMap<>();
            metadata.put("order_id", order.getId());
            metadata.put("user_id", order.getUserId());
            metadata.put("total_items", String.valueOf(order.getTotalItems()));

            // Create payment intent parameters
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency("usd")
                .setDescription("SnapCart Order #" + order.getId())
                .putAllMetadata(metadata)
                .setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                )
                .build();

            // Create the payment intent
            PaymentIntent paymentIntent = PaymentIntent.create(params);

            System.out.println("Payment Intent created: " + paymentIntent.getId());
            System.out.println("Client Secret: " + paymentIntent.getClientSecret());

            // Update order with payment intent info
            order.getPaymentInfo().setPaymentIntentId(paymentIntent.getId());
            order.getPaymentInfo().setPaymentStatus(Order.PaymentStatus.PENDING);
            orderRepository.save(order);

            return new PaymentResponse(
                true,
                "Payment intent created successfully",
                order.getId(),
                paymentIntent.getClientSecret(),
                paymentIntent.getId(),
                order.getTotalAmount()
            );

        } catch (StripeException e) {
            System.err.println("Stripe error: " + e.getMessage());
            return new PaymentResponse(
                false,
                "Payment setup failed: " + e.getMessage(),
                order.getId(),
                null,
                null,
                order.getTotalAmount()
            );
        } catch (Exception e) {
            System.err.println("Unexpected error creating payment intent: " + e.getMessage());
            return new PaymentResponse(
                false,
                "Payment setup failed due to unexpected error",
                order.getId(),
                null,
                null,
                order.getTotalAmount()
            );
        }
    }

    @Override
    public boolean confirmPayment(String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
            
            if ("succeeded".equals(paymentIntent.getStatus())) {
                // Update order status
                Optional<Order> orderOpt = orderRepository.findByPaymentInfoPaymentIntentId(paymentIntentId);
                if (orderOpt.isPresent()) {
                    Order order = orderOpt.get();
                    order.getPaymentInfo().setPaymentStatus(Order.PaymentStatus.COMPLETED);
                    order.setStatus(Order.OrderStatus.CONFIRMED);
                    order.setStatusMessage("Payment confirmed, order processing");
                    orderRepository.save(order);
                    
                    System.out.println("Payment confirmed for order: " + order.getId());
                    return true;
                }
            }
            return false;
        } catch (StripeException e) {
            System.err.println("Error confirming payment: " + e.getMessage());
            return false;
        }
    }

    @Override
    public PaymentResponse processRefund(String orderId, double amount) {
        try {
            Optional<Order> orderOpt = orderRepository.findById(orderId);
            if (orderOpt.isEmpty()) {
                return new PaymentResponse(false, "Order not found", orderId, null, null, 0);
            }

            Order order = orderOpt.get();
            String paymentIntentId = order.getPaymentInfo().getPaymentIntentId();

            if (paymentIntentId == null) {
                return new PaymentResponse(false, "No payment to refund", orderId, null, null, 0);
            }

            // Create refund
            long refundAmountInCents = Math.round(amount * 100);
            RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(paymentIntentId)
                .setAmount(refundAmountInCents)
                .build();

            Refund refund = Refund.create(params);

            // Update order status
            order.getPaymentInfo().setPaymentStatus(Order.PaymentStatus.REFUNDED);
            order.setStatus(Order.OrderStatus.REFUNDED);
            order.setStatusMessage("Order refunded: $" + amount);
            orderRepository.save(order);

            return new PaymentResponse(
                true,
                "Refund processed successfully",
                orderId,
                null,
                refund.getId(),
                amount
            );

        } catch (StripeException e) {
            return new PaymentResponse(false, "Refund failed: " + e.getMessage(), orderId, null, null, 0);
        }
    }

    @Override
    public boolean validateWebhook(String rawBody, String signature) {
        try {
            Webhook.constructEvent(rawBody, signature, webhookSecret);
            return true;
        } catch (Exception e) {
            System.err.println("Webhook validation failed: " + e.getMessage());
            return false;
        }
    }

    @Override
    public void handleWebhookEvent(String eventType, String paymentIntentId) {
        System.out.println("=== WEBHOOK EVENT ===");
        System.out.println("Event Type: " + eventType);
        System.out.println("Payment Intent: " + paymentIntentId);

        switch (eventType) {
            case "payment_intent.succeeded":
                confirmPayment(paymentIntentId);
                break;
            case "payment_intent.payment_failed":
                handlePaymentFailure(paymentIntentId);
                break;
            default:
                System.out.println("Unhandled webhook event: " + eventType);
        }
    }

    private void handlePaymentFailure(String paymentIntentId) {
        Optional<Order> orderOpt = orderRepository.findByPaymentInfoPaymentIntentId(paymentIntentId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.getPaymentInfo().setPaymentStatus(Order.PaymentStatus.FAILED);
            order.setStatus(Order.OrderStatus.CANCELLED);
            order.setStatusMessage("Payment failed");
            orderRepository.save(order);
            
            System.out.println("Payment failed for order: " + order.getId());
        }
    }
}