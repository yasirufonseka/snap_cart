package com.example.SnapCart.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.SnapCart.entity.Cart;

@Repository
public interface CartRepository extends MongoRepository<Cart, String> {
    
    /**
     * Find cart by user ID
     */
    Optional<Cart> findByUserId(String userId);
    
    /**
     * Delete cart by user ID
     */
    void deleteByUserId(String userId);
    
    /**
     * Check if cart exists for user
     */
    boolean existsByUserId(String userId);
}