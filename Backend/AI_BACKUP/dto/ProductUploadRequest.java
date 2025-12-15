package com.example.SnapCart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request DTO for uploading products with AI analysis
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductUploadRequest {
    private String imageBase64; // Base64 encoded product image
    private String productName; // Optional: user can provide or AI suggests
    private String description; // Optional: user can provide or AI generates
    private Double price;
    private Integer discount;
    private String brand;
    private String city;

    // These will be auto-filled by AI but user can override
    private String gender; // Male/Female
    private String occasion; // Wedding/Party/Casual/Office
    private String items; // Sherwani/Dress/Shirt/etc
    private String colour; // Color detected by AI
    private String style; // Luxury/Casual/Formal

    // Flag to indicate if user wants AI to analyze
    private boolean useAiAnalysis = true;
}
