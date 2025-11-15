package com.example.SnapCart.controller;


import com.example.SnapCart.dto.ChatReply;
import com.example.SnapCart.dto.ChatRequest;
import com.example.SnapCart.services.ChatService;
import lombok.Data;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
public class ChatController {

  private final ChatService chatService;

  public ChatController(ChatService chatService) {
    this.chatService = chatService;
  }

  @GetMapping
  public Mono<ChatReply> info() {
    return Mono.just(new ChatReply("Use POST /api/chat with JSON body {\"message\": \"your text\"}"));
  }

  @PostMapping(consumes = "application/json", produces = "application/json")
  public Mono<ChatReply> chat(@RequestBody ChatRequest request) {
    return chatService.getChatResponse(request.getMessage())
      .map(ChatReply::new)
      .doOnError(err -> System.err.println("Chat error: " + err.getMessage()));
  }

  @GetMapping("/debug/products")
  public String debugProducts() {
    return chatService.testProductSearch();
  }

  @GetMapping("/debug/search/{item}")
  public Mono<ChatReply> debugSearch(@PathVariable String item) {
    return chatService.getChatResponse("show me " + item)
      .map(ChatReply::new);
  }
}

