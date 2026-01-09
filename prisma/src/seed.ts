import { prisma, pool } from './shared/database';

/**
 * [유틸] min~max 범위의 정수 랜덤 생성 (양 끝 포함)
 * - 예: randInt(0, 2) -> 0/1/2 중 하나
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * [유틸] 배열에서 임의의 원소 1개 선택
 * - 빈 배열이면 런타임 에러가 날 수 있으므로, 호출자는 arr.length > 0 보장 필요
 */
function pickOne<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/**
 * [유틸] 배열에서 중복 없이 count개를 랜덤으로 선택
 * - 원본 배열을 훼손하지 않기 위해 복사본(copy)을 사용
 * - count가 배열 길이보다 크면 가능한 만큼만 반환
 */
function pickManyUnique<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  const n = Math.min(count, copy.length);

  for (let i = 0; i < n; i++) {
    const idx = randInt(0, copy.length - 1);
    out.push(copy[idx]);
    copy.splice(idx, 1); // 선택한 원소 제거 -> 중복 방지
  }
  return out;
}

/**
 * [설정] seed 데이터 볼륨을 조절하는 파라미터
 * - users: 생성할 사용자 수
 * - maxPostsPerUser: 사용자당 최대 게시글 수 (0~N 랜덤)
 * - maxCommentsPerPost: 게시글당 최대 댓글 수 (0~N 랜덤)
 * - maxLikesPerPost: 게시글당 최대 좋아요 수 (0~N 랜덤, 단 유저 수를 넘지 않게 제한)
 * - withSoftDeletedSamples: deletedAt 샘플 데이터를 일부 생성할지 여부
 */
const config = {
  users: 20,
  maxPostsPerUser: 5,
  maxCommentsPerPost: 8,
  maxLikesPerPost: 10,
  withSoftDeletedSamples: true,
};

