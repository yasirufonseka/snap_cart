package com.example.SnapCart.controller;


import java.util.List;

import com.example.SnapCart.dto.ProductDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.SnapCart.entity.Product;
import com.example.SnapCart.services.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


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

  @PutMapping("/UpdateProduct")
  public ResponseEntity<String> UpdateProduct(@RequestBody ProductDto product){
    Product result = productService.UpdateProduct(product);
    return ResponseEntity.status(200).body("updates successfully");
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

}
