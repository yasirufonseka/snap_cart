package com.example.SnapCart.services;

import com.example.SnapCart.dto.AiChatRequest;
import com.example.SnapCart.dto.AiChatResponse;
import com.example.SnapCart.dto.ImageAnalysisResult;
import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiRecommendationService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private GeminiVisionService geminiVisionService;

    /**
     * Processes user chat message and returns AI response with product
     * recommendations
     */
    public AiChatResponse processUserMessage(AiChatRequest request) {
        AiChatResponse response = new AiChatResponse();
        response.setConversationId(
                request.getConversationId() != null ? request.getConversationId() : UUID.randomUUID().toString());

        // Extract user information from conversation
        AiChatResponse.ExtractedUserInfo userInfo = extractUserInformation(request);
        response.setExtractedInfo(userInfo);

        // If user uploaded an image, analyze it
        if (request.getImageBase64() != null && !request.getImageBase64().isEmpty()) {
            ImageAnalysisResult imageAnalysis = geminiVisionService.analyzeClothingImage(request.getImageBase64());

            // Update user info with image analysis
            updateUserInfoFromImage(userInfo, imageAnalysis);

            // Generate AI message about the image
            String imageMessage = generateImageAnalysisMessage(imageAnalysis);
            response.setAiMessage(imageMessage);

            // Find similar products
            List<Product> products = findSimilarProducts(imageAnalysis);
            response.setProducts(products.stream()
                    .map(AiChatResponse.ProductRecommendation::fromProduct)
                    .collect(Collectors.toList()));

            response.setFollowUpQuestions(List.of(
                    "Would you like to see more options in different colors?",
                    "What is your budget range?",
                    "Do you need matching accessories?"));

        } else {
            // Normal text conversation
            List<String> conversationHistory = buildConversationHistory(request);
            String aiMessage = geminiVisionService.generateChatResponse(request.getMessage(), conversationHistory);
            response.setAiMessage(aiMessage);

            // If we have enough information, recommend products
            if (hasEnoughInfoForRecommendation(userInfo)) {
                List<Product> products = recommendProducts(userInfo);
                response.setProducts(products.stream()
                        .limit(6) // Show top 6 products
                        .map(AiChatResponse.ProductRecommendation::fromProduct)
                        .collect(Collectors.toList()));
            }

            // Generate follow-up questions
            response.setFollowUpQuestions(generateFollowUpQuestions(userInfo));
        }

        return response;
    }

    /**
     * Extracts user preferences from conversation history
     */
    private AiChatResponse.ExtractedUserInfo extractUserInformation(AiChatRequest request) {
        AiChatResponse.ExtractedUserInfo info = new AiChatResponse.ExtractedUserInfo();

        String fullConversation = request.getMessage().toLowerCase();
        if (request.getChatHistory() != null) {
            fullConversation += " " + request.getChatHistory().stream()
                    .map(AiChatRequest.ChatHistory::getContent)
                    .collect(Collectors.joining(" "))
                    .toLowerCase();
        }

        // Extract event/occasion
        if (fullConversation.contains("wedding"))
            info.setEvent("wedding");
        else if (fullConversation.contains("party"))
            info.setEvent("party");
        else if (fullConversation.contains("office") || fullConversation.contains("work"))
            info.setEvent("office");
        else if (fullConversation.contains("casual"))
            info.setEvent("casual");
        else if (fullConversation.contains("traditional"))
            info.setEvent("traditional-event");

        // Extract gender
        if (fullConversation.contains("male") || fullConversation.contains("men")
                || fullConversation.contains("groom")) {
            info.setGender("male");
        } else if (fullConversation.contains("female") || fullConversation.contains("women")
                || fullConversation.contains("bride")) {
            info.setGender("female");
        }

        // Extract style
        if (fullConversation.contains("luxury") || fullConversation.contains("premium"))
            info.setStyle("luxury");
        else if (fullConversation.contains("simple") || fullConversation.contains("minimal"))
            info.setStyle("simple");
        else if (fullConversation.contains("trendy") || fullConversation.contains("modern"))
            info.setStyle("trendy");
        else if (fullConversation.contains("classic") || fullConversation.contains("traditional"))
            info.setStyle("classic");

        // Extract color preference
        String[] colors = { "black", "white", "blue", "red", "green", "yellow", "pink", "purple", "navy", "grey" };
        for (String color : colors) {
            if (fullConversation.contains(color)) {
                info.setColor(color);
                break;
            }
        }

        // Extract clothing type
        String[] clothingTypes = { "coat", "shirt", "dress", "saree", "trouser", "skirt", "jacket", "suit" };
        for (String type : clothingTypes) {
            if (fullConversation.contains(type)) {
                info.setClothingType(type);
                break;
            }
        }

        info.setHasImage(request.getImageBase64() != null && !request.getImageBase64().isEmpty());

        return info;
    }

    /**
     * Updates user info with image analysis results
     */
    private void updateUserInfoFromImage(AiChatResponse.ExtractedUserInfo userInfo, ImageAnalysisResult imageAnalysis) {
        if (userInfo.getClothingType() == null)
            userInfo.setClothingType(imageAnalysis.getClothingType());
        if (userInfo.getGender() == null)
            userInfo.setGender(imageAnalysis.getGender());
        if (userInfo.getEvent() == null)
            userInfo.setEvent(imageAnalysis.getOccasion());
        if (userInfo.getStyle() == null)
            userInfo.setStyle(imageAnalysis.getStyle());
        if (userInfo.getColor() == null && !imageAnalysis.getColors().isEmpty()) {
            userInfo.setColor(imageAnalysis.getColors().get(0));
        }
        userInfo.setHasImage(true);
    }

    /**
     * Generates a friendly message about the analyzed image with detected category
     */
    private String generateImageAnalysisMessage(ImageAnalysisResult analysis) {
        return String.format(
                "🔥 Perfect! I detected this as **%s** category!\n\n" +
                        "I can see this is a %s %s in %s colors, perfect for %s occasions. " +
                        "Let me find similar items from our **%s** collection that match this style!",
                analysis.getCategory(),
                analysis.getStyle(),
                analysis.getClothingType(),
                String.join(" and ", analysis.getColors()),
                analysis.getOccasion(),
                analysis.getCategory());
    }

    /**
     * Finds products similar to the uploaded image using INTELLIGENT CATEGORY
     * FILTERING
     * Step 1: Filter by detected category (Occasion-Gender)
     * Step 2: Score and rank by similarity within that category
     */
    private List<Product> findSimilarProducts(ImageAnalysisResult analysis) {
        List<Product> allProducts = productRepository.findByStatus("approved");

        // STEP 1: STRICT category filtering (e.g., only Wedding-Male products)
        List<Product> categoryFiltered = allProducts.stream()
                .filter(p -> matchesCategory(p, analysis))
                .sorted((p1, p2) -> calculateMatchScore(p2, analysis) - calculateMatchScore(p1, analysis))
                .limit(6)
                .collect(Collectors.toList());

        // If we found enough products in the exact category, return them
        if (categoryFiltered.size() >= 3) {
            System.out
                    .println("✅ Found " + categoryFiltered.size() + " products in category: " + analysis.getCategory());
            return categoryFiltered;
        }

        // STEP 2: Fallback to broader matching (if not enough products in exact
        // category)
        System.out.println(
                "⚠️ Only " + categoryFiltered.size() + " products in exact category, using broader matching...");
        return allProducts.stream()
                .filter(p -> matchesImageCriteria(p, analysis))
                .sorted((p1, p2) -> calculateMatchScore(p2, analysis) - calculateMatchScore(p1, analysis))
                .limit(6)
                .collect(Collectors.toList());
    }

    /**
     * NEW: Checks if product matches the detected category (Occasion-Gender)
     * This is the PRIMARY filter for intelligent recommendations
     */
    private boolean matchesCategory(Product product, ImageAnalysisResult analysis) {
        String detectedCategory = analysis.getCategory(); // e.g., "Wedding-Male"

        if (detectedCategory == null || !detectedCategory.contains("-")) {
            return false;
        }

        String[] parts = detectedCategory.split("-");
        String occasion = parts[0].toLowerCase(); // "wedding"
        String gender = parts[1].toLowerCase(); // "male"

        // Match gender (STRICT - must match)
        if (product.getGender() != null) {
            if (!product.getGender().equalsIgnoreCase(gender)) {
                return false; // Wrong gender = exclude
            }
        }

        // Match occasion (STRICT - must match)
        if (product.getOccasion() != null) {
            if (!product.getOccasion().toLowerCase().contains(occasion)) {
                return false; // Wrong occasion = exclude
            }
        }

        return true; // Both gender AND occasion match!
    }

    /**
     * Checks if product matches image analysis criteria (FALLBACK - more lenient)
     * Used when strict category filtering doesn't return enough products
     */
    private boolean matchesImageCriteria(Product product, ImageAnalysisResult analysis) {
        int matchCount = 0;

        // Match clothing type (partial match OK)
        if (product.getItems() != null
                && product.getItems().toLowerCase().contains(analysis.getClothingType().toLowerCase())) {
            matchCount++;
        }

        // Match color (any color match)
        if (product.getColour() != null && analysis.getColors().stream()
                .anyMatch(color -> product.getColour().toLowerCase().contains(color.toLowerCase()))) {
            matchCount++;
        }

        // Match gender (important but not mandatory)
        if (product.getGender() != null && product.getGender().equalsIgnoreCase(analysis.getGender())) {
            matchCount++;
        }

        // Match occasion (important but not mandatory)
        if (product.getOccasion() != null
                && product.getOccasion().toLowerCase().contains(analysis.getOccasion().toLowerCase())) {
            matchCount++;
        }

        return matchCount >= 2; // At least 2 criteria must match for fallback
    }

    /**
     * Calculates match score for sorting
     */
    private int calculateMatchScore(Product product, ImageAnalysisResult analysis) {
        int score = 0;

        if (product.getItems() != null && product.getItems().equalsIgnoreCase(analysis.getClothingType()))
            score += 40;
        if (product.getColour() != null && analysis.getColors().contains(product.getColour().toLowerCase()))
            score += 30;
        if (product.getGender() != null && product.getGender().equalsIgnoreCase(analysis.getGender()))
            score += 15;
        if (product.getOccasion() != null && product.getOccasion().equalsIgnoreCase(analysis.getOccasion()))
            score += 15;

        return score;
    }

    /**
     * Recommends products based on user preferences
     */
    private List<Product> recommendProducts(AiChatResponse.ExtractedUserInfo userInfo) {
        List<Product> allProducts = productRepository.findByStatus("approved");

        return allProducts.stream()
                .filter(p -> matchesUserPreferences(p, userInfo))
                .sorted((p1, p2) -> Double.compare(p2.getPrice(), p1.getPrice())) // Sort by price
                .collect(Collectors.toList());
    }

    /**
     * Checks if product matches user preferences
     */
    private boolean matchesUserPreferences(Product product, AiChatResponse.ExtractedUserInfo userInfo) {
        if (userInfo.getGender() != null && product.getGender() != null) {
            if (!product.getGender().equalsIgnoreCase(userInfo.getGender()))
                return false;
        }

        if (userInfo.getEvent() != null && product.getOccasion() != null) {
            if (!product.getOccasion().toLowerCase().contains(userInfo.getEvent().toLowerCase()))
                return false;
        }

        if (userInfo.getColor() != null && product.getColour() != null) {
            if (!product.getColour().toLowerCase().contains(userInfo.getColor().toLowerCase()))
                return false;
        }

        if (userInfo.getClothingType() != null && product.getItems() != null) {
            if (!product.getItems().toLowerCase().contains(userInfo.getClothingType().toLowerCase()))
                return false;
        }

        return true;
    }

    /**
     * Checks if we have enough information to make recommendations
     */
    private boolean hasEnoughInfoForRecommendation(AiChatResponse.ExtractedUserInfo userInfo) {
        int infoCount = 0;
        if (userInfo.getGender() != null)
            infoCount++;
        if (userInfo.getEvent() != null)
            infoCount++;
        if (userInfo.getClothingType() != null)
            infoCount++;
        return infoCount >= 2; // Need at least 2 pieces of information
    }

    /**
     * Generates follow-up questions based on missing information
     */
    private List<String> generateFollowUpQuestions(AiChatResponse.ExtractedUserInfo userInfo) {
        List<String> questions = new ArrayList<>();

        if (userInfo.getEvent() == null) {
            questions.add("What's the occasion? (Wedding, Party, Casual, Office)");
        }
        if (userInfo.getGender() == null) {
            questions.add("Are you looking for men's or women's clothing?");
        }
        if (userInfo.getClothingType() == null) {
            questions.add("What type of clothing are you interested in?");
        }
        if (userInfo.getColor() == null) {
            questions.add("Do you have a color preference?");
        }
        if (userInfo.getBudget() == null) {
            questions.add("What's your budget range?");
        }

        return questions.isEmpty() ? List.of("Would you like to see more options?") : questions;
    }

    /**
     * Builds conversation history for context
     */
    private List<String> buildConversationHistory(AiChatRequest request) {
        List<String> history = new ArrayList<>();
        if (request.getChatHistory() != null) {
            history = request.getChatHistory().stream()
                    .map(ch -> ch.getRole() + ": " + ch.getContent())
                    .collect(Collectors.toList());
        }
        return history;
    }
}
