// =============================
// 1. any vs unknown 기본 비교
// =============================

// any: 뭐든지 허용 (타입 검사 OFF)
function logUppercaseAny(value: any) {
  // TypeScript는 아무 말도 안 함
  console.log('logUppercaseAny:', value.toUpperCase());
}

function demoAny() {
  console.log('=== demoAny ===');
  logUppercaseAny('hello'); // 정상 실행
  // 아래는 런타임 에러 (TypeError: value.toUpperCase is not a function)
  // 하지만 컴파일 단계에서는 아무 경고도 없음
  //logUppercaseAny(123 as any);
}

// unknown: "정체를 모르는 값"이지만, 사용하려면 검사를 강제
function logUppercaseUnknown(value: unknown) {
  // 아래 줄은 컴파일 에러
  // console.log(value.toUpperCase());
  // -> Object is of type 'unknown'.

  if (typeof value === 'string') {
    // 타입 가드 이후에는 string으로 좁혀짐
    console.log('logUppercaseUnknown:', value.toUpperCase());
  } else {
    console.log('logUppercaseUnknown: 문자열이 아닙니다:', value);
  }
}

function demoUnknown() {
  console.log('=== demoUnknown ===');
  logUppercaseUnknown('hello'); // OK
  logUppercaseUnknown(123); // 타입 가드에 걸려 안전하게 처리
}

demoAny();
demoUnknown();
