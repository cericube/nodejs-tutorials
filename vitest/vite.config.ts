import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 1. Globals 설정
    globals: true,

    // 2. 환경 설정 (Node.js 서버 로직에 최적화)
    environment: 'node',

    // 3. 파일 포함 경로
    include: ['tests/**/*.test.ts'],

    // 4. 타임아웃
    testTimeout: 10_000,

    // 5. 리포터 설정 : 필요시 사용
    // Vitest 4에서는 'basic' 리포터가 제거되고 'default'가 이를 대체합니다.
    // 'html' 리포터 사용 시 패키지 설치가 필요할 수 있습니다 (npm i -D @vitest/ui)
    // reporters: ['default', 'html'],
  },
});
