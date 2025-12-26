import { prisma, pool } from '../shared/database';

/**
 * ============================================
 * N:M 관계 (명시적 중간 테이블) - PostLike
 * ============================================
 * - User <-> Post 사이의 N:M을 PostLike 테이블로 “명시적으로” 표현
 * - (userId, postId) 복합 유니크/복합 PK로 “한 유저가 한 게시글에 1회만 좋아요” 보장
 * - deletedAt 으로 Soft Delete(논리 삭제) 패턴 적용 가능
 */

// 1. 게시글 좋아요 추가
async function exam1() {
  console.log('\n=== 1. PostLike 생성 (좋아요 추가) ===');

  // 데모용: 첫 유저/첫 게시글 1건을 가져옴 (실무에선 조건(where)로 특정 대상 조회 권장)
  const user = await prisma.user.findFirst();
  const post = await prisma.post.findFirst();

  // 방어 코드: 시드/데이터가 없으면 진행 불가
  if (!user || !post) {
    console.log('User나 Post가 없습니다.');
    return;
  }

  // 좋아요 추가: PostLike 레코드를 생성하면서 FK는 connect로 연결
  const like = await prisma.postLike.create({
    data: {
      user: {
        connect: {
          id: user.id, // FK(userId) 설정과 동일한 의미 (관계로 연결)
        },
      },
      post: {
        connect: {
          id: post.id, // FK(postId) 설정과 동일한 의미
        },
      },
    },
    include: {
      // 응답 페이로드 최소화: 필요한 필드만 선택해 함께 반환(디버깅/로그 확인용)
      user: { select: { displayName: true } },
      post: { select: { title: true } },
    },
  });

  console.log('좋아요 추가:', like);
}

// 2. 좋아요 중복 방지 (복합 키 활용)
async function exam2() {
  console.log('\n=== 2. 좋아요 중복 방지 테스트 ===');

  const user = await prisma.user.findFirst();
  const post = await prisma.post.findFirst();

  if (!user || !post) {
    console.log('User나 Post가 없습니다.');
    return;
  }

  try {
    // 첫 번째 좋아요: 정상 생성
    await prisma.postLike.create({
      data: {
        user: { connect: { id: user.id } },
        post: { connect: { id: post.id } },
      },
    });
    console.log('첫 번째 좋아요 성공');

    // 두 번째 좋아요: (userId, postId) 복합 유니크/PK 제약으로 실패해야 정상
    await prisma.postLike.create({
      data: {
        user: { connect: { id: user.id } },
        post: { connect: { id: post.id } },
      },
    });
    console.log('두 번째 좋아요 성공?? (이상함)');
  } catch (error: any) {
    // Prisma 에러 코드 예: P2002(Unique constraint failed) 등이 올 수 있음
    console.log('예상된 에러 발생 - 중복 좋아요 방지:', error.code);
  }
}

// 3. Soft Delete (좋아요 취소)
async function exam3() {
  console.log('\n=== 3. PostLike Soft Delete (좋아요 취소) ===');

  const user = await prisma.user.findFirst();
  const post = await prisma.post.findFirst();

  if (!user || !post) return;

  // 좋아요 취소(논리 삭제): deletedAt만 채워서 “취소 상태”로 표시
  // - where는 복합 유니크 키(userId_postId)로 단건을 정확히 식별
  const canceledLike = await prisma.postLike.update({
    where: {
      userId_postId: {
        userId: user.id,
        postId: post.id,
      },
    },
    data: {
      deletedAt: new Date(), // 취소 시간 기록(soft delete)
    },
  });

  console.log('좋아요 취소 (Soft Delete):', canceledLike);

  // 좋아요 복구: deletedAt을 null로 되돌려 “활성 좋아요”로 복원
  const restoredLike = await prisma.postLike.update({
    where: {
      userId_postId: {
        userId: user.id,
        postId: post.id,
      },
    },
    data: {
      deletedAt: null,
    },
  });

  console.log('좋아요 복구:', restoredLike);
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    // 원하는 예제만 주석 해제해서 실행
    //await exam1();
    //await exam2();
    await exam3();
  } catch (error) {
    console.error('Error in main function:', error);
  } finally {
    // 리소스 정리: Node 프로세스 hang 방지(커넥션 미종료로 종료 안 되는 문제 예방)
    try {
      await prisma.$disconnect(); // Prisma 연결 종료
    } catch (e) {
      console.error('[cleanup] prisma.$disconnect() failed:', e);
    }

    // raw SQL(pg pool)을 같이 쓴 경우에만 필요 (미종료 시 프로세스 종료가 안 될 수 있음)
    try {
      await pool.end();
    } catch (e) {
      console.error('[cleanup] pool.end() failed:', e);
    }
  }
}

main();
