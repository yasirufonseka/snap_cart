package com.example.SnapCart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response DTO for product upload with AI suggestions
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProductUploadResponse {
    private boolean success;
    private String message;
    private String productId; // ID of created product (String for MongoDB)

    // AI-suggested values (user can review before final submit)
    private AiSuggestions aiSuggestions;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiSuggestions {
        private String category; // e.g., "Wedding-Male"
        private String gender; // Male/Female
        private String occasion; // Wedding/Party/Casual
        private String items; // Sherwani/Dress/Shirt
        private String colour; // Detected colors
        private String style; // Luxury/Casual/Formal
        private String suggestedName; // AI-generated product name
        private String suggestedDescription; // AI-generated description
        private int confidenceScore; // 0-100
    }
}
