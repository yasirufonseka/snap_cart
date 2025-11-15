/**
 * Product Edit Model
 * Represents the structure for sellers to edit their product details
 */
export interface ProductEditModel {
  id?: string;
  images: string[];
  description?: string;
  collection?: string;
  items?: string;
  brand?: string;
  condition?: string;
  serialNo?: string;
  colour?: string;
  size?: string;
  age?: number;
  city?: string;
  price: number;
  discount?: number;
  status?: string;
  sellerId: string;
  occasion?: string;
}

/**
 * Product Photo Model
 * Represents individual photo in the product listing
 */
export interface ProductPhotoModel {
  label: string;
  preview: string;
  file?: File;
}

/**
 * Product Response Model
 * Represents the response from backend when fetching/saving products
 */
export interface ProductResponseModel {
  id: string;
  images: string[];
  description?: string;
  collection?: string;
  items?: string;
  brand?: string;
  condition?: string;
  serialNo?: string;
  colour?: string;
  size?: string;
  age?: number;
  city?: string;
  price: number;
  discount?: number;
  status: string;
  sellerId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Category Model
 * Represents product categories
 */
export interface CategoryModel {
  maincat: string;
  category: string[];
}
