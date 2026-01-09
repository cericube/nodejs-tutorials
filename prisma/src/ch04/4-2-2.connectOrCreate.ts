import { prisma, pool } from '../shared/database';

// connectOrCreate: "없으면 생성(Create), 있으면 연결(Connect)"을 한 번의 트랜잭션성 작업으로 처리
// 전제: where 조건에 사용되는 필드(email)는 Prisma 스키마에서 @unique 여야 함.
async function exam1() {
  console.log('\n=== 1. connectOrCreate 기본 (User 찾기 or 생성) ===');

  // 1) 첫 실행
  // - User(email='david@example.com')를 먼저 조회
  // - 없으면 create 블록으로 User 생성
  // - 생성/연결된 User를 author 관계로 연결하면서 Post 생성
  const post1 = await prisma.post.create({
    data: {
      title: 'ConnectOrCreate Test 1',
      content: 'David를 찾거나 생성',
      author: {
        connectOrCreate: {
          // 연결 대상 식별자: 반드시 unique 제약이 있는 필드여야 함
          where: { email: 'david@example.com' },
          // where로 못 찾았을 때만 실행되는 생성 데이터
          create: {
            email: 'david@example.com',
            displayName: 'David',
          },
        },
      },
    },
    // 생성 결과에서 author까지 같이 확인하려고 include
    include: { author: true },
  });

  console.log('첫 실행 (생성됨):', post1.author);

  // 2) 두 번째 실행
  // - 이제 User가 존재하므로 create 블록은 "실행되지 않음"
  // - 즉, displayName에 다른 값을 넣어도 업데이트되지 않고 무시됨 (생성 경로가 아니기 때문)
  const post2 = await prisma.post.create({
    data: {
      title: 'ConnectOrCreate Test 2',
      content: 'David를 다시 찾음 (생성 안함)',
      author: {
        connectOrCreate: {
          where: { email: 'david@example.com' },
          create: {
            email: 'david@example.com',
            displayName: 'David Different Name(생성안됨)', // 존재하면 create 미실행 → 반영되지 않음
          },
        },
      },
    },
    include: { author: true },
  });

  console.log('두번째 실행 (연결만):', post2.author);

  // 두 Post가 동일한 User(authorId)를 참조하는지 확인
  console.log('같은 author인가?', post1.authorId === post2.authorId);
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    await exam1();
  } catch (error) {
    // 예외 로깅: connectOrCreate 충돌/제약 위반 등도 여기로 떨어질 수 있음
    console.error('Error in main function:', error);
  } finally {
    // Prisma Client 연결 해제: Node 프로세스 종료 시 핸들러가 남는 것 방지
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }

    // pg Pool 종료: raw SQL(pg)도 같이 쓰는 경우 커넥션 정리
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

main();
