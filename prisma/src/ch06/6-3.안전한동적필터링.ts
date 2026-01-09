import { prisma, pool } from '../shared/database';
import { Prisma } from '../generated/client';
import type { Post } from '../generated/client';

async function searchPosts(authorId: number, published: boolean) {
  console.log('\n=== 동적 필터링을 위한 안전한 동적 쿼리 빌드 예시 ===');

  /**
   * 1) 동적 WHERE 조건 조각을 Prisma.sql로 만듭니다.
   *    - ${authorId}, ${published}는 "값 바인딩(parameter binding)"으로 처리되어 SQL Injection에 안전합니다.
   *    - 문자열로 직접 이어붙이는 방식(예: `... author_id = ${authorId}`를 템플릿 문자열로 조합)은 지양하세요.
   */
  const condition = Prisma.sql`
    p.author_id = ${authorId}
    AND p.published = ${published}
    AND p.deleted_at IS NULL
  `;

  /**
   * 2) Raw SQL 결과를 Post 타입으로 받고 싶다면, SELECT 결과 컬럼명이 Post 타입 필드명과 일치해야 합니다.
   *
   *    - DB 컬럼: created_at, author_id (snake_case)
   *    - Post 필드: createdAt, authorId (camelCase)
   *
   *    따라서 Postgres에서 camelCase alias를 만들기 위해 "큰따옴표"를 사용합니다.
   *    예) p.created_at AS "createdAt"
   *
   *    주의:
   *    - SELECT * 는 피합니다. (필드명 불일치 + 컬럼 추가 시 타입/동작이 쉽게 깨짐)
   *    - JOIN으로 추가 컬럼을 섞으면 Post 타입으로 받는 것이 더 이상 적절하지 않습니다.
   */
  const posts = await prisma.$queryRaw<Post[]>`
    SELECT
      p.id,
      p.created_at AS "createdAt",
      p.updated_at AS "updatedAt",
      p.deleted_at AS "deletedAt",
      p.title,
      p.content,
      p.published,
      p.author_id  AS "authorId"
    FROM study.posts p
    WHERE ${condition}
    ORDER BY p.created_at DESC
  `;

  console.log(`작성자 ID=${authorId}의 게시글 조회 결과:`);
  console.dir(posts, { depth: null });

  /**
   * 3) 여기서부터는 posts가 Post[]로 타입이 잡혀 있으므로,
   *    Post의 표준 필드명(camelCase)로 접근할 수 있습니다.
   *
   *    - post.createdAt (O)
   *    - post.authorId  (O)
   *
   *    만약 위 SELECT에서 alias를 맞추지 않으면(created_at 그대로 반환 등),
   *    여기서 post.createdAt은 undefined가 될 수 있습니다(타입은 통과하지만 런타임 불일치).
   */
  posts.forEach((post) => {
    console.log(
      `Post ID: ${post.id}, Title: ${post.title}, Author: ${post.authorId}, Created At: ${post.createdAt}`,
    );
  });

  return posts;
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    await searchPosts(139, true);
  } catch (error) {
    console.error(error);
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
