import { prisma, pool } from '../shared/database';
import { Prisma } from '../generated/client';

// Nested Write: 여러 테이블의 데이터를 한 번의 API 호출로 안전하게 처리합니다.
// 특징: 내부적으로 자동 트랜잭션이 적용되어, 하나라도 실패하면 전체가 롤백됩니다.
async function createPostWithInitialComment(userId: number) {
  // 1. 최상위 작업: 'User' 테이블의 특정 레코드를 수정(update)합니다.
  const user = await prisma.user.update({
    where: { id: userId }, // 수정할 유저의 ID 조건
    data: {
      // 2. 유저 정보 수정: 해당 유저의 필드를 직접 업데이트합니다.
      displayName: 'Active Author',

      // 3. 관계형 중첩 생성 (User -> Post):
      // 유저 수정과 동시에 해당 유저와 연결된 'Post' 레코드를 생성합니다.
      posts: {
        create: {
          title: 'Prisma 7 Guide',
          content: 'Transaction tips',

          // 4. 관계형 중첩 생성 (Post -> Comment):
          // 게시글 생성과 동시에 해당 게시글에 속한 'Comment' 레코드를 생성합니다.
          // depth가 깊어져도 하나의 흐름으로 이어집니다.
          comments: {
            create: {
              content: 'First comment!',
              // 작성자 ID를 현재 작업 중인 userId와 연결합니다.
              authorId: userId,
            },
          },
        },
      },
    },
    // 5. 결과 반환 설정:
    // 생성/수정된 데이터를 즉시 확인하기 위해 관계된 데이터를 모두 포함(fetch)합니다.
    include: {
      posts: {
        include: {
          comments: true, // 생성된 댓글까지 깊게(deep) 가져옵니다.
        },
      },
    },
  });

  // 최종 결과 출력: 복잡한 객체 구조를 끝까지 확인하기 위해 depth: null 옵션을 사용합니다.
  console.dir(user, { depth: null });
}

async function signupUser(email: string, bio: string) {
  // prisma.$transaction을 사용하여 여러 작업을 '하나의 단위'로 묶습니다.
  // 이 블록 안의 작업 중 하나라도 실패하면 모든 변경사항이 취소(Rollback)되어 데이터 무결성을 보장합니다.
  const { user, profile } = await prisma.$transaction(async (tx) => {
    // 1. User 테이블에 새로운 레코드 생성
    const user = await tx.user.create({
      data: {
        email,
        // 이메일 주소에서 @ 앞부분만 추출하여 초기 닉네임으로 설정 (예: 'test@naver.com' -> 'test')
        displayName: email.split('@')[0],
      },
    });

    // 2. Profile 테이블에 새로운 레코드 생성 및 위에서 생성된 User와 연결
    const profile = await tx.profile.create({
      data: {
        bio,
        // 중요: 앞선 단계에서 생성된 user 객체의 id를 외래키(Foreign Key)로 사용합니다.
        // 이를 통해 DB 레벨에서 두 데이터 간의 1:1 또는 1:N 관계가 형성됩니다.
        userId: user.id,
      },
    });

    // 트랜잭션 성공 시 외부로 반환할 데이터 구성
    return { user, profile };
  });

  // 모든 작업이 성공적으로 완료된 후 콘솔에 결과 출력
  console.log('생성된 유저 정보:', user);
  console.log('생성된 프로필 정보:', profile);
}

