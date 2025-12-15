package com.example.SnapCart.repository;

import com.example.SnapCart.entity.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {




  List<Product> findByCollection(String collection);
  List<Product> findByItems(String items);
  List<Product> findByBrand(String brand);
  List<Product> findBySize(String size);
  List<Product> findByCity(String city);
  List<Product> findBySellerId(String sellerId);
  long countBySellerId(String sellerId);
  List<Product> findByItemsContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String items, String description);
  
  // Search method for multiple fields
  List<Product> findByBrandContainingIgnoreCaseOrItemsContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrCollectionContainingIgnoreCase(
      String brand, String items, String description, String collection);
  
  // Get recent products for a seller, ordered by ID descending (newest first)
  List<Product> findTop5BySellerIdOrderByIdDesc(String sellerId);
  
  // Admin queries
  List<Product> findByStatus(String status);
  List<Product> findBySellerIdAndStatus(String sellerId, String status);


}
