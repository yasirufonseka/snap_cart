export interface Product {
  id: string;
  images: string[];
  description: string;
  collection: string;
  items: string;
  brand: string;
  condition: string;
  serialNo: string;
  age: number;
  colour: string;
  size: string;
  city: string;
  price: number;
  discount: number;
  status: 'available' | 'sold' | 'draft';
  sellerId: string;
}
export interface Stats {
  totalProducts: number;
  soldProducts: number;
  draftProducts: number;
  totalRevenue: number;
}