# 🏗️ AI CHATBOT ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE (Angular)                       │
│                         http://localhost:4200                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │  AI Chatbot Component   │
                    │  🤖 ai-chatbot.component│
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │     AI Service          │
                    │   📡 ai.service.ts      │
                    │   - sendMessage()       │
                    │   - convertImageToBase64│
                    └────────────┬────────────┘
                                 │
                                 │ HTTP POST /api/ai/chat
                                 │ {message, imageBase64, ...}
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Spring Boot)                          │
│                      http://localhost:8080                               │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │   Controller.java       │
                    │  POST /api/ai/chat      │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────────────────┐
                    │   AiRecommendationService           │
                    │   📊 Main Business Logic             │
                    │   - processUserMessage()            │
                    │   - extractUserInformation()        │
                    │   - recommendProducts()             │
                    │   - findSimilarProducts()           │
                    └────────────┬────────────────────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
                ▼                                 ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │ GeminiVisionService   │       │  ProductRepository    │
    │ 🤖 AI Processing       │       │  🗄️ Database Access    │
    │                       │       │                       │
    │ Text Processing:      │       │ - findByStatus()      │
    │ - generateChatResponse│       │ - findByGenderAnd...  │
    │                       │       │ - findByOccasionAnd...│
    │ Image Processing:     │       │                       │
    │ - analyzeClothingImage│       └───────────┬───────────┘
    │                       │                   │
    └───────────┬───────────┘                   │
                │                               │
                │                               ▼
                ▼                   ┌───────────────────────┐
    ┌───────────────────────┐       │      MongoDB          │
    │  Google Gemini Pro    │       │  🗄️ Products Database │
    │  Vision API           │       │                       │
    │  🌐 Cloud AI Service   │       │  Collection:          │
    │                       │       │  - products           │
    │  Vertex AI:           │       │                       │
    │  - us-central1        │       │  Document Fields:     │
    │  - gemini-1.5-flash   │       │  - id, images         │
    │                       │       │  - gender, occasion   │
    │  Capabilities:        │       │  - colour, items      │
    │  ✓ Image analysis     │       │  - price, discount    │
    │  ✓ Text generation    │       │  - status, brand      │
    │  ✓ Conversation       │       │  - description        │
    └───────────────────────┘       └───────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAMS

### 1️⃣ TEXT-BASED QUERY FLOW

```
User Types: "I need a suit for wedding"
                │
                ▼
┌───────────────────────────────────────┐
│  Frontend (Angular)                   │
│  - Captures user input                │
│  - Builds ChatRequest object          │
└───────────────┬───────────────────────┘
                │ POST /api/ai/chat
                ▼
┌───────────────────────────────────────┐
│  Controller (Spring Boot)             │
│  - Receives request                   │
│  - Forwards to service                │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  AiRecommendationService              │
│  - extractUserInformation()           │
│    ✓ Gender: "male"                   │
│    ✓ Event: "wedding"                 │
│    ✓ Clothing: "suit"                 │
│                                       │
│  - generateChatResponse()             │
│    (calls Gemini API)                 │
│    Response: "What color do you       │
│              prefer?"                 │
│                                       │
│  - recommendProducts()                │
│    (if enough info collected)         │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  ProductRepository                    │
│  - findByGenderAndOccasionAndStatus() │
│    gender = "male"                    │
│    occasion = "wedding"               │
│    status = "approved"                │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  MongoDB                              │
│  - Query products collection          │
│  - Returns matching products          │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  Response sent back to user           │
│  {                                    │
│    aiMessage: "Here are 6 suits...",  │
│    products: [                        │
│      {id, name, price, images...},    │
│      {...}, {...}                     │
│    ],                                 │
│    followUpQuestions: [...]           │
│  }                                    │
└───────────────────────────────────────┘
```

---

### 2️⃣ IMAGE UPLOAD FLOW

```
User Uploads Image (wedding suit photo)
                │
                ▼
┌───────────────────────────────────────┐
│  Frontend (Angular)                   │
│  - File validation                    │
│    ✓ Type: image/*                    │
│    ✓ Size: < 5MB                      │
│  - Convert to Base64                  │
│  - Show preview                       │
└───────────────┬───────────────────────┘
                │ POST /api/ai/chat
                │ {imageBase64: "iVBORw0..."}
                ▼
┌───────────────────────────────────────┐
│  Controller (Spring Boot)             │
│  - Receives image data                │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  AiRecommendationService              │
│  - processUserMessage()               │
│  - Detects image present              │
│  - Calls GeminiVisionService          │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  GeminiVisionService                  │
│  - analyzeClothingImage()             │
│  - Decodes Base64 to bytes            │
│  - Sends to Vertex AI                 │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  Google Gemini Pro Vision API         │
│  - Analyzes image                     │
│  - Returns structured data:           │
│    {                                  │
│      clothingType: "coat",            │
│      colors: ["navy", "blue"],        │
│      style: "luxury",                 │
│      gender: "male",                  │
│      occasion: "wedding",             │
│      confidence: 95                   │
│    }                                  │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  AiRecommendationService              │
│  - findSimilarProducts()              │
│  - Uses extracted info to query       │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  ProductRepository                    │
│  - findByItemsAndColourAndStatus()    │
│    items = "coat"                     │
│    colour CONTAINS "navy"             │
│    status = "approved"                │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  MongoDB                              │
│  - Returns similar products           │
└───────────────┬───────────────────────┘
                │
                ▼
┌───────────────────────────────────────┐
│  Response sent to user                │
│  - AI message about analysis          │
│  - 6 similar products                 │
│  - Product cards with images          │
└───────────────────────────────────────┘
```

