import { prisma, pool } from '../shared/database';

/**
 * 커서 기반 페이지네이션으로 게시글 목록을 조회한다.
 * - 정렬 기준: createdAt DESC, id DESC (동일 createdAt 대비 id로 안정 정렬)
 * - 커서 구성: (createdAt, id) 복합 커서(Composite Cursor)
 * - 다음 페이지 커서: 현재 페이지의 마지막 아이템의 (id, createdAt)
 */
async function getPostList(cursorParam?: { id: number; createdAt: string }) {
  // 한 페이지에서 가져올 개수
  const take = 3;

  const posts = await prisma.post.findMany({
    // 항상 take 개수만큼 가져온다 (다음 페이지가 있는지 판단은 결과 길이로)
    take: take,

    /**
     * cursorParam이 있을 때만 커서 페이지네이션 옵션을 추가한다.
     * - cursor: "어디부터" 가져올지 기준점(현재 페이지의 마지막 아이템)을 지정
     * - skip: 1 → cursor로 지정한 레코드(기준점) 자체는 중복으로 포함되므로 1개 건너뛰기
     *
     * createdAt_id 는 Prisma 스키마에 정의된 "복합 Unique 인덱스"의 이름(예: @@unique([createdAt, id], name: "createdAt_id"))
     * 즉, createdAt과 id 조합으로 특정 레코드를 유일하게 지정할 수 있어야 한다.
     */

    // 1. ... (spread) : 객체에 다른 객체의 프로퍼티를 펼쳐서 병합
    // 2. cursorParam && {...} : cursorParam이 truthy일 때만 뒤의 객체를 평가/반환
    ...(cursorParam && {
      cursor: {
        createdAt_id: {
          // API에서 받은 createdAt 문자열을 Date로 변환 (Prisma는 Date 타입 기대)
          createdAt: new Date(cursorParam.createdAt),
          id: cursorParam.id,
        },
      },
      // 커서 레코드 본인을 제외하고 다음 레코드부터 가져오기
      skip: 1,
    }),

    /**
     * 조회 조건
     * - 소프트 삭제(deletedAt IS NULL)만
     * - 공개(published=true)만
     */
    where: {
      deletedAt: null,
      published: true,
    },

    /**
     * 정렬
     * - createdAt DESC: 최신 글 우선
     * - id DESC: createdAt이 동일한 경우에도 정렬이 흔들리지 않도록 보조 정렬(안정 정렬)
     *
     * 주의: 커서(Composite Cursor) 필드와 정렬 필드가 논리적으로 일치해야
     * "중복/누락" 없이 페이지를 안정적으로 넘길 수 있다.
     */
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],

    /**
     * 응답에 필요한 관계/집계 데이터만 포함
     * - author: 작성자 정보 중 displayName, email만 반환 (불필요한 필드 최소화)
     * - _count: comments, likes 카운트만 반환 (목록 UI에 흔히 필요)
     */
    include: {
      author: {
        select: {
          displayName: true,
          email: true,
        },
      },
      _count: {
        select: { comments: true, likes: true },
      },
    },
  });

  /**
   * 다음 페이지 커서 계산
   * - 이번 페이지에서 take 개수를 "꽉 채워서" 가져왔다면 다음 페이지가 있을 가능성이 높다.
   * - 다음 요청에서는 "마지막 아이템"을 기준 커서로 넘긴다.
   *
   * 참고:
   * - 데이터가 정확히 take개였다고 해서 100% 다음이 있는 것은 아니지만,
   *   일반적인 커서 페이지네이션에서 많이 쓰는 패턴이다.
   * - 더 엄밀히 하려면 take+1을 조회해서 1개 더 있으면 hasNextPage=true로 판단하는 방식도 사용한다.
   */
  let nextCursor = null;
  if (posts.length === take) {
    const lastPost = posts[posts.length - 1];
    nextCursor = {
      id: lastPost.id,
      // 커서로 넘길 때는 직렬화가 필요하므로 ISO 문자열로 변환
      createdAt: lastPost.createdAt.toISOString(),
    };
  }

  return {
    data: posts,
    nextCursor: nextCursor,
    // !!nextCursor는 “truthy/falsy” 기준이고, !== null은 “null인지 여부만” 봅니다.
    hasNextPage: !!nextCursor,
  };
}

// ========================================
// 실습 메인 함수
// ========================================
async function main() {
  try {
    // 1페이지: 커서 없이 최초 조회
    const page1 = await getPostList();
    console.log('--- page 1 ---');
    console.log(JSON.stringify(page1, null, 2));

    // 2페이지: 1페이지의 마지막 아이템 커서를 전달해서 다음 페이지 조회
    if (page1.hasNextPage && page1.nextCursor) {
      const page2 = await getPostList(page1.nextCursor);
      console.log('--- page 2 ---');
      console.log(JSON.stringify(page2, null, 2));
    }
  } catch (error) {
    console.log(error);
  } finally {
    /**
     * 리소스 정리
     * - prisma.$disconnect(): Prisma Client 커넥션/리소스 정리
     * - pool.end(): pg Pool(혹은 다른 DB 풀) 종료
     *
     * 서버 앱이라면 프로세스 종료 시점 훅에서 처리하지만,
     * 스크립트/테스트 코드에서는 finally에서 정리하는 패턴이 안전하다.
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

main();
