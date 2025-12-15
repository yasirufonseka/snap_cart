import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string; // For displaying uploaded images
  products?: ProductRecommendation[]; // For displaying product recommendations
}

export interface ChatHistory {
  role: string; // 'user' or 'assistant'
  content: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  discount: number;
  colour: string;
  gender: string;
  occasion: string;
  brand: string;
  size: string;
  productUrl: string;
  matchScore: number;
}

export interface ExtractedUserInfo {
  event?: string;
  gender?: string;
  style?: string;
  budget?: string;
  color?: string;
  clothingType?: string;
  hasImage: boolean;
}

export interface ChatRequest {
  message: string;
  userId?: string;
  conversationId?: string;
  imageBase64?: string;
  chatHistory?: ChatHistory[];
}

export interface ChatResponse {
  aiMessage: string;
  products: ProductRecommendation[];
  followUpQuestions: string[];
  conversationId: string;
  extractedInfo: ExtractedUserInfo;
}

// Legacy Product interface (kept for backward compatibility)
export interface Product {
  id: number;
  name: string;
  gender: string;
  color: string;
  price: number;
  category: string;
  description: string;
  style: string;
  imageUrls: string[];
  sizes: string[];
  occasions: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:8080/api';

  // Complete dummy product data for ALL categories (testing purposes)
  private dummyProducts: ProductRecommendation[] = [
    // === MALE WEDDING LUXURY ===
    {
      id: 'M1',
      name: 'Premium Black Tuxedo',
      description: 'Luxury black tuxedo perfect for weddings',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'],
      price: 25000,
      discount: 10,
      colour: 'Black',
      gender: 'Male',
      occasion: 'Wedding',
      brand: 'Royal Suits',
      size: 'L',
      productUrl: '/product/M1',
      matchScore: 98
    },
    {
      id: 'M2',
      name: 'Navy Blue 3-Piece Suit',
      description: 'Elegant navy blue suit for formal weddings',
      images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
      price: 18000,
      discount: 15,
      colour: 'Navy Blue',
      gender: 'Male',
      occasion: 'Wedding',
      brand: 'Gentleman Style',
      size: 'M',
      productUrl: '/product/M2',
      matchScore: 96
    },
    {
      id: 'M3',
      name: 'Classic Grey Wedding Suit',
      description: 'Timeless grey suit for wedding occasions',
      images: ['https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=400'],
      price: 15000,
      discount: 5,
      colour: 'Grey',
      gender: 'Male',
      occasion: 'Wedding',
      brand: 'Classic Wear',
      size: 'L',
      productUrl: '/product/M3',
      matchScore: 94
    },
    // === MALE CASUAL ===
    {
      id: 'M4',
      name: 'White Casual Shirt',
      description: 'Comfortable casual shirt for everyday wear',
      images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'],
      price: 2500,
      discount: 5,
      colour: 'White',
      gender: 'Male',
      occasion: 'Casual',
      brand: 'Comfort Wear',
      size: 'L',
      productUrl: '/product/M4',
      matchScore: 85
    },
    {
      id: 'M5',
      name: 'Grey Polo Shirt',
      description: 'Classic polo shirt for casual occasions',
      images: ['https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400'],
      price: 3000,
      discount: 10,
      colour: 'Grey',
      gender: 'Male',
      occasion: 'Casual',
      brand: 'Urban Style',
      size: 'M',
      productUrl: '/product/M5',
      matchScore: 82
    },
    // === FEMALE WEDDING LUXURY ===
    {
      id: 'F1',
      name: 'Luxury Wedding Gown',
      description: 'Stunning luxury white gown for weddings',
      images: ['https://images.unsplash.com/photo-1519657337289-077653f724ed?w=400'],
      price: 45000,
      discount: 10,
      colour: 'White',
      gender: 'Female',
      occasion: 'Wedding',
      brand: 'Bridal Elegance',
      size: 'M',
      productUrl: '/product/F1',
      matchScore: 99
    },
    {
      id: 'F2',
      name: 'Ivory Silk Wedding Dress',
      description: 'Premium silk wedding dress',
      images: ['https://images.unsplash.com/photo-1594552072238-52fd9a1311e7?w=400'],
      price: 38000,
      discount: 15,
      colour: 'Ivory',
      gender: 'Female',
      occasion: 'Wedding',
      brand: 'Royal Bridal',
      size: 'S',
      productUrl: '/product/F2',
      matchScore: 97
    },
    // === FEMALE PARTY LUXURY ===
    {
      id: 'F3',
      name: 'Elegant Evening Gown',
      description: 'Stunning luxury evening gown perfect for formal parties',
      images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400'],
      price: 15000,
      discount: 15,
      colour: 'Black',
      gender: 'Female',
      occasion: 'Party',
      brand: 'Luxury Fashion',
      size: 'M',
      productUrl: '/product/F3',
      matchScore: 95
    },
    {
      id: 'F4',
      name: 'Sequin Party Dress',
      description: 'Sparkly sequin dress for glamorous nights',
      images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
      price: 12000,
      discount: 20,
      colour: 'Gold',
      gender: 'Female',
      occasion: 'Party',
      brand: 'Glam Collection',
      size: 'S',
      productUrl: '/product/F4',
      matchScore: 92
    },
    {
      id: 'F5',
      name: 'Red Cocktail Dress',
      description: 'Bold red dress for confident party-goers',
      images: ['https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400'],
      price: 9500,
      discount: 10,
      colour: 'Red',
      gender: 'Female',
      occasion: 'Party',
      brand: 'Night Out',
      size: 'M',
      productUrl: '/product/F5',
      matchScore: 88
    },
    // === FEMALE CASUAL ===
    {
      id: 'F6',
      name: 'Casual Summer Dress',
      description: 'Light and comfortable summer dress',
      images: ['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400'],
      price: 4500,
      discount: 10,
      colour: 'Blue',
      gender: 'Female',
      occasion: 'Casual',
      brand: 'Summer Wear',
      size: 'S',
      productUrl: '/product/F6',
      matchScore: 80
    },
    {
      id: 'F7',
      name: 'White Casual Blouse',
      description: 'Elegant white blouse for casual days',
      images: ['https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400'],
      price: 3500,
      discount: 5,
      colour: 'White',
      gender: 'Female',
      occasion: 'Casual',
      brand: 'Daily Fashion',
      size: 'M',
      productUrl: '/product/F7',
      matchScore: 78
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Sends a chat message with optional image to AI chatbot
   * @param message User's text message
   * @param imageBase64 Optional base64 encoded image
   * @param conversationId Optional conversation ID for context
   * @param chatHistory Optional previous conversation history
   */
  sendMessage(
    message: string,
    imageBase64?: string,
    conversationId?: string,
    chatHistory?: ChatHistory[]
  ): Observable<ChatResponse> {
    const request: ChatRequest = {
      message,
      userId: this.getUserId(),
      conversationId,
      imageBase64,
      chatHistory
    };

    return this.http.post<ChatResponse>(`${this.apiUrl}/ai/chat`, request);
  }

  /**
   * Checks if AI service is available
   */
  checkHealth(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/ai/health`);
  }

  /**
   * Converts image file to base64 string
   */
  convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };

      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }

  /**
   * Intelligent product filtering based on user profile
   * Filters by: gender, occasion, style, budget
   */
  getFilteredProducts(gender?: string, occasion?: string, style?: string, budget?: number): ProductRecommendation[] {
    let filtered = this.dummyProducts;

    // Filter by gender
    if (gender) {
      const genderKey = gender.toLowerCase().includes('male') && !gender.toLowerCase().includes('female') ? 'Male' : 'Female';
      filtered = filtered.filter(p => p.gender === genderKey);
    }

    // Filter by occasion
    if (occasion) {
      const occLower = occasion.toLowerCase();
      if (occLower.includes('wedding')) {
        filtered = filtered.filter(p => p.occasion === 'Wedding');
      } else if (occLower.includes('party')) {
        filtered = filtered.filter(p => p.occasion === 'Party');
      } else if (occLower.includes('casual')) {
        filtered = filtered.filter(p => p.occasion === 'Casual');
      }
    }

    // Filter by budget
    if (budget && budget > 0) {
      filtered = filtered.filter(p => p.price <= budget);
    }

    // Sort by match score
    filtered.sort((a, b) => b.matchScore - a.matchScore);

    return filtered.slice(0, 4); // Return top 4 matches
  }

  /**
   * Gets dummy product recommendations based on user query (fallback)
   * This is a simplified version for backward compatibility
   */
  getDummyRecommendations(query: string, hasImage: boolean): ProductRecommendation[] {
    const lowerQuery = query.toLowerCase();

    // Extract filters from query
    let gender: string | undefined;
    let occasion: string | undefined;
    let budget: number | undefined;

    // Detect gender
    if (lowerQuery.includes('male') && !lowerQuery.includes('female')) gender = 'Male';
    if (lowerQuery.includes('female') || lowerQuery.includes('woman') || lowerQuery.includes('girl')) gender = 'Female';

    // Detect occasion
    if (lowerQuery.includes('wedding')) occasion = 'Wedding';
    else if (lowerQuery.includes('party')) occasion = 'Party';
    else if (lowerQuery.includes('casual')) occasion = 'Casual';

    // Detect budget
    const budgetMatch = lowerQuery.match(/\d{3,}/);
    if (budgetMatch) budget = parseInt(budgetMatch[0]);

    return this.getFilteredProducts(gender, occasion, undefined, budget);
  }

  /**
   * Gets user ID from session/local storage or generates a temporary one
   */
  private getUserId(): string {
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('userId', userId);
    }
    return userId;
  }
}
