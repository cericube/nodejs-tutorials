import { prisma, pool } from '../shared/database';

/**
 * ========================================
 * 1:1 관계 (User ↔ Profile)
 * ========================================
 * 핵심 포인트
 * - User를 생성하면서 Profile을 동시에 생성 (nested create)
 * - 하나의 트랜잭션으로 처리됨
 * - profile.create는 "이 User 전용 Profile을 새로 만든다"는 의미
 */
async function exam1() {
  console.log('--- 1: User 생성하면서 Profile 동시 생성 ---');

  const user = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      displayName: 'Alice',

      // User ↔ Profile (1:1 관계)
      // profile 필드는 관계 필드
      profile: {
        create: {
          // Profile 테이블에 새로운 row 생성
          // userId는 Prisma가 자동으로 연결
          bio: '안녕하세요! Alice입니다.',
        },
      },
    },

    // 생성 결과에 profile까지 함께 조회
    include: {
      profile: true,
    },
  });

  console.log('---1: User 생성하면서 Profile 동시 생성 결과 ---');
  console.log(user);
}

/**
 * ========================================
 * 1:N 관계 (User → Posts)
 * ========================================
 * 핵심 포인트
 * - User 1명에 여러 Post를 동시에 생성
 * - posts.create 배열 → 여러 레코드 생성 가능
 * - Post.authorId는 자동으로 User와 연결됨
 */
async function exam2() {
  console.log('--- 2: User 생성하면서 여러 Posts 동시 생성 ---');

  const user = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      displayName: 'Bob',

      // 🔹 User → Posts (1:N 관계)
      posts: {
        create: [
          {
            title: 'Bob의 첫 게시글',
            content: '안녕하세요!',
            published: true,
          },
          {
            title: 'Bob의 두번째 게시글',
            content: 'Prisma 좋네요!',
            published: false,
          },
          {
            title: 'Bob의 세번째 게시글',
            content: '관계 생성 패턴 학습중',
            published: true,
          },
        ],
      },
    },

    // 🔹 생성된 Post 목록도 함께 반환
    include: {
      posts: true,
    },
  });

  console.log('---2: User 생성하면서 여러 Posts 동시 생성 결과 ---');
  console.log(user);
}

/**
 * ========================================
 * 중첩 create (Post + Author + Comments)
 * ========================================
 * 핵심 포인트
 * - 가장 복합적인 nested write 예제
 * - Post 생성
 *   → Author(User) 생성
 *     → Profile 생성
 *   → Comments 생성
 *     → 기존 User와 connect
 */
async function exam3() {
  console.log('--- 3: Post 생성하면서 Author + Comments 동시 생성 ---');

  const post = await prisma.post.create({
    data: {
      title: '글+사용자+댓글',
      content: '글+사용자+댓글 동시 생성 예제입니다.',
      published: true,

      // Post → Author (N:1)
      // 기존 User가 아니라 새 User 생성
      author: {
        create: {
          email: 'charlie@example.com',
          displayName: 'charlie',

          // 🔹 User ↔ Profile (1:1)
          profile: {
            create: {
              bio: 'charlie 프로필입니다.',
            },
          },
        },
      },

      // Post → Comments (1:N)
      comments: {
        create: [
          {
            content: '첫 번째 댓글입니다.',

            // Comment → Author (N:1)
            // 이미 존재하는 User와 연결
            author: {
              connect: {
                // 반드시 @unique 필드
                email: 'alice@example.com',
              },
            },
          },
        ],
      },
    },

    /**
     * select 사용 이유
     * - include는 모든 컬럼을 가져오므로 과할 수 있음
     * - API 응답/로그용으로 필요한 필드만 선택
     */
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      author: {
        select: {
          email: true,
          displayName: true,
        },
      },
      comments: {
        select: {
          content: true,
          author: {
            select: {
              email: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  console.log('---3: Post 생성하면서 Author + Comments 동시 생성 결과 ---');
  console.log(post);
}

/**
 * ========================================
 * create + connect 혼합 패턴
 * ========================================
 * 핵심 포인트
 * - 실무에서 가장 많이 사용하는 패턴
 * - "부모는 기존 데이터, 자식은 새로 생성"
 */
async function exma4() {
  console.log('--- 4: create와 connect 혼합 사용 ---');

  const post = await prisma.post.create({
    data: {
      title: '혼합 패턴 게시글',
      content: 'create와 connect를 함께 사용',
      published: true,

      // 기존 User를 Author로 연결
      // connect는 실제 DB에 존재하는지 검증됨
      author: {
        connect: { email: 'alice@example.com' },
      },

      // 새 Comment 생성
      comments: {
        create: [
          {
            content: '이것도 가능하네요!',

            // 🔹 댓글 작성자는 기존 User
            author: {
              connect: { email: 'charlie@example.com' },
            },
          },
        ],
      },
    },

    // 결과 검증을 위해 관계 전체 포함
    include: {
      author: true,
      comments: {
        include: { author: true },
      },
    },
  });

  console.log('---4: create와 connect 혼합 사용 결과 ---');
  console.log(JSON.stringify(post, null, 2));
}

/**
 * ========================================
 * 메인 실행부
 * ========================================
 */
async function main() {
  try {
    // await exam1();
    // await exam2();
    // await exam3();
    await exma4();
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    // Prisma Client 연결 해제
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }

    // pg Pool 종료 (raw SQL 사용 시)
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

main();
