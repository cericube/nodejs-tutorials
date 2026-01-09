// --- 배열 타입 지정 예제 ---

// 문자열만 담을 수 있는 배열
const names: string[] = ['김민수', '이서현', '박지호'];

// 숫자만 담을 수 있는 배열
const ages: number[] = [25, 30, 22];

// 제네릭 문법으로 선언한 숫자 배열
const scores: Array<number> = [90, 85, 95];

console.log('names:', names);
console.log('ages:', ages);
console.log('scores:', scores);

// 컴파일 오류 예시 (주석 해제하면 에러)
// ages.push("서른"); // 'string' 형식의 인수는 'number' 형식의 매개 변수에 할당될 수 없습니다.
