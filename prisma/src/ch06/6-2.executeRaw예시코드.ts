import { prisma, pool } from '../shared/database';

// 특정 작성자의 게시글을 물리 삭제하지 않고 deleted_at 컬럼을 채워 소프트 삭제하는 함수
async function softDeletePostsByAuthor(authorId: number) {
  // 로그 구분용 출력
  console.log('\n=== 작성자 게시글 소프트 삭제 (executeRaw 예시) ===');

  // Raw SQL 실행
  // - deleted_at IS NULL 조건으로 이미 삭제된 게시글은 제외
  // - $executeRaw는 영향을 받은 row 개수를 반환함
  const resultCount = await prisma.$executeRaw`
    UPDATE study.posts
    SET
      updated_at = NOW(),   -- 수정 시각 갱신
      deleted_at = NOW()    -- 소프트 삭제 처리
    WHERE author_id = ${authorId}   -- 대상 작성자
      AND deleted_at IS NULL        -- 아직 삭제되지 않은 게시글만
  `;

  // 실제 소프트 삭제된 게시글 수 출력
  console.log(`소프트 삭제된 게시글 수: ${resultCount}개`);

  // 영향 받은 row 수 반환
  return resultCount;
}

// 운영/성능 개선 목적의 인덱스를 생성하는 예시 함수
// - "소프트 삭제"를 쓰는 테이블에서 deleted_at IS NULL(활성 데이터)만 대상으로 인덱스를 만들어
//   자주 쓰는 조회(예: published 필터 + 최신순 정렬 + LIMIT)의 성능을 개선한다.
async function createPerformanceIndex() {
  // 로그 구분용 출력
  console.log('\n=== 성능 향상을 위한 인덱스 생성 예시 ===');

  // Raw SQL 실행: 인덱스 생성(DDL)
  // - CONCURRENTLY: 인덱스 생성 중에도 테이블 읽기/쓰기를 최대한 막지 않음(운영 환경 고려)
  //   *주의: CONCURRENTLY는 트랜잭션 블록(예: prisma.$transaction 내부)에서 실행하면 실패함
  // - (published, created_at DESC): published 조건으로 필터링 후,
  //   created_at 최신순 정렬을 인덱스 순서로 처리해
  //   ORDER BY created_at DESC 정렬 비용을 줄이고 LIMIT 조회(Top-N)를 빠르게 함
  // - WHERE deleted_at IS NULL: 소프트 삭제된 행은 제외하고 "활성 행"만 인덱스에 포함(부분 인덱스)
  const result = await prisma.$executeRaw`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_post_published_active
    ON study.posts(published, created_at DESC)
    WHERE deleted_at IS NULL;
  `;

  // 인덱스 생성 완료 로그
  // (참고) CREATE INDEX는 보통 의미 있는 result 값을 반환하지 않는 경우가 많아,
  //       성공/실패 여부 로깅이 더 중요함
  console.log('활성 게시글(published + 최신순) 조회용 인덱스 생성 완료');
  console.log(result);
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    // await softDeletePostsByAuthor(126);
    await createPerformanceIndex();
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
