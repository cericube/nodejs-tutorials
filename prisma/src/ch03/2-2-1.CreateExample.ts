/**
 * import type { User } ...
 * - 런타임에 포함되지 않는 "타입 전용" import
 * - TS 컴파일 단계에서만 사용되며, 번들/실행 코드에 영향이 없음
 *
 * 주의:
 * - 경로 'generated/client'는 프로젝트 설정에 따라 다릅니다.
 * - 일반적으로는 "@prisma/client"에서 타입을 가져오지만,
 *   질문 코드에서는 커스텀 생성 경로를 쓰고 있으므로 그대로 둡니다.
 */
import type { User } from '../generated/client'; // 명시적 반환타입 적용 테스트
import { prisma, pool } from '../shared/database';

/**
 * 1) User 및 Profile 생성 (1:1 관계) - Nested Write 예시
 * - User ↔ Profile이 1:1 관계이고, User 모델에 profile relation field(Profile?)가 있을 때 가능
 * - user.create() 안에서 profile.create로 한 트랜잭션(논리적)처럼 같이 생성할 수 있음
 *
 * 반환 타입: Promise<User>
 * - Prisma의 create 반환 타입은 select/include에 따라 달라질 수 있음
 * - 여기서는 include를 사용하지 않았기 때문에 User만 반환됨
 */
async function runCreate(): Promise<User> {
  console.log('--- [1] create 실행(1:1) --');

  const user = await prisma.user.create({
    data: {
      email: 'cericube1@naver.com',
      displayName: 'cericube1',

      // Nested Write (User 생성과 동시에 Profile 생성)
      profile: {
        create: {
          bio: '환영합니다.!',
        },
      },
    },
  });

  console.log('--- [1] creat 실행결과 ---');
  console.log(user);
  return user;
}

/**
 * 2) User 1건 생성하면서 Post 여러 개 함께 생성 (1:N 관계) - posts.create 배열 예시
 *
 * - posts: { create: [...] } 는 내부적으로 "여러 번의 INSERT"가 발생할 수 있음
 *   (구현/환경에 따라 다르지만, 개념적으로는 개별 생성에 가깝다고 이해하면 됨)
 * - 소량 데이터나 예제에서는 직관적이고 편리
 *
 * include.posts: true
 * - 생성 결과로 User 뿐 아니라, 연결된 posts도 같이 반환
 * - (설명 주석의 SQL은 개념적 설명이며, Prisma 내부 동작은 최적화될 수 있음)
 */
async function runCreateWithMultiCreate() {
  console.log('--- [2] runCreateWithMultiCreate 실행(1:N) ---');

  const user = await prisma.user.create({
    data: {
      email: 'cericube2@naver.com',
      displayName: 'cericube2',
      posts: {
        // User 생성과 함께 Post 2건 생성
        create: [
          {
            title: '타이틀1 cericube2',
            content: '내용1 cericube2',
          },
          {
            title: '타이틀2 cericube2',
            content: '내용2 cericube2',
          },
        ],
      },
    },

    // 생성된 user 결과에 posts 관계까지 포함하여 반환
    include: {
      posts: true,
    },
  });

  console.log('--- [2] runCreateWithMultiCreate 실행결과 ---');
  console.log(user);
  return user;
}

/**
 * 3) User 1건 생성하면서 Post 여러 개 함께 생성 (1:N 관계) - posts.createMany 예시
 *
 * - createMany는 일반적으로 "벌크 INSERT"로 처리되어
 *   네트워크 왕복/쿼리 파싱/플래닝 비용을 줄여 유리한 경우가 많음
 * - 단, DB/드라이버/Prisma 버전에 따라 세부 동작 차이는 있을 수 있음
 *
 * skipDuplicates: true
 * - 중복(주로 unique 제약 충돌)되는 행은 건너뛰고 나머지 삽입
 * - 현재 Post에는 title unique가 없으므로, 보통은 충돌이 나지 않음
 * - 하지만 복합 unique 등을 추가한 경우 유용
 *
 * 주의:
 * - createMany는 "생성된 레코드 전체를 반환"하지 않는 경우가 일반적이었고,
 *   include로 posts를 반환하는 것은 별도 쿼리로 조회될 수 있음
 * - 여기서는 학습 예제로 "개념"을 보여주는 목적이라 이해하면 됨
 */
