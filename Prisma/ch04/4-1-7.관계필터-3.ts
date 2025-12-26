import { prisma, pool } from '../shared/database';

// ========================================
// 다대다(M:N) 관계 필터 - PostLike
// - Post(게시글) : PostLike(좋아요) : User(사용자) 형태의 조인(연결) 테이블이 있다고 가정
// - likes 는 Post -> PostLike 관계 필드 (배열/리스트)로, "이 게시글에 달린 좋아요들"을 의미
// - deletedAt 을 소프트 삭제(취소) 플래그로 사용
//   - deletedAt: null  => "현재 유효한 좋아요(취소되지 않음)"
// ========================================

async function exam1() {
  console.log('--- 1-1: 특정 사용자가 좋아요한 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // [관계 필터: some]
      // likes(PostLike 목록) 중에서 아래 조건을 만족하는 레코드가 "하나라도" 있으면 이 Post를 포함
      // 즉, "userId=131 사용자가 유효한(취소되지 않은) 좋아요를 누른 게시글"만 조회
      likes: {
        some: {
          userId: 131, // 좋아요를 누른 사용자가 131인 경우
          deletedAt: null, // 좋아요가 취소되지 않은(소프트 삭제되지 않은) 경우만
        },
      },

      // [Post 자체 소프트 삭제 필터]
      // 게시글이 소프트 삭제되지 않은 것만 조회
      deletedAt: null,
    },

    select: {
      id: true,
      title: true,

      // [관계 데이터도 함께 조회]
      // 조건에 맞는 PostLike만 select 해서, 실제로 "해당 사용자 좋아요"가 붙어 있음을 결과로 확인 가능
      likes: {
        where: {
          deletedAt: null, // 유효한 좋아요만
          userId: 131, // 그 중에서도 userId=131의 좋아요만
        },
        select: {
          userId: true, // 누가 좋아요했는지(여기서는 131만 나옴)
        },
      },
    },

    take: 10, // 최대 10개만 조회(페이지네이션의 가장 단순한 형태)
  });

  console.log('--- 1-1: 특정 사용자가 좋아요한 게시글 조회  결과---');
  console.log(JSON.stringify(posts, null, 2));
}

async function exam2() {
  console.log('--- 1-2: 좋아요가 없는 게시글 조회 ---');

  const posts = await prisma.post.findMany({
    where: {
      // [관계 필터: none]
      // likes(PostLike 목록) 중에서 아래 조건을 만족하는 레코드가 "하나도 없어야" 이 Post를 포함
      // 즉, "유효한 좋아요(deletedAt=null)가 0개인 게시글"만 조회
      // 주의: 취소된 좋아요(deletedAt != null)는 '유효한 좋아요'가 아니므로 카운트에서 제외됨
      likes: {
        none: {
          deletedAt: null, // 유효한 좋아요가 하나도 없는 게시글
        },
      },

      // [Post 자체 소프트 삭제 필터]
      // 게시글이 소프트 삭제되지 않은 것만
      deletedAt: null,
    },

    select: {
      id: true,
      title: true,

      // [_count 집계]
      // 각 게시글마다 "유효한 좋아요 개수"를 함께 반환
      // (none 조건으로 이미 0개만 나오겠지만, 학습/검증용으로 결과에 포함시키는 패턴)
      _count: {
        select: {
          likes: {
            where: {
              deletedAt: null, // 유효한 좋아요만 카운트
            },
          },
        },
      },
    },

    take: 10, // 최대 10개 조회
  });

  console.log('--- 1-2: 좋아요가 없는 게시글 조회 결과 ---');
  console.log(JSON.stringify(posts, null, 2));
}

// ========================================
// 실습 메인 함수
// - try/catch/finally 로 안전하게 연결 해제까지 보장
// - prisma.$disconnect(): Prisma Client 연결 종료
// - pool.end(): (node-postgres 등) 커넥션 풀 종료
// ========================================
async function main() {
  try {
    // await exam1(); // "특정 사용자가 좋아요한 게시글" 실습 실행
    await exam2(); // "유효한 좋아요가 없는 게시글" 실습 실행
  } catch (error) {
    console.log('Error in main():', error);
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