async function seedPostWithEngagement(authorId: number, title: string) {
  // prisma.$transaction을 사용하여 내부의 모든 작업이 '전부 성공'하거나 '전부 실패'하도록 보장합니다.
  // 하나라도 실패하면 데이터베이스는 함수 실행 전 상태로 되돌아갑니다(Rollback).
  const { post, comment } = await prisma.$transaction(async (tx) => {
    // STEP 1: 새로운 게시글 레코드 생성
    // tx는 트랜잭션 전용 Prisma Client 인스턴스입니다.
    const post = await tx.post.create({
      data: {
        title,
        content: '반갑습니다. 첫 게시글입니다.',
        authorId,
        published: true, // 생성과 동시에 바로 공개 상태로 설정
      },
    });

    // STEP 2: 게시글 작성 시 본인이 자동으로 '좋아요'를 누르도록 설정
    // post.id는 바로 위에서 생성된 게시글의 식별자를 참조합니다.
    await tx.postLike.create({
      data: {
        userId: authorId,
        postId: post.id,
      },
    });

    // STEP 3: 시스템 자동 환영 댓글 작성
    // 게시글 생성이 완료된 후 해당 게시글에 종속된 댓글을 생성합니다.
    const comment = await tx.comment.create({
      data: {
        content: '게시글 등록을 축하합니다!',
        authorId,
        postId: post.id,
      },
    });

    // 모든 작업이 성공하면 생성된 데이터를 객체 형태로 반환합니다.
    return { post, comment };
  });

  // 트랜잭션이 성공적으로 완료(Commit)된 후 콘솔에 결과를 출력합니다.
  console.log('생성된 게시글:', post);
  console.log('생성된 댓글:', comment);
}

async function safeUpdateUserAndPost(postId: number) {
  try {
    // 1. Prisma 트랜잭션 시작
    // tx: 트랜잭션 내에서 사용할 전용 Prisma Client 인스턴스
    await prisma.$transaction(
      async (tx) => {
        // 2. 게시글 정보 조회 (데이터 스냅샷 확보)
        // 트랜잭션 내부에서 조회하여 데이터의 일관성을 유지합니다.
        const post = await tx.post.findUnique({ where: { id: postId } });

        console.log('조회된 게시글:', post);

        // 3. [비즈니스 로직 검증] 게시글 상태 체크
        // 존재하지 않거나, 이미 삭제된(soft delete) 게시글인 경우 에러를 발생시킵니다.
        if (!post || post.deletedAt) {
          // 여기서 throw를 던지면 트랜잭션 내의 모든 작업이 취소(Rollback)됩니다.
          throw new Error('ALREADY_DELETED_POST');
        }

        // 4. 게시글 정보 수정
        // 조회된 정보를 바탕으로 제목을 수정하고 삭제 일시를 기록합니다.
        await tx.post.update({
          where: { id: postId },
          data: {
            title: '[수정됨] ' + post.title,
            deletedAt: new Date(),
          },
        });

        // 블록 끝까지 에러 없이 도달하면 모든 변경사항이 DB에 최종 반영(Commit)됩니다.
      },
      {
        // 5. 격리 수준(Isolation Level) 설정
        // ReadCommitted: 다른 트랜잭션에서 커밋된 데이터만 읽도록 설정하여 부정확한 읽기를 방지합니다.
        isolationLevel: 'ReadCommitted',
      },
    );
  } catch (error) {
    // 6. 에러 핸들링 (트랜잭션이 실패하거나 롤백된 경우 실행)

    // A. Prisma 엔진에서 발생하는 구조적 에러 처리
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        console.error('에러: 업데이트할 레코드를 찾을 수 없습니다 (P2025).');
      } else if (error.code === 'P2002') {
        console.error('에러: 고유 제약 조건 위반이 발생했습니다 (P2002).');
      }
    }
    // B. 위에서 직접 던진 커스텀 비즈니스 로직 에러 처리
    else if (error instanceof Error && error.message === 'ALREADY_DELETED_POST') {
      console.warn('알림: 이미 삭제된 게시글이므로 작업을 취소하고 롤백했습니다.');
    }
    // C. 기타 예상치 못한 런타임 에러
    else {
      console.error('알 수 없는 에러 발생:', error);
    }

    // 7. 최종 에러 전파
    // 호출한 상위 함수에서 에러 발생 여부를 알 수 있도록 다시 던집니다.
    throw error;
  }
}

async function main() {
  try {
    // await createPostWithInitialComment(181);
    // await signupUser('han@hankang.com', '프로필 소개 입니다.');
    // await seedPostWithEngagement(182, '글 타이틀...');
    await safeUpdateUserAndPost(268);
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
