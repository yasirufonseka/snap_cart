# SnapCart Safe Merge Script
# This script safely merges files from "New folder" while preserving AI functionality

param(
    [Parameter(Mandatory=$true)]
    [string]$NewFolderPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun = $false
)

# Paths
$WorkspaceRoot = "d:\malinda adition\awishka\Malinda-project-main (1)\Malinda-project-main\Backend\SnapCart"
$BackupRoot = "d:\malinda adition\awishka\Malinda-project-main (1)\Malinda-project-main\Backend\AI_BACKUP"
$JavaRoot = "$WorkspaceRoot\src\main\java\com\example\SnapCart"

# AI Components to NEVER touch
$AIServices = @(
    "AiRecommendationService.java",
    "GeminiService.java", 
    "GeminiVisionService.java",
    "ImageIdentifyService.java",
    "ProductUploadService.java"
)

$AIDTOs = @(
    "AiChatRequest.java",
    "AiChatResponse.java", 
    "ProductUploadRequest.java",
    "ProductUploadResponse.java"
)

# Files safe to update
$SafeServices = @(
    "AuthService.java",
    "CartService.java",
    "CartServiceImpl.java", 
    "OrderService.java",
    "OrderServiceImpl.java",
    "PaymentService.java",
    "StripePaymentService.java",
    "UserService.java",
    "ServiceImp.java"
)

$SafeEntities = @(
    "User.java",
    "Product.java", 
    "Cart.java",
    "Order.java"
)

$SafeRepositories = @(
    "UserRepository.java",
    "ProductRepository.java",
    "CartRepository.java", 
    "OrderRepository.java"
)

$SafeDTOs = @(
    "AddToCartRequest.java",
    "CheckoutRequest.java",
    "PasswordChangeRequest.java",
    "PaymentResponse.java",
    "ProductDto.java",
    "ProfileUpdateRequest.java", 
    "SystemPreferencesRequest.java",
    "UpdateCartItemRequest.java",
    "UserRegiRequest.java",
    "ChatReply.java",
    "ChatRequest.java"
)

function Write-Status {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Copy-SafeFile {
    param($SourcePath, $DestPath, $FileName, $Category)
    
    $source = Join-Path $SourcePath $FileName
    $dest = Join-Path $DestPath $FileName
    
    if (Test-Path $source) {
        if ($DryRun) {
            Write-Status "  [DRY RUN] Would copy: $FileName" -Color "Yellow"
        } else {
            try {
                Copy-Item $source $dest -Force
                Write-Status "  ✓ Copied: $FileName" -Color "Green"
            } catch {
                Write-Status "  ✗ Failed to copy $FileName : $($_.Exception.Message)" -Color "Red"
            }
        }
    } else {
        Write-Status "  ? Not found in source: $FileName" -Color "Gray"
    }
}

function Main {
    Write-Status "SnapCart Safe Merge Tool" -Color "Cyan"
    Write-Status "=================================" -Color "Cyan"
    
    if (-not (Test-Path $NewFolderPath)) {
        Write-Status "❌ New folder path not found: $NewFolderPath" -Color "Red"
        return
    }
    
    $NewJavaRoot = "$NewFolderPath\src\main\java\com\example\SnapCart"
    
    if (-not (Test-Path $NewJavaRoot)) {
        Write-Status "❌ Java source not found in: $NewJavaRoot" -Color "Red"
        return
    }
    
    if ($DryRun) {
        Write-Status "DRY RUN MODE - No files will be modified" -Color "Yellow"
    }
    
    Write-Status ""
    Write-Status "📁 Source: $NewJavaRoot"
    Write-Status "📁 Target: $JavaRoot"
    Write-Status "💾 AI Backup: $BackupRoot"
    Write-Status ""
    
    # Verify AI backup exists
    if (-not (Test-Path "$BackupRoot\services")) {
        Write-Status "❌ AI backup not found! Run backup first." -Color "Red"
        return
    }
    
    # Copy Services (safe ones only)
    Write-Status "🔧 Updating Services..." -Color "Blue"
    foreach ($service in $SafeServices) {
        Copy-SafeFile "$NewJavaRoot\services" "$JavaRoot\services" $service "Service"
    }
    
    # Copy Entities
    Write-Status ""
    Write-Status "📦 Updating Entities..." -Color "Blue" 
    foreach ($entity in $SafeEntities) {
        Copy-SafeFile "$NewJavaRoot\entity" "$JavaRoot\entity" $entity "Entity"
    }
    
    # Copy Repositories
    Write-Status ""
    Write-Status "🗃️ Updating Repositories..." -Color "Blue"
    foreach ($repo in $SafeRepositories) {
        Copy-SafeFile "$NewJavaRoot\repository" "$JavaRoot\repository" $repo "Repository"
    }
    
    # Copy DTOs (safe ones only)
    Write-Status ""
    Write-Status "📋 Updating DTOs..." -Color "Blue"
    foreach ($dto in $SafeDTOs) {
        Copy-SafeFile "$NewJavaRoot\dto" "$JavaRoot\dto" $dto "DTO"
    }
    
    # Handle ChatService specially
    Write-Status ""
    Write-Status "⚠️ Special: ChatService.java" -Color "Yellow"
    $chatServiceNew = "$NewJavaRoot\services\ChatService.java"
    if (Test-Path $chatServiceNew) {
        Write-Status "  Found ChatService.java in new folder"
        Write-Status "  ⚠️ KEEPING workspace version (AI-integrated)" -Color "Yellow"
        Write-Status "  💡 Manually review if needed: $chatServiceNew" -Color "Cyan"
    }
    
    # Check Controllers
    Write-Status ""
    Write-Status "🎛️ Controllers..." -Color "Blue"
    $controllerFiles = @("CartController.java", "CheckoutController.java", "DashboardController.java")
    foreach ($controller in $controllerFiles) {
        Copy-SafeFile "$NewJavaRoot\controller" "$JavaRoot\controller" $controller "Controller"
    }
    
    Write-Status ""
    Write-Status "WARNING: Controller.java NOT updated (contains AI endpoints)" -Color "Yellow"
    Write-Status "  Manually merge if needed, preserving AI endpoints" -Color "Cyan"
    
    Write-Status ""
    Write-Status "✅ Merge completed!" -Color "Green"
    Write-Status ""
    Write-Status "🧪 Next Steps:" -Color "Cyan"
    Write-Status "1. Build the project: mvn clean compile"
    Write-Status "2. Test AI functionality"
    Write-Status "3. Test regular CRUD operations"
    Write-Status "4. If issues occur, restore from AI_BACKUP folder"
}

# Run the script
Main