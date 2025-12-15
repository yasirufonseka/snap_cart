# Frontend Safe Merge Script for SnapCart
param(
    [Parameter(Mandatory=$true)]
    [string]$NewFolderPath,
    [switch]$DryRun = $false
)

$WorkspaceRoot = "d:\malinda adition\awishka\Malinda-project-main (1)\Malinda-project-main"
$SourceRoot = "$NewFolderPath"

# AI Components to NEVER touch (preserve existing)
$AIComponents = @(
    "components\ai-chatbot",
    "components\image-identify", 
    "components\product-upload"
)

$AIServices = @(
    "services\ai.service.ts",
    "services\ai.service.spec.ts",
    "services\image.service.ts"
)

# Components safe to update
$SafeComponents = @(
    "components\ad-card",
    "components\carousal", 
    "components\cart",
    "components\checkout",
    "components\home",
    "components\nav-bar",
    "components\product",
    "components\seller",
    "components\sign",
    "admin-dashboard",
    "dashboard"
)

# Services safe to update (non-AI)
$SafeServices = @(
    "services\cart.service.ts",
    "services\checkout.service.ts", 
    "services\cookie.handle.ts",
    "services\product-edit.service.ts"
)

# Root files safe to update
$SafeRootFiles = @(
    "src\index.html",
    "src\main.ts", 
    "src\styles.scss",
    "src\app\app.component.html",
    "src\app\app.component.scss",
    "src\app\app.component.spec.ts", 
    "src\app\app.component.ts",
    "src\app\app.config.ts",
    "src\app\app.routes.ts"
)

