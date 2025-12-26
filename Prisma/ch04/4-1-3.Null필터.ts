import { prisma, pool } from '../shared/database';

// ========================================
// NULL 필터 (Nullable 필드)
// ========================================

async function exam1() {
  console.log('--- 1-1: 내용이 없는 임시 게시글 찾기 ---');

  const posts = await prisma.post.findMany({
    where: {
      // content 컬럼이 NULL인 게시글만 조회
      // - 보통 "임시 저장", "본문 미작성" 같은 상태를 의미하도록 설계하는 경우가 많음
      content: null,

      // deletedAt 컬럼이 NULL인 데이터만 조회 = 소프트 삭제되지 않은(활성) 데이터
      // - deletedAt에 날짜가 들어가면 "삭제된 상태"로 간주
      deletedAt: null,
    },

    select: {
      // 필요한 필드만 선택(Projection)해서 가져옴
      // - 성능/보안 측면에서 전체 컬럼을 가져오는 것보다 안전하고 효율적
      id: true,
      title: true,
      content: true,
    },
  });

  console.log('--- 1-1: 내용이 없는 임시 게시글 찾기 결과 ---');
  console.log(posts);
}

async function exam2() {
  console.log('--- 1-2: 내용이 있는 완성된 게시글만 ---');

  const posts = await prisma.post.findMany({
    where: {
      // content가 NULL이 아닌 게시글만 조회
      // - Prisma에서 NULL 제외는 { not: null } 패턴을 사용
      content: {
        not: null,
      },

      // 소프트 삭제 제외(활성 데이터만)
      deletedAt: null,
    },

    select: {
      // 게시글 기본 필드
      id: true,
      title: true,
      content: true,

      // 관계(Relation) 필드: author(작성자) 정보를 함께 가져옴
      // - include 대신 select를 사용하면, author에서 필요한 필드만 제한해서 가져올 수 있음
      author: {
        select: {
          // 작성자 표시명만
          displayName: true,

          // 작성자의 profile(1:1 혹은 1:N 중 스키마에 따라)도 중첩 선택
          // - profile도 필요한 필드(bio)만 선택
          profile: {
            select: {
              bio: true,
            },
          },
        },
      },
    },

    // 결과 개수 제한 (Top N)
    take: 10,

    // 정렬: id 내림차순(가장 최신 게시글부터)
    orderBy: {
      id: 'desc',
    },
  });

  console.log('--- 1-2: 내용이 있는 완성된 게시글만 결과 ---');

  // JSON.stringify + pretty print
  // - 중첩 객체(author/profile)가 포함된 결과를 보기 좋게 출력
  console.log(JSON.stringify(posts, null, 2));
}

// ========================================
// 메인 함수
// ========================================

async function main() {
  try {
    // 예제 1 실행(임시 게시글): 필요 시 주석 해제
    // await exam1();

    // 예제 2 실행(완성 게시글)
    await exam2();
  } catch (error) {
    // 예외 발생 시 로그 출력 후 비정상 종료 코드(1)
    console.error(error);
    process.exit(1);
  } finally {
    // Prisma Client 연결 해제 (Node 프로세스가 정상 종료되도록)
    await prisma.$disconnect();

    // node-postgres pool 종료 (DB 커넥션 풀 정리)
    await pool.end();
  }
}

main();
