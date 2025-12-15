package com.example.SnapCart.services;

import java.util.List;

import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;


public interface ProductService {

  Product saveProduct(ProductDto reqProduct);
  Product getProductById(String id);
  List<Product> getProByCollection(String collection);
   List<Product> getProductByItem(String Items);
  List<Product> getProBycity(String city);
  List<Product>getProBySeller(String sellerId);
  Product UpdateProduct(ProductDto updateProduct);
  double getTotalSalesBySeller(String sellerId);
  List<Product> getAllProducts();
  List<Product> getRecentProductsBySeller(String sellerId, int limit);
  Product deleteProduct(String id);
  
  // Admin methods
  List<Product> getProductsByStatus(String status);
  Product approveProduct(String productId);
  Product declineProduct(String productId, String reason);
  List<Product> getProductsBySellerId(String sellerId);
  List<Product> getProductsBySellerIdAndStatus(String sellerId, String status);
  long getTotalProductsCount();
  
  // Dashboard statistics methods
  java.util.List<java.util.Map<String, Object>> getDailyProductStats(int days);
  java.util.List<java.util.Map<String, Object>> getDailyUserRegistrationStats(int days);
  
  // Search methods
  List<Product> searchProducts(String query);
}
