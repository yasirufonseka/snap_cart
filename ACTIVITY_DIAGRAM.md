# SnapCart E-Commerce Platform - Activity Diagram

## Business Process Overview
SnapCart activity diagrams illustrate the key business processes and user workflows including customer shopping journey, seller product management, payment processing, and AI chat interactions.

## Main Activity Diagrams

### 1. Customer Shopping Journey

```mermaid
flowchart TD
    Start([🚀 Start]) --> BrowseHome[🏠 Browse Homepage]
    BrowseHome --> ViewProducts{🛍️ View Products?}
    
    ViewProducts -->|Yes| ProductShowcase[📱 Product Showcase]
    ViewProducts -->|No| SearchProducts[🔍 Search Products]
    
    SearchProducts --> ProductResults[📋 Search Results]
    ProductResults --> ProductShowcase
    
    ProductShowcase --> FilterProducts{🎯 Filter Products?}
    FilterProducts -->|Yes| ApplyFilters[⚙️ Apply Price/Category Filters]
    FilterProducts -->|No| ViewProductDetail[👁️ View Product Details]
    
    ApplyFilters --> FilteredResults[📊 Filtered Results]
    FilteredResults --> ViewProductDetail
    
    ViewProductDetail --> AuthCheck{🔐 User Authenticated?}
    AuthCheck -->|No| LoginPrompt[🔑 Login Prompt]
    LoginPrompt --> Login[📝 User Login]
    Login --> AuthSuccess{✅ Login Success?}
    AuthSuccess -->|No| LoginError[❌ Login Error]
    LoginError --> Login
    AuthSuccess -->|Yes| AddToCart
    
    AuthCheck -->|Yes| AddToCart[🛒 Add to Cart]
    AddToCart --> CartUpdated[✅ Cart Updated]
    CartUpdated --> ContinueShopping{🛍️ Continue Shopping?}
    
    ContinueShopping -->|Yes| ProductShowcase
    ContinueShopping -->|No| ViewCart[🛒 View Cart]
    
    ViewCart --> CartEmpty{📋 Cart Empty?}
    CartEmpty -->|Yes| EmptyCartMessage[📭 Empty Cart Message]
    EmptyCartMessage --> ProductShowcase
    
    CartEmpty -->|No| ModifyCart{✏️ Modify Cart?}
    ModifyCart -->|Update Quantity| UpdateQuantity[🔢 Update Item Quantity]
    ModifyCart -->|Remove Item| RemoveItem[🗑️ Remove Item]
    ModifyCart -->|Proceed| Checkout[💳 Proceed to Checkout]
    
    UpdateQuantity --> RecalculateTotal[💰 Recalculate Total]
    RemoveItem --> RecalculateTotal
    RecalculateTotal --> ViewCart
    
    Checkout --> EnterShipping[📦 Enter Shipping Details]
    EnterShipping --> ValidateShipping{✅ Valid Shipping Info?}
    ValidateShipping -->|No| ShippingError[❌ Shipping Error]
    ShippingError --> EnterShipping
    
    ValidateShipping -->|Yes| PaymentMethod[💳 Select Payment Method]
    PaymentMethod --> StripePayment[💰 Stripe Payment Form]
    StripePayment --> ProcessPayment[⚙️ Process Payment]
    
    ProcessPayment --> PaymentResult{💳 Payment Success?}
    PaymentResult -->|No| PaymentError[❌ Payment Failed]
    PaymentError --> PaymentMethod
    
    PaymentResult -->|Yes| CreateOrder[📋 Create Order]
    CreateOrder --> ClearCart[🧹 Clear Cart]
    ClearCart --> OrderConfirmation[✅ Order Confirmation]
    OrderConfirmation --> SendEmail[📧 Send Confirmation Email]
    SendEmail --> End([🏁 End])
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    
    class Start,End startEnd
    class BrowseHome,ProductShowcase,SearchProducts,ProductResults,ApplyFilters,FilteredResults,ViewProductDetail,Login,AddToCart,ViewCart,UpdateQuantity,RemoveItem,Checkout,EnterShipping,PaymentMethod,StripePayment,ProcessPayment,CreateOrder,ClearCart,SendEmail process
    class ViewProducts,FilterProducts,AuthCheck,AuthSuccess,ContinueShopping,CartEmpty,ModifyCart,ValidateShipping,PaymentResult decision
    class LoginError,ShippingError,PaymentError,EmptyCartMessage error
    class CartUpdated,RecalculateTotal,OrderConfirmation success
```

