# Thunder Client API Testing Guide

This guide explains how to use Thunder Client to test all the SnapCart API endpoints.

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Thunder Client"
4. Install the extension by Ranga Vadhineni

## Import Collection

1. In VS Code, click on the Thunder Client icon in the left sidebar
2. Click "Collections" 
3. Click the import icon (folder with arrow)
4. Navigate to `.thunderclient.json` in the project root
5. Select and import the file

## Prerequisites

Make sure both services are running:

```bash
# Terminal 1: Start Backend (Spring Boot)
cd Backend/SnapCart
./mvnw spring-boot:run  # Linux/macOS
# or
mvnw.cmd spring-boot:run  # Windows

# Terminal 2: Start MongoDB
mongod

# Terminal 3: Start Frontend (Angular) - Optional for testing APIs
cd snap_cart
npm start
```

## API Test Order & Instructions

### 1. Authentication APIs

#### Sign Up (Create User)
- **Method**: POST
- **URL**: `http://localhost:8080/api/CreateUser`
- **Body**: JSON with user details
- **Expected Response**: User object with ID
- **Note**: Save the returned user ID for future tests

#### Sign In (Login)
- **Method**: POST
- **URL**: `http://localhost:8080/api/login`
- **Body**: Username and password
- **Expected Response**: User ID or success message
- **Note**: Save this ID as your `seller_id` for dashboard tests

### 2. Product Creation APIs

#### Create Product
- **Method**: POST
- **URL**: `http://localhost:8080/api/SaveProduct`
- **Body**: Complete product details with `sellerId` from previous login
- **Expected Response**: Product object with MongoDB ID
- **Note**: Save the returned product ID for update/delete/mark as sold tests

#### Get Product by ID
- **Method**: GET
- **URL**: `http://localhost:8080/api/GetProduct/ById/{product_id}`
- **Expected Response**: Single product object
- **Replace**: `{product_id}` with the ID from Create Product

#### Get Products by Collection
- **Method**: GET
- **URL**: `http://localhost:8080/api/GetProduct/ByCollection/Men`
- **Expected Response**: Array of products in that collection
- **Options**: Men, Women, Kids, Sports

#### Get Products by Items
- **Method**: GET
- **URL**: `http://localhost:8080/api/GetProduct/ByItems/Shoes`
- **Expected Response**: Array of products with that item type
- **Examples**: Shoes, Jeans, T-shirt, etc.

### 3. Dashboard APIs (Seller Management)

#### Get Products by Seller
- **Method**: GET
- **URL**: `http://localhost:8080/api/dashboard/seller/{seller_id}`
- **Expected Response**: Array of ProductDto objects
- **Replace**: `{seller_id}` with your seller ID from login

#### Get Seller Statistics
- **Method**: GET
- **URL**: `http://localhost:8080/api/dashboard/stats/seller/{seller_id}`
- **Expected Response**: Object with stats:
  ```json
  {
    "totalProducts": 5,
    "activeListed": 3,
    "sold": 1,
    "draft": 1,
    "totalValue": 350.50
  }
  ```

#### Update Product
- **Method**: PUT
- **URL**: `http://localhost:8080/api/dashboard/{product_id}`
- **Body**: Updated ProductDto (all fields optional)
- **Expected Response**: Updated ProductDto
- **Replace**: `{product_id}` with product ID to update

#### Mark Product as Sold
- **Method**: PUT
- **URL**: `http://localhost:8080/api/dashboard/{product_id}/sold`
- **Body**: Empty or `{}`
- **Expected Response**: ProductDto with status = "sold"
- **Replace**: `{product_id}` with product ID to mark as sold

#### Delete Product
- **Method**: DELETE
- **URL**: `http://localhost:8080/api/dashboard/{product_id}`
- **Body**: None
- **Expected Response**: `{"message": "Product deleted successfully"}`
- **Replace**: `{product_id}` with product ID to delete

## Testing Workflow

### Step 1: Create a Test Seller
1. Click "Sign Up" request
2. Modify the username/email to something unique
3. Send the request
4. Copy the returned user ID

### Step 2: Create Test Products
1. Click "Create Product" request
2. Set the `sellerId` to the ID from Step 1
3. Modify product details as needed
4. Send multiple requests to create 3-4 test products
5. Save the product IDs returned

### Step 3: Test Dashboard APIs
1. Click "Get Products by Seller"
2. Replace `seller123` with your seller ID
3. Verify you see all created products

4. Click "Get Seller Statistics"
5. Verify the counts match your created products

6. Click "Update Product"
7. Replace the product ID and modify fields
8. Send and verify the response

9. Click "Mark Product as Sold"
10. Replace the product ID
11. Send and verify status changed to "sold"

12. Verify in "Get Seller Statistics" that sold count increased

13. Click "Delete Product"
14. Replace the product ID
15. Send and verify deletion message

### Step 4: Verify in Statistics
Run "Get Seller Statistics" again to see updated counts

## Common Issues & Troubleshooting

### Connection Refused
- **Problem**: `Failed to connect to localhost:8080`
- **Solution**: Make sure backend is running with `./mvnw spring-boot:run`

### MongoDB Error
- **Problem**: `error accessing database`
- **Solution**: Make sure MongoDB is running with `mongod`

### 404 Not Found
- **Problem**: Endpoint returns 404
- **Solution**: Check the URL path spelling and that product/seller IDs exist

### 400 Bad Request
- **Problem**: Invalid request body
- **Solution**: Check JSON formatting and required fields in the request body

### 500 Internal Server Error
- **Problem**: Server error
- **Solution**: Check backend console logs for detailed error message

## Using Variables

In Thunder Client, you can use variables to avoid repetitive typing:

1. Click on the "Variables" tab at the bottom
2. Add variables:
   - `base_url`: http://localhost:8080/api
   - `seller_id`: Your test seller ID
   - `product_id`: Your test product ID

3. Use in requests like: `{{base_url}}/dashboard/seller/{{seller_id}}`

## Tips for Efficient Testing

1. **Create a test seller** and keep their ID handy
2. **Create multiple test products** with different statuses
3. **Test edge cases**: empty seller, invalid IDs, malformed JSON
4. **Check response times** - should be under 500ms
5. **Verify error messages** - are they helpful and accurate?
6. **Test with different data types** - strings, numbers, arrays

## Next Steps

After successful API testing:
1. Update the frontend service endpoints if needed
2. Test the full flow through the Angular UI
3. Monitor backend logs for any issues
4. Load test with multiple concurrent requests
5. Test error scenarios and edge cases

---

**For questions or issues**, check the backend logs and MongoDB collections to verify data persistence.
