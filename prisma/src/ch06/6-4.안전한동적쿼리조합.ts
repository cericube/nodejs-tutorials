import { prisma, pool } from '../shared/database';
import { Prisma } from '../generated/client';
import type { Comment } from '../generated/client';

async function searchComments(filters: {
  posId: number; // 필수: 특정 게시글의 댓글만 조회
  authorId?: number; // 옵션: 특정 작성자 댓글만 조회
  keyword?: string; // 옵션: 내용 키워드 검색(ILIKE)
  includeDeleted?: boolean; // 옵션: 삭제된 댓글 포함 여부(기본: 제외)
}) {
  console.log('\n=== 동적 필터링을 위한 안전한 동적 쿼리 빌드 예시 ===');

  // 동적으로 추가될 WHERE 조건들을 누적할 배열
  // Prisma.sql 템플릿을 사용하면 파라미터 바인딩이 적용되어 SQL Injection을 방지할 수 있음
  const conditions: Prisma.Sql[] = [];

  // 1) 필수 조건: 게시글 ID
  conditions.push(Prisma.sql`c.post_id = ${filters.posId}`);

  // 2) 삭제 댓글 처리: includeDeleted가 true가 아니면(=false/undefined) 삭제되지 않은 것만
  //    (짧은 형태의 조건 추가 패턴)
  !filters.includeDeleted && conditions.push(Prisma.sql`c.deleted_at IS NULL`);

  // 3) 작성자 필터: 값이 있을 때만 조건 추가
  //    (주의: authorId가 0일 가능성이 있다면 `filters.authorId != null` 형태가 더 안전)
  if (filters.authorId) {
    conditions.push(Prisma.sql`c.author_id = ${filters.authorId}`);
  }

  // 4) 키워드 필터: 값이 있을 때만 ILIKE 패턴 검색 조건 추가
  if (filters.keyword) {
    const pattern = `%${filters.keyword}%`; // 부분일치 패턴
    conditions.push(Prisma.sql`c.content ILIKE ${pattern}`);
  }

  // 누적된 조건이 있으면 WHERE ... AND ... 로 조립, 없으면 WHERE 생략
  const whereClause =
    conditions.length > 0 ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}` : Prisma.empty;

  // 최종 Raw SQL 실행: whereClause가 템플릿에 그대로 삽입됨
  // ${...}는 문자열 결합이 아니라 "바인딩"으로 들어가므로 안전하게 파라미터 처리됨
  const comments = await prisma.$queryRaw<Comment[]>`
    SELECT *
    FROM study.comments c
    JOIN study.users u ON c.author_id = u.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT 20
  `;

  console.log(`게시글 ID=${filters.posId}의 댓글 조회 결과:`);
  console.log(comments);

  return comments;
}

async function main() {
  try {
    // await searchComments({ posId: 290 });
    // await searchComments({ posId: 290, authorId: 140 });
    await searchComments({ posId: 290, keyword: '도움' });
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
