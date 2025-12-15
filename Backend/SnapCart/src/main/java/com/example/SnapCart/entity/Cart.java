package com.example.SnapCart.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Document(collection = "carts")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Cart {
    
    @Id
    private String id;
    
    private String userId;
    private List<CartItem> items = new ArrayList<>();
    private double totalAmount = 0.0;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    // Inner class for cart items
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CartItem {
        private String productId;
        private String productName;
        private String productImage;
        private double price;
        private int quantity;
        private String sellerId;
        private String brand;
        private String size;
        private String color;
        
        public double getSubTotal() {
            return price * quantity;
        }
    }
    
    // Helper methods
    public void addItem(CartItem item) {
        // Check if item already exists
        for (CartItem existingItem : items) {
            if (existingItem.getProductId().equals(item.getProductId()) &&
                (existingItem.getSize() == null || existingItem.getSize().equals(item.getSize())) &&
                (existingItem.getColor() == null || existingItem.getColor().equals(item.getColor()))) {
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                updateTotalAmount();
                setUpdatedAt(LocalDateTime.now());
                return;
            }
        }
        items.add(item);
        updateTotalAmount();
        setUpdatedAt(LocalDateTime.now());
    }
    
    public void removeItem(String productId) {
        items.removeIf(item -> item.getProductId().equals(productId));
        updateTotalAmount();
        setUpdatedAt(LocalDateTime.now());
    }
    
    public void updateItemQuantity(String productId, int quantity) {
        for (CartItem item : items) {
            if (item.getProductId().equals(productId)) {
                if (quantity <= 0) {
                    removeItem(productId);
                } else {
                    item.setQuantity(quantity);
                    updateTotalAmount();
                    setUpdatedAt(LocalDateTime.now());
                }
                return;
            }
        }
    }
    
    public void clearCart() {
        items.clear();
        totalAmount = 0.0;
        setUpdatedAt(LocalDateTime.now());
    }
    
    public int getTotalItems() {
        return items.stream().mapToInt(CartItem::getQuantity).sum();
    }
    
    private void updateTotalAmount() {
        totalAmount = items.stream()
                          .mapToDouble(CartItem::getSubTotal)
                          .sum();
    }
}