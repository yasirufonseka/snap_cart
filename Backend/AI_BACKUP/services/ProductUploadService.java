package com.example.SnapCart.services;

import com.example.SnapCart.dto.ImageAnalysisResult;
import com.example.SnapCart.dto.ProductUploadRequest;
import com.example.SnapCart.dto.ProductUploadResponse;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Service for AI-assisted product upload
 */
@Service
public class ProductUploadService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private GeminiVisionService geminiVisionService;

    /**
     * Step 1: Analyze product image and return AI suggestions
     * User can review before final submit
     */
    public ProductUploadResponse analyzeProductImage(ProductUploadRequest request) {
        ProductUploadResponse response = new ProductUploadResponse();

        try {
            if (request.getImageBase64() == null || request.getImageBase64().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Image is required for AI analysis");
                return response;
            }

            // Analyze image using Gemini Vision AI
            ImageAnalysisResult analysis = geminiVisionService.analyzeClothingImage(request.getImageBase64());

            // Build AI suggestions
            ProductUploadResponse.AiSuggestions suggestions = new ProductUploadResponse.AiSuggestions();
            suggestions.setCategory(analysis.getCategory());
            suggestions.setGender(analysis.getGender());
            suggestions.setOccasion(analysis.getOccasion());
            suggestions.setItems(analysis.getClothingType());
            suggestions.setColour(String.join(", ", analysis.getColors()));
            suggestions.setStyle(analysis.getStyle());
            suggestions.setConfidenceScore(analysis.getConfidenceScore());

            // Generate smart product name
            suggestions.setSuggestedName(generateProductName(analysis));

            // Generate description
            suggestions.setSuggestedDescription(analysis.getDescription());

            response.setSuccess(true);
            response.setMessage("AI analysis completed! Review the suggestions below.");
            response.setAiSuggestions(suggestions);

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("AI analysis failed: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    /**
     * Step 2: Create product with user-confirmed data
     */
    public ProductUploadResponse createProduct(ProductUploadRequest request) {
        ProductUploadResponse response = new ProductUploadResponse();

        try {
            // Validate required fields
            if (request.getPrice() == null || request.getPrice() <= 0) {
                response.setSuccess(false);
                response.setMessage("Price is required");
                return response;
            }

            if (request.getGender() == null || request.getGender().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Gender is required");
                return response;
            }

            if (request.getOccasion() == null || request.getOccasion().isEmpty()) {
                response.setSuccess(false);
                response.setMessage("Occasion is required");
                return response;
            }

            // Create product entity
            Product product = new Product();
            product.setItems(request.getItems());
            product.setDescription(request.getDescription());
            product.setPrice(request.getPrice());
            product.setDiscount(request.getDiscount() != null ? request.getDiscount() : 0);
            product.setGender(request.getGender());
            product.setColour(request.getColour());
            product.setOccasion(request.getOccasion());
            product.setBrand(request.getBrand());
            product.setCity(request.getCity());
            product.setCollection(request.getProductName());

            // Set default values
            product.setStatus("approved"); // Auto-approve or set to "pending"
            product.setCreatedAt(java.time.LocalDateTime.now());
            product.setApprovedAt(java.time.LocalDateTime.now()); // Auto-approved

            // IMPORTANT: Save image as base64 or URL
            // For now, storing as data URL (you can implement cloud storage later)
            if (request.getImageBase64() != null && !request.getImageBase64().isEmpty()) {
                // Convert base64 to data URL format for display
                String imageDataUrl = "data:image/jpeg;base64," + request.getImageBase64();
                product.setImages(java.util.Arrays.asList(imageDataUrl));

                System.out.println("✅ Product image saved (base64 format)");
            } else {
                System.out.println("⚠️ No image provided for product");
            }

            // Save to database
            Product savedProduct = productRepository.save(product);

            response.setSuccess(true);
            response.setMessage("✅ Product created successfully with ID: " + savedProduct.getId());
            response.setProductId(savedProduct.getId());

        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Failed to create product: " + e.getMessage());
            e.printStackTrace();
        }

        return response;
    }

    /**
     * Combined: Analyze and create in one step (if user trusts AI 100%)
     */
    public ProductUploadResponse analyzeAndCreateProduct(ProductUploadRequest request) {
        // Step 1: Analyze
        ProductUploadResponse analysisResponse = analyzeProductImage(request);

        if (!analysisResponse.isSuccess()) {
            return analysisResponse;
        }

        // Step 2: Auto-fill from AI suggestions
        ProductUploadResponse.AiSuggestions suggestions = analysisResponse.getAiSuggestions();
        request.setGender(suggestions.getGender());
        request.setOccasion(suggestions.getOccasion());
        request.setItems(suggestions.getItems());
        request.setColour(suggestions.getColour());

        if (request.getProductName() == null || request.getProductName().isEmpty()) {
            request.setProductName(suggestions.getSuggestedName());
        }

        if (request.getDescription() == null || request.getDescription().isEmpty()) {
            request.setDescription(suggestions.getSuggestedDescription());
        }

        // Step 3: Create product
        return createProduct(request);
    }

    /**
     * Generate intelligent product name based on AI analysis
     */
    private String generateProductName(ImageAnalysisResult analysis) {
        StringBuilder name = new StringBuilder();

        // Add style prefix
        if (analysis.getStyle() != null && !analysis.getStyle().equalsIgnoreCase("unknown")) {
            name.append(capitalize(analysis.getStyle())).append(" ");
        }

        // Add color
        if (analysis.getColors() != null && !analysis.getColors().isEmpty()) {
            String mainColor = analysis.getColors().get(0);
            if (!mainColor.equalsIgnoreCase("unknown")) {
                name.append(capitalize(mainColor)).append(" ");
            }
        }

        // Add clothing type
        if (analysis.getClothingType() != null) {
            name.append(capitalize(analysis.getClothingType()));
        }

        // Add occasion hint
        if (analysis.getOccasion() != null && !analysis.getOccasion().equalsIgnoreCase("casual")) {
            name.append(" for ").append(capitalize(analysis.getOccasion()));
        }

        return name.toString().trim();
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty())
            return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
