package com.example.SnapCart.controller;


import java.util.List;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.SnapCart.dto.ProductDto;
import com.example.SnapCart.dto.UserRegiRequest;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.entity.User;
import com.example.SnapCart.modal.UserLogin;
import com.example.SnapCart.services.AuthService;
import com.example.SnapCart.services.ProductService;
import com.example.SnapCart.services.UserService;

@RestController
@RequestMapping("api/")
@CrossOrigin(origins = "http://localhost:4200")
public class Controller {

  private final UserService userService;
  private final AuthService authService;
  private final ProductService productService;

  @Autowired
  public Controller(UserService userService, AuthService authService, ProductService productService) {
    this.userService = userService;
    this.authService = authService;
    this.productService = productService;
  }


  @PostMapping("CreateUser")
  public ResponseEntity<?> createUser(@Valid @RequestBody UserRegiRequest request) {
    try {
      User savedUser = userService.createUser(request);
      return ResponseEntity.ok(savedUser);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());  // Returns 400 with message like "Username already exists"
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());  // For other errors
    }
  }

  @PostMapping("login")
  public ResponseEntity<?> login(@RequestBody UserLogin loginReq) {
    Optional<String> success = authService.logIn(loginReq.getUsername(), loginReq.getPassword(), "");
    if (success.isPresent()) {
      return ResponseEntity.ok(success.get());
    } else {
      return ResponseEntity.status(401).body("Invalid username or password");
    }
  }

  @PostMapping("SaveProduct")
  public ResponseEntity<?> addProduct(@RequestBody ProductDto productDto) {
    try {
      Product saveItem = productService.saveProduct(productDto);
      return ResponseEntity.ok(productDto);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());  // For other errors
    }

  }

  //get products by category
  @GetMapping("GetProduct/ByCollection/{collection}")
  public ResponseEntity<List<Product>> getMensProduct(@PathVariable("collection") String collection) {
    List<Product> getProByCollection = productService.getProByCollection(collection);

    return new ResponseEntity<>(getProByCollection, HttpStatus.OK);

  }

  //get product by id
  @GetMapping("GetProduct/ById/{id}")
  public ResponseEntity<Product> getProductById(@PathVariable("id") String id) {
    Product product = productService.getProductById(id);
    return new ResponseEntity<>(product, HttpStatus.OK);
  }

  //get product by items
  @GetMapping("GetProduct/ByItems/{items}")
  public ResponseEntity<List<Product>> getProductByItem(@PathVariable("items") String items) {
    try {
      List<Product> getByItem = productService.getProductByItem(items);
     if (getByItem!=null){
       return new ResponseEntity<>(getByItem, HttpStatus.OK);
     }else {

       return new ResponseEntity<>(getByItem, HttpStatus.BAD_REQUEST);

     }
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(null);
    }
  }


}
