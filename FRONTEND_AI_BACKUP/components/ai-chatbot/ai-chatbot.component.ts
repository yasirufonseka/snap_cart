import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AiService, ChatMessage, ChatHistory, ProductRecommendation, ChatResponse } from '../../services/ai.service';

@Component({
  selector: 'app-ai-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-chatbot.component.html',
  styleUrl: './ai-chatbot.component.scss'
})
export class AiChatbotComponent implements OnInit {
  messages: ChatMessage[] = [];
  userInput: string = '';
  isLoading: boolean = false;
  isChatOpen: boolean = false;
  conversationId?: string;
  chatHistory: ChatHistory[] = [];
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  followUpQuestions: string[] = [];

  // User profile for intelligent conversation
  userProfile = {
    occasion: '',
    gender: '',
    style: '',
    budget: '',
    hasImage: false
  };

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLDivElement>;

  constructor(
    private aiService: AiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.addWelcomeMessage();
  }

  private addWelcomeMessage(): void {
    const welcomeText = `👋 Hi! I'm GeminiStore, your AI fashion assistant!

I can help you in TWO ways:

🌐 **Style Advice Mode:**
Ask me: "What should I wear to a party?"
I'll give you 5 outfit ideas with styling tips!

🏪 **Product Search Mode:**
Say: "Show me products" or upload a photo
I'll find similar items from our store!

Try: "What should I wear to a wedding?" or "Show me casual shirts"`;

    this.addMessage(welcomeText, false);
  }

  toggleChat(): void {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  /**
   * Handles file selection for image upload
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      this.selectedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Triggers file input click
   */
  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  /**
   * Removes selected image
   */
  removeImage(): void {
    this.selectedImage = null;
    this.imagePreview = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  /**
   * Sends message with optional image
   */
  async sendMessage(): Promise<void> {
    if ((!this.userInput.trim() && !this.selectedImage) || this.isLoading) return;

    const userMessage = this.userInput.trim() || '(Image uploaded)';
    const imageUrl = this.imagePreview || undefined;

    // Add user message to chat
    this.addMessage(userMessage, true, imageUrl);

    this.userInput = '';
    this.isLoading = true;

    try {
      // Convert image to base64 if present
      let imageBase64: string | undefined;
      if (this.selectedImage) {
        imageBase64 = await this.aiService.convertImageToBase64(this.selectedImage);
      }

      // Remove image preview after sending
      this.removeImage();

      // Send request to backend
      this.aiService.sendMessage(
        userMessage,
        imageBase64,
        this.conversationId,
        this.chatHistory
      ).subscribe({
        next: (response: ChatResponse) => {
          // Update conversation ID
          this.conversationId = response.conversationId;

          // Update user profile from conversation
          this.updateUserProfile(userMessage);

          // DUAL SYSTEM LOGIC: Internet AI vs Database Products
          let productsToShow = response.products;
          let messageToShow = response.aiMessage;
          const hasImage = !!imageBase64;

          if (!productsToShow || productsToShow.length === 0) {

            // SYSTEM 1: Check if user wants Internet AI suggestions (general advice)
            const useInternetAI = this.shouldUseInternetAI(userMessage, hasImage);

            if (useInternetAI) {
              // Use backend's AI response for internet-based suggestions
              // Backend should provide 5 outfit ideas with internet images
              messageToShow = response.aiMessage ||
                `Based on ${this.userProfile.occasion || 'your event'} and ${this.userProfile.style || 'your style'}, here are 5 outfit recommendations:\n\n` +
                `The AI will search internet fashion trends and provide detailed suggestions with reference images.`;

              // Note: Backend needs to implement internet search
              // For now, show helpful message
              this.followUpQuestions = [
                'Show me products from your store',
                'Upload a photo for similar items',
                'What do you have in stock?'
              ];
            }
            // SYSTEM 2: Check if user wants YOUR store products
            else if (this.shouldShowProducts(userMessage, hasImage)) {
              // Use intelligent filtering based on collected user profile
              const budget = this.userProfile.budget ? parseInt(this.userProfile.budget) : undefined;
              productsToShow = this.aiService.getFilteredProducts(
                this.userProfile.gender,
                this.userProfile.occasion,
                this.userProfile.style,
                budget
              );

              // If no products match filters, fallback to dummy recommendations
              if (productsToShow.length === 0) {
                productsToShow = this.aiService.getDummyRecommendations(userMessage, hasImage);
              }

              // Update message to indicate products are shown
              if (productsToShow.length > 0) {
                if (hasImage) {
                  messageToShow = `Great! I found ${productsToShow.length} similar items from our store that match your style:`;
                } else {
                  const genderText = this.userProfile.gender === 'male' ? 'men\'s' : 'women\'s';
                  const occasionText = this.userProfile.occasion || 'fashion';
                  messageToShow = `Perfect! Here are ${productsToShow.length} ${genderText} ${occasionText} products from our collection:`;
                }
              }
            }
          }

          // Add AI response with products
          this.addMessage(messageToShow, false, undefined, productsToShow);

          // Update chat history
          this.chatHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: messageToShow }
          );

          // Update follow-up questions (only if no products shown to avoid repetition)
          if (!productsToShow || productsToShow.length === 0) {
            this.followUpQuestions = response.followUpQuestions || [];
          } else {
            this.followUpQuestions = []; // Clear quick questions when showing products
          }

          this.isLoading = false;
          this.scrollToBottom();
        },
        error: (error: any) => {
          console.error('AI Error:', error);

          // Use dummy data as fallback
          const hasImage = !!imageBase64;
          const products = this.aiService.getDummyRecommendations(userMessage, hasImage);

          let aiResponse = '';
          if (hasImage) {
            aiResponse = `Great! I can see this is a ${products[0]?.description || 'lovely outfit'}. Here are similar items from our collection that match this style!`;
          } else {
            aiResponse = `Based on your preferences, here are some ${products[0]?.occasion.toLowerCase()} options I think you'll love!`;
          }

          this.addMessage(aiResponse, false, undefined, products);
          this.followUpQuestions = hasImage ?
            ['Do you need matching accessories?', 'Would you like different colors?', 'What\'s your size?'] :
            ['Show me more options', 'What sizes are available?', 'Any special offers?'];

          this.isLoading = false;
          this.scrollToBottom();
        }
      });

    } catch (error) {
      console.error('Image conversion error:', error);
      this.addMessage('Failed to process image. Please try again.', false);
      this.isLoading = false;
    }
  }

