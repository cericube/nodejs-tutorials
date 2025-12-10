// =====================================
// never + Exhaustiveness Checking
// =====================================

//Fruit는 문자열 리터럴 유니온 타입입니다
type Fruit = 'Apple' | 'Banana' | 'Orange';

// 아래처럼 새로운 과일을 추가했는데 switch에서 처리 안 하면?
//type Fruit = 'Apple' | 'Banana' | 'Orange' | 'Grape';
// 에러발생: Type '"Tomato"' is not assignable to type 'never'.

function fruitToKorean(fruit: Fruit): string {
  switch (fruit) {
    case 'Apple':
      return '사과';
    case 'Banana':
      return '바나나';
    case 'Orange':
      return '오렌지';
    default: {
      // 이 default 블록은 논리적으로 "절대 도달하지 않아야 하는 곳"입니다.
      // 이 시점에서 fruit는 절대 존재하지 않는 타입이어야 함 (never)
      const _exhaustiveCheck: never = fruit;
      return _exhaustiveCheck;
    }
  }
}

function demoFruit() {
  console.log('=== demoFruit ===');
  console.log(fruitToKorean('Apple'));
  console.log(fruitToKorean('Banana'));
  console.log(fruitToKorean('Orange'));

  //console.log(fruitToKorean('tomato'));

  // 아래처럼 새로운 과일을 추가했는데 switch에서 처리 안 하면?
  //type Fruit = "Apple" | "Banana" | "Orange" | "Grape";
  // -> default 블록에서 컴파일 에러 발생 (Fruit 타입이 never가 아니라서)
}

demoFruit();
