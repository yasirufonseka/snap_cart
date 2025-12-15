package com.example.SnapCart.services;

import com.example.SnapCart.dto.AddToCartRequest;
import com.example.SnapCart.dto.UpdateCartItemRequest;
import com.example.SnapCart.entity.Cart;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.CartRepository;
import com.example.SnapCart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CartServiceImpl implements CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Override
    public Cart addToCart(AddToCartRequest request) {
        System.out.println("=== ADD TO CART ===");
        System.out.println("User ID: " + request.getUserId());
        System.out.println("Product ID: " + request.getProductId());
        System.out.println("Quantity: " + request.getQuantity());

        // Validate product exists
        Optional<Product> productOpt = productRepository.findById(request.getProductId());
        if (productOpt.isEmpty()) {
            throw new RuntimeException("Product not found with ID: " + request.getProductId());
        }

        Product product = productOpt.get();

        // Get or create cart for user
        Cart cart = cartRepository.findByUserId(request.getUserId())
                .orElse(new Cart());

        if (cart.getUserId() == null) {
            cart.setUserId(request.getUserId());
            cart.setCreatedAt(LocalDateTime.now());
        }

        // Create cart item
        Cart.CartItem cartItem = new Cart.CartItem();
        cartItem.setProductId(product.getId());
        cartItem.setProductName(product.getItems() != null ? product.getItems() : product.getCollection());
        cartItem.setProductImage(product.getImages() != null && !product.getImages().isEmpty() 
                                 ? product.getImages().get(0) : "");
        cartItem.setPrice(product.getPrice());
        cartItem.setQuantity(request.getQuantity());
        cartItem.setSellerId(product.getSellerId());
        cartItem.setBrand(product.getBrand());
        cartItem.setSize(request.getSize());
        cartItem.setColor(request.getColor());

        // Add item to cart
        cart.addItem(cartItem);

        // Save and return cart
        Cart savedCart = cartRepository.save(cart);
        System.out.println("Cart saved with " + savedCart.getTotalItems() + " items, total: $" + savedCart.getTotalAmount());
        
        return savedCart;
    }

    @Override
    public Cart getCartByUserId(String userId) {
        return cartRepository.findByUserId(userId)
                .orElse(new Cart()); // Return empty cart if none exists
    }

    @Override
    public Cart updateCartItemQuantity(UpdateCartItemRequest request) {
        System.out.println("=== UPDATE CART ITEM ===");
        System.out.println("User ID: " + request.getUserId());
        System.out.println("Product ID: " + request.getProductId());
        System.out.println("New Quantity: " + request.getQuantity());

        Optional<Cart> cartOpt = cartRepository.findByUserId(request.getUserId());
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found for user: " + request.getUserId());
        }

        Cart cart = cartOpt.get();
        cart.updateItemQuantity(request.getProductId(), request.getQuantity());

        return cartRepository.save(cart);
    }

    @Override
    public Cart removeFromCart(String userId, String productId) {
        System.out.println("=== REMOVE FROM CART ===");
        System.out.println("User ID: " + userId);
        System.out.println("Product ID: " + productId);

        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            throw new RuntimeException("Cart not found for user: " + userId);
        }

        Cart cart = cartOpt.get();
        cart.removeItem(productId);

        return cartRepository.save(cart);
    }

    @Override
    public Cart clearCart(String userId) {
        System.out.println("=== CLEAR CART ===");
        System.out.println("User ID: " + userId);

        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        if (cartOpt.isEmpty()) {
            return new Cart(); // Return empty cart if none exists
        }

        Cart cart = cartOpt.get();
        cart.clearCart();

        return cartRepository.save(cart);
    }

    @Override
    public int getCartItemCount(String userId) {
        Optional<Cart> cartOpt = cartRepository.findByUserId(userId);
        return cartOpt.map(Cart::getTotalItems).orElse(0);
    }
}