package com.example.SnapCart.services;

import com.example.SnapCart.dto.ImageAnalysisResult;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class GeminiVisionService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Analyzes a clothing image using Gemini Pro Vision via REST API
     * 
     * @param base64Image Base64 encoded image (without data:image prefix)
     * @return ImageAnalysisResult with extracted clothing details
     */
    public ImageAnalysisResult analyzeClothingImage(String base64Image) {
        try {
            // Create ENHANCED prompt for intelligent category detection
            String prompt = """
                    🎯 INTELLIGENT CLOTHING ANALYSIS - CATEGORY DETECTION

                    Analyze this clothing image and extract precise information for smart product recommendations.

                    **CRITICAL: Detect the combined category for filtering**

                    CATEGORY: [Occasion-Gender format]
                    Examples:
                    - Wedding-Male (for groom, sherwani, tuxedo, formal wedding suits)
                    - Wedding-Female (for bride, lehenga, bridal gown, wedding saree)
                    - Party-Male (for party suits, blazers, cocktail attire)
                    - Party-Female (for evening gowns, party dresses, cocktail dresses)
                    - Casual-Male (for casual shirts, jeans, t-shirts, casual wear)
                    - Casual-Female (for casual dresses, tops, casual blouses)
                    - Office-Male (for formal office shirts, trousers, business suits)
                    - Office-Female (for office dresses, blazers, formal blouses)
                    - Traditional-Male (for kurta, dhoti, ethnic wear)
                    - Traditional-Female (for saree, salwar kameez, ethnic dresses)

                    CLOTHING_TYPE: [shirt/dress/saree/suit/kurta/lehenga/gown/trouser/blazer/etc]
                    COLORS: [comma-separated dominant colors: white, blue, grey, black, red, etc]
                    STYLE: [luxury/casual/formal/traditional/trendy/classic/ethnic]
                    GENDER: [male/female] - Be VERY accurate
                    OCCASION: [wedding/party/casual/office/traditional-event] - Be precise
                    MATERIAL: [cotton/silk/polyester/linen/wool/chiffon/unknown]
                    PATTERN: [solid/striped/floral/printed/checkered/plain/embroidered]
                    DESCRIPTION: [2-sentence description: what it is + who should wear it]
                    CONFIDENCE: [0-100]

                    **IMPORTANT RULES:**
                    1. CATEGORY must be in "Occasion-Gender" format (e.g., Wedding-Male)
                    2. Detect GENDER accurately - look at cut, style, fit, and traditional indicators
                    3. For OCCASION: wedding dress/sherwani = Wedding, party gown = Party, casual shirt = Casual
                    4. Be precise - don't guess if unsure, use context clues

                    Respond in the EXACT format above.
                    """;

            // Build Gemini API request
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();

            // Add text part
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);

            // Add image part
            Map<String, Object> imagePart = new HashMap<>();
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mime_type", "image/jpeg");
            inlineData.put("data", base64Image);
            imagePart.put("inline_data", inlineData);
            parts.add(imagePart);

            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Call Gemini REST API
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(url, request, String.class);

            // Parse response
            JsonNode root = objectMapper.readTree(response);
            String analysisText = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            // Parse the response into structured data
            return parseAnalysisText(analysisText);

        } catch (Exception e) {
            e.printStackTrace();
            // Return default analysis on error
            return getDefaultAnalysis();
        }
    }

    /**
     * Parses the AI response text into structured ImageAnalysisResult
     */
    private ImageAnalysisResult parseAnalysisText(String text) {
        ImageAnalysisResult result = new ImageAnalysisResult();

        // Extract category first (NEW - intelligent category detection)
        String category = extractValue(text, "CATEGORY");
        if (category.equals("unknown") || !category.contains("-")) {
            // Fallback: build category from occasion + gender
            String occasion = extractValue(text, "OCCASION");
            String gender = extractValue(text, "GENDER");
            category = capitalizeFirst(occasion) + "-" + capitalizeFirst(gender);
        }
        result.setCategory(category);

        result.setClothingType(extractValue(text, "CLOTHING_TYPE"));
        result.setColors(Arrays.asList(extractValue(text, "COLORS").split(",\\s*")));
        result.setStyle(extractValue(text, "STYLE"));
        result.setGender(extractValue(text, "GENDER"));
        result.setOccasion(extractValue(text, "OCCASION"));
        result.setMaterial(extractValue(text, "MATERIAL"));
        result.setPattern(extractValue(text, "PATTERN"));
        result.setDescription(extractValue(text, "DESCRIPTION"));

        String confidenceStr = extractValue(text, "CONFIDENCE");
        try {
            result.setConfidenceScore(Integer.parseInt(confidenceStr.replaceAll("[^0-9]", "")));
        } catch (Exception e) {
            result.setConfidenceScore(75); // Default confidence
        }

        return result;
    }

    /**
     * Helper method to capitalize first letter
     */
    private String capitalizeFirst(String str) {
        if (str == null || str.isEmpty() || str.equals("unknown")) {
            return "Casual"; // Default
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    /**
     * Extracts value from formatted AI response
     */
    private String extractValue(String text, String key) {
        Pattern pattern = Pattern.compile(key + ":\\s*\\[?([^\\]\\n]+)\\]?", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        return "unknown";
    }

    /**
     * Returns default analysis when AI fails
     */
    private ImageAnalysisResult getDefaultAnalysis() {
        ImageAnalysisResult result = new ImageAnalysisResult();
        result.setCategory("Casual-Male"); // Default category
        result.setClothingType("clothing");
        result.setColors(List.of("unknown"));
        result.setStyle("casual");
        result.setGender("unisex");
        result.setOccasion("casual");
        result.setMaterial("unknown");
        result.setPattern("solid");
        result.setDescription("Could not analyze image. Please try again.");
        result.setConfidenceScore(0);
        return result;
    }

    /**
     * Generates a chat response using Gemini Pro via REST API (text only)
     * 
     * @param userMessage         User's message
     * @param conversationHistory Previous conversation context
     * @return AI's response
     */
    public String generateChatResponse(String userMessage, List<String> conversationHistory) {
        try {
            // Build context-aware prompt - NEW DIRECT STYLE
            StringBuilder contextPrompt = new StringBuilder();
            contextPrompt.append(
                    "You are GeminiStore, a friendly AI fashion assistant for SnapCart. Your name is 'bro' or 'brother'.\n\n");
            contextPrompt.append("🎯 YOUR BEHAVIOR:\n");
            contextPrompt.append("- ALWAYS give direct outfit suggestions with 5 options (Option 1, Option 2, etc.)\n");
            contextPrompt.append("- DO NOT ask questions unless you really can't understand the request\n");
            contextPrompt.append("- Be casual, friendly, and use emojis like 🔥 💯 ✔️\n");
            contextPrompt.append(
                    "- Infer context from the message (if they say 'wedding' assume formal, if they don't mention gender assume male for first response)\n");
            contextPrompt.append("- Keep responses SHORT and ACTIONABLE\n\n");
            contextPrompt.append("📝 RESPONSE FORMAT:\n");
            contextPrompt.append("Sure brother! 💯\n");
            contextPrompt.append("Here are **perfect outfit ideas** for [occasion]:\n\n");
            contextPrompt.append("## **1️⃣ [Style Name]**\n");
            contextPrompt.append("* Item 1\n* Item 2\n* Item 3\n🔥 [Why it works]\n\n");
            contextPrompt.append("(Repeat for 5 options)\n\n");
            contextPrompt.append("⭐ **My Best Pick:** [Your top recommendation]\n\n");
            contextPrompt.append(
                    "IMPORTANT: Only ask questions if the user's message is too vague (like just 'hi' or 'help').\n\n");

            // Add conversation history
            if (conversationHistory != null && !conversationHistory.isEmpty()) {
                contextPrompt.append("Previous conversation:\n");
                for (String msg : conversationHistory) {
                    contextPrompt.append(msg).append("\n");
                }
            }

            contextPrompt.append("\nUser: ").append(userMessage).append("\nAssistant:");

            // Build Gemini API request
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", contextPrompt.toString());
            parts.add(textPart);

            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            // Call Gemini REST API
            String url = geminiApiUrl + "?key=" + geminiApiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(url, request, String.class);

            // Parse response
            JsonNode root = objectMapper.readTree(response);
            String aiResponse = root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();

            return aiResponse;

        } catch (Exception e) {
            e.printStackTrace();
            return "I'm here to help you find the perfect outfit! What occasion are you shopping for?";
        }
    }
}
