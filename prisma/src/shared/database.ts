// Prisma/shared/database.ts
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Prisma } from '../generated/client';

import * as dotenv from 'dotenv';
import * as path from 'path';
// 1. 여기서 딱 한 번 로드 (경로 강제는 되지만 관리가 한 곳에서 됨)
// 한 번 실행되면 해당 실행 흐름(Process) 전체에 적용되므로,
// /가장 먼저 실행되는 파일이나 공통 모듈 상단에 두시면 됩니다.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * [실무 포인트 1] 환경 변수 정의
 * NODE_ENV에 따라 로그 레벨과 동작 방식을 결정합니다.
 */
const isDev = process.env.NODE_ENV === 'development';

// 개발 중에는 코드를 수정하고 저장할 때마다 서버가 전체 재시작되는 대신,
// 변경된 모듈만 새로 읽어오는 HMR(Hot Module Replacement)이 작동합니다.

/**
 * [Type Definition]
 * 개발 환경에서 HMR(Hot Module Replacement) 발생 시
 * Prisma 인스턴스를 유지하기 위해 global 객체에 타입을 선언합니다.
 */
declare global {
  var __prisma_client__: PrismaClient | undefined;
  var __pg_pool__: Pool | undefined;
}

/**
 * [Singleton Factory]
 * Prisma와 Postgres Pool 인스턴스를 생성하는 핵심 함수
 */
function createPrismaInstance() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('❌ DATABASE_URL is not defined in .env file');
  }

  // 1. Postgres 커넥션 풀 설정
  const pool = new Pool({
    connectionString,
    max: isDev ? 5 : 20, // 개발 시엔 적게, 운영 시엔 넉넉하게
    idleTimeoutMillis: 30000,
  });

  // 2. Prisma 전용 Postgres 어댑터 적용 (특정 스키마 지정)
  // Prisma/어댑터가 내부적으로 풀에서 커넥션을 빌리고, 쿼리가 끝나면 내부에서 release 합니다.
  const adapter = new PrismaPg(pool, { schema: 'study' });

  // 3. Prisma 클라이언트 생성
  // 클라이언트 생성 시 log 설정을 객체 형태로 넘겨야 이벤트를 구독할 수 있습니다.
  // level: 'query' : Prisma가 생성하여 DB에 보낸 모든 SQL 문장을 추적하겠다는 뜻입니다.
  // emit: 'event' : 로그를 콘솔에 단순히 찍는 것이 아니라, 코드상에서 '이벤트'로 전달받겠다는 의미입니다.
  const client = new PrismaClient({
    adapter,
    log: isDev ? [{ emit: 'event', level: 'query' }, 'info', 'warn', 'error'] : ['error'],
  });

  // 4. 개발 환경 전용 쿼리 로깅 (성능 모니터링)
  //'query' as any라고 작성하면,
  // TypeScript에게 "이건 어떤 타입이든 될 수 있으니 네가 참견하지 마"라고 명령하는 것입니다.
  // TypeScript는 개발자가 의도적으로 타입을 무시했다고 판단하여 더 이상 검사하지 않습니다.

  if (isDev) {
    client.$on('query', (e: Prisma.QueryEvent) => {
      console.log(`\n [${e.duration}ms] SQL: ${e.query}`);
      console.log(`Params: ${e.params}\n`);
    });
  }

  return { client, pool };
}

/**
 * [Execution] 싱글톤 할당
 * 이미 global에 인스턴스가 있으면 재사용하고, 없으면 새로 생성합니다.
 */
const instances =
  global.__prisma_client__ && global.__pg_pool__
    ? { client: global.__prisma_client__, pool: global.__pg_pool__ }
    : createPrismaInstance();

// 개발 환경일 경우에만 전역 변수에 인스턴스를 캐싱합니다.
if (isDev) {
  global.__prisma_client__ = instances.client;
  global.__pg_pool__ = instances.pool;
}

// 외부에서 사용할 Prisma 객체 수출
export const prisma = instances.client;
export const pool = instances.pool;

/**
 * [Graceful Shutdown] 안전한 종료 처리
 * 프로세스 종료 시 DB 커넥션을 명시적으로 닫아 좀비 세션을 방지합니다.
 */

let isShuttingDown = false;
const handleShutdown = async (signal: string) => {
  if (isShuttingDown) {
    console.error(`RECEIVED ${signal} again: force exit`);
    process.exit(1);
  }
  isShuttingDown = true;

  console.log(`\nRECEIVED ${signal}: DB 연결 종료 중...`);

  let exitCode = 0;
  try {
    await prisma.$disconnect();
  } catch (err) {
    exitCode = 1;
    console.error('>> DB 해제 실패: prisma.$disconnect()', err);
  }

  try {
    await pool.end();
  } catch (err) {
    exitCode = 1;
    console.error('>> DB 해제 실패: pool.end()', err);
  }

  // 여기까지 왔다는 건 정리 작업을 "시도"했고 await도 끝났다는 뜻
  // 이제 즉시 종료
  process.exit(exitCode);
};

//터미널에서 Ctrl + C 입력 시
process.on('SIGINT', () => handleShutdown('SIGINT'));
//kill 명령어나 도커/쿠버네티스 종료 시
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
