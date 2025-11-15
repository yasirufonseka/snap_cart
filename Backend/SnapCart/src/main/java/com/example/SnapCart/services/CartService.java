package com.example.SnapCart.services;

import com.example.SnapCart.dto.AddToCartRequest;
import com.example.SnapCart.dto.UpdateCartItemRequest;
import com.example.SnapCart.entity.Cart;

public interface CartService {
    Cart addToCart(AddToCartRequest request);
    Cart getCartByUserId(String userId);
    Cart updateCartItemQuantity(UpdateCartItemRequest request);
    Cart removeFromCart(String userId, String productId);
    Cart clearCart(String userId);
    int getCartItemCount(String userId);
}