### 2. Seller Product Management Workflow

```mermaid
flowchart TD
    SellerStart([🚀 Seller Start]) --> SellerLogin[🔑 Seller Login]
    SellerLogin --> LoginValidation{✅ Valid Credentials?}
    LoginValidation -->|No| LoginFailed[❌ Login Failed]
    LoginFailed --> SellerLogin
    
    LoginValidation -->|Yes| SellerDashboard[📊 Seller Dashboard]
    SellerDashboard --> DashboardAction{🎯 Choose Action}
    
    DashboardAction -->|Add Product| AddProductForm[📝 Add Product Form]
    DashboardAction -->|Manage Products| ViewProducts[📋 View Product List]
    DashboardAction -->|View Orders| ViewOrders[📦 View Orders]
    DashboardAction -->|Analytics| ViewAnalytics[📈 View Sales Analytics]
    
    %% Add Product Flow
    AddProductForm --> FillProductDetails[✏️ Fill Product Details]
    FillProductDetails --> UploadImages[📸 Upload Product Images]
    UploadImages --> ValidateProduct{✅ Valid Product Data?}
    ValidateProduct -->|No| ProductValidationError[❌ Validation Error]
    ProductValidationError --> FillProductDetails
    
    ValidateProduct -->|Yes| SaveProduct[💾 Save Product to Database]
    SaveProduct --> ProductSaved[✅ Product Saved Successfully]
    ProductSaved --> BackToDashboard[🔄 Back to Dashboard]
    
    %% Manage Products Flow
    ViewProducts --> SelectProduct{🎯 Select Product Action}
    SelectProduct -->|Edit| EditProduct[✏️ Edit Product Details]
    SelectProduct -->|Delete| ConfirmDelete{❓ Confirm Delete?}
    SelectProduct -->|Update Inventory| UpdateInventory[📦 Update Stock Quantity]
    
    EditProduct --> UpdateProduct[💾 Update Product]
    UpdateProduct --> ProductUpdated[✅ Product Updated]
    ProductUpdated --> ViewProducts
    
    ConfirmDelete -->|No| ViewProducts
    ConfirmDelete -->|Yes| DeleteProduct[🗑️ Delete Product]
    DeleteProduct --> ProductDeleted[✅ Product Deleted]
    ProductDeleted --> ViewProducts
    
    UpdateInventory --> SaveInventory[💾 Save Inventory Changes]
    SaveInventory --> InventoryUpdated[✅ Inventory Updated]
    InventoryUpdated --> ViewProducts
    
    %% Order Management Flow
    ViewOrders --> SelectOrder{📦 Select Order}
    SelectOrder --> OrderDetails[📋 View Order Details]
    OrderDetails --> UpdateOrderStatus{📊 Update Status?}
    UpdateOrderStatus -->|Yes| ChangeStatus[🔄 Change Order Status]
    UpdateOrderStatus -->|No| ViewOrders
    
    ChangeStatus --> NotifyCustomer[📧 Notify Customer]
    NotifyCustomer --> StatusUpdated[✅ Status Updated]
    StatusUpdated --> ViewOrders
    
    %% Analytics Flow
    ViewAnalytics --> GenerateReports[📊 Generate Sales Reports]
    GenerateReports --> DisplayMetrics[📈 Display Key Metrics]
    DisplayMetrics --> BackToDashboard
    
    BackToDashboard --> SellerDashboard
    ViewProducts --> SellerDashboard
    ViewOrders --> SellerDashboard
    DisplayMetrics --> SellerDashboard
    
    SellerDashboard -->|Logout| SellerEnd([🏁 Seller End])
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    classDef process fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    
    class SellerStart,SellerEnd startEnd
    class SellerLogin,SellerDashboard,AddProductForm,FillProductDetails,UploadImages,SaveProduct,ViewProducts,EditProduct,UpdateProduct,DeleteProduct,UpdateInventory,SaveInventory,ViewOrders,OrderDetails,ChangeStatus,NotifyCustomer,ViewAnalytics,GenerateReports,DisplayMetrics,BackToDashboard process
    class LoginValidation,DashboardAction,ValidateProduct,SelectProduct,ConfirmDelete,SelectOrder,UpdateOrderStatus decision
    class LoginFailed,ProductValidationError error
    class ProductSaved,ProductUpdated,ProductDeleted,InventoryUpdated,StatusUpdated success
```

