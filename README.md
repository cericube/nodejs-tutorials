# 🧱 Node.js Tutorials 초기 구성 가이드

TypeScript · JavaScript · Prisma 실습을 하나의 루트 프로젝트에서 통합
관리하는 구조입니다.

---

## 1. 프로젝트 초기화 및 패키지 설치

```bash
# 1. 루트 및 서브 폴더 생성
mkdir nodejs-tutorials
cd nodejs-tutorials
mkdir javascript typescript prisma

# 2. 루트 프로젝트 초기화 및 공통 패키지 설치
npm init -y
npm install -D \
  typescript \
  @types/node \
  tsx \
  eslint \
  @eslint/js \
  @eslint/json \
  globals \
  prettier \
  eslint-config-prettier \
  typescript-eslint

# 3. 서브 프로젝트 초기화
cd javascript && npm init -y && cd ..
cd typescript && npm init -y && cd ..
cd prisma && npm init -y && cd ..

# 4. Prisma 프로젝트 전용 설정
cd prisma
npm install prisma --save-dev
npm install @prisma/client
npx prisma init
cd ..

# 5. 루트 TS 에러 방지용 빈 파일 생성
echo "export {};" > dummy.ts
```

---

## 2. 전체 폴더 구조 (Directory Structure)

```text
nodejs-tutorials/
├── node_modules/
├── package.json
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── dummy.ts
│
├── javascript/
│   ├── package.json
│   └── src/
│
├── typescript/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│
└── prisma/
    ├── node_modules/
    ├── package.json
    ├── tsconfig.json
    └── src/
```

---

## 3. 핵심 설정 파일 (Root)

### 1) package.json (루트)

워크스페이스 선언과 통합 스크립트를 관리합니다.

```
{
  "name": "nodejs-tutorials",
  "private": true,
  "type": "module",
  "workspaces": ["javascript", "typescript", "prisma"],
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "ts:check": "tsc --noEmit"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.2",
    "@eslint/json": "^0.14.0",
    "@types/node": "^25.0.3",
    "eslint": "^9.39.2",
    "eslint-config-prettier": "^10.1.8",
    "globals": "^17.0.0",
    "prettier": "^3.7.4",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.52.0"
  }
}

```

### 2) tsconfig.json (루트 공통 베이스)

모든 서브 프로젝트가 공유하는 엄격한 타입 규칙입니다.

```
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "types": ["node"],
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "sourceMap": true,
    "composite": true
  },
  "files": ["dummy.ts"],
  "references": [
    { "path": "./typescript" },
    { "path": "./prisma" }
  ]
}

```

## 4. 서브 프로젝트 설정 (Sub-Projects)

### 1) typescript/tsconfig.json (상속형)

prisma/tsconfig.json도 동일하게 구성합니다.

```
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}

```

### 2) javascript/package.json (순수 JS 프로젝트)

```
{
  "name": "javascript-study",
  "type": "module",
  "private": true
}
```

## 5. 코드 품질 설정 (Lint & Format)

### 1) eslint.config.mjs (공통 ESLint 설정)

```
import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import json from '@eslint/json';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // 공통 무시 패턴
  { ignores: ['**/node_modules/**', '**/dist/**', '**/build/**'] },

  // JavaScript 권장 규칙
  js.configs.recommended,

  // TypeScript 권장 규칙
  ...tseslint.configs.recommended,

  // JS / TS 공통 언어 옵션
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
  },

  // JSON 전용 린팅
  {
    files: ['**/*.json'],
    language: 'json/json',
    plugins: { json },
    rules: { ...json.configs.recommended.rules },
  },

  // Prettier 충돌 규칙 제거
  prettier
);

```

## 6. 서브 프로젝트 파일 실행

보통 Node.js 프로젝트에서는 각 프로젝트의 루트 폴더에서 실행하는 것이 경로 에러를 방지하는 가장 좋은 습관입니다.

```
# 1. typescript 폴더로 이동
cd \nodejs-tutorials\typescript

# 2. 상대 경로를 정확히 입력하여 실행
npx tsx src/ch01/1-1-0.기본타입이해하기.ts
```
