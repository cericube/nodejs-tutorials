/**
 * [Prisma 실습 01] 데이터 생성 및 관계형 쓰기(Nested Write)
 * 이 파일은 새로운 유저를 생성하면서 동시에 프로필 정보를 저장하는 예제입니다.
 */

// 전역 싱글톤으로 설정된 prisma 인스턴스를 가져옵니다.
// (내부적으로 PostgreSQL 어댑터와 연결 설정이 완료된 상태)
import { prisma } from '../shared/database';

async function main() {
  console.log('🚀 데이터 생성을 시작합니다...');

  /**
   * [1] prisma.user.create()
   * 'users' 테이블에 데이터를 삽입합니다.
   */
  const created = await prisma.user.create({
    data: {
      /**
       * 1-1. 스칼라 필드(단순 값) 설정
       * email은 @unique 설정이 되어 있으므로 Date.now()를 이용해 충돌을 방지합니다.
       */
      email: `dev${Date.now()}@example.com`,
      displayName: 'Prisma Dev',

      /**
       * 1-2. 중첩 쓰기 (Nested Write)
       * Prisma의 가장 강력한 기능 중 하나입니다.
       * 'profile'은 별개의 테이블이지만, 유저를 생성함과 동시에 프로필도 생성합니다.
       * Prisma 엔진이 내부적으로 'User 생성을 통한 ID 획득 -> Profile 생성 시 FK 주입'을
       * 하나의 트랜잭션으로 자동 처리합니다.
       */
      profile: {
        create: {
          bio: '안녕하세요. Prisma 학습용 프로필입니다.',
        },
      },
    },

    /**
     * [2] 데이터 포함 (Include)
     * 기본적으로 Prisma는 성능을 위해 관계된 데이터를 자동으로 가져오지 않습니다.
     * include 옵션을 사용해야만 생성된 유저와 함께 '연결된 프로필' 정보를
     * 하나의 JSON 객체 결과물로 돌려받을 수 있습니다. (SQL의 JOIN과 유사한 역할)
     */
    include: {
      profile: true,
    },
  });

  /**
   * [3] 결과 확인
   * include 설정 덕분에 created 객체 안에는 .profile 속성이 존재하게 됩니다.
   */
  console.log('✅ 성공적으로 생성되었습니다:');
  console.dir(created, { depth: null }); // 객체 내부 깊은 곳까지 출력
}

/**
 * [4] 실행 및 에러 핸들링
 */
main()
  .catch((e) => {
    // DB 제약조건 위반(Unique 등)이나 연결 에러를 여기서 잡습니다.
    console.error('❌ 에러 발생:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    /**
     * [5] 연결 종료
     * 스크립트 형식의 실행인 경우 프로세스가 종료되기 전에
     * 명시적으로 $disconnect를 호출하여 DB 커넥션 풀을 비워주는 것이 좋습니다.
     */
    await prisma.$disconnect();
    console.log('👋 DB 연결을 종료합니다.');
  });