### 3. AI Chat Assistant Workflow

```mermaid
flowchart TD
    ChatStart([🤖 Chat Start]) --> OpenChatWidget[💬 Open Chat Widget]
    OpenChatWidget --> ChatInterface[🖥️ Display Chat Interface]
    ChatInterface --> UserInput[✏️ User Types Message]
    
    UserInput --> ValidateInput{✅ Valid Input?}
    ValidateInput -->|No| InputError[❌ Input Error Message]
    InputError --> UserInput
    
    ValidateInput -->|Yes| ShowTyping[⏳ Show Typing Indicator]
    ShowTyping --> SendToAI[🚀 Send to Gemini AI]
    
    SendToAI --> AIProcessing[🧠 AI Processing Query]
    AIProcessing --> AnalyzeIntent[🎯 Analyze User Intent]
    
    AnalyzeIntent --> IntentType{🤔 What Intent?}
    
    IntentType -->|Product Query| SearchProducts[🔍 Search Product Database]
    IntentType -->|General Question| GeneralResponse[💬 Generate General Response]
    IntentType -->|Order Inquiry| OrderLookup[📦 Look Up Order Status]
    IntentType -->|Technical Support| TechnicalHelp[🛠️ Technical Assistance]
    
    SearchProducts --> ProductResults[📋 Format Product Results]
    ProductResults --> ProductRecommendations[🎯 Generate Recommendations]
    ProductRecommendations --> FormatResponse[📝 Format AI Response]
    
    GeneralResponse --> FormatResponse
    OrderLookup --> FormatResponse
    TechnicalHelp --> FormatResponse
    
    FormatResponse --> AIResponse{✅ Response Ready?}
    AIResponse -->|No| AIError[❌ AI Service Error]
    AIError --> ErrorMessage[📢 Display Error Message]
    ErrorMessage --> ChatInterface
    
    AIResponse -->|Yes| HideTyping[✅ Hide Typing Indicator]
    HideTyping --> DisplayResponse[💬 Display AI Response]
    DisplayResponse --> UserSatisfied{😊 User Satisfied?}
    
    UserSatisfied -->|Continue Chat| UserInput
    UserSatisfied -->|Take Action| ActionType{🎯 What Action?}
    UserSatisfied -->|End Chat| ChatEnd([🏁 Chat End])
    
    ActionType -->|View Product| NavigateToProduct[🛍️ Navigate to Product Page]
    ActionType -->|Add to Cart| QuickAddToCart[🛒 Quick Add to Cart]
    ActionType -->|Contact Support| ContactForm[📞 Contact Support Form]
    
    NavigateToProduct --> ChatEnd
    QuickAddToCart --> CartUpdated[✅ Cart Updated]
    CartUpdated --> ChatInterface
    ContactForm --> ChatEnd
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    classDef process fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef ai fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    
    class ChatStart,ChatEnd startEnd
    class OpenChatWidget,ChatInterface,UserInput,ShowTyping,SendToAI,SearchProducts,GeneralResponse,OrderLookup,TechnicalHelp,ProductResults,ProductRecommendations,FormatResponse,HideTyping,DisplayResponse,NavigateToProduct,QuickAddToCart,ContactForm process
    class AIProcessing,AnalyzeIntent ai
    class ValidateInput,IntentType,AIResponse,UserSatisfied,ActionType decision
    class InputError,AIError,ErrorMessage error
    class CartUpdated success
```

