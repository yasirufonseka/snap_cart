# Test login endpoint

Write-Output "Testing POST /api/login with invalid credentials..."
try {
  $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/login' -Method POST -ContentType 'application/json' -Body '{"username":"testuser","password":"testpass"}'
  Write-Output "✅ Success Response:"
  Write-Output $response | ConvertTo-Json
} catch {
  Write-Output "Response Status: $($_.Exception.Response.StatusCode)"
  Write-Output "Response Body: $($_.ErrorDetails.Message)"
}

Write-Output "`nTesting GET /api/login (should fail with 405 or helpful error)..."
try {
  $response = Invoke-RestMethod -Uri 'http://localhost:8080/api/login' -Method GET
  Write-Output "Response:"
  Write-Output $response | ConvertTo-Json
} catch {
  Write-Output "Status: $($_.Exception.Response.StatusCode)"
  Write-Output "Body: $($_.ErrorDetails.Message)"
}