async function main() {
  /**
   * [초기화] 기존 데이터 삭제
   * - FK 제약 때문에 "자식 테이블 -> 부모 테이블" 순서로 삭제해야 안전합니다.
   * - PostLike/Comment가 Post/User를 참조하므로 먼저 제거합니다.
   */
  await prisma.postLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  /**
   * [1] User 생성 (벌크)
   * - createManyAndReturn: 여러 건 생성 + 생성된 레코드 배열을 반환
   * - withSoftDeletedSamples가 true면 일부 유저에 deletedAt을 세팅해서 소프트삭제 샘플 생성
   */
  const createdUsers = await prisma.user.createManyAndReturn({
    data: Array.from({ length: config.users }).map((_, idx) => {
      const i = idx + 1;

      return {
        email: `user${String(i).padStart(3, '0')}@example.com`,
        displayName: `User ${String(i).padStart(3, '0')}`,
        // 소프트 삭제 샘플: 17번째마다 deletedAt을 채움(임의 규칙)
        deletedAt: config.withSoftDeletedSamples && i % 17 === 0 ? new Date() : null,
      };
    }),
  });

  /**
   * 후속 데이터 생성에서 참조할 userId 목록
   * - Comment/Like에서 작성자/좋아요 유저를 랜덤으로 선택할 때 사용
   */
  const userIds = createdUsers.map((u) => u.id);

  /**
   * [2] Profile 생성 (벌크)
   * - 유저당 70% 확률로 프로필 생성
   * - Profile.userId는 @unique 이므로 유저당 최대 1개만 생성해야 함
   * - withSoftDeletedSamples가 true면 일부 profile에 deletedAt 샘플 생성
   */
  const profileData = createdUsers
    .filter(() => Math.random() < 0.7)
    .map((u) => ({
      userId: u.id,
      bio: `안녕하세요. ${u.displayName ?? '익명'}의 bio 입니다.`,
      // 소프트 삭제 샘플: 19의 배수 id에 deletedAt 세팅(임의 규칙)
      deletedAt: config.withSoftDeletedSamples && u.id % 19 === 0 ? new Date() : null,
    }));

  if (profileData.length) {
    await prisma.profile.createMany({ data: profileData });
  }

  /**
   * [3] Post 생성 (개별 create)
   * - 유저마다 0~maxPostsPerUser개를 랜덤 생성
   * - Post는 authorId(User.id)를 참조하므로, 먼저 User를 만들어야 함
   *
   * 주의:
   * - 여기서는 posts의 id가 필요해서 개별 create로 생성(리턴값 필요)
   * - 성능이 중요하면 createMany로 bulk insert 후 id를 얻는 전략을 별도로 구성할 수 있음
   */
  const posts: { id: number; authorId: number }[] = [];

  for (const u of createdUsers) {
    const postCount = randInt(0, config.maxPostsPerUser);

    for (let j = 1; j <= postCount; j++) {
      const created = await prisma.post.create({
        data: {
          title: `Post ${u.id}-${j}`,
          content: `Content for Post ${u.id}-${j}`,
          // 발행 여부도 랜덤으로 일부 true
          published: Math.random() < 0.6,
          authorId: u.id,
          // 소프트 삭제 샘플: 약 5% 확률로 deletedAt 채움
          deletedAt: config.withSoftDeletedSamples && Math.random() < 0.05 ? new Date() : null,
        },
        // 이후 comment/like 생성을 위해 id가 필요
        select: { id: true, authorId: true },
      });

      posts.push(created);
    }
  }

  /**
   * [4] Comment 생성 (벌크)
   * - 게시글마다 0~maxCommentsPerPost개 랜덤 생성
   * - 작성자(authorId)는 userIds 중에서 랜덤 선택
   * - postId는 해당 게시글 id를 사용
   */
  const commentCreates = posts.flatMap((p) => {
    const commentCount = randInt(0, config.maxCommentsPerPost);

    return Array.from({ length: commentCount }).map(() => ({
      postId: p.id,
      authorId: pickOne(userIds),
      content: pickOne([
        '좋은 글이네요.',
        '도움이 많이 됐습니다.',
        '추가 설명이 있으면 좋겠습니다.',
        '이 부분은 조금 다르게 생각합니다.',
        '감사합니다!',
      ]),
      // 소프트 삭제 샘플: 약 3% 확률
      deletedAt: config.withSoftDeletedSamples && Math.random() < 0.03 ? new Date() : null,
    }));
  });

  if (commentCreates.length) {
    await prisma.comment.createMany({ data: commentCreates });
  }

  /**
   * [5] PostLike 생성 (벌크)
   * - PostLike는 @@id([userId, postId]) 복합 PK이므로 (userId, postId) 조합 중복이 불가능
   * - 각 게시글마다 0~maxLikesPerPost명의 유저를 "중복 없이" 선택하여 좋아요 생성
   * - pickManyUnique로 유저 중복을 방지
   * - createMany 옵션 skipDuplicates: true로 혹시 모를 충돌도 방어
   */
  const likeCreates = posts.flatMap((p) => {
    const likeCount = randInt(0, Math.min(config.maxLikesPerPost, userIds.length));
    const likerIds = pickManyUnique(userIds, likeCount);

    return likerIds.map((userId) => ({
      userId,
      postId: p.id,
      // 소프트 삭제 샘플: 약 2% 확률
      deletedAt: config.withSoftDeletedSamples && Math.random() < 0.02 ? new Date() : null,
    }));
  });

  if (likeCreates.length) {
    await prisma.postLike.createMany({ data: likeCreates, skipDuplicates: true });
  }

  /**
   * [요약 출력]
   * - 실행마다 랜덤이므로 실제 생성량 확인용
   */
  console.log('Seed completed:', {
    users: createdUsers.length,
    profiles: profileData.length,
    posts: posts.length,
    comments: commentCreates.length,
    likes: likeCreates.length,
  });
}

/**
 * 엔트리 포인트
 * - seed는 보통 단발성 스크립트이므로, 종료 시점에 prisma 연결을 끊는 것이 일반적
 * - shared/database가 싱글톤 prisma를 export 하더라도, seed 프로세스 자체는 종료되므로 disconnect가 안전
 */
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    // databse prisma와 pool을 종료한다.
    await prisma.$disconnect();
    await pool.end();
  });