async function runCreateWithCreateMany() {
  console.log('--- [3] runCreateWithCreateMany 실행(1:N) ---');

  const user = await prisma.user.create({
    data: {
      email: 'cericube3@naver.com',
      displayName: 'cericube3',
      posts: {
        createMany: {
          data: [
            {
              title: '타이틀3 cericube3',
              content: '내용3 cericube3 ',
            },
            {
              title: '타이틀4 cericube3',
              content: '내용4 cericube3',
            },
          ],

          // 유니크 충돌 발생 시 해당 레코드는 스킵하고 나머지 삽입
          skipDuplicates: true,
        },
      },
    },

    // 생성된 user 결과에 posts 관계까지 포함하여 반환
    include: {
      posts: true,
    },
  });

  console.log('--- [3] runCreateWithCreateMany 실행결과 ---');
  console.log(user);
  return user;
}

/**
 * 4) Post 여러 개를 createManyAndReturn으로 생성하고, 생성된 레코드를 반환 받기
 *
 * - createMany는 기본적으로 BatchPayload({count})만 반환하는 경우가 많음
 * - createManyAndReturn은 생성 레코드 자체를 반환 (DB/프리뷰/버전 지원에 따라 차이 가능)
 * - select로 반환 필드를 최소화해서 페이로드를 줄이는 것이 일반적
 *
 * userId는 Post.authorId(N:1 관계)의 FK로 사용
 */
async function runCreateManyAndReturn(userId: number) {
  console.log('--- [4] runCreateManyAndReturn ---');

  const posts = await prisma.post.createManyAndReturn({
    data: [
      {
        title: '타이틀: createManyAndReturn 1',
        content: '내용 createManyAndReturn 1',
        authorId: userId,
      },
      {
        title: '타이틀: createManyAndReturn 2',
        content: '내용 createManyAndReturn 2',
        authorId: userId,
      },
    ],

    // 반환할 필드만 선택 (필요 최소)
    select: {
      id: true,
      title: true,
      authorId: true,
    },
  });

  console.log('--- [4] runCreateManyAndReturn 실행결과 ---');
  console.log(posts);
}

/**
 * 5) 특정 Post에 Comment 여러 개 달기 - comment.createMany 예시
 *
 * - createMany는 기본적으로 BatchPayload({ count }) 반환
 * - authorId/userId는 Comment.authorId FK, postId는 Comment.postId FK
 *
 * 주의:
 * - 여기서는 userId와 postId를 외부에서 숫자로 받는데,
 *   실제로 해당 ID가 존재하지 않으면 FK 제약으로 에러 발생 가능
 */
async function runCreateMany(userId: number, postId: number) {
  console.log('--- [5] runCreateMany 실행 ---');

  const result = await prisma.comment.createMany({
    data: [
      {
        content: 'comments crateMany1',
        postId: postId,
        authorId: userId,
      },
      {
        content: 'comments crateMany2',
        postId: postId,
        authorId: userId,
      },
    ],
  });

  console.log('--- [5] runCreateMany 실행결과 ---');
  console.log(result); // { count: 2 }
  return result;
}

/**
 * 테스트 데이터 초기화
 * - FK 제약 때문에 자식 테이블부터 삭제하는 순서가 안전
 * - PostLike/Comment -> Post -> Profile -> User
 */
async function cleanUp() {
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * 실행 함수
 * - 예제 실행 전 cleanUp()으로 DB를 비워 "결과를 예측 가능"하게 만듦
 * - 아래 run* 함수 호출을 주석 해제하면서 하나씩 테스트하는 형태
 */
async function main() {
  try {
    // 테스트 전 DB 초기화
    await cleanUp();

    // 아래는 필요에 따라 하나씩 실행
    // await runCreate();
    // await runCreateWithMultiCreate();
    // await runCreateWithCreateMany();

    // 주의: 아래는 "24", "22" 같은 ID가 실제 DB에 존재해야 성공함
    // - cleanUp() 직후에는 해당 ID가 없을 가능성이 큼
    // await runCreateManyAndReturn(24);
    // await runCreateMany(24, 22);
  } catch (e) {
    // 예외 로깅
    console.log(e);
  } finally {
    /**
     * 테스트 종료 후 정리
     * - 필요하면 다시 cleanUp()을 실행해서 DB를 원복할 수 있음
     * - (현재는 주석 처리)
     */
    // await cleanUp();

    /**
     * 리소스 종료
     * - prisma.$disconnect(): Prisma Client의 DB 연결 해제
     * - pool.end(): (shared/database에서 export한) pg Pool 같은 커넥션 풀 종료
     *   -> pool을 열어둔 상태면 Node 프로세스가 종료되지 않을 수 있음
     */
    try {
      await prisma.$disconnect();
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

// 실제 실행
main();
