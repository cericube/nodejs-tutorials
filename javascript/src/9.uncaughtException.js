// node 로 실행하면 테스트 할 수 있음
process.on('uncaughtException', (error) => {
  console.error('[Node.js 전역 uncaughtException 감지]');
  console.error('오류 메시지:', error.message);
  console.error('스택:', error.stack);

  // 프로덕션에서는 반드시 치명적 오류로 간주합니다.
  // 로깅 후 안전하게 서버를 재시작하는 전략을 취합니다.
  // 예: cleanupResources(); gracefulShutdown();
  // process.exit(1); // 안전하게 종료
});

// 존재하지 않는 함수를 호출하여 uncaughtException 발생
nonExistentFunction();
