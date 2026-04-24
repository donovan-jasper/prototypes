export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri?: string;
  platforms: string[];
  createdAt: number;
  isDraft?: boolean;
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  quantity: number;
  imageUri?: string;
  platforms: string[];
  isDraft?: boolean;
}
