package com.example.SnapCart.repository;

import com.example.SnapCart.entity.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {
    
    /**
     * Find orders by user ID
     */
    List<Order> findByUserId(String userId);
    
    /**
     * Find orders by user ID ordered by creation date descending
     */
    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    
    /**
     * Find order by payment intent ID (for Stripe webhooks)
     */
    Optional<Order> findByPaymentInfoPaymentIntentId(String paymentIntentId);
    
    /**
     * Find orders by status
     */
    List<Order> findByStatus(Order.OrderStatus status);
    
    /**
     * Find orders by seller ID (from order items)
     */
    List<Order> findByItems_SellerId(String sellerId);
    
    /**
     * Count orders by user ID
     */
    long countByUserId(String userId);
}