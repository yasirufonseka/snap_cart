import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface AiSuggestions {
  category: string;
  gender: string;
  occasion: string;
  items: string;
  colour: string;
  style: string;
  suggestedName: string;
  suggestedDescription: string;
  confidenceScore: number;
}

interface ProductUploadResponse {
  success: boolean;
  message: string;
  productId?: string; // MongoDB ID is string
  aiSuggestions?: AiSuggestions;
}

@Component({
  selector: 'app-product-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-upload.component.html',
  styleUrl: './product-upload.component.scss'
})
export class ProductUploadComponent {
  private apiUrl = 'http://localhost:8080/api';

  // Form data
  productData = {
    imageBase64: '',
    productName: '',
    description: '',
    price: null as number | null,
    discount: 0,
    brand: '',
    city: '',
    gender: '',
    occasion: '',
    items: '',
    colour: '',
    style: '',
    useAiAnalysis: true
  };

  // UI state
  imagePreview: string | null = null;
  isAnalyzing: boolean = false;
  isCreating: boolean = false;
  showAiSuggestions: boolean = false;
  aiSuggestions: AiSuggestions | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  step: 'upload' | 'review' | 'success' = 'upload';

  constructor(private http: HttpClient) { }

  /**
   * Handle image selection
   */
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select an image file';
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        this.errorMessage = 'Image size should be less than 10MB';
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      // Convert to base64 for API
      this.convertToBase64(file);
    }
  }

  /**
   * Convert image to base64
   */
  private convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove data:image/...;base64, prefix
      this.productData.imageBase64 = base64String.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  /**
   * Step 1: Analyze image with AI
   */
  analyzeImage(): void {
    if (!this.productData.imageBase64) {
      this.errorMessage = 'Please select an image first';
      return;
    }

    this.isAnalyzing = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.http.post<ProductUploadResponse>(`${this.apiUrl}/products/analyze`, this.productData)
      .subscribe({
        next: (response) => {
          this.isAnalyzing = false;

          if (response.success && response.aiSuggestions) {
            this.aiSuggestions = response.aiSuggestions;
            this.showAiSuggestions = true;
            this.step = 'review';

            // Auto-fill form with AI suggestions
            this.applyAiSuggestions();

            this.successMessage = `🔥 AI Analysis Complete! Confidence: ${response.aiSuggestions.confidenceScore}%`;
          } else {
            this.errorMessage = response.message || 'Analysis failed';
          }
        },
        error: (error) => {
          this.isAnalyzing = false;
          this.errorMessage = 'Failed to analyze image: ' + (error.error?.message || error.message);
          console.error('Analysis error:', error);
        }
      });
  }

  /**
   * Apply AI suggestions to form
   */
  applyAiSuggestions(): void {
    if (!this.aiSuggestions) return;

    this.productData.gender = this.aiSuggestions.gender;
    this.productData.occasion = this.aiSuggestions.occasion;
    this.productData.items = this.aiSuggestions.items;
    this.productData.colour = this.aiSuggestions.colour;
    this.productData.style = this.aiSuggestions.style;

    if (!this.productData.productName) {
      this.productData.productName = this.aiSuggestions.suggestedName;
    }

    if (!this.productData.description) {
      this.productData.description = this.aiSuggestions.suggestedDescription;
    }
  }

  /**
   * Step 2: Create product with confirmed data
   */
  createProduct(): void {
    // Validate required fields
    if (!this.productData.productName) {
      this.errorMessage = 'Product name is required';
      return;
    }

    if (!this.productData.price || this.productData.price <= 0) {
      this.errorMessage = 'Valid price is required';
      return;
    }

    if (!this.productData.gender) {
      this.errorMessage = 'Gender is required';
      return;
    }

    if (!this.productData.occasion) {
      this.errorMessage = 'Occasion is required';
      return;
    }

    this.isCreating = true;
    this.errorMessage = '';

    this.http.post<ProductUploadResponse>(`${this.apiUrl}/products/create`, this.productData)
      .subscribe({
        next: (response) => {
          this.isCreating = false;

          if (response.success) {
            this.successMessage = `✅ ${response.message}`;
            this.step = 'success';

            // Reset form after 3 seconds
            setTimeout(() => this.resetForm(), 3000);
          } else {
            this.errorMessage = response.message || 'Failed to create product';
          }
        },
        error: (error) => {
          this.isCreating = false;
          this.errorMessage = 'Failed to create product: ' + (error.error?.message || error.message);
          console.error('Create error:', error);
        }
      });
  }

  /**
   * Quick upload: Analyze and create in one step
   */
  quickUpload(): void {
    if (!this.productData.imageBase64) {
      this.errorMessage = 'Please select an image first';
      return;
    }

    if (!this.productData.price || this.productData.price <= 0) {
      this.errorMessage = 'Price is required for quick upload';
      return;
    }

    this.isCreating = true;
    this.errorMessage = '';

    this.http.post<ProductUploadResponse>(`${this.apiUrl}/products/quick-upload`, this.productData)
      .subscribe({
        next: (response) => {
          this.isCreating = false;

          if (response.success) {
            this.successMessage = `✅ ${response.message}`;
            this.step = 'success';
            setTimeout(() => this.resetForm(), 3000);
          } else {
            this.errorMessage = response.message || 'Failed to upload product';
          }
        },
        error: (error) => {
          this.isCreating = false;
          this.errorMessage = 'Failed to upload product: ' + (error.error?.message || error.message);
          console.error('Quick upload error:', error);
        }
      });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.productData = {
      imageBase64: '',
      productName: '',
      description: '',
      price: null,
      discount: 0,
      brand: '',
      city: '',
      gender: '',
      occasion: '',
      items: '',
      colour: '',
      style: '',
      useAiAnalysis: true
    };
    this.imagePreview = null;
    this.aiSuggestions = null;
    this.showAiSuggestions = false;
    this.successMessage = '';
    this.errorMessage = '';
    this.step = 'upload';
  }

  /**
   * Go back to edit
   */
  backToEdit(): void {
    this.step = 'review';
  }
}