function Write-Status {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Copy-SafeItem {
    param($SourcePath, $DestPath, $RelativePath, $ItemType)
    
    $source = Join-Path $SourcePath $RelativePath
    $dest = Join-Path $DestPath $RelativePath
    
    if (Test-Path $source) {
        if ($DryRun) {
            Write-Status "  [DRY RUN] Would update: $RelativePath" -Color "Yellow"
            return $true
        } else {
            try {
                $destDir = Split-Path $dest -Parent
                if (!(Test-Path $destDir)) {
                    New-Item -ItemType Directory -Path $destDir -Force | Out-Null
                }
                
                if (Test-Path $source -PathType Container) {
                    Copy-Item $source $destDir -Recurse -Force
                } else {
                    Copy-Item $source $dest -Force  
                }
                Write-Status "  Updated: $RelativePath" -Color "Green"
                return $true
            } catch {
                Write-Status "  Failed: $RelativePath - $($_.Exception.Message)" -Color "Red"
                return $false
            }
        }
    } else {
        Write-Status "  Not found in source: $RelativePath" -Color "Gray"
        return $false
    }
}

function Main {
    Write-Status "SnapCart Frontend Safe Merge Tool" -Color "Green"  
    Write-Status "===================================" -Color "Green"
    
    if (-not (Test-Path $NewFolderPath)) {
        Write-Status "ERROR: New folder path not found: $NewFolderPath" -Color "Red"
        exit 1
    }
    
    if ($DryRun) {
        Write-Status "DRY RUN MODE - No files will be modified" -Color "Yellow"
    }
    
    Write-Status ""
    Write-Status "Source: $SourceRoot"
    Write-Status "Target: $WorkspaceRoot"
    Write-Status ""
    
    $TotalFiles = 0
    $UpdatedFiles = 0
    $SkippedFiles = 0
    
    # Update root files
    Write-Status "Updating root files..." -Color "Blue"
    foreach ($file in $SafeRootFiles) {
        $TotalFiles++
        if (Copy-SafeItem $SourceRoot $WorkspaceRoot $file "File") {
            $UpdatedFiles++
        } else {
            $SkippedFiles++
        }
    }
    
    # Update safe components
    Write-Status ""
    Write-Status "Updating components..." -Color "Blue"
    foreach ($component in $SafeComponents) {
        $TotalFiles++
        $sourcePath = "src\app\$component"
        if (Copy-SafeItem $SourceRoot $WorkspaceRoot $sourcePath "Component") {
            $UpdatedFiles++
        } else {
            $SkippedFiles++
        }
    }
    
    # Handle special case: aibot vs ai-chatbot
    Write-Status ""
    Write-Status "Checking aibot component..." -Color "Yellow"
    $aibotSource = "$SourceRoot\src\app\components\aibot"
    if (Test-Path $aibotSource) {
        Write-Status "  Found 'aibot' in new folder" -Color "Yellow"
        Write-Status "  PRESERVING existing 'ai-chatbot' (AI functionality)" -Color "Yellow"
        Write-Status "  Note: Manual review may be needed if aibot has improvements" -Color "Cyan"
    }
    
    # Update safe services
    Write-Status ""
    Write-Status "Updating services..." -Color "Blue"
    foreach ($service in $SafeServices) {
        $TotalFiles++
        $servicePath = "src\app\$service"
        if (Copy-SafeItem $SourceRoot $WorkspaceRoot $servicePath "Service") {
            $UpdatedFiles++
        } else {
            $SkippedFiles++
        }
    }
    
    # Handle chat.service.ts specially
    Write-Status ""
    Write-Status "Checking chat.service.ts..." -Color "Yellow"
    $chatServiceSource = "$SourceRoot\src\app\services\chat.service.ts"
    $chatServiceDest = "$WorkspaceRoot\src\app\services\chat.service.ts"
    
    if (Test-Path $chatServiceSource) {
        Write-Status "  Found chat.service.ts in new folder"
        if (Test-Path $chatServiceDest) {
            Write-Status "  PRESERVING existing chat.service.ts (may be AI-integrated)" -Color "Yellow"
            Write-Status "  Note: Manual review recommended" -Color "Cyan"
        } else {
            if (-not $DryRun) {
                Copy-Item $chatServiceSource $chatServiceDest -Force
                Write-Status "  Added: chat.service.ts (new file)" -Color "Green"
            } else {
                Write-Status "  [DRY RUN] Would add: chat.service.ts" -Color "Yellow"
            }
            $UpdatedFiles++
        }
        $TotalFiles++
    }
    
    # Update public folder and assets
    Write-Status ""
    Write-Status "Updating assets..." -Color "Blue"
    $publicSource = "$SourceRoot\public"
    $publicDest = "$WorkspaceRoot\public" 
    if (Test-Path $publicSource) {
        $TotalFiles++
        if (Copy-SafeItem $SourceRoot $WorkspaceRoot "public" "Folder") {
            $UpdatedFiles++
        } else {
            $SkippedFiles++
        }
    }
    
    $assetsSource = "$SourceRoot\src\assets"
    $assetsDest = "$WorkspaceRoot\src\assets"
    if (Test-Path $assetsSource) {
        $TotalFiles++
        if (Copy-SafeItem $SourceRoot $WorkspaceRoot "src\assets" "Folder") {
            $UpdatedFiles++
        } else {
            $SkippedFiles++
        }
    }
    
    Write-Status ""
    Write-Status "Summary:" -Color "Cyan"
    Write-Status "  Total items checked: $TotalFiles"
    Write-Status "  Items updated: $UpdatedFiles" -Color "Green"
    Write-Status "  Items skipped: $SkippedFiles" -Color "Gray"
    
    Write-Status ""
    Write-Status "PRESERVED AI COMPONENTS:" -Color "Yellow"
    Write-Status "  - ai-chatbot component (full AI chat UI)"
    Write-Status "  - image-identify component (AI image analysis UI)"
    Write-Status "  - product-upload component (AI product upload UI)"  
    Write-Status "  - ai.service.ts (AI service integration)"
    Write-Status "  - image.service.ts (Image processing service)"
    Write-Status "  - chat.service.ts (if AI-integrated)"
    
    Write-Status ""
    if ($DryRun) {
        Write-Status "To perform actual merge, run without -DryRun flag" -Color "Cyan"
    } else {
        Write-Status "Frontend merge completed! Test your Angular application now." -Color "Green"
        Write-Status ""
        Write-Status "Next steps:" -Color "Cyan"
        Write-Status "1. Run 'ng serve' to start frontend"
        Write-Status "2. Test AI chatbot functionality"  
        Write-Status "3. Test AI product upload"
        Write-Status "4. Test all updated UI components"
    }
}

Main