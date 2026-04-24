export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri?: string;
  platforms: string[];
  isDraft: boolean;
  createdAt: number;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri?: string;
  platforms: string[];
  isDraft: boolean;
}
