# 📡 AI CHATBOT API DOCUMENTATION

## Base URL
```
Development: http://localhost:8080/api
Production: https://your-domain.com/api
```

---

## Endpoints

### 1. Chat with AI

Send a message to the AI chatbot with optional image upload.

**Endpoint**: `POST /api/ai/chat`

**Headers**:
```http
Content-Type: application/json
```

**Request Body**:
```json
{
  "message": "I need a black suit for wedding",
  "userId": "user_abc123",
  "conversationId": "conv_xyz789",
  "imageBase64": "optional_base64_encoded_image_data",
  "chatHistory": [
    {
      "role": "user",
      "content": "Previous user message"
    },
    {
      "role": "assistant",
      "content": "Previous AI response"
    }
  ]
}
```

**Request Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `message` | String | Yes | User's text message |
| `userId` | String | No | Unique user identifier for tracking |
| `conversationId` | String | No | Conversation ID for context maintenance |
| `imageBase64` | String | No | Base64 encoded image (without data:image prefix) |
| `chatHistory` | Array | No | Previous conversation for context |

**Response**:
```json
{
  "aiMessage": "Great! I can help you find a black suit for your wedding. What style do you prefer - Luxury, Classic, or Modern?",
  "products": [
    {
      "id": "prod_123",
      "name": "Premium Black Wedding Suit",
      "description": "Elegant black suit perfect for weddings",
      "images": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
      ],
      "price": 45000.00,
      "discount": 10.0,
      "colour": "black",
      "gender": "male",
      "occasion": "wedding",
      "brand": "Royal Suits",
      "size": "M",
      "productUrl": "/product/prod_123",
      "matchScore": 95
    },
    {
      "id": "prod_456",
      "name": "Classic Black Tuxedo",
      "description": "Timeless tuxedo for special occasions",
      "images": ["https://example.com/image3.jpg"],
      "price": 55000.00,
      "discount": 15.0,
      "colour": "black",
      "gender": "male",
      "occasion": "wedding",
      "brand": "Elite Wear",
      "size": "L",
      "productUrl": "/product/prod_456",
      "matchScore": 90
    }
  ],
  "followUpQuestions": [
    "What is your budget range?",
    "Do you need matching accessories?",
    "What size are you looking for?"
  ],
  "conversationId": "conv_xyz789",
  "extractedInfo": {
    "event": "wedding",
    "gender": "male",
    "style": "luxury",
    "budget": null,
    "color": "black",
    "clothingType": "suit",
    "hasImage": false
  }
}
```

**Response Fields**:

| Field | Type | Description |
|-------|------|-------------|
| `aiMessage` | String | AI's text response to user |
| `products` | Array | Recommended products (max 6) |
| `followUpQuestions` | Array | Suggested questions for user |
| `conversationId` | String | ID to maintain conversation context |
| `extractedInfo` | Object | Information extracted from conversation |

**Product Object**:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Product ID |
| `name` | String | Product name |
| `description` | String | Product description |
| `images` | Array | Product image URLs |
| `price` | Number | Original price (LKR) |
| `discount` | Number | Discount percentage (0-100) |
| `colour` | String | Product color |
| `gender` | String | "male" or "female" |
| `occasion` | String | Suitable occasion |
| `brand` | String | Brand name |
| `size` | String | Available size |
| `productUrl` | String | Relative URL to product page |
| `matchScore` | Number | Match confidence (0-100) |

**Status Codes**:
- `200 OK` - Success
- `400 Bad Request` - Invalid request format
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - AI service not configured

---

### 2. Health Check

Check if AI service is running and configured.

**Endpoint**: `GET /api/ai/health`

**Response**:
```json
"AI Service is running"
```

**Status Codes**:
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service not configured

---

## Usage Examples

### Example 1: Text-Only Query

```javascript
// Frontend (Angular)
const request = {
  message: "I need a dress for party",
  userId: "user_123"
};

this.http.post('http://localhost:8080/api/ai/chat', request)
  .subscribe(response => {
    console.log(response.aiMessage);
    console.log(response.products);
  });
```

### Example 2: Image Upload

```javascript
// Frontend (Angular)
async sendImageMessage(file: File, message: string) {
  // Convert image to base64
  const base64 = await this.convertToBase64(file);
  
  const request = {
    message: message,
    userId: "user_123",
    imageBase64: base64
  };
  
  this.http.post('http://localhost:8080/api/ai/chat', request)
    .subscribe(response => {
      console.log('AI analyzed image:', response.extractedInfo);
      console.log('Similar products:', response.products);
    });
}

convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
```

### Example 3: Conversation with Context

