package com.example.SnapCart.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ImageAnalysisResult {
    private String clothingType; // coat, shirt, dress, saree, etc.
    private List<String> colors; // dominant colors
    private String style; // luxury, casual, formal, traditional
    private String gender; // male, female, unisex
    private String occasion; // wedding, party, casual, office
    private String material; // cotton, silk, polyester (if detectable)
    private String pattern; // solid, striped, floral, printed
    private String description; // AI-generated description
    private int confidenceScore; // 0-100

    // NEW: Combined category for intelligent filtering (e.g., "Wedding-Male",
    // "Casual-Female")
    private String category; // Format: "Occasion-Gender" (e.g., Wedding-Male, Party-Female)
}
