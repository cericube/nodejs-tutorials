import { prisma, pool } from '../shared/database';
import { Prisma } from '../generated/client';

async function register(email: string, name: string, bio: string) {
  const { user, profile } = await prisma.$transaction(
    async (tx) => {
      //1. 유저 생성
      const user = await tx.user.create({
        data: {
          email: email,
          displayName: name,
        },
      });

      console.log('강제 지연....... 시작...');
      await new Promise((res) => setTimeout(res, 10000));

      //
      //2. 프로필 생성
      const profile = await tx.profile.create({
        data: {
          bio: bio,
          user: {
            connect: {
              email: email,
            },
          },
        },
      });
      return { user, profile };
    },
    {
      timeout: 5000,
      maxWait: 2000,
    },
  );

  console.log('--- 사용자 , 프로필 등록 예시 결과 ---');
  console.dir(user, { depth: null });
  console.dir(profile, { depth: null });
  return { user, profile };
}

async function main() {
  try {
    await register('지연요청@example.com', '지연_이름', '지연 소개 데이터, ');
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // P2002: Unique constraint failed (예: 이미 존재하는 이메일)
      if (error.code === 'P2002') {
        console.error('이미 등록된 이메일입니다.');
      }
      // P2028: 트랜잭션 타임아웃 관련
      if (error.code === 'P2028') {
        console.error('서버 부하로 인해 요청이 취소되었습니다. 잠시 후 다시 시도해주세요.');
      }
    }
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
