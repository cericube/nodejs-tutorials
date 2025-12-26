import { prisma, pool } from '../shared/database';

/**
 * 단일 댓글 삭제 (존재하지 않으면 예외 발생)
 * - prisma.comment.delete는 where가 unique 조건이어야 하며,
 * - 대상 레코드가 없으면 PrismaClientKnownRequestError(P2025)가 발생합니다.
 * - select로 반환 필드를 제한하여 삭제 결과 확인용으로 사용합니다.
 */
async function runDelete(commentId: number) {
  console.log('--- [1] 댓글 삭제 ---');

  const comment = await prisma.comment.delete({
    // delete: unique 조건으로 1건 삭제
    where: {
      id: commentId,
    },

    // 삭제된 레코드와 연관 정보(게시글/작성자)를 함께 확인
    select: {
      id: true,

      // 댓글이 달린 게시글 정보
      post: {
        select: {
          id: true,
          title: true,
          published: true,
        },
      },

      // 댓글 작성자 정보
      author: {
        select: {
          id: true,
          displayName: true,
          email: true,
        },
      },
    },
  });

  console.log('--- [1] 댓글 삭제 결과 ---');
  console.log(comment);
}

/**
 * 특정 사용자의 댓글 일괄 삭제 (0건이어도 예외 없음)
 * - prisma.comment.deleteMany는 조건에 맞는 다건을 삭제하며
 * - 결과는 BatchPayload 형태({ count })로 반환됩니다.
 * - 대상이 없어도 count=0으로 정상 처리됩니다.
 */
async function runDeleteMany(userId: number) {
  console.log('--- [2] 사용자 댓글 삭제 ---');

  const result = await prisma.comment.deleteMany({
    // deleteMany: 조건에 해당하는 댓글을 전부 삭제
    where: {
      authorId: userId,
    },
  });

  console.log('--- [2] 사용자 댓글 삭제 결과 ---');
  console.log(result); // { count: number }
}

/////////////////////////////////////////////////////////
// 테스트 데이터 정리용 함수
// - ../prisma/seed.ts 실행 후, 재실행/반복 테스트 시 사용
// - FK(외래 키) 제약 조건을 고려하여 "자식 → 부모" 순서로 삭제
//   예) PostLike/Comment가 Post/User를 참조하므로 먼저 제거해야 함
/////////////////////////////////////////////////////////
async function cleanUp() {
  // (자식) 좋아요 → 댓글 → 게시글 → 프로필 → 유저 순으로 정리
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  try {
    // 단일 댓글 삭제:
    // - 없으면 P2025 예외 발생
    // await runDelete(920);

    // 사용자 댓글 일괄 삭제:
    // - 대상이 없어도 예외 없이 { count: 0 } 반환
    await runDeleteMany(137);

    // 필요 시 전체 테스트 데이터 정리
    // await cleanUp();
  } catch (e) {
    // 운영 코드라면 에러 타입별 분기 처리(예: P2025) 권장
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

main();
