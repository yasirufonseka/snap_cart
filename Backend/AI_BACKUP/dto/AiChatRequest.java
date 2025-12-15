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
public class AiChatRequest {
    private String message;
    private String userId;
    private String conversationId;
    private String imageBase64; // For image upload (optional)
    private List<ChatHistory> chatHistory; // Previous conversation context

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatHistory {
        private String role; // "user" or "assistant"
        private String content;
    }
}
