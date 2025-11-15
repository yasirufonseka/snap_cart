package com.example.SnapCart.services;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import com.example.SnapCart.entity.Product;
import com.example.SnapCart.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import reactor.core.publisher.Mono;

@Service
public class ChatService {

    private final WebClient webClient;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:}")
    private String apiUrl;

    public ChatService(WebClient.Builder webClientBuilder, ProductRepository productRepository) {
        this.webClient = webClientBuilder.build();
        this.productRepository = productRepository;
        this.objectMapper = new ObjectMapper();
    }

    public Mono<String> getChatResponse(String userQuery) {
        System.out.println("Processing chat query: " + userQuery);

        // Check if API is configured
        if (apiKey == null || apiKey.trim().isEmpty() || apiUrl == null || apiUrl.trim().isEmpty() || 
            apiKey.equals("YOUR_ACTUAL_API_KEY")) {
            System.err.println("Gemini API not configured properly, using fallback response with product search");
            return Mono.just(fallbackResponseWithProducts(userQuery));
        }

        // Build the context prompt for Gemini
        String prompt = buildGeminiPrompt(userQuery, null);

        // Create Gemini API request
        String requestBody = buildGeminiRequest(prompt);

        // Call Gemini API
        System.out.println("Calling Gemini API...");
        System.out.println("Using model: gemini-2.0-flash");
        
        return webClient.post()
            .uri(apiUrl + "?key=" + apiKey)
            .header("Content-Type", "application/json")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(String.class)
            .map(this::extractGeminiResponse)
            .doOnSuccess(response -> {
                System.out.println("Final response length: " + response.length());
                System.out.println("Final response preview: " + response.substring(0, Math.min(200, response.length())));
            })
            .doOnError(error -> {
                System.err.println("Gemini API error: " + error.getMessage());
                if (error instanceof WebClientResponseException) {
                    WebClientResponseException webEx = (WebClientResponseException) error;
                    System.err.println("Status: " + webEx.getStatusCode());
                    System.err.println("Response: " + webEx.getResponseBodyAsString());
                }
            })
            .onErrorReturn(fallbackResponseWithProducts(userQuery));
    }

    private String buildLocalResponse(String userQuery, List<Product> relevantProducts) {
        String query = userQuery.toLowerCase();
        
        // Simple keyword matching responses
        if (query.contains("hello") || query.contains("hi") || query.contains("hey")) {
            return "Hi! I'm GeminiStore, your fashion assistant! 👋 I can help you with fashion tips, styling advice, and product recommendations. What would you like to know?";
        }
        
        if (query.contains("price") || query.contains("cost") || query.contains("how much")) {
            if (!relevantProducts.isEmpty()) {
                Product p = relevantProducts.get(0);
                return "The " + p.getCollection() + " costs $" + String.format("%.2f", p.getPrice()) + 
                       (p.getDiscount() > 0 ? " with a " + p.getDiscount() + "% discount!" : "");
            }
            return "I couldn't find pricing information for what you're looking for.";
        }
        
        if (query.contains("product") || query.contains("item") || query.contains("what do you have")) {
            if (!relevantProducts.isEmpty()) {
                StringBuilder response = new StringBuilder("Here are some products we have:\n");
                for (int i = 0; i < Math.min(3, relevantProducts.size()); i++) {
                    Product p = relevantProducts.get(i);
                    response.append((i + 1)).append(". ").append(p.getCollection())
                            .append(" - $").append(String.format("%.2f", p.getPrice()))
                            .append("\n");
                }
                return response.toString();
            }
            return "I couldn't find any products matching your search.";
        }
        
        if (query.contains("help") || query.contains("support")) {
            return "I can help you find products by asking about specific items, prices, or categories. What would you like to know?";
        }
        
        // Default response with product context if available
        if (!relevantProducts.isEmpty()) {
            Product p = relevantProducts.get(0);
            return "I found '" + p.getCollection() + "' which might interest you! It's priced at $" + 
                   String.format("%.2f", p.getPrice()) + ". Would you like to know more?";
        }
        
        return "I'm here to help! Try asking me about products, prices, or categories we have available.";
    }

    // ---------------------- PRODUCT SEARCH ------------------------

    private List<Product> findRelevantProducts(String query) {
        String[] keywords = query.toLowerCase().split("\\s+");

        for (String keyword : keywords) {
            if (keyword.length() > 2) {
                List<Product> products =
                    productRepository.findByItemsContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);

                if (!products.isEmpty()) {
                    return products.stream().limit(3).collect(Collectors.toList());
                }
            }
        }

        return List.of();
    }

    // ---------------------- GEMINI API INTEGRATION ------------------------

    private String buildGeminiPrompt(String userQuery, List<Product> products) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are GeminiStore, a fashion e-commerce AI assistant. ");
        prompt.append("Analyze the user's message and extract fashion/clothing items they might be interested in. ");
        prompt.append("IMPORTANT: Always respond in this exact JSON format: ");
        prompt.append("{\"message\": \"your response here\", \"items\": [\"item1\", \"item2\"]} ");
        prompt.append("Extract fashion items like: jeans, shirt, dress, shoes, hat, watch, jacket, skirt, pants, top, etc. ");
        prompt.append("If no fashion items are mentioned, use empty array for items. ");
        prompt.append("Keep your message conversational and helpful. ");
        
        prompt.append("\n\nUser: ").append(userQuery);
        prompt.append("\n\nRespond in JSON format with message and extracted items:");
        
        return prompt.toString();
    }

    private String buildGeminiRequest(String prompt) {
        try {
            // Create the request structure for Gemini API
            String escapedPrompt = prompt.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
            
            return String.format("""
                {
                  "contents": [{
                    "parts": [{
                      "text": "%s"
                    }]
                  }],
                  "generationConfig": {
                    "temperature": 0.3,
                    "maxOutputTokens": 200,
                    "topP": 0.8,
                    "topK": 10
                  },
                  "safetySettings": [
                    {
                      "category": "HARM_CATEGORY_HARASSMENT",
                      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                      "category": "HARM_CATEGORY_HATE_SPEECH",
                      "threshold": "BLOCK_MEDIUM_AND_ABOVE"
                    }
                  ]
                }
                """, escapedPrompt);
        } catch (Exception e) {
            System.err.println("Error building Gemini request: " + e.getMessage());
            return "{}";
        }
    }

    private String extractGeminiResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            
            // Navigate through Gemini's response structure
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    if (!text.isEmpty()) {
                        System.out.println("Raw Gemini response: " + text);
                        return processGeminiJsonResponse(text.trim());
                    }
                }
            }
            
            System.err.println("Unexpected Gemini response structure: " + jsonResponse);
            return createFallbackResponse("I received an unexpected response format. Let me try to help you differently!");
            
        } catch (Exception e) {
            System.err.println("Error parsing Gemini response: " + e.getMessage());
            System.err.println("Raw response: " + jsonResponse);
            return createFallbackResponse("I had trouble understanding the AI response. How can I help you with fashion advice?");
        }
    }

    private String processGeminiJsonResponse(String aiResponse) {
        try {
            // Clean the response - remove markdown formatting if present
            String cleanResponse = aiResponse.replace("```json", "").replace("```", "").trim();
            
            // Parse the AI's JSON response
            JsonNode aiJson = objectMapper.readTree(cleanResponse);
            String message = aiJson.path("message").asText();
            JsonNode itemsNode = aiJson.path("items");
            
            System.out.println("AI Message: " + message);
            System.out.println("Extracted items: " + itemsNode);
            
            // Search for products based on extracted items
            List<Product> foundProducts = List.of();
            if (itemsNode.isArray() && itemsNode.size() > 0) {
                for (JsonNode item : itemsNode) {
                    String itemName = item.asText();
                    System.out.println("Searching for: " + itemName);
                    List<Product> products = searchProductsByItem(itemName);
                    if (!products.isEmpty()) {
                        foundProducts = products;
                        break; // Use first matching category
                    }
                }
            }
            
            // Build final response with products
            return buildFinalResponseWithProducts(message, foundProducts);
            
        } catch (Exception e) {
            System.err.println("Error processing AI JSON response: " + e.getMessage());
            System.err.println("Original response: " + aiResponse);
            
            // Fallback: extract items manually and search
            return extractItemsManuallyAndSearch(aiResponse);
        }
    }

    private List<Product> searchProductsByItem(String itemName) {
        try {
            System.out.println("=== SEARCHING FOR ITEM: " + itemName + " ===");
            
            // Search in items field and description
            List<Product> products = productRepository.findByItemsContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
                itemName, itemName);
            
            System.out.println("Database search returned " + products.size() + " products for: " + itemName);
            
            // Log first few products found
            for (int i = 0; i < Math.min(3, products.size()); i++) {
                Product p = products.get(i);
                System.out.println("Product " + (i+1) + ": " + p.getItems() + " | " + p.getBrand() + " | $" + p.getPrice());
            }
            
            // Also try broader search if specific search fails
            if (products.isEmpty()) {
                System.out.println("No products found for '" + itemName + "', trying collection search...");
                products = productRepository.findByCollection(itemName);
                System.out.println("Collection search returned " + products.size() + " products");
            }
            
            // Even broader search if still empty
            if (products.isEmpty()) {
                System.out.println("Still no products, trying brand search...");
                products = productRepository.findByBrand(itemName);
                System.out.println("Brand search returned " + products.size() + " products");
            }
            
            return products.stream().limit(5).collect(Collectors.toList());
            
        } catch (Exception e) {
            System.err.println("Error searching products for item: " + itemName + ", " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    private String buildFinalResponseWithProducts(String aiMessage, List<Product> products) {
        try {
            System.out.println("=== BUILDING FINAL RESPONSE ===");
            System.out.println("AI Message: " + aiMessage);
            System.out.println("Products count: " + products.size());
            
            StringBuilder response = new StringBuilder();
            
            // Add AI message
            response.append(aiMessage);
            
            // Add products if found
            if (!products.isEmpty()) {
                response.append("\n\n🛍️ Here are some products I found for you:\n");
                for (int i = 0; i < Math.min(3, products.size()); i++) {
                    Product p = products.get(i);
                    System.out.println("Adding product " + (i+1) + ": " + p.getItems());
                    
                    response.append("\n").append(i + 1).append(". **")
                            .append(p.getItems() != null && !p.getItems().isEmpty() ? p.getItems() : 
                                   (p.getCollection() != null ? p.getCollection() : "Product"))
                            .append("**");
                    
                    if (p.getBrand() != null && !p.getBrand().isEmpty()) {
                        response.append(" by ").append(p.getBrand());
                    }
                    
                    response.append("\n   💰 Price: $").append(String.format("%.2f", p.getPrice()));
                    
                    if (p.getDiscount() > 0) {
                        response.append(" (").append(p.getDiscount()).append("% off!)");
                    }
                    
                    if (p.getDescription() != null && !p.getDescription().isEmpty()) {
                        String desc = p.getDescription().length() > 50 ? 
                            p.getDescription().substring(0, 50) + "..." : p.getDescription();
                        response.append("\n   📝 ").append(desc);
                    }
                    
                    if (p.getCity() != null && !p.getCity().isEmpty()) {
                        response.append("\n   📍 Location: ").append(p.getCity());
                    }
                    
                    response.append("\n");
                }
                response.append("\nWould you like to know more about any of these items?");
            } else {
                System.out.println("No products to add to response");
                response.append("\n\nI couldn't find specific products matching your request in our current inventory. Would you like me to help you with something else?");
            }
            
            String finalResponse = response.toString();
            System.out.println("Final response length: " + finalResponse.length());
            return finalResponse;
            
        } catch (Exception e) {
            System.err.println("Error building final response: " + e.getMessage());
            e.printStackTrace();
            return aiMessage + "\n\nI had trouble fetching product details, but I'm here to help!";
        }
    }

    private String extractItemsManuallyAndSearch(String response) {
        // Manual extraction as fallback
        String[] fashionItems = {"jeans", "shirt", "dress", "shoes", "hat", "watch", "jacket", 
                                "skirt", "pants", "top", "blouse", "sweater", "coat", "boots", 
                                "sneakers", "bag", "purse", "belt", "scarf", "tie"};
        
        String lowerResponse = response.toLowerCase();
        for (String item : fashionItems) {
            if (lowerResponse.contains(item)) {
                List<Product> products = searchProductsByItem(item);
                if (!products.isEmpty()) {
                    return buildFinalResponseWithProducts(
                        "I found some " + item + " options for you!", products);
                }
            }
        }
        
        return response; // Return original if no items found
    }

    private String fallbackResponseWithProducts(String userQuery) {
        System.out.println("Using fallback response with product search for: " + userQuery);
        
        // Extract items from user query
        String extractedResponse = extractItemsManuallyAndSearch(userQuery);
        if (!extractedResponse.equals(userQuery)) {
            return extractedResponse; // Found products
        }
        
        // Generic search in all products if no specific items found
        List<Product> allProducts = findRelevantProducts(userQuery);
        if (!allProducts.isEmpty()) {
            return buildFinalResponseWithProducts(
                "I found some products that might interest you based on your query!", allProducts);
        }
        
        return "Hi! I'm here to help you find fashion items. Try asking about specific items like jeans, shirts, dresses, shoes, or just browse our collection!";
    }

    private String createFallbackResponse(String message) {
        return "{\"message\": \"" + message + "\", \"products\": []}";
    }

    // Debug method to test database connectivity
    public String testProductSearch() {
        try {
            System.out.println("=== TESTING PRODUCT DATABASE ===");
            
            // Try to get any products
            List<Product> allProducts = productRepository.findAll();
            System.out.println("Total products in database: " + allProducts.size());
            
            if (!allProducts.isEmpty()) {
                System.out.println("Sample products:");
                for (int i = 0; i < Math.min(5, allProducts.size()); i++) {
                    Product p = allProducts.get(i);
                    System.out.println((i+1) + ". Items: '" + p.getItems() + "', Collection: '" + p.getCollection() + 
                                     "', Brand: '" + p.getBrand() + "', Price: $" + p.getPrice());
                }
                
                // Test search with first product's items
                if (allProducts.get(0).getItems() != null) {
                    String testItem = allProducts.get(0).getItems();
                    List<Product> searchResult = searchProductsByItem(testItem);
                    System.out.println("Test search for '" + testItem + "' returned: " + searchResult.size() + " products");
                }
            }
            
            return "Database test completed. Check console logs.";
            
        } catch (Exception e) {
            System.err.println("Database test failed: " + e.getMessage());
            e.printStackTrace();
            return "Database test failed: " + e.getMessage();
        }
    }
}
