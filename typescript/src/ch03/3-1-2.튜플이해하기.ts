// --- 튜플 타입 예제 ---

// 튜플: 첫 번째는 숫자, 두 번째는 문자열
let userInfo: [number, string];

userInfo = [1, '김철수']; // 정상
// userInfo = ["김철수", 1];          // 오류 - 순서가 올바르지 않음
// userInfo = [1, "김철수", 20];      // 오류 - 요소 개수가 초과됨

console.log('userInfo:', userInfo);

// 함수에서 튜플 반환
function getUser(): [string, number] {
  return ['홍길동', 28];
}

const [userName, userAge] = getUser();

console.log('userName:', userName);
console.log('userAge:', userAge);
