// =====================================
// never: 절대 반환되지 않는 함수들
// =====================================

// 항상 예외를 던져서 정상 종료되지 않는 함수
function throwError(message: string): never {
  throw new Error(message);
}

// 무한 루프 (주의: 실제 실행 시 프로그램이 멈추지 않으므로 호출은 주석 처리)
function loopForever(): never {
  while (true) {
    // ...
  }
}

function demoNeverFunctions() {
  console.log('=== demoNeverFunctions ===');

  // 아래 줄의 반환 타입은 never이므로, 이 줄 이후 코드는 "도달 불가"로 간주할 수 있음
  try {
    throwError('이 함수는 절대 정상 종료되지 않습니다.');
    console.log('여기는 절대 실행되지 않아야 합니다.'); // 논리적으로 unreachable
  } catch (e) {
    console.log('catch에서 에러를 잡았습니다:', (e as Error).message);
  }

  // loopForever(); // 실제로 실행하면 무한 루프
}

demoNeverFunctions();
