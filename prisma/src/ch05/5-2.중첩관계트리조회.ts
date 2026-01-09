import { prisma, pool } from '../shared/database';

/**
 * ========================================
 * 1. include를 활용한 전체 트리 조회
 * ========================================
 */

async function exam1() {
  console.log('\n=== 1. User 전체 트리 조회 (include 활용) ===');

  // include: 관계 필드(연관 테이블)를 "통째로" 포함해서 가져옴
  // - User -> posts -> comments -> author 까지 한 번에 트리로 조회
  // - 학습/디버깅에는 편하지만, 실무 API 응답에는 과도한 데이터가 포함될 수 있음
  const users = await prisma.user.findMany({
    include: {
      posts: {
        include: {
          comments: {
            include: {
              author: true, // 댓글 작성자(User) 전체 컬럼 포함
            },
          },
        },
      },
    },
  });

  // console.dir depth:null
  // - 중첩 객체를 "끝까지" 펼쳐서 출력(기본값은 일정 깊이까지만 출력됨)
  console.dir(users, { depth: null });
  return users;
}

/**
 * ========================================
 * 2. select를 활용한 정밀한 트리 제어
 * ========================================
 */
async function exam2() {
  console.log('\n=== 2. User 정밀 조회 (select 활용) ===');

  // select: 필요한 필드만 고르는 방식(응답 구조/크기 제어에 유리)
  // - User에서 id, displayName만
  // - posts는 published=true만, 최신 3개(take:3)만
  // - 댓글 수는 _count로 집계
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      posts: {
        where: { published: true }, // 게시된 글만 필터링
        take: 3, // 게시글 최대 3개만 가져옴(페이지네이션의 기초)
        select: {
          title: true,
          createdAt: true,
          _count: {
            // _count: 관계 개수만 빠르게 확인(전체 댓글 내용을 다 가져올 필요가 없을 때 유용)
            select: { comments: true },
          },
          comments: {
            // 댓글 내용 + 댓글 작성자 displayName만 최소로 조회
            select: {
              content: true,
              author: {
                select: {
                  displayName: true,
                },
              },
            },
          },
        },
      },
    },
  });

  console.dir(users, { depth: null });
  return users;
}

/**
 * ========================================
 * 3. include + select 조합
 * ========================================
 */
async function exam3() {
  console.log('\n=== 3. User 트리 조회 (include + select 조합) ===');

  // 상위(User)는 select로 필요한 필드만 제한하고,
  // 하위(posts/comments)는 include를 섞어 관계 포함 + 일부는 select로 필드 최소화하는 패턴
  // - 실무에서는 "응답 DTO를 통제"하기 위해 select 중심으로 가는 것을 권장
  const users = await prisma.user.findMany({
    select: {
      id: true,
      displayName: true,
      posts: {
        // posts는 전체 필드를 포함(include). 필요하다면 여기에도 select로 제한 가능
        include: {
          comments: {
            // comments는 select로 필요한 필드만 최소화
            select: {
              content: true,
              author: {
                select: {
                  displayName: true, // 작성자도 displayName만
                },
              },
            },
          },
        },
      },
    },
  });

  console.dir(users, { depth: null });
  return users;
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    // 학습 시나리오별로 하나씩 실행해 결과 구조를 비교해 보세요.
    // await exam1();
    // await exam2();
    await exam3();
  } catch (error) {
    console.error(error);
  } finally {
    try {
      await prisma.$disconnect(); // Prisma 연결 종료
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

main();
