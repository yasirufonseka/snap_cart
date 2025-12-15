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

@CrossOrigin(origins = { "http://localhost:4200", "http://localhost:4201" }, allowCredentials = "true")
@RestController
@RequestMapping("api/")
public class Controller {

  private final UserService userService;
  private final AuthService authService;
  private final ProductService productService;
  private final UserRepository userRepository;

  @Autowired(required = false)
  private com.example.SnapCart.services.AiRecommendationService aiRecommendationService;

  @Autowired(required = false)
  private com.example.SnapCart.services.ProductUploadService productUploadService;

  public Controller(UserService userService, AuthService authService, ProductService productService,
      UserRepository userRepository) {
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
      return ResponseEntity.badRequest().body(e.getMessage()); // Returns 400 with message like "Username already
                                                               // exists"
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage()); // For other
                                                                                                           // errors
    }
  }

  @PostMapping("login")
  public ResponseEntity<?> login(@RequestBody UserLogin loginReq) {
    System.out.println("=== LOGIN REQUEST ===");
    System.out.println("Username: " + loginReq.getUsername());
    System.out
        .println("Password length: " + (loginReq.getPassword() != null ? loginReq.getPassword().length() : "null"));

    // Get authenticated user instead of just user ID
    Optional<com.example.SnapCart.entity.User> authenticatedUser = authService.authenticateUser(loginReq.getUsername(), loginReq.getPassword());
    if (authenticatedUser.isPresent()) {
      com.example.SnapCart.entity.User user = authenticatedUser.get();
      System.out.println("Login successful for user: " + user.getUsername() + " (ID: " + user.getId() + ", Role: " + user.getRole() + ")");
      
      // Create a comprehensive JSON response with user details
      java.util.Map<String, Object> response = new java.util.HashMap<>();
      response.put("userId", user.getId());
      response.put("username", user.getUsername());
      response.put("name", user.getName());
      response.put("email", user.getEmail());
      response.put("role", user.getRole());
      response.put("success", true);
      response.put("message", "Login successful");
      
      return ResponseEntity.ok(response);
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
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage()); // For other
                                                                                                           // errors
    }

  }

  // get products by category
  @GetMapping("GetProduct/ByCollection/{collection}")
  public ResponseEntity<List<Product>> getsProductCollection(@PathVariable String collection) {
    List<Product> getProByCollection = productService.getProByCollection(collection);

    return new ResponseEntity<>(getProByCollection, HttpStatus.OK);

  }

  // get product by id
  @GetMapping("GetProduct/ById/{id}")
  public ResponseEntity<Product> getProductById(@PathVariable("id") String id) {
    Product product = productService.getProductById(id);
    return new ResponseEntity<>(product, HttpStatus.OK);
  }

  // get product by items
  @GetMapping("GetProduct/ByItems/{items}")
  public ResponseEntity<List<Product>> getProductByItem(@PathVariable("items") String items) {
    try {
      List<Product> getByItem = productService.getProductByItem(items);
      if (getByItem != null) {
        return new ResponseEntity<>(getByItem, HttpStatus.OK);
      } else {

        return new ResponseEntity<>(getByItem, HttpStatus.BAD_REQUEST);

      }
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(null);
    }
  }

  @GetMapping("/products")
  public List<Product> getAllProduct() {
    return productService.getAllProducts();
  }

  // Admin endpoints for product approval
  @GetMapping("admin/pending-products")
  public ResponseEntity<List<Product>> getPendingProducts() {
    try {
      List<Product> pendingProducts = productService.getProductsByStatus("pending");
      return ResponseEntity.ok(pendingProducts);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("admin/approved-products")
  public ResponseEntity<List<Product>> getApprovedProducts() {
    try {
      List<Product> approvedProducts = productService.getProductsByStatus("approved");
      return ResponseEntity.ok(approvedProducts);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("admin/declined-products")
  public ResponseEntity<List<Product>> getDeclinedProducts() {
    try {
      List<Product> declinedProducts = productService.getProductsByStatus("declined");
      return ResponseEntity.ok(declinedProducts);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("admin/all-products")
  public ResponseEntity<List<Product>> getAllProducts() {
    try {
      List<Product> allProducts = productService.getAllProducts();
      return ResponseEntity.ok(allProducts);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  // Simple search endpoint
  @GetMapping("search")
  public ResponseEntity<List<Product>> searchProducts(@org.springframework.web.bind.annotation.RequestParam String query) {
    try {
      System.out.println("Search request for: " + query);
      
      // Get all approved products
      List<Product> allProducts = productService.getProductsByStatus("approved");
      
      // Filter products based on search query
      List<Product> searchResults = allProducts.stream()
        .filter(product -> {
          String searchTerm = query.toLowerCase();
          return (product.getDescription() != null && product.getDescription().toLowerCase().contains(searchTerm)) ||
                 (product.getItems() != null && product.getItems().toLowerCase().contains(searchTerm)) ||
                 (product.getBrand() != null && product.getBrand().toLowerCase().contains(searchTerm)) ||
                 (product.getCollection() != null && product.getCollection().toLowerCase().contains(searchTerm));
        })
        .limit(10) // Limit to 10 results
        .collect(java.util.stream.Collectors.toList());
      
      System.out.println("Found " + searchResults.size() + " search results");
      return ResponseEntity.ok(searchResults);
    } catch (Exception e) {
      System.err.println("Search error: " + e.getMessage());
      return ResponseEntity.internalServerError().body(new java.util.ArrayList<>());
    }
  }

  @PostMapping("admin/approve-product/{productId}")
  public ResponseEntity<?> approveProduct(@PathVariable String productId) {
    try {
      productService.approveProduct(productId);
      return ResponseEntity.ok("Product approved successfully");
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
    }
  }

  @PostMapping("admin/decline-product/{productId}")
  public ResponseEntity<?> declineProduct(@PathVariable String productId,
      @RequestBody(required = false) java.util.Map<String, String> payload) {
    try {
      String reason = payload != null ? payload.get("reason") : "Product does not meet our guidelines";
      productService.declineProduct(productId, reason);
      return ResponseEntity.ok("Product declined successfully");
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
    }
  }

  @GetMapping("seller/products/{sellerId}")
  public ResponseEntity<List<Product>> getSellerProducts(@PathVariable String sellerId) {
    try {
      List<Product> sellerProducts = productService.getProductsBySellerId(sellerId);
      return ResponseEntity.ok(sellerProducts);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @GetMapping("seller/products/{sellerId}/status/{status}")
  public ResponseEntity<List<Product>> getSellerProductsByStatus(@PathVariable String sellerId,
      @PathVariable String status) {
    try {
      List<Product> products = productService.getProductsBySellerIdAndStatus(sellerId, status);
      return ResponseEntity.ok(products);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  // User Management APIs
  @GetMapping("admin/users")
  public ResponseEntity<List<User>> getAllUsers() {
    try {
      List<User> users = userService.getAllUsers();
      return ResponseEntity.ok(users);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body(null);
    }
  }

  @PostMapping("admin/toggle-user-status/{userId}")
  public ResponseEntity<?> toggleUserStatus(@PathVariable String userId) {
    try {
      userService.toggleUserStatus(userId);
      return ResponseEntity.ok("User status updated successfully");
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
    }
  }

  @org.springframework.web.bind.annotation.DeleteMapping("admin/delete-user/{userId}")
  public ResponseEntity<?> deleteUser(@PathVariable String userId) {
    try {
      userService.deleteUser(userId);
      return ResponseEntity.ok("User deleted successfully");
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("An unexpected error occurred: " + e.getMessage());
    }
  }

  @GetMapping("GetUser/{userId}")
  public ResponseEntity<User> getUserById(@PathVariable String userId) {
    try {
      Optional<User> userOpt = userService.getUserById(userId);
      if (userOpt.isPresent()) {
        return ResponseEntity.ok(userOpt.get());
      } else {
        return ResponseEntity.notFound().build();
      }
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  
  }
  // Dashboard Stats API
  @GetMapping("admin/dashboard-stats")
  public ResponseEntity<?> getDashboardStats() {
    try {
      java.util.Map<String, Object> stats = new java.util.HashMap<>();

      // Get actual counts from database
      long totalProducts = productService.getTotalProductsCount();
      long totalUsers = userService.getTotalUsersCount();
      long totalSales = 45670; // Mock data - implement actual sales tracking when needed
      long totalReviews = 1250; // Mock data - implement actual reviews tracking when needed

      stats.put("totalProducts", totalProducts);
      stats.put("totalUsers", totalUsers);
      stats.put("totalSales", totalSales);
      stats.put("totalReviews", totalReviews);

      // Get actual daily product stats from database for last 30 days
      java.util.List<java.util.Map<String, Object>> dailyProductStats = productService.getDailyProductStats(30);
      stats.put("dailyProductStats", dailyProductStats);

      // Get daily user registration stats (placeholder for now)
      java.util.List<java.util.Map<String, Object>> userGrowthStats = productService.getDailyUserRegistrationStats(30);
      stats.put("userGrowthStats", userGrowthStats);

      System.out
          .println("Dashboard stats loaded from database - Products: " + totalProducts + ", Users: " + totalUsers);
      System.out.println("Daily product stats count: " + dailyProductStats.size());

      return ResponseEntity.ok(stats);
    } catch (Exception e) {
      System.err.println("Error fetching dashboard stats: " + e.getMessage());
      e.printStackTrace();
      return ResponseEntity.internalServerError().body("Error fetching dashboard stats: " + e.getMessage());
    }
  }

  // Settings Management APIs
  @GetMapping("admin/profile/{userId}")
  public ResponseEntity<?> getUserProfile(@PathVariable String userId) {
    try {
      java.util.Optional<User> userOpt = userService.getUserById(userId);
      if (userOpt.isEmpty()) {
        return ResponseEntity.notFound().build();
      }

      User user = userOpt.get();
      // Create a response object without sensitive data like password
      java.util.Map<String, Object> userProfile = new java.util.HashMap<>();
      userProfile.put("id", user.getId());
      userProfile.put("name", user.getName());
      userProfile.put("username", user.getUsername());
      userProfile.put("email", user.getEmail());
      userProfile.put("contact", user.getContact());
      userProfile.put("address", user.getAddress());
      userProfile.put("profileImage", user.getProfileImage());
      userProfile.put("role", user.getRole());
      userProfile.put("isActive", user.isActive());
      userProfile.put("createdAt", user.getCreatedAt());
      userProfile.put("updatedAt", user.getUpdatedAt());
      userProfile.put("lastLoginAt", user.getLastLoginAt());

      // System preferences
      userProfile.put("emailNotifications", user.isEmailNotifications());
      userProfile.put("smsNotifications", user.isSmsNotifications());
      userProfile.put("pushNotifications", user.isPushNotifications());
      userProfile.put("language", user.getLanguage());
      userProfile.put("timezone", user.getTimezone());
      userProfile.put("theme", user.getTheme());
      userProfile.put("twoFactorEnabled", user.isTwoFactorEnabled());

      return ResponseEntity.ok(userProfile);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Error fetching user profile: " + e.getMessage());
    }
  }

  @org.springframework.web.bind.annotation.PutMapping("admin/profile/{userId}")
  public ResponseEntity<?> updateUserProfile(@PathVariable String userId,
      @Valid @RequestBody com.example.SnapCart.dto.ProfileUpdateRequest request) {
    try {
      User updatedUser = userService.updateProfile(userId, request);

      // Return updated profile without sensitive data
      java.util.Map<String, Object> response = new java.util.HashMap<>();
      response.put("id", updatedUser.getId());
      response.put("name", updatedUser.getName());
      response.put("username", updatedUser.getUsername());
      response.put("email", updatedUser.getEmail());
      response.put("contact", updatedUser.getContact());
      response.put("address", updatedUser.getAddress());
      response.put("profileImage", updatedUser.getProfileImage());
      response.put("updatedAt", updatedUser.getUpdatedAt());

      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Error updating profile: " + e.getMessage());
    }
  }

  @org.springframework.web.bind.annotation.PutMapping("admin/password/{userId}")
  public ResponseEntity<?> changePassword(@PathVariable String userId,
      @Valid @RequestBody com.example.SnapCart.dto.PasswordChangeRequest request) {
    try {
      userService.changePassword(userId, request);
      return ResponseEntity.ok("Password changed successfully");
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Error changing password: " + e.getMessage());
    }
  }

  @org.springframework.web.bind.annotation.PutMapping("admin/preferences/{userId}")
  public ResponseEntity<?> updateSystemPreferences(@PathVariable String userId,
      @Valid @RequestBody com.example.SnapCart.dto.SystemPreferencesRequest request) {
    try {
      User updatedUser = userService.updateSystemPreferences(userId, request);

      // Return updated preferences
      java.util.Map<String, Object> preferences = new java.util.HashMap<>();
      preferences.put("emailNotifications", updatedUser.isEmailNotifications());
      preferences.put("smsNotifications", updatedUser.isSmsNotifications());
      preferences.put("pushNotifications", updatedUser.isPushNotifications());
      preferences.put("language", updatedUser.getLanguage());
      preferences.put("timezone", updatedUser.getTimezone());
      preferences.put("theme", updatedUser.getTheme());
      preferences.put("twoFactorEnabled", updatedUser.isTwoFactorEnabled());
      preferences.put("updatedAt", updatedUser.getUpdatedAt());

      return ResponseEntity.ok(preferences);
    } catch (RuntimeException e) {
      return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Error updating preferences: " + e.getMessage());
    }
  }

  @GetMapping("admin/system-info")
  public ResponseEntity<?> getSystemInfo() {
    try {
      java.util.Map<String, Object> systemInfo = new java.util.HashMap<>();

      // System information
      systemInfo.put("applicationName", "SnapCart Admin");
      systemInfo.put("version", "1.0.0");
      systemInfo.put("environment", "Development");
      systemInfo.put("javaVersion", System.getProperty("java.version"));
      systemInfo.put("springBootVersion", "3.x");
      systemInfo.put("databaseStatus", "Connected");
      systemInfo.put("serverStatus", "Online");
      systemInfo.put("uptime",
          java.time.Duration.between(java.time.Instant.now().minusSeconds(3600), java.time.Instant.now()).toString());
      systemInfo.put("lastUpdate", new java.util.Date());

      // Statistics
      systemInfo.put("totalUsers", userService.getTotalUsersCount());
      systemInfo.put("totalProducts", productService.getTotalProductsCount());
      systemInfo.put("serverMemory", Runtime.getRuntime().totalMemory() / (1024 * 1024) + " MB");
      systemInfo.put("freeMemory", Runtime.getRuntime().freeMemory() / (1024 * 1024) + " MB");

      return ResponseEntity.ok(systemInfo);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().body("Error fetching system info: " + e.getMessage());
    }
  }

  // ==================== AI CHATBOT ENDPOINTS ====================

  /**
   * AI Chat endpoint - handles text messages and image uploads
   * POST /api/ai/chat
   * 
   * Request body:
   * {
   * "message": "I need a suit for a wedding",
   * "userId": "user123",
   * "conversationId": "conv123",
   * "imageBase64": "optional_base64_image",
   * "chatHistory": [...]
   * }
   */
  @PostMapping("ai/chat")
  public ResponseEntity<?> aiChat(@RequestBody com.example.SnapCart.dto.AiChatRequest request) {
    try {
      if (aiRecommendationService == null) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("AI service is not available. Please configure Gemini API.");
      }

      com.example.SnapCart.dto.AiChatResponse response = aiRecommendationService.processUserMessage(request);
      return ResponseEntity.ok(response);
    } catch (Exception e) {
      e.printStackTrace();

      com.example.SnapCart.dto.AiChatResponse errorResponse = new com.example.SnapCart.dto.AiChatResponse();
      errorResponse.setAiMessage("I'm sorry, I encountered an error. Please try again.");
      errorResponse.setConversationId(request.getConversationId());

      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
  }

  /**
   * Health check for AI service
   */
  @GetMapping("ai/health")
  public ResponseEntity<String> aiHealth() {
    if (aiRecommendationService == null) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body("AI service is not configured");
    }
    return ResponseEntity.ok("AI Service is running");
  }

  // ==================== AI PRODUCT UPLOAD ENDPOINTS ====================

  /**
   * Step 1: Analyze product image with AI
   * POST /api/products/analyze
   * Returns AI suggestions for review before final submit
   */
  @PostMapping("products/analyze")
  public ResponseEntity<?> analyzeProductImage(@RequestBody com.example.SnapCart.dto.ProductUploadRequest request) {
    try {
      if (productUploadService == null) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Product upload service is not available");
      }

      com.example.SnapCart.dto.ProductUploadResponse response = productUploadService.analyzeProductImage(request);

      if (response.isSuccess()) {
        return ResponseEntity.ok(response);
      } else {
        return ResponseEntity.badRequest().body(response);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error analyzing product image: " + e.getMessage());
    }
  }

  /**
   * Step 2: Create product with confirmed data
   * POST /api/products/create
   */
  @PostMapping("products/create")
  public ResponseEntity<?> createProduct(@RequestBody com.example.SnapCart.dto.ProductUploadRequest request) {
    try {
      if (productUploadService == null) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Product upload service is not available");
      }

      com.example.SnapCart.dto.ProductUploadResponse response = productUploadService.createProduct(request);

      if (response.isSuccess()) {
        return ResponseEntity.ok(response);
      } else {
        return ResponseEntity.badRequest().body(response);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error creating product: " + e.getMessage());
    }
  }

  /**
   * Combined: Analyze and create in one step
   * POST /api/products/quick-upload
   * For users who trust AI suggestions 100%
   */
  @PostMapping("products/quick-upload")
  public ResponseEntity<?> quickUploadProduct(@RequestBody com.example.SnapCart.dto.ProductUploadRequest request) {
    try {
      if (productUploadService == null) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("Product upload service is not available");
      }

      com.example.SnapCart.dto.ProductUploadResponse response = productUploadService.analyzeAndCreateProduct(request);

      if (response.isSuccess()) {
        return ResponseEntity.ok(response);
      } else {
        return ResponseEntity.badRequest().body(response);
      }
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Error uploading product: " + e.getMessage());
    }
  }

}
