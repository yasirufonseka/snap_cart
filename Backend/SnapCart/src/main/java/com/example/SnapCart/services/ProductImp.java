package com.example.SnapCart.services;


import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.ProductRepository;

@Service
public class ProductImp implements ProductService {

  @Autowired
  private ProductRepository productRepo;

  @Override
  public Product saveProduct(ProductDto reqProduct) {
    Product product = new Product();

    product.setBrand(reqProduct.getBrand());
    product.setCollection(reqProduct.getCollection());
    product.setItems(reqProduct.getItems());
    product.setCondition(reqProduct.getCondition());
    product.setSerialNo(reqProduct.getSerialNo());
    product.setColour(reqProduct.getColour());
    product.setSize(reqProduct.getSize());
    product.setAge(reqProduct.getAge());
    product.setCity(reqProduct.getCity());
    product.setPrice(reqProduct.getPrice());
    product.setDiscount(reqProduct.getDiscount());
    product.setDescription(reqProduct.getDescription());
    product.setImages(reqProduct.getImages());
    product.setSellerId(reqProduct.getSellerId()); // Add sellerId mapping


    return productRepo.save(product);
  }


  @Override
  public List<Product> getProByCollection(String collection) {
    return productRepo.findByCollection(collection);
  }


  @Override
  public Product getProductById(String id) {
    // get product by id
    return productRepo.findById(id).orElseThrow(() -> new UnsupportedOperationException("Unimplemented method 'getProductById'"));

  }

  //get products by item name
  @Override
  public List<Product> getProductByItem(String items) {
    List<Product> byItems;
    try {
      byItems = productRepo.findByItems(items);
      return byItems;
    } catch (NullPointerException e) {
      throw new NullPointerException("No such items");
    }

  }


  @Override
  public List<Product> getAllProducts() {
    return productRepo.findAll();
  }

  @Override
  public List<Product> getProBySeller(String sellerId) {
    System.out.print(productRepo.findBySellerId(sellerId));
    return productRepo.findBySellerId(sellerId);
  }

  @Override
  public Product UpdateProduct(ProductDto updateProduct) {
    if (updateProduct.getId() == null) {
      return null;
    }
    Optional<Product> existingProduct = productRepo.findById(updateProduct.getId());

    if (existingProduct.isPresent()){
      Product product = existingProduct.get();
      product.setImages(updateProduct.getImages());
      product.setBrand(updateProduct.getBrand());
      product.setCollection(updateProduct.getCollection());
      product.setItems(updateProduct.getItems());
      product.setCondition(updateProduct.getCondition());
      product.setSerialNo(updateProduct.getSerialNo());
      product.setColour(updateProduct.getColour());
      product.setSize(updateProduct.getSize());
      product.setAge(updateProduct.getAge());
      product.setCity(updateProduct.getCity());
      product.setPrice(updateProduct.getPrice());
      product.setDiscount(updateProduct.getDiscount());
      product.setDescription(updateProduct.getDescription());
      // Preserve sellerId - don't update it during product updates
      if (updateProduct.getSellerId() != null) {
        product.setSellerId(updateProduct.getSellerId());
      }
      return productRepo.save(product);
    }
    return null;
  }

  public long getTotalProductsBySeller(String sellerId) {
    // count products by seller
    return productRepo.countBySellerId(sellerId);
  }

  @Override
  public double getTotalSalesBySeller(String sellerId) {
    // sum of products price by seller
    System.out.println("ProductService: Searching for products with sellerId: '" + sellerId + "'");
    List<Product> products = productRepo.findBySellerId(sellerId);
    System.out.println("ProductService: Found " + products.size() + " products");
    
    if (products.isEmpty()) {
      System.out.println("ProductService: No products found for sellerId: " + sellerId);
      // Let's also check if there are any products at all
      long totalProducts = productRepo.count();
      System.out.println("ProductService: Total products in database: " + totalProducts);
      return 0.0;
    }
    
    System.out.println("ProductService: Product details:");
    double runningTotal = 0.0;
    for (Product p : products) {
      double price = p.getPrice();
      runningTotal += price;
      System.out.println("  ID: " + p.getId() + ", Price: " + price + ", Running Total: " + runningTotal + ", SellerId: '" + p.getSellerId() + "'");
    }
    
    double totalSales = products.stream()
        .mapToDouble(Product::getPrice)
        .sum();
    System.out.println("ProductService: Stream calculated total: " + totalSales);
    System.out.println("ProductService: Manual calculated total: " + runningTotal);
    
    // Let's also check if there are any sold quantities or other factors
    System.out.println("ProductService: Raw product data check:");
    for (Product p : products) {
      System.out.println("  Product: " + p.getItems() + " | Brand: " + p.getBrand() + " | Price: " + p.getPrice() + " | Status: " + p.getStatus());
    }
    
    return totalSales;
  }

  @Override
  public List<Product> getRecentProductsBySeller(String sellerId, int limit) {
    System.out.println("Getting recent products for seller: " + sellerId + ", limit: " + limit);
    
    if (limit <= 5) {
      // Use the optimized repository method for small limits
      List<Product> recentProducts = productRepo.findTop5BySellerIdOrderByIdDesc(sellerId);
      System.out.println("Found " + recentProducts.size() + " recent products using repository method");
      return recentProducts;
    } else {
      // For larger limits, get all and sort manually
      List<Product> allProducts = productRepo.findBySellerId(sellerId);
      List<Product> recentProducts = allProducts.stream()
          .sorted((a, b) -> b.getId().compareTo(a.getId()))
          .limit(limit)
          .collect(java.util.stream.Collectors.toList());
      System.out.println("Found " + recentProducts.size() + " recent products using manual sorting");
      return recentProducts;
    }
  }

}
