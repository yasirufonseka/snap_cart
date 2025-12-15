import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService, ImageIdentifyRequest } from '../../services/image.service';

interface Message {
  text: string;
  isUser: boolean;
  imageUrl?: string;
}

@Component({
  selector: 'app-image-identify',
  imports: [CommonModule, FormsModule],
  templateUrl: './image-identify.component.html',
  styleUrl: './image-identify.component.scss'
})
export class ImageIdentifyComponent {
  isOpen = false;
  messages: Message[] = [];
  imageUrl = '';
  selectedFile: File | null = null;
  isLoading = false;
  previewUrl: string | null = null;

  constructor(private imageService: ImageService) { }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.messages.push({
        text: '👋 Hi! I can help you identify fashion items and suggest outfits. Upload an image or paste an image URL!',
        isUser: false
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePreview() {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  async sendImage() {
    if (!this.imageUrl && !this.selectedFile) {
      return;
    }

    this.isLoading = true;

    try {
      let request: ImageIdentifyRequest = {};

      if (this.selectedFile) {
        // Convert file to base64
        const base64 = await this.fileToBase64(this.selectedFile);
        request.imageData = base64;

        this.messages.push({
          text: 'Uploaded image',
          isUser: true,
          imageUrl: this.previewUrl || undefined
        });
      } else if (this.imageUrl) {
        request.imageUrl = this.imageUrl;

        this.messages.push({
          text: this.imageUrl,
          isUser: true,
          imageUrl: this.imageUrl
        });
      }

      this.imageService.identifyImage(request).subscribe({
        next: (response) => {
          this.isLoading = false;

          if (response.success) {
            let responseText = `✨ ${response.suggestion}`;

            if (response.detectedType || response.detectedColor || response.detectedStyle) {
              responseText = `📸 I detected: ${response.detectedType || ''} ${response.detectedColor || ''} ${response.detectedStyle || ''}\n\n${responseText}`;
            }

            this.messages.push({
              text: responseText,
              isUser: false
            });
          } else {
            this.messages.push({
              text: `❌ ${response.error || 'Sorry, I could not identify the image. Please try another one.'}`,
              isUser: false
            });
          }

          this.clearInputs();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error identifying image:', error);
          this.messages.push({
            text: '❌ Sorry, there was an error processing your image. Please try again.',
            isUser: false
          });
          this.clearInputs();
        }
      });
    } catch (error) {
      this.isLoading = false;
      console.error('Error processing image:', error);
      this.messages.push({
        text: '❌ Sorry, there was an error processing your image. Please try again.',
        isUser: false
      });
      this.clearInputs();
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private clearInputs() {
    this.imageUrl = '';
    this.selectedFile = null;
    this.previewUrl = null;
  }

  clearChat() {
    this.messages = [{
      text: '👋 Hi! I can help you identify fashion items and suggest outfits. Upload an image or paste an image URL!',
      isUser: false
    }];
    this.clearInputs();
  }
}
