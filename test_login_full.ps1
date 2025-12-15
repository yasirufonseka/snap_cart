# Create test user and then login

Write-Output "1️⃣ Creating test user..."
try {
  $createResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/CreateUser' -Method POST -ContentType 'application/json' -Body '{"username":"testuser123","password":"TestPass123","email":"test123@example.com","contact":"1234567890","name":"Test User","address":"123 Test Street"}'
  Write-Output "✅ User created:"
  $createResp | ConvertTo-Json -Depth 10
  $userId = $createResp.id
} catch {
  Write-Output "❌ Failed to create user"
  Write-Output "Status: $($_.Exception.Response.StatusCode)"
  Write-Output "Body: $($_.ErrorDetails.Message)"
  exit 1
}

Write-Output "`n2️⃣ Testing POST /api/login with correct credentials..."
try {
  $loginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/login' -Method POST -ContentType 'application/json' -Body '{"username":"testuser123","password":"TestPass123"}'
  Write-Output "✅ Login successful!"
  Write-Output "Response:"
  $loginResp | ConvertTo-Json -Depth 10
} catch {
  Write-Output "❌ Login failed"
  Write-Output "Status: $($_.Exception.Response.StatusCode)"
  Write-Output "Body: $($_.ErrorDetails.Message)"
}

Write-Output "`n3️⃣ Testing POST /api/login with wrong password..."
try {
  $loginResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/login' -Method POST -ContentType 'application/json' -Body '{"username":"testuser123","password":"WrongPassword"}'
  Write-Output "Response:"
  $loginResp | ConvertTo-Json -Depth 10
} catch {
  Write-Output "✅ Correctly rejected (as expected)"
  Write-Output "Status: $($_.Exception.Response.StatusCode)"
  Write-Output "Body: $($_.ErrorDetails.Message)"
}

Write-Output "`n4️⃣ Testing GET /api/login (should show helpful error)..."
try {
  $getResp = Invoke-RestMethod -Uri 'http://localhost:8080/api/login' -Method GET
  Write-Output "Response:"
  $getResp | ConvertTo-Json -Depth 10
} catch {
  Write-Output "✅ GET correctly blocked"
  Write-Output "Status: $($_.Exception.Response.StatusCode)"
  Write-Output "Body: $($_.ErrorDetails.Message)"
}
