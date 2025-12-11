// 1. 유니언 타입(Union Type): 하나 이상의 타입을 허용하는 방식
// ===============================================================

function section1_unionExamples() {
  console.log('=== 1. 유니언 타입(Union Type) 예제 ===');

  // 유니언 타입 정의와 사용
  let priceOrText: number | string;

  priceOrText = 10000; // number
  console.log('number 할당:', priceOrText);

  priceOrText = '무료'; // string
  console.log('string 할당:', priceOrText);

  // priceOrText = true;
  // 오류: 'boolean' 타입은 허용되지 않습니다.

  // typeof를 활용한 타입 좁히기 (Type Narrowing)
  function printID(id: number | string) {
    if (typeof id === 'string') {
      // 이 블록 안에서는 id가 string 타입
      console.log(`ID는 문자열입니다: ${id.toUpperCase()}`);
    } else {
      // 이 블록 안에서는 id가 number 타입
      console.log(`ID는 숫자입니다: ${id + 10}`);
    }
  }

  printID(12345); // ID는 숫자입니다: 12355
  printID('abc-xyz'); // ID는 문자열입니다: ABC-XYZ
}

section1_unionExamples();
