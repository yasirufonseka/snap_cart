package com.example.SnapCart.services;


import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

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
  public List<Product> getProBycity(String city) {
    return productRepo.findByCity(city);
  }

  @Override
  public List<Product> getProductsBySeller(String sellerId) {
    return productRepo.findBySellerId(sellerId);
  }

  @Override
  public Product updateProduct(String id, ProductDto productDto) {
    Product existing = productRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found: " + id));

    // update fields from DTO (only commonly updated fields)
    existing.setBrand(productDto.getBrand());
    existing.setCollection(productDto.getCollection());
    existing.setItems(productDto.getItems());
    existing.setCondition(productDto.getCondition());
    existing.setSerialNo(productDto.getSerialNo());
    existing.setColour(productDto.getColour());
    existing.setSize(productDto.getSize());
    existing.setAge(productDto.getAge());
    existing.setCity(productDto.getCity());
    existing.setPrice(productDto.getPrice());
    existing.setDiscount(productDto.getDiscount());
    existing.setDescription(productDto.getDescription());
    existing.setImages(productDto.getImages());
    existing.setStatus(productDto.getStatus());

    return productRepo.save(existing);
  }

  @Override
  public void deleteProduct(String id) {
    productRepo.deleteById(id);
  }

  @Override
  public Product updateProductStatus(String id, String status) {
    Product existing = productRepo.findById(id)
        .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    existing.setStatus(status);
    return productRepo.save(existing);
  }

}
