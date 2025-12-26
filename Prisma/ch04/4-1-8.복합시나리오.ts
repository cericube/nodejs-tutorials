import { prisma, pool } from '../shared/database';

/**
 * 시나리오 1: "인기 게시글" 정의
 * - published = true (발행된 글)
 * - createdAt >= 최근 30일 (최신성)
 * - comments.some(...) (댓글이 1개 이상 존재)
 * - likes.some(...) (좋아요가 1개 이상 존재)
 * - deletedAt = null (소프트 삭제된 글 제외)
 *
 * 주의:
 * - comments / likes의 "개수(>=3 등)"로 where에서 직접 필터링은 Prisma findMany 단일 호출만으로 제한이 있음
 *   (관계 개수 기반 필터는 DB별/Prisma 기능 제약으로 인해 보통 groupBy, raw SQL, 별도 쿼리 등이 필요)
 * - 여기서는 "존재 여부"만 some으로 체크하고, 실제 개수는 _count로 반환만 한다.
 */
async function exam1() {
  console.log('--- 1-1: 인기 게시글 조회 ---');

  /**
   * 최근 30일 기준 시각 생성
   * - Date.now(): 현재 시각(ms)
   * - 30일 * 24시간 * 60분 * 60초 * 1000ms
   * - "지금 - 30일"을 계산해서, 그 이후 작성된 글만 조회(gte)
   */
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  /**
   * prisma.post.findMany:
   * - Post 테이블(모델)에서 조건에 맞는 레코드를 여러 건 조회
   * - where: 필터 조건
   * - select: 가져올 컬럼/관계/집계 필드 선택
   * - take: 최대 N건 제한 (pagination의 가장 기본 형태)
   */
  const posts = await prisma.post.findMany({
    where: {
      /**
       * published: true
       * - 발행된 글만 조회
       */
      published: true,

      /**
       * createdAt: { gte: thirtyDaysAgo }
       * - gte(Greater Than or Equal): thirtyDaysAgo 이상(=이후)에 작성된 글
       * - 즉 최근 30일 이내 글만 필터링
       */
      createdAt: { gte: thirtyDaysAgo },

      /**
       * comments: { some: { ... } }
       * - 관계(1:N) 필터에서 "some"은 "조건을 만족하는 댓글이 1개라도 존재"를 의미
       * - 여기서는 deletedAt: null 인 댓글(=소프트 삭제되지 않은 댓글)이 하나라도 있으면 통과
       */
      comments: {
        some: {
          deletedAt: null,
        },
      },

      /**
       * likes: { some: { ... } }
       * - comments와 동일한 패턴
       * - 소프트 삭제되지 않은 좋아요가 1개라도 존재하면 통과
       */
      likes: {
        some: {
          deletedAt: null,
        },
      },

      /**
       * deletedAt: null
       * - 게시글 자체가 소프트 삭제된 경우(삭제 시각이 존재) 제외
       * - 운영에서 "삭제된 데이터는 남겨두되 조회에서 제외"할 때 흔히 쓰는 패턴
       */
      deletedAt: null,
    },

    /**
     * select:
     * - 결과로 어떤 필드를 반환할지 정의
     * - 필요한 필드만 가져오면 네트워크/메모리 효율이 좋아짐
     */
    select: {
      id: true, // 게시글 PK
      title: true, // 게시글 제목
      createdAt: true, // 게시글 작성 시각

      /**
       * _count:
       * - Prisma가 제공하는 관계 개수 집계 필드
       * - 여기서는 comments/likes의 "총 개수"를 반환 (단, 삭제되지 않은 것만 카운트하도록 where를 추가)
       *
       * 포인트:
       * - where의 some은 "존재" 필터링
       * - _count는 "개수 반환"
       * - 즉, "필터링 기준(존재)"과 "표시 목적(카운트)"를 분리한 형태
       */
      _count: {
        select: {
          comments: { where: { deletedAt: null } }, // 삭제되지 않은 댓글 개수
          likes: { where: { deletedAt: null } }, // 삭제되지 않은 좋아요 개수
        },
      },
    },

    /**
     * take: 10
     * - 최대 10건만 조회
     * - 정렬(orderBy)이 없으면 DB 기본 반환 순서에 의존하므로,
     *   운영에서는 보통 createdAt desc 또는 좋아요/댓글 수 기반 정렬을 명시하는 것이 안전
     */
    take: 10,
  });

  console.log('--- 1-1: 인기 게시글 조회  결과---');
  console.log(JSON.stringify(posts, null, 2));
}

/**
 * 실습 메인 함수
 * - try/catch/finally:
 *   - try: 정상 실행
 *   - catch: 에러 로깅
 *   - finally: 성공/실패와 무관하게 "항상" 리소스 정리(cleanup) 수행
 *
 * cleanup이 중요한 이유:
 * - prisma.$disconnect(): Prisma Client가 내부적으로 유지하는 연결/리소스 정리
 * - pool.end(): node-postgres(pg) 등 커넥션 풀 사용 시 프로세스 종료 전에 풀 종료 필요
 * - 실습/스크립트 환경에서는 cleanup을 안 하면 Node 프로세스가 종료되지 않거나 연결이 남을 수 있음
 */
async function main() {
  try {
    // 실제 실습 로직 실행
    await exam1();
  } catch (error) {
    // 실행 중 발생한 에러를 콘솔에 출력
    console.error(error);
  } finally {
    /**
     * cleanup 1) Prisma 연결 종료
     * - 종료 과정에서도 에러가 날 수 있으므로, cleanup 자체를 개별 try/catch로 감싼다.
     * - cleanup에서 에러가 나더라도 다음 cleanup을 계속 수행하기 위함
     */
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }

    /**
     * cleanup 2) DB 커넥션 풀 종료
     * - pg Pool을 사용 중이면 end()로 종료
     */
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

// 스크립트 실행 시작점(entry point)
main();
