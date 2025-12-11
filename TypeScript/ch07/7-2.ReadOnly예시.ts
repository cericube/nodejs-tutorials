// =========================
// 2-1. Config를 Readonly로 만들기 (기존 예제 확장)
// =========================

interface Config {
  apiUrl: string;
  timeout: number;
  debugMode: boolean;
}

type AppConfig = Readonly<Config>;

const appConfig: AppConfig = {
  apiUrl: 'https://api.myapp.com',
  timeout: 5000,
  debugMode: false,
};

console.log('=== 초기 appConfig ===', appConfig);

// 아래 코드는 컴파일 에러 (주석 해제 시 타입 에러 확인 가능)
// appConfig.timeout = 10000;

// =========================
// 2-2. 설정 객체(AppSettings)를 Readonly로 보호
// =========================

interface AppSettings {
  theme: 'light' | 'dark';
  autoSave: boolean;
}

const settings: Readonly<AppSettings> = {
  theme: 'light',
  autoSave: true,
};

console.log('=== 초기 settings ===', settings);

// settings.theme = "dark"; // ❌ 에러: 읽기 전용 속성

// =========================
// 2-3. 함수 인자로 받는 설정을 Readonly로 선언
// =========================

// 인자로 들어오는 config를 함수 안에서 실수로 수정하지 못하게 막고 싶을 때
function printConfig(config: Readonly<Config>) {
  console.log('=== printConfig ===');
  console.log(`API URL: ${config.apiUrl}`);
  console.log(`Timeout: ${config.timeout}`);
  console.log(`Debug: ${config.debugMode}`);

  // config.timeout = 1234; // ❌ 컴파일 에러
}

printConfig(appConfig);

// =========================
// 2-4. 배열에 Readonly 적용 (ReadonlyArray)
// =========================

const numbers: ReadonlyArray<number> = [1, 2, 3];

// numbers.push(4); // ❌ push, pop 등 변경 메서드 사용 불가
// numbers[0] = 999; // ❌ 인덱스로 변경 불가

console.log('=== ReadonlyArray numbers ===', numbers);
