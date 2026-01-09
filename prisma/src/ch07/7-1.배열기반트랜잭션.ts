import { prisma, pool } from '../shared/database';

async function createUserWithProfile() {
  console.log('--- 사용자와 프로필 동시 생성 ---');

  const [user, profile] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'trans@example.com',
        displayName: '트랜잭션 사용자',
      },
    }),
    //
    prisma.profile.create({
      data: {
        bio: '트랜잭션 생성자 입니다.',
        user: {
          connect: { email: 'trans@example.com' },
        },
      },
    }),
  ]);

  console.log('--- 사용자와 프로필 동시 생성  종료---');
  console.log(user);
  console.log(profile);
}

async function createUserWithProfileFail() {
  console.log('--- 사용자와 프로필 동시 생성 실패---');

  const [user, profile] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'trans_fail@example.com',
        displayName: '트랜잭션 실패 사용자',
      },
    }),
    //
    prisma.profile.create({
      data: {
        bio: '트랜잭션 생성자 입니다.',
        user: {
          connect: { email: 'trans@example.cddom' },
        },
      },
    }),
  ]);

  console.log('--- 사용자와 프로필 동시 생성  실패 종료---');
  console.log(user);
  console.log(profile);
}

async function main(): Promise<void> {
  try {
    //await createUserWithProfile();
    await createUserWithProfileFail();
  } catch (error) {
    console.error('Transaction error:', error);
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

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
