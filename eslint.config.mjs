// @eslint/js: ESLint 공식 JavaScript 규칙 세트
import js from '@eslint/js';

// globals: Node.js, Browser 등의 전역 변수 정의 모음
import globals from 'globals';

// typescript-eslint: TypeScript 코드를 검사하기 위한 공식 통합 패키지
import tseslint from 'typescript-eslint';

// @eslint/json: JSON 파일 린팅을 위한 플러그인
import json from '@eslint/json';

// defineConfig: Flat Config를 더 명확하고 안전하게 정의하도록 도와주는 헬퍼
import { defineConfig } from 'eslint/config';

export default defineConfig([
  // -----------------------------
  // 1) JavaScript + TypeScript 공통 규칙
  // -----------------------------
  {
    // 검사할 파일 확장자 지정
    // js/mjs/cjs → JS 파일, ts/mts/cts → TS 파일
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],

    // 사용할 플러그인 등록 (여기선 JS 기본 플러그인만)
    plugins: { js },

    // JavaScript 공식 권장 규칙 적용
    // js/recommended는 ESLint 팀에서 제공하는 기본 베스트 프랙티스
    extends: ['js/recommended'],

    // Node.js 환경에서 제공하는 전역 변수 생략 가능하도록 설정
    // 예: require, module, __dirname 등
    languageOptions: {
      globals: globals.node,
    },
  },

  // -----------------------------
  // 2) TypeScript 권장 규칙 적용
  // -----------------------------
  // TypeScript 코드를 올바르게 분석하고 검사하기 위한 기본 규칙 모음
  // 타입 기반 검사(recommendedTypeChecked)는 포함되지 않은 "가벼운 기본세트"
  tseslint.configs.recommended,

  // -----------------------------
  // 3) JSON 파일 전용 규칙
  // -----------------------------
  {
    // JSON 파일만 대상으로 하는 별도의 규칙 집합
    files: ['**/*.json'],

    // JSON 플러그인 사용
    plugins: { json },

    // JSON 전용 언어 파서 적용
    language: 'json/json',

    // JSON 문법 오류 및 기본 스타일 검사
    extends: ['json/recommended'],
  },

  // -----------------------------
  // 4) 공통 무시 패턴
  // -----------------------------
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**', '**/coverage/**'],
  },
]);
