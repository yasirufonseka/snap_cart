package com.example.SnapCart.services;


import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.ProductRepository;
import org.apache.coyote.BadRequestException;
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

}
