package com.example.SnapCart.controller;


import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
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

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/api/")
public class Controller {

  private final UserService userService;
  private final AuthService authService;
  private final ProductService productService;
  private final MongoTemplate mongoTemplate;


  @Autowired
  public Controller(UserService userService, AuthService authService, ProductService productService, MongoTemplate mongoTemplate) {
    this.userService = userService;
    this.authService = authService;
    this.productService = productService;
    this.mongoTemplate = mongoTemplate;


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

  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody UserLogin loginReq) {
    System.out.println("🔐 POST /api/login received");
    // Authenticate using AuthService which now returns Optional<User>
    Optional<UsergIn(
        loginReq.getUsername(),
        loginReq.getPassword()
    );

    if (userOpt.isPresent()) {
      com.example.SnapCart.entity.User user = userOpt.get();
      // Return a small JSON payload so frontend can store user id and role
      Map<String, String> resp = new java.util.HashMap<>();
      resp.put("id", user.getId());
      // If role doesn't exist, default to "seller"
      resp.put("role", "seller");

      System.out.println("✅ Login successful: userId=" + user.getId());
      return ResponseEntity.ok(resp);
    } else {
      System.out.println("❌ Login failed: invalid credentials");
      Map<String, String> err = new java.util.HashMap<>();
      err.put("error", "Incorrect username or password");
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
    }
  }

  @GetMapping("/login")
  public ResponseEntity<?> loginGetError() {
    System.out.println("⚠️ GET /api/login called - this endpoint only accepts POST. Use POST instead.");
    Map<String, String> err = new java.util.HashMap<>();
    err.put("error", "Login endpoint only accepts POST requests. Please POST your credentials to /api/login");
    err.put("note", "Use POST with body: {\"username\":\"...\",\"password\":\"...\"}");
    return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(err);
  }

//get all users
  @GetMapping("/users")
  public ResponseEntity<List<User>> getallusers(){
    List<User> users = userService.getAllUsers();
    return new ResponseEntity<>(users, HttpStatus.OK);
  };


  @GetMapping("/health/db")
  public ResponseEntity<String> checkDatabaseConnection() {
    try {
      // Try to execute a simple command
       mongoTemplate.getDb().getName();
      String dbName = mongoTemplate.getDb().getName();
      long userCount = mongoTemplate.getCollection("users").countDocuments();

      return ResponseEntity.ok(
        "✅ MongoDB Connected!\n" +
          "Database: " + dbName + "\n" +
          "Users collection count: " + userCount
      );
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("❌ MongoDB Connection Failed: " + e.getMessage());
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
  public ResponseEntity<List<Product>> getsProductCollection(@PathVariable String collection) {
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

  @GetMapping("hello")
  public String getHello(){
    return "hello";
  }







}
