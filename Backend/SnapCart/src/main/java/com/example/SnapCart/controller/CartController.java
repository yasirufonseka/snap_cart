package com.example.SnapCart.controller;

import com.example.SnapCart.dto.AddToCartRequest;
import com.example.SnapCart.dto.UpdateCartItemRequest;
import com.example.SnapCart.entity.Cart;
import com.example.SnapCart.services.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    /**
     * Add item to cart
     */
    @PostMapping("/add")
    public ResponseEntity<?> addToCart(@RequestBody AddToCartRequest request) {
        try {
            Cart cart = cartService.addToCart(request);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An unexpected error occurred: " + e.getMessage());
        }
    }

    /**
     * Get user's cart
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getCart(@PathVariable String userId) {
        try {
            Cart cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error retrieving cart: " + e.getMessage());
        }
    }

    /**
     * Update cart item quantity
     */
    @PutMapping("/update")
    public ResponseEntity<?> updateCartItem(@RequestBody UpdateCartItemRequest request) {
        try {
            Cart cart = cartService.updateCartItemQuantity(request);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating cart: " + e.getMessage());
        }
    }

    /**
     * Remove item from cart
     */
    @DeleteMapping("/remove/{userId}/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable String userId, @PathVariable String productId) {
        try {
            Cart cart = cartService.removeFromCart(userId, productId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing item from cart: " + e.getMessage());
        }
    }

    /**
     * Clear entire cart
     */
    @DeleteMapping("/clear/{userId}")
    public ResponseEntity<?> clearCart(@PathVariable String userId) {
        try {
            Cart cart = cartService.clearCart(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error clearing cart: " + e.getMessage());
        }
    }

    /**
     * Get cart item count for user
     */
    @GetMapping("/count/{userId}")
    public ResponseEntity<?> getCartItemCount(@PathVariable String userId) {
        try {
            int count = cartService.getCartItemCount(userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting cart count: " + e.getMessage());
        }
    }

    /**
     * Debug endpoint - get all carts
     */
    @GetMapping("/debug/all")
    public ResponseEntity<?> getAllCarts() {
        try {
            // This would require adding a method to the service/repository
            return ResponseEntity.ok("Debug endpoint - implement as needed");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Debug error: " + e.getMessage());
        }
    }
}