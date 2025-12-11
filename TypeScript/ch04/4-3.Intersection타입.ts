// ===============================================================
// 3. 인터섹션 타입(Intersection Type): 여러 타입을 결합하기
// ===============================================================

interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

// 'PersonProfile'은 HasName과 HasAge를 모두 만족해야 함
type PersonProfile = HasName & HasAge;

function section3_intersectionExamples() {
  console.log('\n=== 3. 인터섹션 타입(Intersection Type) 예제 ===');

  const myProfile: PersonProfile = {
    name: '이아름', // ✅ HasName의 속성
    age: 25, // ✅ HasAge의 속성
  };

  console.log('정상 프로필(PersonProfile):', myProfile);

  // 오류 예시 (컴파일 시 주석 해제하면 에러 확인 가능)
  /*
  const partialProfile: PersonProfile = {
    name: "김철수",
    // ❌ Error: Property 'age' is missing in type '{ name: string; }'
  };
  */

  // 🔷 유니언 타입 vs 인터섹션 타입 비교

  // 유니언 타입: string 또는 number 중 하나
  let value: string | number;

  value = '안녕하세요'; // ✅
  console.log('유니언 값(string):', value);

  value = 123; // ✅
  console.log('유니언 값(number):', value);

  // value = true;
  // ❌ 오류: boolean은 허용되지 않음

  // 인터섹션 타입 예시 (불가능한 경우)
  type Impossible = string & number;
  // const x: Impossible = ???;
  // ❌ 이 타입은 실질적으로 존재할 수 없으므로 실제 값 생성 불가
}

section3_intersectionExamples();
