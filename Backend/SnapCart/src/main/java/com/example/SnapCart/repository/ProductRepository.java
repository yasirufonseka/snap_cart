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





}
