package com.example.SnapCart.controller;


import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.services.ProductImp;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class DashboardController {


  @Autowired
  private ProductImp productService;


  @GetMapping("/seller/{id}")
  public ResponseEntity<List<ProductDto>> getProductBySeller(@PathVariable("id") String sellerId){
    System.out.println("DEBUG: Fetching products for sellerId: " + sellerId);
    List<Product> products = productService.getProductsBySeller(sellerId);
    System.out.println("DEBUG: Found " + products.size() + " products for sellerId: " + sellerId);
    List<ProductDto> productDtos = products.stream().map(this::convertToDto).collect(Collectors.toList());
    return ResponseEntity.ok(productDtos);
  }

  // Update product endpoint
  @PutMapping("/{id}")
  public ResponseEntity<?> updateProduct(@PathVariable String id, @RequestBody ProductDto productDto) {
    try {
      Product updatedProduct = productService.updateProduct(id, productDto);
      ProductDto responseDto = convertToDto(updatedProduct);
      return ResponseEntity.ok(responseDto);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
        put("error", e.getMessage());
      }});
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(new HashMap<String, String>() {{
        put("error", "An unexpected error occurred: " + e.getMessage());
      }});
    }
  }

  // Delete product endpoint
  @DeleteMapping("/{id}")
  public ResponseEntity<?> deleteProduct(@PathVariable String id) {
    try {
      productService.deleteProduct(id);
      return ResponseEntity.ok(new HashMap<String, String>() {{
        put("message", "Product deleted successfully");
      }});
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
        put("error", e.getMessage());
      }});
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(new HashMap<String, String>() {{
        put("error", "An unexpected error occurred: " + e.getMessage());
      }});
    }
  }

  // Mark product as sold endpoint
  @PutMapping("/{id}/sold")
  public ResponseEntity<?> markAsSold(@PathVariable String id) {
    try {
      Product soldProduct = productService.updateProductStatus(id, "sold");
      ProductDto responseDto = convertToDto(soldProduct);
      return ResponseEntity.ok(responseDto);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
        put("error", e.getMessage());
      }});
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(new HashMap<String, String>() {{
        put("error", "An unexpected error occurred: " + e.getMessage());
      }});
    }
  }

  // Get statistics for seller
  @GetMapping("/stats/seller/{sellerId}")
  public ResponseEntity<?> getSellerStats(@PathVariable String sellerId) {
    try {
      List<Product> sellerProducts = productService.getProductsBySeller(sellerId);
      
      Map<String, Object> stats = new HashMap<>();
      stats.put("totalProducts", sellerProducts.size());
      stats.put("activeListed", sellerProducts.stream().filter(p -> "available".equalsIgnoreCase(p.getStatus())).count());
      stats.put("sold", sellerProducts.stream().filter(p -> "sold".equalsIgnoreCase(p.getStatus())).count());
      stats.put("draft", sellerProducts.stream().filter(p -> "draft".equalsIgnoreCase(p.getStatus())).count());
      
      double totalValue = sellerProducts.stream()
          .filter(p -> "available".equalsIgnoreCase(p.getStatus()))
          .mapToDouble(p -> p.getPrice() * (1 - p.getDiscount() / 100.0))
          .sum();
      stats.put("totalValue", totalValue);
      
      return ResponseEntity.ok(stats);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(new HashMap<String, String>() {{
        put("error", "An unexpected error occurred: " + e.getMessage());
      }});
    }
  }

  // Helper method to convert Product to ProductDto
  private ProductDto convertToDto(Product product) {
    ProductDto dto = new ProductDto();
    dto.setId(product.getId());
    dto.setImages(product.getImages());
    dto.setDescription(product.getDescription());
    dto.setCollection(product.getCollection());
    dto.setItems(product.getItems());
    dto.setBrand(product.getBrand());
    dto.setCondition(product.getCondition());
    dto.setSerialNo(product.getSerialNo());
    dto.setAge(product.getAge());
    dto.setColour(product.getColour());
    dto.setGender(product.getGender());
    dto.setOccasion(product.getOccasion());
    dto.setSize(product.getSize());
    dto.setCity(product.getCity());
    dto.setPrice(product.getPrice());
    dto.setDiscount(product.getDiscount());
    dto.setStatus(product.getStatus());
    dto.setSellerId(product.getSellerId());
    dto.setCreated_at(product.getCreated_at());
    dto.setUpdates_at(product.getUpdates_at());
    return dto;
  }

}
