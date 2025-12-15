# 🎯 AI CHATBOT - QUICK START GUIDE

## ⚡ TL;DR - Get Started in 5 Minutes

### 1. Add Maven Dependencies

Add to `Backend/SnapCart/pom.xml` (inside `<dependencies>` section):

```xml
<!-- Google Cloud Vertex AI for Gemini Pro Vision -->
<dependency>
    <groupId>com.google.cloud</groupId>
    <artifactId>google-cloud-vertexai</artifactId>
    <version>1.1.0</version>
</dependency>
```

### 2. Install & Configure Google Cloud

```bash
# Download and install: https://cloud.google.com/sdk/docs/install

# After installation, run:
gcloud auth application-default login

# Set your project (replace with your project ID)
gcloud config set project YOUR_PROJECT_ID
```

### 3. Enable Vertex AI API

1. Go to: https://console.cloud.google.com/
2. Select your project
3. Go to "APIs & Services" → "Library"
4. Search "Vertex AI API"
5. Click "Enable"

### 4. Update Configuration

Edit `Backend/SnapCart/src/main/resources/application.properties`:

```properties
# Replace YOUR_PROJECT_ID with your actual Google Cloud project ID
gemini.project.id=YOUR_PROJECT_ID
gemini.location=us-central1
```

### 5. Restart Backend

```bash
cd Backend\SnapCart
.\mvnw spring-boot:run
```

### 6. Test It!

1. Open http://localhost:4200
2. Click the 🤖 chatbot button
3. Try: "I need a black suit for wedding"
4. Or upload a clothing image!

---

## 🧪 EXAMPLE QUERIES TO TEST

### Text Queries
```
✅ "I need a dress for party"
✅ "Show me men's casual wear"
✅ "Wedding outfits for women"
✅ "Black coat for office"
✅ "Luxury traditional wear"
```

### With Image Upload
```
📷 Upload a wedding dress photo → "Find similar dresses"
📷 Upload a suit photo → "I want this style"
📷 Upload any outfit → AI will auto-detect and suggest
```

---

## 💡 HOW USERS INTERACT

### Scenario 1: Shopping for Wedding
```
User: "I'm attending a wedding"
AI: "Great! Are you looking for men's or women's clothing?"
User: "Men's"
AI: "What style do you prefer? Luxury, Simple, or Classic?"
User: "Luxury"
AI: "What's your preferred color?"
User: "Navy blue"
AI: [Shows luxury navy blue wedding wear]
```

### Scenario 2: Image-Based Search
```
User: [Uploads friend's wedding photo]
User: "Find me something like this"
AI: "I can see this is a luxury navy blue coat, perfect for weddings. 
     Here are 6 similar items from our collection!"
[Shows matching products]
```

---

## 📊 YOUR DATABASE REQUIREMENTS

Your products need these fields (you already have them!):

| Field | Example | Required? |
|-------|---------|-----------|
| gender | "male" / "female" | ✅ Yes |
| occasion | "wedding", "party", "casual" | ✅ Yes |
| colour | "black", "blue", "red" | ✅ Yes |
| items | "coat", "dress", "shirt" | ✅ Yes |
| status | "approved" | ✅ Yes |
| images | ["url1.jpg", "url2.jpg"] | ✅ Yes |
| price | 15000.00 | ✅ Yes |

---

## 🔍 AI EXTRACTS THESE FROM USER

The AI automatically understands:

| User Says | AI Understands |
|-----------|----------------|
| "wedding", "marriage" | occasion = "wedding" |
| "male", "men", "groom" | gender = "male" |
| "female", "women", "bride" | gender = "female" |
| "luxury", "premium" | style = "luxury" |
| "black", "navy", "white" | color preference |
| "coat", "dress", "shirt" | clothing type |

---

## 💰 PRICING

### Free Tier (Good for Small Business)
- **First 1,000 image analyses/month**: FREE
- **Text conversations**: FREE (unlimited)

### After Free Tier
- **~$0.0025 per image** analysis
- Example: 100 images/day = 3,000/month
  - 1,000 free + 2,000 paid
  - Cost: 2,000 × $0.0025 = **$5/month**

**Extremely affordable!**

---

## 🚨 COMMON ERRORS & FIXES

### "AI service is not available"
```bash
# Run this in terminal:
gcloud auth application-default login
```

### "Could not analyze image"
- ✅ Check image is < 5MB
- ✅ Verify Vertex AI API is enabled
- ✅ Ensure authentication is configured

### "No products found"
- ✅ Check MongoDB has products with status="approved"
- ✅ Verify products have gender, occasion, colour fields
- ✅ MongoDB should be running on localhost:27017

---

## 📱 MOBILE RESPONSIVE

The chatbot is fully responsive and works on:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile phones

---

## 🎨 CUSTOMIZATION

### Change Chatbot Colors
Edit `src/app/components/ai-chatbot/ai-chatbot.component.scss`:

```scss
// Change primary color from purple to your brand color
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Change Chatbot Name
Edit `src/app/components/ai-chatbot/ai-chatbot.component.ts`:

```typescript
// Line ~70
const welcomeText = `👋 Hi! I'm YOUR_BRAND_NAME, your AI fashion assistant!`;
```

---

## 🎯 WHAT'S INCLUDED

### ✅ Features You Get
- 🤖 AI-powered conversational interface
- 📷 Image upload and analysis
- 🔍 Smart product recommendations
- 💬 Context-aware conversations
- 📊 Product cards with images & prices
- ⚡ Follow-up question suggestions
- 🎨 Beautiful modern UI
- 📱 Mobile responsive design

### ✅ Technologies Used
- **Backend**: Spring Boot + MongoDB
- **AI**: Google Gemini Pro Vision
- **Frontend**: Angular 18 + SCSS
- **APIs**: REST APIs with CORS enabled

---

## 📞 NEED HELP?

### Check Logs
**Backend logs** (where Spring Boot runs):
- Look for Gemini API errors
- Check MongoDB connection

**Frontend logs** (Browser F12 → Console):
- Check for network errors
- Verify API responses

### Test Individual Components
1. **Test MongoDB**: Check if products exist with `status="approved"`
2. **Test Backend API**: Visit http://localhost:8080/api/ai/health
3. **Test Frontend**: Check browser console for errors

---

## ✨ YOU'RE READY!

Your AI Fashion Chatbot is now:
- ✅ Configured
- ✅ Integrated with your database
- ✅ Ready to accept text and images
- ✅ Providing intelligent recommendations

**Just start your servers and test it!** 🚀

---

**Questions?** Check the full guide in `AI_CHATBOT_SETUP_GUIDE.md`
