import { prisma, pool } from '../shared/database';

import { Prisma } from '../generated/client';

/**
 * ========================================
 * User + Profile LEFT JOIN (deletedAt 제외)
 * ========================================
 */
type UserWithProfileRow = {
  id: number;
  email: string;
  displayName: string | null;
  userCreatedAt: Date;
  profileId: number | null;
  bio: string | null;
};

async function findUsersWithProfiles(limit: number = 20) {
  console.log('\n=== User + Profile LEFT JOIN (deletedAt 제외) 예시 ===');
  const users = await prisma.$queryRaw<UserWithProfileRow[]>(Prisma.sql`
    SELECT
      u.id,
      u.email,
      u.display_name as "displayName",
      u.created_at AS "userCreatedAt",
      p.id AS "profileId",
      p.bio
    FROM study.users u
    LEFT JOIN study.profiles p ON p.user_id = u.id AND p.deleted_at IS NULL
    WHERE u.deleted_at IS NULL
    ORDER BY u.created_at DESC
    LIMIT ${limit}
    `);

  console.log('\n=== User + Profile LEFT JOIN (deletedAt 제외) 실행 결과 ===');
  console.dir(users, { depth: null });
  return users;
}

/**
 * ========================================
 * 페이징: 복합 커서(createdAt,id) 기반 Keyset Pagination
 * ========================================
 */
type PostPageRow = {
  id: number;
  createdAt: Date;
  title: string;
  published: boolean;
  authorId: number;
};

async function fetchPostsKeyset(params: {
  published?: boolean;
  take: number;
  cursor?: { createdAt: Date; id: number }; // 마지막 row의 createdAt/id
}) {
  const { published, take, cursor } = params;

  const publishedFilter =
    published === undefined
      ? Prisma.sql`` // no-op
      : Prisma.sql`AND p.published = ${published}`;

  const cursorFilter = cursor
    ? Prisma.sql`
        AND (p.created_at, p.id) < (${cursor.createdAt}, ${cursor.id})
      `
    : Prisma.sql``;

  const posts = await prisma.$queryRaw<PostPageRow[]>(Prisma.sql`
    SELECT
      p.id,
      p.created_at as "createdAt",
      p.title,
      p.published,
      p.author_id as "authorId"
    FROM study.posts p
    WHERE p.deleted_at IS NULL
      ${publishedFilter}
      ${cursorFilter}
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT ${take}
  `);

  console.dir(posts, { depth: null });
  return posts;
}

/**
 * ========================================
 * 메인 실행
 * ========================================
 */
async function main() {
  try {
    // await findUsersWithProfiles(5);
    const page1 = await fetchPostsKeyset({ take: 20 });
  } catch (error) {
    console.log(error);
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
