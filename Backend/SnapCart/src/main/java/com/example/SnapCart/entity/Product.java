package com.example.SnapCart.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.GeneratedColumn;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "products")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

public class Product {
  @GeneratedColumn("")
  private String id;

  private List<String> images;
  private String description;
  private String collection;
  private String items;
  private String brand;
  private String condition;
  private String serialNo;
  private Integer age;
  private String colour;
  private String size;
  private String city;
  private double price;
  private double discount;


}