### 4. Payment Processing Workflow

```mermaid
flowchart TD
    PaymentStart([💳 Payment Start]) --> InitializeCheckout[🛒 Initialize Checkout]
    InitializeCheckout --> ValidateCart{✅ Cart Valid?}
    ValidateCart -->|No| CartError[❌ Cart Validation Error]
    CartError --> PaymentEnd([🔚 Payment End])
    
    ValidateCart -->|Yes| CollectShipping[📦 Collect Shipping Info]
    CollectShipping --> ValidateShipping{✅ Shipping Valid?}
    ValidateShipping -->|No| ShippingError[❌ Shipping Error]
    ShippingError --> CollectShipping
    
    ValidateShipping -->|Yes| CalculateTotals[💰 Calculate Order Totals]
    CalculateTotals --> CreatePaymentIntent[🎯 Create Stripe Payment Intent]
    
    CreatePaymentIntent --> StripeResponse{✅ Stripe Response?}
    StripeResponse -->|Error| StripeError[❌ Stripe Service Error]
    StripeError --> PaymentEnd
    
    StripeResponse -->|Success| DisplayPaymentForm[💳 Display Payment Form]
    DisplayPaymentForm --> CustomerPayment[👤 Customer Enters Payment]
    CustomerPayment --> ValidatePaymentInfo{✅ Valid Payment Info?}
    
    ValidatePaymentInfo -->|No| PaymentInfoError[❌ Payment Info Error]
    PaymentInfoError --> CustomerPayment
    
    ValidatePaymentInfo -->|Yes| ProcessPayment[⚙️ Process Payment with Stripe]
    ProcessPayment --> PaymentProcessing[⏳ Payment Processing...]
    
    PaymentProcessing --> StripeWebhook[🔔 Stripe Webhook Received]
    StripeWebhook --> WebhookValidation{✅ Valid Webhook?}
    
    WebhookValidation -->|No| WebhookError[❌ Webhook Validation Error]
    WebhookError --> PaymentFailed[❌ Payment Failed]
    
    WebhookValidation -->|Yes| PaymentStatus{💳 Payment Status?}
    
    PaymentStatus -->|Failed| PaymentFailed
    PaymentStatus -->|Succeeded| PaymentSucceeded[✅ Payment Succeeded]
    PaymentStatus -->|Requires Action| RequiresAction[⚠️ Payment Requires Action]
    
    RequiresAction --> AdditionalAuth[🔐 Additional Authentication]
    AdditionalAuth --> AuthResult{✅ Auth Result?}
    AuthResult -->|Failed| PaymentFailed
    AuthResult -->|Success| PaymentSucceeded
    
    PaymentSucceeded --> CreateOrder[📋 Create Order Record]
    CreateOrder --> UpdateInventory[📦 Update Product Inventory]
    UpdateInventory --> ClearCart[🧹 Clear Customer Cart]
    ClearCart --> SendConfirmation[📧 Send Order Confirmation]
    SendConfirmation --> PaymentComplete[✅ Payment Complete]
    PaymentComplete --> PaymentEnd
    
    PaymentFailed --> NotifyFailure[📢 Notify Payment Failure]
    NotifyFailure --> OfferRetry{🔄 Offer Retry?}
    OfferRetry -->|Yes| DisplayPaymentForm
    OfferRetry -->|No| PaymentEnd
    
    %% Styling
    classDef startEnd fill:#e8f5e8,stroke:#388e3c,stroke-width:3px
    classDef process fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef decision fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef error fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef success fill:#e8f5e8,stroke:#4caf50,stroke-width:2px
    classDef payment fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    classDef webhook fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    
    class PaymentStart,PaymentEnd startEnd
    class InitializeCheckout,CollectShipping,CalculateTotals,DisplayPaymentForm,CustomerPayment,ProcessPayment,CreateOrder,UpdateInventory,ClearCart,SendConfirmation,AdditionalAuth,NotifyFailure process
    class CreatePaymentIntent,PaymentProcessing payment
    class StripeWebhook,WebhookValidation webhook
    class ValidateCart,ValidateShipping,StripeResponse,ValidatePaymentInfo,PaymentStatus,AuthResult,OfferRetry decision
    class CartError,ShippingError,StripeError,PaymentInfoError,WebhookError,PaymentFailed error
    class PaymentSucceeded,PaymentComplete success
```

