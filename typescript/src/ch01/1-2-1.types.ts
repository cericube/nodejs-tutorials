// types.ts
// 공통으로 사용할 타입과 상수, 헬퍼 함수를 export 합니다.

export type Product = {
  id: number;
  name: string;
  price: number;
  tags?: string[];
};

export const API_URL = 'https://api.example.com/products';

export const DEFAULT_TAX_RATE = 0.1; // 10% 부가세

export function calculateFinalPrice(product: Product): number {
  return Math.round(product.price * (1 + DEFAULT_TAX_RATE));
}