  /**
   * Sends a follow-up question
   */
  sendFollowUpQuestion(question: string): void {
    this.userInput = question;
    this.sendMessage();
  }

  /**
   * Adds a message to the chat
   */
  private addMessage(
    text: string,
    isUser: boolean,
    imageUrl?: string,
    products?: ProductRecommendation[]
  ): void {
    this.messages.push({
      text,
      isUser,
      timestamp: new Date(),
      imageUrl,
      products
    });
  }

  /**
   * Scrolls chat to bottom
   */
  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop =
          this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 100);
  }

  /**
   * Handles Enter key press
   */
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  /**
   * Calculates discounted price
   */
  getDiscountedPrice(price: number, discount: number): number {
    return price - (price * discount / 100);
  }

  /**
   * SYSTEM 1: Should use Internet AI for general suggestions?
   * Returns true when user asks for advice/ideas (not products)
   */
  private shouldUseInternetAI(query: string, hasImage: boolean): boolean {
    if (hasImage) return false; // Images always use database system

    const lowerQuery = query.toLowerCase();

    // General advice/suggestion keywords
    const adviceKeywords = [
      'what should i wear',
      'suggest outfit',
      'outfit ideas',
      'style advice',
      'help me choose',
      'what to wear',
      'recommend style',
      'fashion advice',
      'what looks good',
      'trending',
      'popular style'
    ];

    return adviceKeywords.some(keyword => lowerQuery.includes(keyword));
  }

  /**
   * SYSTEM 2: Should show YOUR database products?
   * Returns true when user wants to see actual products from your store
   */
  private shouldShowProducts(query: string, hasImage: boolean): boolean {
    const lowerQuery = query.toLowerCase();

    // If image uploaded, only show products if user says "similar", "suggest", or "show"
    if (hasImage) {
      return lowerQuery.includes('similar') ||
        lowerQuery.includes('suggest') ||
        lowerQuery.includes('show') ||
        lowerQuery.includes('find') ||
        lowerQuery.includes('like this');
    }

    // For text queries, ONLY show products if user explicitly says "show me"
    const explicitShowCommands = [
      'show me',
      'show all',
      'display',
      'give me products',
      'your products',
      'system product',
      'show products',
      'yes brother show',
      'yes show',
      'from your store',
      'your shop'
    ];

    return explicitShowCommands.some(cmd => lowerQuery.includes(cmd));
  }

  /**
   * Updates user profile from conversation
   */
  private updateUserProfile(query: string): void {
    const lowerQuery = query.toLowerCase();

    // Extract occasion
    if (lowerQuery.includes('wedding')) this.userProfile.occasion = 'wedding';
    else if (lowerQuery.includes('party')) this.userProfile.occasion = 'party';
    else if (lowerQuery.includes('casual')) this.userProfile.occasion = 'casual';
    else if (lowerQuery.includes('office') || lowerQuery.includes('formal')) this.userProfile.occasion = 'formal';

    // Extract gender
    if ((lowerQuery.includes('male') && !lowerQuery.includes('female')) || lowerQuery.includes('man') || lowerQuery.includes('boy')) {
      this.userProfile.gender = 'male';
    } else if (lowerQuery.includes('female') || lowerQuery.includes('woman') || lowerQuery.includes('girl')) {
      this.userProfile.gender = 'female';
    }

    // Extract style
    if (lowerQuery.includes('luxury')) this.userProfile.style = 'luxury';
    else if (lowerQuery.includes('simple')) this.userProfile.style = 'simple';
    else if (lowerQuery.includes('classic')) this.userProfile.style = 'classic';
    else if (lowerQuery.includes('trendy')) this.userProfile.style = 'trendy';

    // Extract budget
    const budgetMatch = lowerQuery.match(/\d{3,}/);
    if (budgetMatch) this.userProfile.budget = budgetMatch[0];
  }

  /**
   * Checks if we have enough information to show products
   */
  private hasEnoughInfo(): boolean {
    return !!(this.userProfile.gender && this.userProfile.occasion);
  }

  /**
   * Navigate to product detail page
   */
  viewProduct(productId: string): void {
    console.log('Navigating to product:', productId);
    this.router.navigate(['/product-detail', productId]);
    this.toggleChat(); // Close chatbot
  }
}
