// app.ts
// types.ts에서 정의한 타입/상수/함수를 import 해서 사용하는 예제입니다.

import { API_URL, calculateFinalPrice } from './1-2-1.types';

//verbatimModuleSyntax: true는:
//“타입만 필요한 import”를 반드시 import type으로 표시하도록 요구합니다
import type { Product } from './1-2-1.types';

const newProduct: Product = {
  id: 1,
  name: '노트북',
  price: 1_200_000,
  tags: ['전자제품', '모바일 오피스'],
};

// ❌ 아래 코드는 타입 오류를 발생시킵니다 (컴파일 시 에러)
// const invalidProduct: Product = {
//   id: "a",        // number 타입이어야 합니다.
//   name: "PC",
//   price: 500_000,
// };

const finalPrice = calculateFinalPrice(newProduct);

console.log('=== [app] ===');
console.log(`새 제품: ${newProduct.name}`);
console.log(`기본 가격: ${newProduct.price.toLocaleString()}원`);
console.log(`최종 가격(부가세 포함): ${finalPrice.toLocaleString()}원`);
console.log(`API URL: ${API_URL}`);
