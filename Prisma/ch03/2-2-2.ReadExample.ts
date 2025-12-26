import { prisma, pool } from '../shared/database';

/**
 * [1] findUnique
 * - 고유(Unique) 필드로 "정확히 1건" 조회
 * - 조회 대상이 없으면 null 반환 (에러 아님)
 * - 여기서는 User.email이 @unique 이므로 findUnique가 적합
 */
async function runFindUnique(email: string) {
  console.log('--- [1] findUnique ---');

  const user = await prisma.user.findUnique({
    where: {
      // @unique 필드(email)로 단일 레코드 조회
      email: email,
    },
  });

  console.log('--- [1] findUnique 실행 결과 ---');
  console.log(user);

  // 결과 예시 (없으면 null):
  // {
  //   id: 126,
  //   createdAt: 2025-12-23T04:24:17.612Z,
  //   updatedAt: 2025-12-23T04:24:17.612Z,
  //   deletedAt: null,
  //   email: 'user001@example.com',
  //   displayName: 'User 001'
  // }

  return user;
}

/**
 * [2] findUniqueOrThrow
 * - Unique 조건으로 "정확히 1건" 조회
 * - 조회 대상이 없으면 Prisma가 예외(throw) 발생
 * - include를 사용해 관계 데이터를 함께 로딩할 수 있음 (여기서는 Post.author)
 */
async function runFindUniqueOrThrow(postId: number) {
  console.log('--- [2] findUniqueOrThrow ---');

  const post = await prisma.post.findUniqueOrThrow({
    where: {
      // Post.id는 @id 이므로 unique 조건에 해당
      id: postId,
    },
    // include: 관계(조인) 데이터를 함께 가져옴
    include: { author: true },
  });

  console.log('--- [2] findUniqueOrThrow 실행 결과 ---');
  console.log(post);

  // 결과 예시:
  // {
  //   id: 280,
  //   ...
  //   authorId: 132,
  //   author: { id: 132, email: 'user007@example.com', ... }
  // }

  return post;
}

/**
 * [3] findFirst
 * - 조건을 만족하는 "첫 번째" 레코드 1건 조회
 * - 정렬(orderBy)을 지정하지 않으면 DB가 반환하는 임의 순서의 "첫 번째"가 될 수 있음
 * - 없으면 null 반환
 *
 * - 여기서는 특정 authorId의 게시글 중(soft delete 제외) 1건을 가져오는 예시
 */
async function runFindFirst(userId: number) {
  console.log('--- [3] findFirst ---');

  const post = await prisma.post.findFirst({
    where: {
      authorId: userId,
      // soft delete 정책: 삭제되지 않은 것만
      deletedAt: null,
    },
    include: {
      // author 전체를 가져오는 대신 select로 필요한 필드만 가져오면 데이터량이 줄어듦
      author: {
        select: { id: true, displayName: true },
      },
    },
    // 실무에서는 "최신 글 1개"처럼 의도가 있으면 orderBy를 명시하는 것을 권장
    // orderBy: { createdAt: 'desc' },
  });

  console.log('--- [3] findFirst 실행 결과 ---');
  console.log(post);

  return post;
}

/**
 * [4] findFirstOrThrow
 * - findFirst와 동일하되, 결과가 없으면 예외(throw)
 * - "반드시 존재해야 하는 데이터"를 찾을 때 유용
 *
 * - 예시: published=true 이면서 title에 '공지'가 포함된 글 1건을 찾음
 * - 단, seed 데이터에 '공지'가 없으면 예외가 발생할 수 있음
 */
async function runFindFirstOrThrow() {
  console.log('--- [4] findFirstOrThrow ---');

  const post = await prisma.post.findFirstOrThrow({
    where: {
      published: true,
      title: {
        // 부분 문자열 검색 (LIKE '%공지%')
        contains: '공지',
      },
    },
    // 실무에선 의도를 명확히 하기 위해 정렬을 곁들이는 경우가 많음
    // orderBy: { createdAt: 'desc' },
  });

  console.log('--- [4] findFirstOrThrow 실행 결과 ---');
  console.log(post);

  return post;
}

/**
 * [5] findMany
 * - 조건을 만족하는 레코드 "여러 건" 조회
 * - take/skip으로 페이지네이션 가능
 * - 대량 데이터일 경우 orderBy를 명시하지 않으면 결과 순서가 안정적이지 않을 수 있음
 */
async function runFindMany() {
  console.log('--- [5] findMany ---');

  const posts = await prisma.post.findMany({
    where: {
      // soft delete 제외
      deletedAt: null,
    },
    take: 10, // LIMIT 10
    skip: 0, // OFFSET 0
    // 일반적으로 페이징은 정렬과 함께 사용
    // orderBy: { createdAt: 'desc' },
  });

  console.log('--- [5] findMany 실행 결과 ---');
  console.log(posts);

  return posts;
}

/////////////////////////////////////////////////////////
// ../prisma/seed.ts 를 실행하여 테스트 데이터를 생성한다.
/////////////////////////////////////////////////////////

/**
 * 엔트리 포인트
 * - 각 run* 함수를 필요에 따라 호출하며 동작을 확인하는 샘플
 * - try/catch/finally로 예외 처리 및 리소스 정리
 *
 * - finally에서:
 *   - prisma.$disconnect(): Prisma 연결 종료
 *   - pool.end(): (shared/database에서 export한) pg Pool 같은 별도 커넥션 풀 종료
 *     (Raw SQL을 pool로 실행하는 구조라면 반드시 종료해 프로세스가 안 남게 함)
 */
async function main() {
  try {
    // 아래는 필요에 따라 하나씩 실행하며 결과를 확인
    // await runFindUnique('user001@example.com');
    // await runFindUniqueOrThrow(280); // postId
    // await runFindFirst(130); // userId
    // await runFindFirstOrThrow(); // seed 데이터에 '공지'가 없으면 throw 가능
    await runFindMany();
  } catch (e) {
    // 예외 발생 시 로깅
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(e);
  } finally {
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
