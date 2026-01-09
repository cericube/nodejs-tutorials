import { prisma, pool } from '../shared/database';

async function exam1() {
  const userCard = await prisma.user.findUnique({
    where: { id: 135 },
    select: {
      id: true,
      displayName: true,
      // Profile 전체가 아닌 bio만 콕 집어서 가져오기 (관계의 select)
      profile: {
        select: { bio: true },
      },
    },
  });

  console.log(userCard);
}

async function exam2() {
  const userCard = await prisma.user.findUnique({
    where: { id: 135 },
    include: {
      profile: {
        select: { bio: true },
      },
    },
  });

  console.log(userCard);
}

// ========================================
// 실습 메인 함수
// ========================================
async function main() {
  try {
    // 실제 실습 로직 실행
    // await exam1();
    await exam2();
  } catch (error) {
    // 실행 중 발생한 에러를 콘솔에 출력
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

// 스크립트 실행 시작점(entry point)
main();
