# Simple Safe Merge Script for SnapCart
param(
    [Parameter(Mandatory=$true)]
    [string]$NewFolderPath,
    [switch]$DryRun = $false
)

$WorkspaceRoot = "d:\malinda adition\awishka\Malinda-project-main (1)\Malinda-project-main\Backend\SnapCart"
$JavaRoot = "$WorkspaceRoot\src\main\java\com\example\SnapCart"
$NewJavaRoot = "$NewFolderPath\src\main\java\com\example\SnapCart"

# Files safe to update (non-AI)
$SafeFiles = @{
    "services" = @("AuthService.java", "CartService.java", "CartServiceImpl.java", "OrderService.java", "OrderServiceImpl.java", "PaymentService.java", "StripePaymentService.java", "UserService.java", "ServiceImp.java", "ProductService.java", "ProductImp.java")
    "entity" = @("User.java", "Product.java", "Cart.java", "Order.java")
    "repository" = @("UserRepository.java", "ProductRepository.java", "CartRepository.java", "OrderRepository.java")
    "dto" = @("AddToCartRequest.java", "CheckoutRequest.java", "PasswordChangeRequest.java", "PaymentResponse.java", "ProductDto.java", "ProfileUpdateRequest.java", "SystemPreferencesRequest.java", "UpdateCartItemRequest.java", "UserRegiRequest.java", "ChatReply.java", "ChatRequest.java")
    "controller" = @("CartController.java", "CheckoutController.java", "DashboardController.java")
    "ErrorHandling" = @("GlobalExceptionHandler.java")
    "modal" = @("ProductModal.java", "UserLogin.java")
    "config" = @("Config.java")
}

function Write-Status {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-Status "SnapCart Safe Merge Tool" -Color "Green"
Write-Status "========================" -Color "Green"

if (-not (Test-Path $NewFolderPath)) {
    Write-Status "ERROR: New folder path not found: $NewFolderPath" -Color "Red"
    exit 1
}

if (-not (Test-Path $NewJavaRoot)) {
    Write-Status "ERROR: Java source not found in: $NewJavaRoot" -Color "Red"
    exit 1
}

if ($DryRun) {
    Write-Status "DRY RUN MODE - No files will be modified" -Color "Yellow"
}

Write-Status ""
Write-Status "Source: $NewJavaRoot"
Write-Status "Target: $JavaRoot"
Write-Status ""

$TotalFiles = 0
$UpdatedFiles = 0
$SkippedFiles = 0

foreach ($folder in $SafeFiles.Keys) {
    Write-Status "Updating $folder..." -Color "Blue"
    
    $sourceFolder = Join-Path $NewJavaRoot $folder
    $targetFolder = Join-Path $JavaRoot $folder
    
    if (-not (Test-Path $sourceFolder)) {
        Write-Status "  Source folder not found: $folder" -Color "Gray"
        continue
    }
    
    foreach ($file in $SafeFiles[$folder]) {
        $TotalFiles++
        $sourcePath = Join-Path $sourceFolder $file
        $targetPath = Join-Path $targetFolder $file
        
        if (Test-Path $sourcePath) {
            if ($DryRun) {
                Write-Status "  [DRY RUN] Would update: $file" -Color "Yellow"
                $UpdatedFiles++
            } else {
                try {
                    Copy-Item $sourcePath $targetPath -Force
                    Write-Status "  Updated: $file" -Color "Green"
                    $UpdatedFiles++
                } catch {
                    Write-Status "  Failed: $file - $($_.Exception.Message)" -Color "Red"
                }
            }
        } else {
            Write-Status "  Not found: $file" -Color "Gray"
            $SkippedFiles++
        }
    }
}

Write-Status ""
Write-Status "Summary:" -Color "Cyan"
Write-Status "  Total files checked: $TotalFiles"
Write-Status "  Files updated: $UpdatedFiles" -Color "Green"
Write-Status "  Files skipped: $SkippedFiles" -Color "Gray"

Write-Status ""
Write-Status "PRESERVED AI COMPONENTS:" -Color "Yellow"
Write-Status "  - AiRecommendationService.java"
Write-Status "  - ChatService.java (AI version)"
Write-Status "  - GeminiService.java"
Write-Status "  - GeminiVisionService.java"
Write-Status "  - ImageIdentifyService.java"
Write-Status "  - ProductUploadService.java"
Write-Status "  - All AI DTOs and endpoints"

Write-Status ""
if ($DryRun) {
    Write-Status "To perform actual merge, run without -DryRun flag" -Color "Cyan"
} else {
    Write-Status "Merge completed! Test your application now." -Color "Green"
}