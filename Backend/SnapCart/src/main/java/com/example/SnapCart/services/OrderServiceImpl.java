package com.example.SnapCart.services;

import com.example.SnapCart.dto.CheckoutRequest;
import com.example.SnapCart.dto.PaymentResponse;
import com.example.SnapCart.entity.Cart;
import com.example.SnapCart.entity.Order;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.entity.User;
import com.example.SnapCart.repository.OrderRepository;
import com.example.SnapCart.repository.ProductRepository;
import com.example.SnapCart.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private CartService cartService;

    @Override
    public PaymentResponse createOrder(CheckoutRequest checkoutRequest) {
        try {
            System.out.println("=== CREATING ORDER ===");
            System.out.println("User ID: " + checkoutRequest.getUserId());
            System.out.println("Items count: " + checkoutRequest.getItems().size());

            // Get user info
            Optional<User> userOpt = userRepository.findById(checkoutRequest.getUserId());
            if (userOpt.isEmpty()) {
                return new PaymentResponse(false, "User not found", null, null, null, 0);
            }
            User user = userOpt.get();

            // Create new order
            Order order = new Order();
            order.setUserId(user.getId());
            order.setUserEmail(user.getEmail());
            order.setUserName(user.getName());

            // Set shipping address
            Order.Address shippingAddress = new Order.Address(
                checkoutRequest.getShippingAddress().getFullName(),
                checkoutRequest.getShippingAddress().getAddressLine1(),
                checkoutRequest.getShippingAddress().getAddressLine2(),
                checkoutRequest.getShippingAddress().getCity(),
                checkoutRequest.getShippingAddress().getState(),
                checkoutRequest.getShippingAddress().getZipCode(),
                checkoutRequest.getShippingAddress().getCountry(),
                checkoutRequest.getShippingAddress().getPhoneNumber()
            );
            order.setShippingAddress(shippingAddress);

            // Initialize payment info
            Order.PaymentInfo paymentInfo = new Order.PaymentInfo();
            paymentInfo.setPaymentMethod(checkoutRequest.getPaymentMethod());
            paymentInfo.setPaymentStatus(Order.PaymentStatus.PENDING);
            order.setPaymentInfo(paymentInfo);

            // Process order items
            List<Order.OrderItem> orderItems = new ArrayList<>();
            
            for (CheckoutRequest.CheckoutItem checkoutItem : checkoutRequest.getItems()) {
                Optional<Product> productOpt = productRepository.findById(checkoutItem.getProductId());
                if (productOpt.isEmpty()) {
                    return new PaymentResponse(false, "Product not found: " + checkoutItem.getProductId(), null, null, null, 0);
                }
                
                Product product = productOpt.get();
                
                Order.OrderItem orderItem = new Order.OrderItem();
                orderItem.setProductId(product.getId());
                orderItem.setProductName(product.getItems() != null ? product.getItems() : product.getCollection());
                orderItem.setProductImage(product.getImages() != null && !product.getImages().isEmpty() 
                                         ? product.getImages().get(0) : "");
                orderItem.setSellerId(product.getSellerId());
                orderItem.setBrand(product.getBrand());
                orderItem.setPrice(product.getPrice());
                orderItem.setQuantity(checkoutItem.getQuantity());
                orderItem.setSize(checkoutItem.getSize());
                orderItem.setColor(checkoutItem.getColor());
                
                orderItems.add(orderItem);
            }
            
            order.setItems(orderItems);
            
            // Calculate totals
            order.calculateTotals();
            
            // Set estimated delivery (7 days from now)
            order.setEstimatedDelivery(LocalDateTime.now().plusDays(7));
            
            // Generate tracking number
            order.setTrackingNumber("SC" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

            // Save order
            Order savedOrder = orderRepository.save(order);
            System.out.println("Order created with ID: " + savedOrder.getId());

            // Create payment intent
            PaymentResponse paymentResponse = paymentService.createPaymentIntent(checkoutRequest, savedOrder);
            
            if (paymentResponse.isSuccess()) {
                // Clear user's cart after successful order creation
                try {
                    cartService.clearCart(checkoutRequest.getUserId());
                    System.out.println("Cart cleared for user: " + checkoutRequest.getUserId());
                } catch (Exception e) {
                    System.err.println("Failed to clear cart: " + e.getMessage());
                    // Don't fail the order creation if cart clearing fails
                }
            }

            return paymentResponse;

        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return new PaymentResponse(false, "Order creation failed: " + e.getMessage(), null, null, null, 0);
        }
    }

    @Override
    public Optional<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
    }

    @Override
    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Override
    public Order updateOrderStatus(String orderId, Order.OrderStatus status, String message) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isPresent()) {
            Order order = orderOpt.get();
            order.setStatus(status);
            order.setStatusMessage(message);
            order.setUpdatedAt(LocalDateTime.now());
            return orderRepository.save(order);
        }
        throw new RuntimeException("Order not found: " + orderId);
    }

    @Override
    public List<Order> getOrdersBySellerId(String sellerId) {
        return orderRepository.findByItems_SellerId(sellerId);
    }
}