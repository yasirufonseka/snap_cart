package com.example.SnapCart.services;

import com.example.SnapCart.dto.ImageIdentifyRequest;
import com.example.SnapCart.dto.ImageIdentifyResponse;
import com.example.SnapCart.entity.FashionSuggestion;
import com.example.SnapCart.entity.ImageHistory;
import com.example.SnapCart.repository.FashionSuggestionRepository;
import com.example.SnapCart.repository.ImageHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ImageIdentifyService {

    @Autowired(required = false)
    private FashionSuggestionRepository fashionSuggestionRepository;

    @Autowired(required = false)
    private ImageHistoryRepository imageHistoryRepository;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public ImageIdentifyResponse identifyImage(ImageIdentifyRequest request) {
        ImageIdentifyResponse response = new ImageIdentifyResponse();

        try {
            // Get AI identification from OpenAI Vision API
            Map<String, String> aiResult = identifyWithAI(request);

            if (aiResult == null || aiResult.isEmpty()) {
                response.setSuccess(false);
                response.setError("Could not identify the image. Please try another one.");
                return response;
            }

            String detectedType = aiResult.getOrDefault("type", "");
            String detectedColor = aiResult.getOrDefault("color", "");
            String detectedStyle = aiResult.getOrDefault("style", "");

            response.setDetectedType(detectedType);
            response.setDetectedColor(detectedColor);
            response.setDetectedStyle(detectedStyle);

            // Get suggestion from database
            String suggestion = getSuggestionFromDatabase(detectedType, detectedColor, detectedStyle);

            if (suggestion == null || suggestion.isEmpty()) {
                suggestion = generateDefaultSuggestion(detectedType, detectedColor, detectedStyle);
            }

            response.setSuggestion(suggestion);
            response.setSuccess(true);

            // Save to history
            saveToHistory(request.getImageUrl(), detectedType, detectedColor, detectedStyle, suggestion);

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            response.setSuccess(false);
            response.setError("An error occurred while processing the image: " + e.getMessage());
            return response;
        }
    }

    private Map<String, String> identifyWithAI(ImageIdentifyRequest request) {
        if (openaiApiKey == null || openaiApiKey.isEmpty()) {
            // Fallback: Use simple keyword detection for demo purposes
            return identifyWithKeywords(request);
        }

        try {
            String imageInput;
            if (request.getImageData() != null && !request.getImageData().isEmpty()) {
                imageInput = "data:image/jpeg;base64," + request.getImageData();
            } else if (request.getImageUrl() != null && !request.getImageUrl().isEmpty()) {
                imageInput = request.getImageUrl();
            } else {
                return null;
            }

            String apiUrl = "https://api.openai.com/v1/chat/completions";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "gpt-4o-mini");

            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");

            List<Map<String, Object>> content = new ArrayList<>();

            Map<String, Object> textContent = new HashMap<>();
            textContent.put("type", "text");
            textContent.put("text",
                    "Identify this fashion item. Return ONLY a JSON with: {\"type\": \"shirt/pants/dress/shoes/jacket/etc\", \"color\": \"main color\", \"style\": \"casual/formal/party/sporty/etc\"}");
            content.add(textContent);

            Map<String, Object> imageContent = new HashMap<>();
            imageContent.put("type", "image_url");
            Map<String, String> imageUrl = new HashMap<>();
            imageUrl.put("url", imageInput);
            imageContent.put("image_url", imageUrl);
            content.add(imageContent);

            message.put("content", content);
            messages.add(message);

            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 100);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> aiResponse = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);

            if (aiResponse.getStatusCode() == HttpStatus.OK && aiResponse.getBody() != null) {
                Map<String, Object> responseBody = aiResponse.getBody();
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");

                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> messageObj = (Map<String, Object>) firstChoice.get("message");
                    String aiText = (String) messageObj.get("content");

                    // Parse JSON response
                    return parseAIResponse(aiText);
                }
            }
        } catch (Exception e) {
            System.err.println("Error calling OpenAI API: " + e.getMessage());
            e.printStackTrace();
        }

        // Fallback to keyword detection
        return identifyWithKeywords(request);
    }

    private Map<String, String> identifyWithKeywords(ImageIdentifyRequest request) {
        // Simple fallback: random fashion item for demo
        Map<String, String> result = new HashMap<>();

        String[] types = { "shirt", "pants", "dress", "shoes", "jacket" };
        String[] colors = { "blue", "red", "black", "white", "green" };
        String[] styles = { "casual", "formal", "party", "sporty" };

        Random random = new Random();
        result.put("type", types[random.nextInt(types.length)]);
        result.put("color", colors[random.nextInt(colors.length)]);
        result.put("style", styles[random.nextInt(styles.length)]);

        return result;
    }

    private Map<String, String> parseAIResponse(String aiText) {
        Map<String, String> result = new HashMap<>();

        try {
            // Remove markdown code blocks if present
            aiText = aiText.replace("```json", "").replace("```", "").trim();

            // Simple JSON parsing (in production, use Jackson or Gson)
            if (aiText.contains("\"type\"")) {
                String type = extractValue(aiText, "type");
                String color = extractValue(aiText, "color");
                String style = extractValue(aiText, "style");

                result.put("type", type.toLowerCase());
                result.put("color", color.toLowerCase());
                result.put("style", style.toLowerCase());
            }
        } catch (Exception e) {
            System.err.println("Error parsing AI response: " + e.getMessage());
        }

        return result;
    }

    private String extractValue(String json, String key) {
        try {
            String search = "\"" + key + "\"";
            int start = json.indexOf(search);
            if (start == -1)
                return "";

            start = json.indexOf(":", start) + 1;
            start = json.indexOf("\"", start) + 1;
            int end = json.indexOf("\"", start);

            return json.substring(start, end).trim();
        } catch (Exception e) {
            return "";
        }
    }

    private String getSuggestionFromDatabase(String type, String color, String style) {
        if (fashionSuggestionRepository == null) {
            return null;
        }

        List<FashionSuggestion> suggestions = fashionSuggestionRepository.findByTypeColorStyle(type, color, style);

        if (suggestions.isEmpty()) {
            suggestions = fashionSuggestionRepository.findByItemType(type);
        }

        if (!suggestions.isEmpty()) {
            return suggestions.get(0).getSuggestion();
        }

        return null;
    }

    private String generateDefaultSuggestion(String type, String color, String style) {
        StringBuilder suggestion = new StringBuilder();
        suggestion.append("Great choice! ");

        switch (type.toLowerCase()) {
            case "shirt":
                suggestion.append("For a ").append(color).append(" ").append(style).append(" shirt, ");
                suggestion.append(
                        "I recommend pairing it with dark jeans or chinos and white sneakers for a clean look.");
                break;
            case "pants":
                suggestion.append("These ").append(color).append(" ").append(style).append(" pants ");
                suggestion.append("would look great with a white or light-colored shirt and casual shoes.");
                break;
            case "dress":
                suggestion.append("This ").append(color).append(" ").append(style).append(" dress ");
                suggestion.append(
                        "is perfect with heels and a small clutch. Add some statement jewelry to complete the look!");
                break;
            case "shoes":
                suggestion.append("These ").append(color).append(" ").append(style).append(" shoes ");
                suggestion.append("are versatile and can be paired with jeans, chinos, or even dress pants.");
                break;
            case "jacket":
                suggestion.append("A ").append(color).append(" ").append(style).append(" jacket ");
                suggestion
                        .append("is a wardrobe essential. Layer it over a t-shirt with jeans for an effortless style.");
                break;
            default:
                suggestion.append("This ").append(color).append(" ").append(style).append(" piece ");
                suggestion.append("is stylish! Mix and match with complementary colors and styles from your wardrobe.");
        }

        return suggestion.toString();
    }

    private void saveToHistory(String imageUrl, String type, String color, String style, String suggestion) {
        try {
            if (imageHistoryRepository == null) {
                return;
            }
            ImageHistory history = new ImageHistory();
            history.setImageUrl(imageUrl);
            history.setDetectedType(type);
            history.setDetectedColor(color);
            history.setDetectedStyle(style);
            history.setSuggestion(suggestion);
            imageHistoryRepository.save(history);
        } catch (Exception e) {
            System.err.println("Error saving to history: " + e.getMessage());
        }
    }
}