## Activity Diagram Specifications

### Key Process Flows

#### 1. Customer Shopping Journey
- **Duration**: 5-30 minutes average
- **Entry Points**: Homepage, search, direct product links
- **Key Decision Points**: Authentication, cart modifications, payment method
- **Success Metrics**: Completed orders, cart conversion rate
- **Error Handling**: Login failures, payment errors, validation issues

#### 2. Seller Product Management
- **Duration**: 2-15 minutes per task
- **Entry Points**: Seller dashboard login
- **Key Decision Points**: Product actions, inventory updates, order status changes  
- **Success Metrics**: Products added, orders processed, inventory accuracy
- **Error Handling**: Validation errors, image upload failures, database errors

#### 3. AI Chat Assistant
- **Duration**: 30 seconds - 5 minutes per conversation
- **Entry Points**: Chat widget activation
- **Key Decision Points**: Intent recognition, response type, user satisfaction
- **Success Metrics**: Query resolution rate, user engagement time
- **Error Handling**: AI service failures, input validation, timeout handling

#### 4. Payment Processing
- **Duration**: 1-3 minutes typical
- **Entry Points**: Checkout initiation
- **Key Decision Points**: Payment validation, Stripe responses, webhook verification
- **Success Metrics**: Payment success rate, order completion time
- **Error Handling**: Payment failures, webhook validation, retry mechanisms

### Integration Points

#### Frontend-Backend Communication
```
User Action → Component → Service → HTTP Request → Backend Controller → Service → Repository → Database
```

#### External Service Integration
```
Backend Service → External API → Webhook/Response → Database Update → Frontend Notification
```

#### Real-time Updates
```
Database Change → Service Event → WebSocket/Polling → Frontend Update → User Interface Refresh
```

### Performance Considerations

#### Response Time Targets
- **Product Loading**: < 2 seconds
- **Cart Operations**: < 1 second  
- **Payment Processing**: < 5 seconds
- **AI Chat Response**: < 3 seconds

#### Scalability Factors
- **Concurrent Users**: 100+ simultaneous sessions
- **Product Catalog**: 10,000+ products
- **Order Volume**: 1,000+ orders per day
- **Chat Sessions**: 50+ concurrent conversations

### Error Recovery Patterns

#### Graceful Degradation
- **Payment Failures**: Multiple retry attempts with different methods
- **AI Service Outage**: Fallback to predefined responses
- **Database Connectivity**: Cached data presentation
- **Image Loading**: Placeholder images with retry mechanisms

#### User Experience Continuity
- **Session Management**: Persistent cart across browser sessions
- **Form Data**: Auto-save of checkout information
- **Search State**: Maintained filter preferences
- **Navigation**: Breadcrumb trail preservation

This activity diagram documentation provides comprehensive workflows for all major business processes in the SnapCart e-commerce platform, ensuring clear understanding of user journeys, system interactions, and error handling procedures.