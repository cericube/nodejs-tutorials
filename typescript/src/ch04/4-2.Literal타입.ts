// ===============================================================
// 2. 리터럴 타입(Literal Types): 특정 값만 허용하기
// ===============================================================

function section2_literalExamples() {
  console.log('\n=== 2. 리터럴 타입(Literal Types) 예제 ===');

  // 문자열 리터럴 타입
  // 원문의 Status 타입 예제를 그대로 사용하되,
  // 아래 enum과 이름 충돌을 피하기 위해 StatusLiteral로 명명합니다.
  type StatusLiteral = 'pending' | 'success' | 'error';

  let currentStatus: StatusLiteral = 'pending';
  console.log('초기 StatusLiteral:', currentStatus);

  currentStatus = 'success';
  console.log('변경된 StatusLiteral:', currentStatus);

  // currentStatus = "finished";
  // 오류: Type '"finished"' is not assignable to type 'StatusLiteral'.

  function updateStatus(status: StatusLiteral) {
    console.log(`현재 상태는 ${status}입니다.`);
  }

  updateStatus('error');
  // updateStatus("ready"); // 오류 발생

  // 숫자 및 불리언 리터럴 타입
  type Direction = 1 | -1;

  let move: Direction = 1; // ✅
  console.log('이동 방향:', move);

  move = -1;
  console.log('반대 방향:', move);

  // move = 0;
  // 오류: Type '0' is not assignable to type 'Direction'.

  type AlwaysTrue = true;

  let flag: AlwaysTrue = true; //
  console.log('AlwaysTrue flag:', flag);

  // flag = false;
  // 오류: Type 'false' is not assignable to type 'true'.

  // 리터럴 타입 vs enum 예제
  // enum은 런타임에 실제 JS 객체가 생성되는 문법입니다.
  enum StatusEnum {
    Pending = 'pending',
    Success = 'success',
    Error = 'error',
  }

  let enumStatus: StatusEnum = StatusEnum.Pending;
  console.log('enum StatusEnum 값:', enumStatus);

  enumStatus = StatusEnum.Success;
  console.log('변경된 enum StatusEnum 값:', enumStatus);
}

section2_literalExamples();
