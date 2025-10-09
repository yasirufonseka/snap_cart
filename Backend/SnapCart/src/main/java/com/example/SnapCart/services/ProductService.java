package com.example.SnapCart.services;

import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.entity.Product;

import java.util.List;


public interface ProductService {

  Product saveProduct(ProductDto reqProduct);
  Product getProductById(String id);
   List<Product> getProByCollection(String collection);
   List<Product> getProductByItem(String Items);

}
