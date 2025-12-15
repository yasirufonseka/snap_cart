package com.example.SnapCart.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.example.SnapCart.dto.GeminiSearchParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GeminiSearchParams analyzeUserMessage(String userMessage) {
        System.out.println("🔵 User Message: " + userMessage);

        // TRY GEMINI API FIRST, FALLBACK TO KEYWORDS IF IT FAILS
        try {
            String prompt = buildPrompt(userMessage);
            System.out.println("🔵 Calling Gemini API...");
            String geminiResponse = callGeminiAPI(prompt);
            System.out.println("🟢 Gemini Response: " + geminiResponse);
            GeminiSearchParams result = parseGeminiResponse(geminiResponse);
            System.out.println("🟢 Parsed Successfully - Intent: " + result.getIntent());
            return result;
        } catch (Exception e) {
            System.err.println("🔴 Gemini API failed, using keyword fallback: " + e.getMessage());
            return analyzeWithKeywords(userMessage);
        }
    }

    private GeminiSearchParams analyzeWithKeywords(String message) {
        String msg = message.toLowerCase().trim();
        GeminiSearchParams params = new GeminiSearchParams();
        params.setShouldSearch(false);

        // NEGATIVE RESPONSES - User doesn't want something
        if (msg.matches(".*(don't want|dont want|no need|not interested|stop|enough|cancel|never mind).*")) {
            params.setIntent("question");
            params.setAiResponse(
                    "No problem! What would you like instead? Tell me the style, color, or occasion you prefer!");
            return params;
        }

        // GREETINGS - Simple greetings only
        if (msg.matches(
                "^(hi|hello|hey|good morning|good evening|hii|hlo|namaste)(\\s+(bro|brother|dude|friend|man))?$")) {
            params.setIntent("greeting");
            params.setAiResponse(
                    "Hey there! 👋 I'm your fashion assistant! Are you looking for men's or women's clothing?");
            return params;
        }

        // NATURAL LANGUAGE UNDERSTANDING - Extract intent from sentences
        boolean hasOccasion = msg.contains("party") || msg.contains("wedding") || msg.contains("office")
                || msg.contains("casual") || msg.contains("formal");
        boolean hasCategory = msg.contains("dress") || msg.contains("shirt") || msg.contains("t-shirt")
                || msg.contains("tshirt") || msg.contains("jeans") || msg.contains("saree") || msg.contains("kurta")
                || msg.contains("jacket");
        boolean hasColor = msg.contains("black") || msg.contains("white") || msg.contains("blue") || msg.contains("red")
                || msg.contains("pink") || msg.contains("green") || msg.contains("yellow") || msg.contains("orange");

        // Understand "I have" statements - User is informing about event
        if (msg.matches(
                ".*(i have|i got|i'm going to|im going to|going to|attending|going for)\\s+(a |an |the )?(party|wedding|office|meeting|date|interview|function|event).*")) {
            params.setIntent("question");
            // Extract the occasion
            if (msg.contains("party"))
                params.setOccasion("Party");
            else if (msg.contains("wedding"))
                params.setOccasion("Wedding");
            else if (msg.contains("office") || msg.contains("meeting") || msg.contains("interview"))
                params.setOccasion("Office");
            else
                params.setOccasion("Event");

            String genderPrompt = " Are you looking for men's or women's clothing?";
            params.setAiResponse(String.format(
                    "Awesome! You have a %s coming up! 🎉%s What would you like to wear? I can show you dresses, shirts, kurtas, or anything else!",
                    params.getOccasion() != null ? params.getOccasion().toLowerCase() : "special event", genderPrompt));
            return params;
        }

        // Understand "show me" / "need" / "want" patterns with details
        if (msg.matches(".*(show me|show|find|need|want|looking for|search for|get me).*")
                && (hasCategory || hasColor || hasOccasion)) {
            // User wants to search, will extract details below
            params.setShouldSearch(true);
        }

        // GENERAL QUESTIONS - Only if no specific details mentioned
        if (msg.matches(".*(have|any|cloth|match|suggest|recommend|looking for|need|want|show|help|find).*")
                && !hasOccasion && !hasCategory && !hasColor && !params.getShouldSearch()) {
            params.setIntent("question");
            params.setAiResponse(
                    "Sure! Tell me what you're looking for - men's or women's? Any specific occasion like party, office, or casual?");
            params.setMissingInfo(List.of("gender", "occasion"));
            return params;
        }

        // Single word occasion (user just says "party" or "wedding")
        if ((msg.equals("party") || msg.equals("wedding") || msg.equals("office") || msg.equals("casual")
                || msg.equals("formal"))
                || msg.matches("^(party|wedding|office|casual|formal)(\\s+(bro|brother|broo))?$")) {
            params.setIntent("question");
            String occasion = msg.replaceAll("\\s+(bro|brother|broo)", "").trim();
            params.setOccasion(occasion.substring(0, 1).toUpperCase() + occasion.substring(1));

            params.setAiResponse(String.format(
                    "Perfect! %s outfit! 🎉 Are you looking for men's or women's? What style - dress, shirt, traditional wear?",
                    params.getOccasion()));
            return params;
        }

        // PRODUCT SEARCH - Extract details
        params.setIntent("search");
        if (!params.getShouldSearch()) {
            params.setShouldSearch(true); // Default to search if we reach here
        }

        // SMART GENDER DETECTION
        if (msg.matches(".*(men's|mens|for men|men|man|boy|male|groom|him|his).*"))
            params.setGender("Men");
        else if (msg.matches(".*(women's|womens|for women|women|woman|girl|lady|female|bride|her|ladies).*"))
            params.setGender("Women");
        // Auto-detect gender from category
        else if (msg.contains("saree") || msg.matches(".*(bride|bridal).*"))
            params.setGender("Women");

        // SMART COLOR DETECTION - Handle variations
        if (msg.matches(".*(black|dark).*") && !msg.contains("white"))
            params.setColor("Black");
        else if (msg.matches(".*(white|light|cream).*") && !msg.contains("black"))
            params.setColor("White");
        else if (msg.matches(".*(blue|navy|sky).*"))
            params.setColor("Blue");
        else if (msg.matches(".*(red|maroon|crimson).*"))
            params.setColor("Red");
        else if (msg.matches(".*(pink|rose).*"))
            params.setColor("Pink");
        else if (msg.matches(".*(green|olive).*"))
            params.setColor("Green");
        else if (msg.matches(".*(yellow|golden).*"))
            params.setColor("Yellow");

        // SMART CATEGORY DETECTION - Handle plural and variations
        if (msg.matches(".*(dress|dresses|gown|frock).*"))
            params.setCategory("Dress");
        else if (msg.matches(".*(shirt|shirts).*") && !msg.contains("t-shirt") && !msg.contains("tshirt"))
            params.setCategory("Shirt");
        else if (msg.matches(".*(t-shirt|tshirt|t shirt|tee|tees).*"))
            params.setCategory("T-Shirt");
        else if (msg.matches(".*(jeans|denim|pants).*"))
            params.setCategory("Jeans");
        else if (msg.matches(".*(saree|sarees|sari|saris).*"))
            params.setCategory("Saree");
        else if (msg.matches(".*(kurta|kurtas|kurti|kurtis).*"))
            params.setCategory("Kurta");
        else if (msg.matches(".*(jacket|blazer|coat).*"))
            params.setCategory("Jacket");

        // SMART OCCASION DETECTION - Understand context
        if (msg.matches(".*(party|parties|celebration|birthday|night out).*")) {
            params.setOccasion("Party");
            params.setStyle("Party");
        } else if (msg.matches(".*(wedding|marriage|bride|groom|reception|sangeet).*")) {
            params.setOccasion("Wedding");
            params.setStyle("Traditional");
        } else if (msg.matches(".*(office|work|professional|meeting|interview|business|formal).*")) {
            params.setOccasion("Office");
            params.setStyle("Formal");
        } else if (msg.matches(".*(casual|daily|everyday|comfort|hangout|outing).*")) {
            params.setOccasion("Casual");
            params.setStyle("Casual");
        }

        // INTELLIGENT RESPONSE BUILDING
        List<String> missingInfo = new ArrayList<>();
        if (params.getGender() == null)
            missingInfo.add("gender");
        if (params.getCategory() == null && params.getColor() == null)
            missingInfo.add("type");

        // If we have occasion only (like "i have party" or "wedding")
        if (params.getOccasion() != null && params.getCategory() == null && params.getColor() == null) {
            params.setShouldSearch(false);
            params.setIntent("question");
            params.setMissingInfo(missingInfo);

            String genderPrompt = params.getGender() == null ? " Are you looking for men's or women's clothing?" : "";
            params.setAiResponse(String.format(
                    "Perfect! %s event! 🎉%s What would you like to wear? Maybe a dress, shirt, kurta, or something else?",
                    params.getOccasion(), genderPrompt));
            return params;
        }

        // If we don't have enough info for search
        if (params.getCategory() == null && params.getColor() == null && params.getOccasion() == null) {
            params.setShouldSearch(false);
            params.setIntent("question");
            params.setMissingInfo(missingInfo);
            params.setAiResponse(
                    "I'd love to help! Could you tell me more? For example: 'black shirt for party' or 'casual dress' or 'wedding outfit'");
            return params;
        }

        // Build natural conversational response for successful search
        StringBuilder response = new StringBuilder();

        // Natural opening phrases
        String[] openings = { "Perfect!", "Great choice!", "Awesome!", "Excellent!", "Nice!" };
        response.append(openings[(int) (Math.random() * openings.length)]).append(" ");

        // Build description naturally
        if (params.getGender() != null && params.getCategory() != null) {
            response.append("Let me show you ").append(params.getGender().toLowerCase()).append("'s ");
        } else if (params.getCategory() != null) {
            response.append("Let me find ");
        } else {
            response.append("Searching for ");
        }

        if (params.getColor() != null)
            response.append(params.getColor().toLowerCase()).append(" ");
        if (params.getCategory() != null)
            response.append(params.getCategory().toLowerCase());
        else if (params.getColor() != null)
            response.append("clothes");

        if (params.getOccasion() != null)
            response.append(" perfect for ").append(params.getOccasion().toLowerCase());

        response.append("! 🎉");

        params.setAiResponse(response.toString());
        return params;
    }

    private String buildPrompt(String userMessage) {
        return String.format(
                """
                        Analyze this message and return ONLY valid JSON with NO other text:

                        Message: "%s"

                        Return this exact JSON structure:
                        {
                          "intent": "greeting or question or search",
                          "gender": "Men or Women or null",
                          "occasion": "Party or Wedding or Casual or Office or Formal or Traditional or null",
                          "color": "Black or Blue or White or Red or Pink or Green or Yellow or null",
                          "category": "T-Shirt or Shirt or Dress or Saree or Kurta or Jeans or Jacket or null",
                          "style": "Formal or Casual or Party or Traditional or null",
                          "budget": "number or null",
                          "missing_info": [],
                          "should_search": false,
                          "search_query": "",
                          "ai_response": "Your friendly response"
                        }

                        Rules:
                        - "hi" or "hello" → intent=greeting, should_search=false, ai_response="Hey! I'm your fashion assistant. Are you looking for men's or women's clothing?"
                        - "have cloth for me" → intent=question, should_search=false, ai_response="Sure! Tell me - men's or women's? What occasion?"
                        - "black dress party" → intent=search, gender=Women, color=Black, category=Dress, occasion=Party, should_search=true, ai_response="Great! Here are black party dresses!"

                        Return ONLY the JSON, nothing else:
                        """,
                userMessage);
    }

    private String callGeminiAPI(String prompt) {
        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;
            System.out.println("🔵 API URL: " + url);

            // Build request payload according to Gemini API v1beta specification
            Map<String, Object> payload = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)))));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            System.out.println("🔵 Sending request to Gemini...");
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            System.out.println("🟢 Got response from Gemini - Status: " + response.getStatusCode());

            // Extract text from response
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (!parts.isEmpty()) {
                        String text = (String) parts.get(0).get("text");
                        System.out.println("🟢 Extracted text: " + text);
                        return text;
                    }
                }
            }

            throw new RuntimeException("No valid response from Gemini API");
        } catch (Exception e) {
            System.err.println("🔴 Gemini API Error: " + e.getMessage());
            throw new RuntimeException("Error calling Gemini API: " + e.getMessage(), e);
        }
    }

    private GeminiSearchParams parseGeminiResponse(String response) {
        try {
            String cleanJson = response.trim()
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            return objectMapper.readValue(cleanJson, GeminiSearchParams.class);
        } catch (Exception e) {
            e.printStackTrace();
            return createFallbackResponse();
        }
    }

    private GeminiSearchParams createFallbackResponse() {
        GeminiSearchParams params = new GeminiSearchParams();
        params.setAiResponse(
                "I'm having trouble understanding your request. Could you please specify what type of clothing you're looking for?");
        params.setMissingInfo(List.of("gender", "category"));
        return params;
    }
}
