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
import com.example.SnapCart.repository.UserRepository;
import com.example.SnapCart.services.AuthService;
import com.example.SnapCart.services.ProductService;
import com.example.SnapCart.services.UserService;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("api/")
public class Controller {

  private final UserService userService;
  private final AuthService authService;
  private final ProductService productService;
  private final UserRepository userRepository;

  public Controller(UserService userService, AuthService authService, ProductService productService, UserRepository userRepository) {
    this.userService = userService;
    this.authService = authService;
    this.productService = productService;
    this.userRepository = userRepository;
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
    System.out.println("=== LOGIN REQUEST ===");
    System.out.println("Username: " + loginReq.getUsername());
    System.out.println("Password length: " + (loginReq.getPassword() != null ? loginReq.getPassword().length() : "null"));
    
    Optional<String> success = authService.logIn(loginReq.getUsername(), loginReq.getPassword(), "");
    if (success.isPresent()) {
      System.out.println("Login successful, returning user ID: " + success.get());
      return ResponseEntity.ok(success.get());
    } else {
      System.out.println("Login failed - Invalid credentials");
      return ResponseEntity.status(401).body("Invalid username or password");
    }
  }

  @GetMapping("debug/users")
  public ResponseEntity<?> debugUsers() {
    List<User> allUsers = userRepository.findAll();
    System.out.println("Total users in database: " + allUsers.size());
    for (User user : allUsers) {
      System.out.println("User: " + user.getUsername() + ", Password: " + user.getPassword() + ", ID: " + user.getId());
    }
    return ResponseEntity.ok("Found " + allUsers.size() + " users. Check console for details.");
  }

  @PostMapping("debug/create-test-user")
  public ResponseEntity<?> createTestUser() {
    try {
      User testUser = new User();
      testUser.setUsername("testuser");
      testUser.setPassword("testpass123");
      testUser.setEmail("test@example.com");
      testUser.setName("Test User");
      
      User saved = userRepository.save(testUser);
      System.out.println("Created test user: " + saved.getUsername() + " with password: " + saved.getPassword());
      
      return ResponseEntity.ok("Test user created: " + saved.getUsername() + " / " + saved.getPassword());
    } catch (Exception e) {
      System.err.println("Error creating test user: " + e.getMessage());
      return ResponseEntity.status(500).body("Error: " + e.getMessage());
    }
  }

  @PostMapping("debug/test-login")
  public ResponseEntity<?> testLogin() {
    UserLogin testLogin = new UserLogin();
    testLogin.setUsername("testuser");
    testLogin.setPassword("testpass123");
    
    return login(testLogin);
  }

  @PostMapping("SaveProduct")
  public ResponseEntity<?> addProduct(@RequestBody ProductDto productDto) {
    try {
      productService.saveProduct(productDto);
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

  @GetMapping("/products")
  public List<Product> getAllProduct(){
    return productService.getAllProducts();
  }







}