```javascript
// Frontend (Angular)
let conversationId = null;
let chatHistory = [];

function sendMessage(message: string) {
  const request = {
    message: message,
    userId: "user_123",
    conversationId: conversationId,
    chatHistory: chatHistory
  };
  
  this.http.post('http://localhost:8080/api/ai/chat', request)
    .subscribe(response => {
      // Update conversation ID
      conversationId = response.conversationId;
      
      // Update chat history
      chatHistory.push(
        { role: 'user', content: message },
        { role: 'assistant', content: response.aiMessage }
      );
      
      console.log(response);
    });
}

// Usage
sendMessage("I need clothes for wedding");
// ... AI responds ...
sendMessage("Men's wear");
// ... AI responds with men's wedding wear ...
sendMessage("Navy blue color");
// ... AI responds with navy blue men's wedding wear ...
```

---

## cURL Examples

### Text Query
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me casual men wear",
    "userId": "user_test"
  }'
```

### Health Check
```bash
curl http://localhost:8080/api/ai/health
```

---

## Error Responses

### Error Format
```json
{
  "aiMessage": "I'm sorry, I encountered an error. Please try again.",
  "products": [],
  "followUpQuestions": [],
  "conversationId": "conv_abc123"
}
```

### Common Errors

**1. AI Service Not Configured**
```json
HTTP 503
{
  "message": "AI service is not available. Please configure Gemini API."
}
```

**2. Invalid Image Format**
```json
HTTP 400
{
  "aiMessage": "Invalid image format. Please upload a valid image file.",
  "products": [],
  "followUpQuestions": [],
  "conversationId": "conv_abc123"
}
```

**3. Database Connection Error**
```json
HTTP 500
{
  "aiMessage": "I'm experiencing technical difficulties. Please try again later.",
  "products": [],
  "followUpQuestions": [],
  "conversationId": "conv_abc123"
}
```

---

## Rate Limits

### Development (No Limits)
- Unlimited requests for testing

### Production (Recommended)
- Text queries: 100 requests/minute per user
- Image uploads: 10 requests/minute per user
- Implement rate limiting at API gateway level

---

## Best Practices

### 1. Image Upload
✅ **DO**:
- Validate file type before upload (client-side)
- Compress images > 1MB
- Show upload progress indicator
- Handle conversion errors gracefully

❌ **DON'T**:
- Upload files > 5MB
- Send multiple images in single request
- Upload videos or non-image files

### 2. Conversation Context
✅ **DO**:
- Store conversationId in component state
- Maintain chat history (last 10 messages)
- Clear history on new conversation

❌ **DON'T**:
- Send entire conversation history (use last 10)
- Reuse conversationId across sessions
- Store sensitive data in chat history

### 3. Error Handling
✅ **DO**:
- Show user-friendly error messages
- Retry on network errors
- Log errors for debugging

❌ **DON'T**:
- Show technical error details to users
- Retry indefinitely
- Ignore errors silently

---

## Integration Guide

### Step 1: Install HTTP Client (Angular)
Already included in your project via `HttpClient`

### Step 2: Create Service
```typescript
// ai.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiService {
  private apiUrl = 'http://localhost:8080/api/ai';

  constructor(private http: HttpClient) {}

  sendMessage(request: ChatRequest): Observable<ChatResponse> {
    return this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request);
  }

  checkHealth(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/health`);
  }
}
```

### Step 3: Use in Component
```typescript
// component.ts
export class ChatComponent {
  constructor(private aiService: AiService) {}

  sendMessage(text: string) {
    const request = {
      message: text,
      userId: this.getUserId()
    };

    this.aiService.sendMessage(request).subscribe(
      response => {
        // Handle success
        this.messages.push(response.aiMessage);
        this.products = response.products;
      },
      error => {
        // Handle error
        console.error('Error:', error);
      }
    );
  }
}
```

---

## Testing

### Unit Tests (Backend)
```java
@Test
public void testAiChatEndpoint() {
    AiChatRequest request = new AiChatRequest();
    request.setMessage("I need a suit");
    
    ResponseEntity<?> response = controller.aiChat(request);
    
    assertEquals(HttpStatus.OK, response.getStatusCode());
    AiChatResponse body = (AiChatResponse) response.getBody();
    assertNotNull(body.getAiMessage());
}
```

### Integration Tests (Postman)
```json
POST http://localhost:8080/api/ai/chat
{
  "message": "Show me wedding dresses",
  "userId": "test_user"
}

Expected: 200 OK
Response should contain:
- aiMessage (non-empty)
- products (array)
- conversationId (non-null)
```

---

## Performance Metrics

### Expected Response Times
- Text query without products: 1-2 seconds
- Text query with products: 2-3 seconds
- Image analysis: 3-5 seconds
- Database query: < 500ms

### Optimization Tips
1. Index MongoDB fields: `gender`, `occasion`, `colour`, `status`
2. Cache frequently requested products
3. Compress images before upload
4. Use CDN for product images
5. Implement response caching for common queries

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-11-17 | Initial release with Gemini Pro Vision |

---

## Support

For API issues:
1. Check logs in Spring Boot console
2. Verify MongoDB connection
3. Test Gemini API authentication
4. Review request/response in browser DevTools

For feature requests or bugs, contact the development team.

---

**API Status**: ✅ Production Ready
**Documentation Updated**: November 17, 2025
