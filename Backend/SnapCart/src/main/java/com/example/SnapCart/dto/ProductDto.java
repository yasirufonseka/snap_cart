package com.example.SnapCart.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor

public class ProductDto {


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
  private String occasion;
  private String size;
  private String city;
  private double price;
  private double discount;

}
