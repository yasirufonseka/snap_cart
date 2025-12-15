# Safe Merge Instructions

## ⚠️ CRITICAL: Do NOT touch these AI files
These files contain AI functionality that is working correctly. Do NOT replace or modify:

### AI Services (PRESERVE AS-IS):
- `src/main/java/com/example/SnapCart/services/AiRecommendationService.java`
- `src/main/java/com/example/SnapCart/services/GeminiService.java`
- `src/main/java/com/example/SnapCart/services/GeminiVisionService.java`
- `src/main/java/com/example/SnapCart/services/ImageIdentifyService.java`
- `src/main/java/com/example/SnapCart/services/ProductUploadService.java`

### AI DTOs (PRESERVE AS-IS):
- `src/main/java/com/example/SnapCart/dto/AiChatRequest.java`
- `src/main/java/com/example/SnapCart/dto/AiChatResponse.java`
- `src/main/java/com/example/SnapCart/dto/ProductUploadRequest.java`
- `src/main/java/com/example/SnapCart/dto/ProductUploadResponse.java`

### AI Controllers (PRESERVE AS-IS):
- The AI endpoints in `Controller.java` (lines with `/api/ai/` and `/api/products/analyze`)

## ⚠️ SPECIAL HANDLING: ChatService.java
The workspace ChatService.java is AI-integrated. If the "New folder" has a different ChatService.java:
- Keep the workspace version (it's AI-integrated)
- Only merge specific non-AI methods if needed

## ✅ Safe to Update (from New folder):
These files can be safely replaced/updated from the "New folder":

### Core Services:
- `AuthService.java` (but check for any AI integrations first)
- `CartService.java` & `CartServiceImpl.java`
- `OrderService.java` & `OrderServiceImpl.java`
- `PaymentService.java`
- `StripePaymentService.java`
- `UserService.java`
- `ServiceImp.java`

### Entities:
- `entity/User.java`
- `entity/Product.java`
- `entity/Cart.java`
- `entity/Order.java`

### Repositories:
- `repository/UserRepository.java`
- `repository/ProductRepository.java`
- `repository/CartRepository.java`
- `repository/OrderRepository.java`

### DTOs (non-AI):
- All DTOs except the AI ones listed above

### Controllers:
- Update carefully, preserving AI endpoints

## 🔄 Merge Process:

1. **Backup Current AI Components**:
   ```
   Copy these to backup folder:
   - services/AiRecommendationService.java
   - services/GeminiService.java
   - services/GeminiVisionService.java
   - services/ImageIdentifyService.java
   - services/ProductUploadService.java
   - services/ChatService.java
   - dto/AiChat*.java
   - dto/ProductUpload*.java
   ```

2. **Update Non-AI Files**:
   - Copy from "New folder" only the files listed in "Safe to Update"
   - Do NOT copy AI-related files

3. **Check Dependencies**:
   - Ensure new files don't break AI service imports
   - Verify Controller.java still has AI endpoints

4. **Test After Merge**:
   - Run the application
   - Test AI chat functionality
   - Test product upload with AI analysis
   - Test regular CRUD operations

## 🚨 If Something Breaks:
Restore from backup and try merging individual files one by one.

---
Created: $(Get-Date)
Status: Ready for merge