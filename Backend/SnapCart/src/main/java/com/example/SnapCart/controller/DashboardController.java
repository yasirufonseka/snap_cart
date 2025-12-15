package com.example.SnapCart.controller;


import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.services.ProductService;


@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("api/dashboard/")
public class DashboardController {
  @Autowired
  private final ProductService productService;


  public DashboardController(ProductService productService){
    this.productService = productService;

  }
@GetMapping("/seller")
public ResponseEntity<?> getProductBySeller(@RequestParam String sellerId){
    try {
        List<Product> results = productService.getProBySeller(sellerId);
        return ResponseEntity.ok(results);
    } catch (Exception e) {
        throw new RuntimeException(e);
    }
}

  @PutMapping("UpdateProduct")
  public ResponseEntity<?> UpdateProduct(@RequestBody ProductDto product){
    try {
      Product result = productService.UpdateProduct(product);
      
      // Create JSON response
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Product updated successfully");
      response.put("productId", result.getId());
      
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      // Error response in JSON format
      Map<String, Object> errorResponse = new HashMap<>();
      errorResponse.put("success", false);
      errorResponse.put("message", "Failed to update product: " + e.getMessage());
      
      return ResponseEntity.status(500).body(errorResponse);
    }
  }

@GetMapping("stats/totalproducts")
public String getMethodName(@RequestParam String sellerId) {
  //get total products count by seller
  List<Product> products = productService.getProBySeller(sellerId);
  return String.valueOf(products.size());
}

@GetMapping("stats/totalsales")
public String getTotalSales(@RequestParam String sellerId) {
  //get total sales by seller
  System.out.println("Dashboard: Getting total sales for sellerId: " + sellerId);
  List<Product> products = productService.getProBySeller(sellerId);
  System.out.println("Dashboard: Found " + products.size() + " products for seller");
  
  if (!products.isEmpty()) {
    System.out.println("Dashboard: Sample product prices:");
    for (int i = 0; i < Math.min(3, products.size()); i++) {
      Product p = products.get(i);
      System.out.println("  Product " + i + ": price=" + p.getPrice() + ", sellerId=" + p.getSellerId());
    }
  }
  
  double totalSales = productService.getTotalSalesBySeller(sellerId);
  System.out.println("Dashboard: Final total sales: " + totalSales);
  return String.valueOf(totalSales);
}

@GetMapping("debug/allproducts")
public ResponseEntity<?> getAllProductsDebug() {
  // Debug endpoint to see all products
  List<Product> allProducts = productService.getAllProducts();
  return ResponseEntity.ok(allProducts);
}

@GetMapping("debug/seller/{sellerId}")
public ResponseEntity<?> getSellerProductsDebug(@PathVariable String sellerId) {
  // Debug endpoint to see products for specific seller
  List<Product> products = productService.getProBySeller(sellerId);
  double total = products.stream().mapToDouble(Product::getPrice).sum();
  
  return ResponseEntity.ok(new Object() {
    public final String sellerId_requested = sellerId;
    public final int product_count = products.size();
    public final double total_price_sum = total;
    public final List<Product> products_found = products;
  });
}

@GetMapping("recent-products")
public ResponseEntity<?> getRecentProducts(@RequestParam String sellerId, 
                                         @RequestParam(defaultValue = "5") int limit) {
  try {
    System.out.println("Fetching recent products for seller: " + sellerId + ", limit: " + limit);
    
    List<Product> allProducts = productService.getProBySeller(sellerId);
    System.out.println("Found " + allProducts.size() + " total products for seller");
    
    // Sort by ID (assuming newer products have newer IDs) and limit results
    List<Product> recentProducts = allProducts.stream()
        .sorted((a, b) -> b.getId().compareTo(a.getId())) // Sort by ID descending (newest first)
        .limit(limit)
        .toList();
    
    System.out.println("Returning " + recentProducts.size() + " recent products");
    
    return ResponseEntity.ok(recentProducts);
  } catch (Exception e) {
    System.err.println("Error fetching recent products: " + e.getMessage());
    return ResponseEntity.status(500).body("Error fetching recent products: " + e.getMessage());
  }
}

@GetMapping("stats/daily-sales")
public ResponseEntity<?> getDailySales(@RequestParam String sellerId, 
                                     @RequestParam(defaultValue = "7") int days) {
  try {
    System.out.println("Fetching daily sales for seller: " + sellerId + ", last " + days + " days");
    
    List<Product> products = productService.getProBySeller(sellerId);
    Map<String, Double> dailySales = new HashMap<>();
    
    // Initialize last 'days' days with 0 sales
    LocalDate today = LocalDate.now();
    for (int i = days - 1; i >= 0; i--) {
      LocalDate date = today.minusDays(i);
      dailySales.put(date.toString(), 0.0);
    }
    
    // Group products by creation date and sum prices
    for (Product product : products) {
      if (product.getCreatedAt() != null) {
        LocalDate productDate = product.getCreatedAt().toLocalDate();
        String dateKey = productDate.toString();
        
        // Only include if within the last 'days' days
        if (productDate.isAfter(today.minusDays(days)) || productDate.isEqual(today.minusDays(days - 1))) {
          dailySales.put(dateKey, dailySales.getOrDefault(dateKey, 0.0) + product.getPrice());
        }
      }
    }
    
    // Convert to ordered list
    List<Map<String, Object>> result = new ArrayList<>();
    for (int i = days - 1; i >= 0; i--) {
      LocalDate date = today.minusDays(i);
      String dateKey = date.toString();
      Map<String, Object> dayData = new HashMap<>();
      dayData.put("date", dateKey);
      dayData.put("sales", dailySales.getOrDefault(dateKey, 0.0));
      result.add(dayData);
    }
    
    System.out.println("Returning daily sales data: " + result);
    return ResponseEntity.ok(result);
    
  } catch (Exception e) {
    System.err.println("Error fetching daily sales: " + e.getMessage());
    return ResponseEntity.status(500).body("Error fetching daily sales: " + e.getMessage());
  }
}

@GetMapping("stats/daily-sold-products")
public ResponseEntity<?> getDailySoldProducts(@RequestParam String sellerId, 
                                            @RequestParam(defaultValue = "7") int days) {
  try {
    System.out.println("Fetching daily sold products for seller: " + sellerId + ", last " + days + " days");
    
    List<Product> allProducts = productService.getProBySeller(sellerId);
    Map<String, Integer> dailySoldCount = new HashMap<>();
    
    // Initialize last 'days' days with 0 sold products
    LocalDate today = LocalDate.now();
    for (int i = days - 1; i >= 0; i--) {
      LocalDate date = today.minusDays(i);
      dailySoldCount.put(date.toString(), 0);
    }
    
    // Count products with status="sold" by creation date
    System.out.println("Total products for seller: " + allProducts.size());
    
    int totalSoldProducts = 0;
    for (Product product : allProducts) {
      // Check if product status is "sold"
      if ("sold".equalsIgnoreCase(product.getStatus()) && product.getCreatedAt() != null) {
        LocalDate productDate = product.getCreatedAt().toLocalDate();
        String dateKey = productDate.toString();
        
        // Only include if within the last 'days' days
        if (productDate.isAfter(today.minusDays(days)) || productDate.isEqual(today.minusDays(days - 1))) {
          dailySoldCount.put(dateKey, dailySoldCount.getOrDefault(dateKey, 0) + 1);
          totalSoldProducts++;
          System.out.println("Found sold product on " + dateKey + ": " + product.getItems());
        }
      }
    }
    
    System.out.println("Total sold products found: " + totalSoldProducts);
    
    // Convert to ordered list
    List<Map<String, Object>> result = new ArrayList<>();
    for (int i = days - 1; i >= 0; i--) {
      LocalDate date = today.minusDays(i);
      String dateKey = date.toString();
      Map<String, Object> dayData = new HashMap<>();
      dayData.put("date", dateKey);
      dayData.put("soldCount", dailySoldCount.getOrDefault(dateKey, 0));
      result.add(dayData);
    }
    
    System.out.println("Returning daily sold products data: " + result);
    return ResponseEntity.ok(result);
    
  } catch (Exception e) {
    System.err.println("Error fetching daily sold products: " + e.getMessage());
    return ResponseEntity.status(500).body("Error fetching daily sold products: " + e.getMessage());
  }
}

@DeleteMapping("delete-product")
public ResponseEntity<?> deleteProduct(@RequestParam String productId){
    try {
      System.out.println("Attempting to delete product with ID: " + productId);
      
      productService.deleteProduct(productId);
      System.out.println("Product deleted successfully: " + productId);
      
      // Create JSON response
      Map<String, Object> response = new HashMap<>();
      response.put("success", true);
      response.put("message", "Product deleted successfully");
      response.put("productId", productId);

      return ResponseEntity.ok(response);
    } catch (Exception e) {
      System.err.println("Error deleting product " + productId + ": " + e.getMessage());
      e.printStackTrace();
      
      // Error response in JSON format
      Map<String, Object> errorResponse = new HashMap<>();
      errorResponse.put("success", false);
      errorResponse.put("message", "Failed to delete product: " + e.getMessage());
      errorResponse.put("productId", productId);

      return ResponseEntity.status(500).body(errorResponse);
    }
  }

}