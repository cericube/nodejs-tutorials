import { prisma, pool } from '../shared/database';
/**
 * 최근 게시글 10개를 대상으로
 * - posts + users JOIN (작성자 이름)
 * - comments LEFT JOIN (댓글 수 집계)
 * 를 한 번의 SQL로 조회하는 예시입니다.
 *
 * Prisma의 $queryRaw 템플릿 리터럴을 사용해
 * - SQL Injection 위험을 낮추고(파라미터 바인딩)
 * - 복잡한 집계/조인을 직접 SQL로 처리
 * 하는 목적의 코드입니다.
 */
async function getPostStatistics() {
  console.log('\n===  게시글 + 작성자 JOIN 및 통계 조회 (queryRaw 예시) ===');

  /**
   * Raw SQL 결과를 TypeScript에서 안전하게 다루기 위한 타입 정의입니다.
   * - SQL의 컬럼 alias("postId", "authorName" 등)와 인터페이스의 필드명이 정확히 일치해야 합니다.
   */
  interface PostSummary {
    postId: number;
    title: string;
    authorName: string;

    /**
     * 주의:
     * - PostgreSQL에서 COUNT()는 bigint로 반환되는 경우가 많습니다.
     * - Prisma의 드라이버/환경에 따라 string 또는 bigint로 들어올 수도 있어,
     *   안정적으로 number를 원한다면 SQL에서 CAST하는 편이 좋습니다.
     *   예) COUNT(c.id)::int AS "commentCount"
     */
    commentCount: number;

    /**
     * p.created_at 컬럼을 "createdAt"으로 alias하여 매핑합니다.
     * - Prisma가 Date로 파싱해주지만, 환경/드라이버 설정에 따라 string일 수 있으니
     *   로그/포맷팅 시 주의하세요.
     */
    createdAt: Date;
  }

  /**
   * $queryRaw<T[]>:
   * - T는 “내가 기대하는 결과 형태”를 컴파일 타임에 제공할 뿐,
   *   런타임에서 실제 값이 그 타입을 보장하진 않습니다.
   * - 따라서 COUNT/Date 파싱 같은 부분은 SQL 측에서 명시적으로 맞춰주는 것이 안전합니다.
   */
  const posts = await prisma.$queryRaw<PostSummary[]>`
    SELECT
      -- posts 테이블 PK를 "postId"로 alias (TS 인터페이스 필드명과 일치)
      p.id AS "postId",

      -- 게시글 제목
      p.title,

      -- 작성자 표시 이름을 "authorName"으로 alias
      u.display_name AS "authorName",

      -- 댓글 수 집계: comments가 없을 수 있으므로 LEFT JOIN + COUNT
      -- 안정적 number 매핑을 원하면 아래처럼 캐스팅 권장:
      -- COUNT(c.id)::int AS "commentCount"
      COUNT(c.id)::int AS "commentCount",

      -- created_at을 "createdAt"으로 alias
      p.created_at AS "createdAt"
    FROM study.posts p

    -- 작성자는 항상 존재한다고 가정: INNER JOIN
    INNER JOIN study.users u ON p.author_id = u.id

    -- 댓글은 없을 수 있으므로 LEFT JOIN (댓글 0개도 결과에 포함)
    LEFT JOIN study.comments c ON c.post_id = p.id

    -- COUNT 집계를 쓰므로, SELECT에 나온 비집계 컬럼은 GROUP BY에 포함
    GROUP BY p.id, p.title, p.created_at, u.display_name

    -- 최신 게시글부터
    ORDER BY p.created_at DESC

    -- 최근 10개만
    LIMIT 10;
  `;

  console.log('Recent Post Statistics:');

  /**
   * 조회 결과를 출력합니다.
   * - commentCount 타입이 런타임에서 string/bigint로 올 가능성이 있다면
   *   Number(post.commentCount)로 방어 변환하는 것도 방법입니다.
   */
  posts.forEach((post) => {
    console.log(
      `Post ID: ${post.postId}, Title: ${post.title}, Author: ${post.authorName}, Comments: ${post.commentCount}, Created At: ${post.createdAt}`,
    );
  });

  // 호출 측에서 재사용할 수 있도록 결과 반환
  return posts;
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    await getPostStatistics();
  } catch (error) {
    console.error('Error executing raw query:', error);
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

main();