---

## 🔄 CONVERSATION STATE MANAGEMENT

```
┌─────────────────────────────────────────┐
│  Conversation ID: "conv-abc-123"        │
│  Generated on first message             │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌─────────────┐         ┌─────────────────┐
│ Chat        │         │ Extracted       │
│ History     │         │ User Info       │
│             │         │                 │
│ [          │         │ - gender        │
│   {        │         │ - event         │
│     role: "user",    │ - color         │
│     content: "..."   │ - clothingType  │
│   },       │         │ - style         │
│   {        │         │ - hasImage      │
│     role: "assistant"│                 │
│     content: "..."   │                 │
│   }        │         │                 │
│ ]          │         │                 │
└────────────┘         └─────────────────┘
     │                          │
     │    Both stored in        │
     │    frontend component    │
     │    for context           │
     │                          │
     └──────────┬───────────────┘
                │
                ▼
        Used in next request
        to maintain context
```

---

## 🎯 PRODUCT MATCHING ALGORITHM

```
Input: User Info
├─ gender: "male"
├─ event: "wedding"
├─ color: "navy"
└─ clothingType: "coat"

         │
         ▼

┌────────────────────────────┐
│  Step 1: Filter by Status  │
│  status = "approved"       │
│  (from all products)       │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Step 2: Filter by Gender  │
│  gender = "male"           │
│  (reduces to ~50%)         │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Step 3: Filter by Event   │
│  occasion = "wedding"      │
│  (reduces to ~30%)         │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Step 4: Filter by Color   │
│  colour CONTAINS "navy"    │
│  (reduces to ~20%)         │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Step 5: Filter by Type    │
│  items CONTAINS "coat"     │
│  (reduces to ~10%)         │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Step 6: Calculate Score   │
│  - Exact gender match: +15 │
│  - Exact occasion: +15     │
│  - Exact type: +40         │
│  - Color match: +30        │
│  Total score: 0-100        │
└───────────┬────────────────┘
            │
            ▼
┌────────────────────────────┐
│  Step 7: Sort & Limit      │
│  - Sort by score DESC      │
│  - Take top 6 products     │
└───────────┬────────────────┘
            │
            ▼
      Return Results
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                       PRODUCTION ENVIRONMENT                     │
└─────────────────────────────────────────────────────────────────┘

Frontend (Angular)                    Backend (Spring Boot)
├─ Vercel/Netlify                    ├─ Render/Railway/AWS
│  ├─ Static hosting                 │  ├─ Java 17 runtime
│  ├─ CDN enabled                    │  ├─ Auto-scaling
│  └─ HTTPS enabled                  │  └─ Environment variables
│                                    │
└─→ API calls ──────────────────────→└─┐
                                       │
                                       ▼
                          ┌────────────────────────┐
                          │  Google Cloud Platform │
                          │  ├─ Vertex AI API      │
                          │  ├─ Gemini Pro Vision  │
                          │  └─ us-central1        │
                          └────────────────────────┘
                                       │
                                       ▼
                          ┌────────────────────────┐
                          │  MongoDB Atlas         │
                          │  ├─ Cloud database     │
                          │  ├─ Auto-backups       │
                          │  └─ Global clusters    │
                          └────────────────────────┘
```

---

## 📈 SCALABILITY CONSIDERATIONS

```
Current Setup (Development)
├─ Single server
├─ Local MongoDB
└─ Expected load: 1-10 concurrent users

Small Business (100-500 users/day)
├─ Frontend: Vercel free tier
├─ Backend: Render free tier
├─ MongoDB: Atlas free tier (512MB)
└─ Gemini: Free tier (1000 images/month)

Medium Business (1000-10000 users/day)
├─ Frontend: Vercel Pro ($20/month)
├─ Backend: Render Standard ($25/month)
├─ MongoDB: Atlas M10 ($57/month)
└─ Gemini: ~$50/month (20000 images)

Enterprise (100000+ users/day)
├─ Frontend: CDN + load balancer
├─ Backend: Kubernetes cluster
├─ MongoDB: Sharded cluster
└─ Gemini: Enterprise pricing
```

---

## 🔐 SECURITY LAYERS

```
┌────────────────────────────────────┐
│  Layer 1: Frontend Validation      │
│  ✓ File type check (images only)  │
│  ✓ File size limit (5MB)           │
│  ✓ Input sanitization              │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Layer 2: Network Security         │
│  ✓ HTTPS encryption                │
│  ✓ CORS policy                     │
│  ✓ Rate limiting (future)          │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Layer 3: Backend Validation       │
│  ✓ Request validation              │
│  ✓ Authentication (if enabled)     │
│  ✓ Authorization checks            │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Layer 4: Database Security        │
│  ✓ MongoDB injection protection    │
│  ✓ Parameterized queries           │
│  ✓ Index-based filtering           │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│  Layer 5: API Security             │
│  ✓ Gemini API key secured          │
│  ✓ Service account authentication  │
│  ✓ Quota management                │
└────────────────────────────────────┘
```

---

This architecture is:
- ✅ Scalable
- ✅ Maintainable
- ✅ Secure
- ✅ Cost-effective
- ✅ Production-ready
