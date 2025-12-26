-- ============================================================================
-- SQL 실습용 쿼리 모음
-- 테이블 구조: users, profiles, posts, comments, post_likes
-- ============================================================================

-- ============================================================================
-- 1. 기본 SELECT 쿼리
-- ============================================================================

-- 1-1. 모든 사용자 조회
-- 설명: users 테이블의 모든 레코드를 조회합니다.
SELECT * FROM users;

-- 1-2. 특정 컬럼만 조회
-- 설명: 사용자의 이메일과 표시 이름만 조회합니다.
SELECT email, display_name FROM users;

-- 1-3. 삭제되지 않은 사용자만 조회 (소프트 딜리트 적용)
-- 설명: deleted_at이 NULL인 레코드만 조회하여 활성 사용자만 가져옵니다.
SELECT * FROM users
WHERE deleted_at IS NULL;

-- 1-4. 공개된 게시물만 조회
-- 설명: published가 TRUE인 게시물만 조회합니다.
SELECT * FROM posts
WHERE published = TRUE;


-- ============================================================================
-- 2. WHERE 절을 활용한 필터링
-- ============================================================================

-- 2-1. 특정 이메일로 사용자 검색
-- 설명: 이메일 주소가 정확히 일치하는 사용자를 찾습니다.
SELECT * FROM users
WHERE email = 'example@email.com';

-- 2-2. LIKE를 사용한 패턴 매칭
-- 설명: 이메일에 'gmail'이 포함된 사용자를 검색합니다.
SELECT * FROM users
WHERE email LIKE '%gmail%';

-- 2-3. 특정 날짜 이후 생성된 게시물 조회
-- 설명: 2024년 1월 1일 이후 작성된 게시물을 조회합니다.
SELECT * FROM posts
WHERE created_at >= '2024-01-01';

-- 2-4. 여러 조건을 AND로 결합
-- 설명: 공개되었고 삭제되지 않은 게시물만 조회합니다.
SELECT * FROM posts
WHERE published = TRUE
  AND deleted_at IS NULL;

-- 2-5. OR 조건 사용
-- 설명: 공개되었거나 특정 작성자의 게시물을 조회합니다.
SELECT * FROM posts
WHERE published = TRUE
   OR author_id = 1;

-- 2-6. IN 연산자 사용
-- 설명: 여러 작성자 ID 중 하나에 해당하는 게시물을 조회합니다.
SELECT * FROM posts
WHERE author_id IN (1, 2, 3);

-- 2-7. BETWEEN 사용
-- 설명: 특정 날짜 범위 내에 생성된 게시물을 조회합니다.
SELECT * FROM posts
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';


-- ============================================================================
-- 3. ORDER BY를 활용한 정렬
-- ============================================================================

-- 3-1. 최신 게시물부터 조회 (내림차순)
-- 설명: created_at을 기준으로 내림차순 정렬하여 최신 게시물이 먼저 나타납니다.
SELECT * FROM posts
ORDER BY created_at DESC;

-- 3-2. 이름순으로 사용자 정렬 (오름차순)
-- 설명: display_name을 기준으로 오름차순 정렬합니다.
SELECT * FROM users
ORDER BY display_name ASC;

-- 3-3. 여러 컬럼으로 정렬
-- 설명: 먼저 author_id로 정렬하고, 같은 작성자 내에서는 created_at으로 정렬합니다.
SELECT * FROM posts
ORDER BY author_id ASC, created_at DESC;


-- ============================================================================
-- 4. LIMIT과 OFFSET을 활용한 페이지네이션
-- ============================================================================

-- 4-1. 최신 게시물 10개만 조회
-- 설명: 결과를 10개로 제한합니다 (첫 페이지).
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 10;

-- 4-2. 페이지네이션 (2페이지 조회)
-- 설명: 11번째부터 20번째 레코드를 조회합니다 (페이지당 10개 기준).
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;


-- ============================================================================
-- 5. 집계 함수 (Aggregate Functions)
-- ============================================================================

-- 5-1. 전체 사용자 수 조회
-- 설명: COUNT() 함수로 전체 레코드 수를 계산합니다.
SELECT COUNT(*) AS total_users FROM users;

-- 5-2. 삭제되지 않은 활성 사용자 수
-- 설명: WHERE 조건과 함께 COUNT를 사용합니다.
SELECT COUNT(*) AS active_users FROM users
WHERE deleted_at IS NULL;

-- 5-3. 작성자별 게시물 수 계산
-- 설명: GROUP BY를 사용하여 각 작성자가 작성한 게시물 수를 계산합니다.
SELECT author_id, COUNT(*) AS post_count
FROM posts
GROUP BY author_id;

-- 5-4. 게시물별 댓글 수 계산
-- 설명: 각 게시물에 달린 댓글 수를 계산합니다.
SELECT post_id, COUNT(*) AS comment_count
FROM comments
GROUP BY post_id;

-- 5-5. 게시물별 좋아요 수 계산
-- 설명: post_likes 테이블에서 각 게시물의 좋아요 수를 계산합니다.
SELECT post_id, COUNT(*) AS like_count
FROM post_likes
WHERE deleted_at IS NULL
GROUP BY post_id;

-- 5-6. HAVING을 사용한 그룹 필터링
-- 설명: 게시물을 3개 이상 작성한 작성자만 조회합니다.
-- (WHERE는 그룹화 전 필터링, HAVING은 그룹화 후 필터링)
SELECT author_id, COUNT(*) AS post_count
FROM posts
GROUP BY author_id
HAVING COUNT(*) >= 3;


-- ============================================================================
-- 6. JOIN 쿼리 - INNER JOIN
-- ============================================================================

-- 6-1. 사용자와 프로필 조인
-- 설명: users와 profiles를 user_id로 조인하여 사용자 정보와 프로필을 함께 조회합니다.
SELECT u.id, u.email, u.display_name, p.bio
FROM users u
INNER JOIN profiles p ON u.id = p.user_id
WHERE u.deleted_at IS NULL
  AND p.deleted_at IS NULL;

-- 6-2. 게시물과 작성자 정보 함께 조회
-- 설명: posts와 users를 조인하여 게시물과 작성자 정보를 함께 가져옵니다.
SELECT p.id, p.title, p.content, p.created_at,
       u.email, u.display_name
FROM posts p
INNER JOIN users u ON p.author_id = u.id
WHERE p.deleted_at IS NULL;

-- 6-3. 댓글, 게시물, 작성자 정보 함께 조회
-- 설명: 세 개의 테이블을 조인하여 댓글, 댓글이 달린 게시물, 댓글 작성자 정보를 조회합니다.
SELECT c.id, c.content AS comment_content, c.created_at,
       p.title AS post_title,
       u.display_name AS commenter_name
FROM comments c
INNER JOIN posts p ON c.post_id = p.id
INNER JOIN users u ON c.author_id = u.id
WHERE c.deleted_at IS NULL;

-- 6-4. 게시물의 좋아요와 사용자 정보 조회
-- 설명: post_likes와 users를 조인하여 어떤 사용자가 어떤 게시물에 좋아요를 눌렀는지 조회합니다.
SELECT pl.post_id, pl.user_id, u.display_name, pl.created_at
FROM post_likes pl
INNER JOIN users u ON pl.user_id = u.id
WHERE pl.deleted_at IS NULL;


-- ============================================================================
-- 7. LEFT JOIN (외부 조인)
-- ============================================================================

-- 7-1. 모든 사용자와 프로필 조회 (프로필이 없어도 포함)
-- 설명: LEFT JOIN을 사용하여 프로필이 없는 사용자도 결과에 포함됩니다.
-- 프로필이 없으면 p.bio는 NULL로 표시됩니다.
SELECT u.id, u.email, u.display_name, p.bio
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.deleted_at IS NULL;

-- 7-2. 모든 게시물과 댓글 수 조회 (댓글이 없어도 포함)
-- 설명: 댓글이 없는 게시물도 포함하고, COALESCE로 NULL을 0으로 처리합니다.
SELECT p.id, p.title, COALESCE(COUNT(c.id), 0) AS comment_count
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.title;


-- ============================================================================
-- 8. 서브쿼리 (Subquery)
-- ============================================================================

-- 8-1. 가장 많은 게시물을 작성한 사용자 찾기
-- 설명: 서브쿼리로 최대 게시물 수를 구하고, 그 수와 일치하는 작성자를 찾습니다.
SELECT author_id, COUNT(*) AS post_count
FROM posts
GROUP BY author_id
HAVING COUNT(*) = (
    SELECT MAX(post_count)
    FROM (
        SELECT COUNT(*) AS post_count
        FROM posts
        GROUP BY author_id
    ) AS counts
);

-- 8-2. 평균보다 많은 댓글을 받은 게시물 찾기
-- 설명: 서브쿼리로 게시물당 평균 댓글 수를 계산하고, 그보다 많은 댓글을 받은 게시물을 조회합니다.
SELECT p.id, p.title, COUNT(c.id) AS comment_count
FROM posts p
LEFT JOIN comments c ON p.id = c.post_id
GROUP BY p.id, p.title
HAVING COUNT(c.id) > (
    SELECT AVG(comment_count)
    FROM (
        SELECT COUNT(*) AS comment_count
        FROM comments
        GROUP BY post_id
    ) AS avg_comments
);

-- 8-3. 특정 사용자가 좋아요를 누른 게시물 조회
-- 설명: IN과 서브쿼리를 사용하여 특정 사용자가 좋아요한 게시물을 찾습니다.
SELECT * FROM posts
WHERE id IN (
    SELECT post_id
    FROM post_likes
    WHERE user_id = 1 AND deleted_at IS NULL
);

-- 8-4. 댓글이 없는 게시물 찾기
-- 설명: NOT EXISTS를 사용하여 댓글이 하나도 없는 게시물을 찾습니다.
SELECT * FROM posts p
WHERE NOT EXISTS (
    SELECT 1 FROM comments c
    WHERE c.post_id = p.id AND c.deleted_at IS NULL
);


-- ============================================================================
-- 9. 복합 쿼리 (실전 예제)
-- ============================================================================

-- 9-1. 인기 게시물 TOP 10 (좋아요 + 댓글 수 기준)
-- 설명: 좋아요 수와 댓글 수를 합산하여 인기도를 계산하고 상위 10개를 조회합니다.
SELECT p.id, p.title, p.created_at,
       u.display_name AS author_name,
       COALESCE(COUNT(DISTINCT pl.user_id), 0) AS like_count,
       COALESCE(COUNT(DISTINCT c.id), 0) AS comment_count,
       COALESCE(COUNT(DISTINCT pl.user_id), 0) + COALESCE(COUNT(DISTINCT c.id), 0) AS popularity_score
FROM posts p
INNER JOIN users u ON p.author_id = u.id
LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.deleted_at IS NULL
LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL AND p.published = TRUE
GROUP BY p.id, p.title, p.created_at, u.display_name
ORDER BY popularity_score DESC
LIMIT 10;

-- 9-2. 사용자별 활동 통계 (게시물, 댓글, 좋아요)
-- 설명: 각 사용자의 게시물 수, 댓글 수, 좋아요 수를 한 번에 조회합니다.
SELECT u.id, u.display_name,
       COALESCE(post_stats.post_count, 0) AS total_posts,
       COALESCE(comment_stats.comment_count, 0) AS total_comments,
       COALESCE(like_stats.like_count, 0) AS total_likes
FROM users u
LEFT JOIN (
    SELECT author_id, COUNT(*) AS post_count
    FROM posts
    WHERE deleted_at IS NULL
    GROUP BY author_id
) post_stats ON u.id = post_stats.author_id
LEFT JOIN (
    SELECT author_id, COUNT(*) AS comment_count
    FROM comments
    WHERE deleted_at IS NULL
    GROUP BY author_id
) comment_stats ON u.id = comment_stats.author_id
LEFT JOIN (
    SELECT user_id, COUNT(*) AS like_count
    FROM post_likes
    WHERE deleted_at IS NULL
    GROUP BY user_id
) like_stats ON u.id = like_stats.user_id
WHERE u.deleted_at IS NULL
ORDER BY total_posts DESC;

-- 9-3. 최근 7일간 가장 활발한 게시물 (댓글 수 기준)
-- 설명: CURRENT_DATE를 사용하여 최근 7일간의 게시물 중 댓글이 많은 순으로 조회합니다.
SELECT p.id, p.title, p.created_at,
       u.display_name AS author_name,
       COUNT(c.id) AS recent_comment_count
FROM posts p
INNER JOIN users u ON p.author_id = u.id
LEFT JOIN comments c ON p.id = c.post_id
    AND c.created_at >= CURRENT_DATE - INTERVAL '7 days'
    AND c.deleted_at IS NULL
WHERE p.deleted_at IS NULL
  AND p.published = TRUE
  AND p.created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY p.id, p.title, p.created_at, u.display_name
ORDER BY recent_comment_count DESC
LIMIT 10;

-- 9-4. 상호작용이 많은 사용자 쌍 찾기 (댓글 기준)
-- 설명: 어떤 사용자가 누구의 게시물에 가장 많이 댓글을 달았는지 분석합니다.
SELECT p.author_id AS post_author_id,
       pa.display_name AS post_author_name,
       c.author_id AS commenter_id,
       ca.display_name AS commenter_name,
       COUNT(*) AS interaction_count
FROM comments c
INNER JOIN posts p ON c.post_id = p.id
INNER JOIN users pa ON p.author_id = pa.id
INNER JOIN users ca ON c.author_id = ca.id
WHERE c.deleted_at IS NULL
  AND p.deleted_at IS NULL
  AND p.author_id != c.author_id  -- 자신의 게시물에 단 댓글 제외
GROUP BY p.author_id, pa.display_name, c.author_id, ca.display_name
ORDER BY interaction_count DESC
LIMIT 10;


-- ============================================================================
-- 10. INSERT 쿼리 (데이터 삽입)
-- ============================================================================

-- 10-1. 새 사용자 추가
-- 설명: users 테이블에 새로운 사용자를 추가합니다.
INSERT INTO users (email, display_name)
VALUES ('newuser@example.com', 'New User');

-- 10-2. 여러 사용자를 한 번에 추가
-- 설명: 한 번의 INSERT 문으로 여러 레코드를 삽입합니다.
INSERT INTO users (email, display_name)
VALUES
    ('user1@example.com', 'User One'),
    ('user2@example.com', 'User Two'),
    ('user3@example.com', 'User Three');

-- 10-3. 프로필 추가
-- 설명: 특정 사용자의 프로필을 생성합니다.
INSERT INTO profiles (user_id, bio)
VALUES (1, '안녕하세요! 개발자입니다.');

-- 10-4. 게시물 추가
-- 설명: 새로운 게시물을 작성합니다.
INSERT INTO posts (title, content, published, author_id)
VALUES ('나의 첫 게시물', '이것은 테스트 게시물입니다.', TRUE, 1);


-- ============================================================================
-- 11. UPDATE 쿼리 (데이터 수정)
-- ============================================================================

-- 11-1. 사용자 정보 수정
-- 설명: 특정 사용자의 display_name을 변경하고 updated_at을 현재 시간으로 업데이트합니다.
UPDATE users
SET display_name = 'Updated Name',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 11-2. 게시물 공개 상태 변경
-- 설명: 특정 게시물을 공개 또는 비공개로 변경합니다.
UPDATE posts
SET published = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 11-3. 여러 조건으로 일괄 수정
-- 설명: 특정 작성자의 모든 비공개 게시물을 공개로 변경합니다.
UPDATE posts
SET published = TRUE,
    updated_at = CURRENT_TIMESTAMP
WHERE author_id = 1 AND published = FALSE;

-- 11-4. 댓글 내용 수정
-- 설명: 특정 댓글의 내용을 수정합니다.
UPDATE comments
SET content = '수정된 댓글 내용입니다.',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 1;


-- ============================================================================
-- 12. DELETE 쿼리 (소프트 딜리트)
-- ============================================================================

-- 12-1. 사용자 소프트 딜리트
-- 설명: 실제로 삭제하지 않고 deleted_at에 현재 시간을 기록합니다.
UPDATE users
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 12-2. 게시물 소프트 딜리트
-- 설명: 게시물을 소프트 딜리트 처리합니다.
UPDATE posts
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 12-3. 댓글 소프트 딜리트
-- 설명: 특정 댓글을 소프트 딜리트 처리합니다.
UPDATE comments
SET deleted_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- 12-4. 하드 딜리트 (실제 삭제) - 주의 필요!
-- 설명: 데이터를 실제로 삭제합니다. 복구가 불가능하므로 신중하게 사용해야 합니다.
DELETE FROM post_likes
WHERE user_id = 1 AND post_id = 1;


-- ============================================================================
-- 13. 트랜잭션 (Transaction)
-- ============================================================================

-- 13-1. 트랜잭션으로 여러 작업을 안전하게 수행
-- 설명: BEGIN으로 시작하고, 문제가 없으면 COMMIT, 문제가 있으면 ROLLBACK합니다.
BEGIN;

-- 새 사용자 추가
INSERT INTO users (email, display_name)
VALUES ('transaction_user@example.com', 'Transaction User');

-- 방금 추가한 사용자의 ID를 얻어서 프로필 생성
INSERT INTO profiles (user_id, bio)
VALUES (currval('users_id_seq'), '트랜잭션 테스트 사용자입니다.');

-- 모든 작업이 성공하면 COMMIT
COMMIT;

-- 문제가 발생하면 ROLLBACK (모든 변경사항 취소)
-- ROLLBACK;


-- ============================================================================
-- 14. 고급 쿼리 (Advanced)
-- ============================================================================

-- 14-1. CASE 문 사용 (조건부 값 표시)
-- 설명: 게시물의 상태를 텍스트로 표시합니다.
SELECT id, title,
       CASE
           WHEN deleted_at IS NOT NULL THEN '삭제됨'
           WHEN published = TRUE THEN '공개'
           ELSE '비공개'
       END AS status
FROM posts;

-- 14-2. 윈도우 함수 (Window Function) - ROW_NUMBER
-- 설명: 각 작성자별로 게시물에 번호를 매깁니다.
SELECT id, title, author_id, created_at,
       ROW_NUMBER() OVER (PARTITION BY author_id ORDER BY created_at DESC) AS post_rank
FROM posts
WHERE deleted_at IS NULL;

-- 14-3. 윈도우 함수 - RANK (공동 순위 허용)
-- 설명: 좋아요 수로 순위를 매기되, 동점이면 같은 순위를 부여합니다.
SELECT p.id, p.title, COUNT(pl.user_id) AS like_count,
       RANK() OVER (ORDER BY COUNT(pl.user_id) DESC) AS rank
FROM posts p
LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.deleted_at IS NULL
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.title;

-- 14-4. CTE (Common Table Expression) 사용
-- 설명: WITH 절로 임시 결과를 만들고 재사용합니다. 가독성이 좋아집니다.
WITH post_stats AS (
    SELECT p.id, p.title, p.author_id,
           COUNT(DISTINCT c.id) AS comment_count,
           COUNT(DISTINCT pl.user_id) AS like_count
    FROM posts p
    LEFT JOIN comments c ON p.id = c.post_id AND c.deleted_at IS NULL
    LEFT JOIN post_likes pl ON p.id = pl.post_id AND pl.deleted_at IS NULL
    WHERE p.deleted_at IS NULL
    GROUP BY p.id, p.title, p.author_id
)
SELECT ps.*, u.display_name AS author_name
FROM post_stats ps
INNER JOIN users u ON ps.author_id = u.id
WHERE ps.comment_count > 5 OR ps.like_count > 10
ORDER BY ps.like_count DESC;

-- 14-5. UNION (여러 쿼리 결과 합치기)
-- 설명: 두 개 이상의 SELECT 결과를 하나로 합칩니다. (중복 제거됨)
SELECT id, 'post' AS type, title AS content, created_at
FROM posts
WHERE deleted_at IS NULL
UNION
SELECT id, 'comment' AS type, content, created_at
FROM comments
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20;

-- 14-6. 재귀 CTE (Recursive CTE) 예제 - 숫자 생성
-- 설명: 1부터 10까지의 숫자를 생성하는 재귀 쿼리입니다.
WITH RECURSIVE numbers AS (
    SELECT 1 AS n
    UNION ALL
    SELECT n + 1 FROM numbers WHERE n < 10
)
SELECT * FROM numbers;


-- ============================================================================
-- 15. 데이터 분석 쿼리
-- ============================================================================

-- 15-1. 월별 게시물 작성 추이
-- 설명: 각 월별로 작성된 게시물 수를 집계합니다.
SELECT DATE_TRUNC('month', created_at) AS month,
       COUNT(*) AS post_count
FROM posts
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- 15-2. 요일별 활동 분석
-- 설명: 어느 요일에 게시물이 가장 많이 작성되는지 분석합니다.
SELECT EXTRACT(DOW FROM created_at) AS day_of_week,
       TO_CHAR(created_at, 'Day') AS day_name,
       COUNT(*) AS post_count
FROM posts
WHERE deleted_at IS NULL
GROUP BY EXTRACT(DOW FROM created_at), TO_CHAR(created_at, 'Day')
ORDER BY day_of_week;

-- 15-3. 시간대별 활동 분석
-- 설명: 어느 시간대에 댓글이 가장 많이 작성되는지 분석합니다.
SELECT EXTRACT(HOUR FROM created_at) AS hour,
       COUNT(*) AS comment_count
FROM comments
WHERE deleted_at IS NULL
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY hour;

-- 15-4. 코호트 분석 (가입 월별 사용자 활동)
-- 설명: 가입 월별로 사용자들의 게시물 작성 수를 분석합니다.
SELECT DATE_TRUNC('month', u.created_at) AS signup_month,
       COUNT(DISTINCT u.id) AS user_count,
       COUNT(p.id) AS total_posts,
       ROUND(COUNT(p.id)::NUMERIC / COUNT(DISTINCT u.id), 2) AS avg_posts_per_user
FROM users u
LEFT JOIN posts p ON u.id = p.author_id AND p.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY DATE_TRUNC('month', u.created_at)
ORDER BY signup_month DESC;


-- ============================================================================
-- 16. 성능 최적화 관련 쿼리
-- ============================================================================

-- 16-1. EXPLAIN으로 쿼리 실행 계획 확인
-- 설명: 쿼리가 어떻게 실행되는지 계획을 보여줍니다. 성능 최적화에 필수입니다.
EXPLAIN
SELECT * FROM posts
WHERE author_id = 1 AND published = TRUE;

-- 16-2. EXPLAIN ANALYZE로 실제 실행 시간 측정
-- 설명: 실제로 쿼리를 실행하고 각 단계별 소요 시간을 보여줍니다.
EXPLAIN ANALYZE
SELECT p.*, u.display_name
FROM posts p
INNER JOIN users u ON p.author_id = u.id
WHERE p.published = TRUE
ORDER BY p.created_at DESC
LIMIT 10;


-- ============================================================================
-- 17. 유용한 유틸리티 쿼리
-- ============================================================================

-- 17-1. 현재 데이터베이스의 모든 테이블 목록 조회
-- 설명: information_schema를 사용하여 현재 스키마의 모든 테이블을 조회합니다.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 17-2. 특정 테이블의 컬럼 정보 조회
-- 설명: 테이블의 모든 컬럼과 데이터 타입을 확인합니다.
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- 17-3. 테이블별 레코드 수 확인
-- 설명: 각 테이블에 몇 개의 레코드가 있는지 확인합니다.
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'posts', COUNT(*) FROM posts
UNION ALL
SELECT 'comments', COUNT(*) FROM comments
UNION ALL
SELECT 'post_likes', COUNT(*) FROM post_likes;


-- ============================================================================
-- 실습 팁
-- ============================================================================
-- 1. 쿼리를 실행하기 전에 항상 SELECT로 확인하세요 (특히 UPDATE, DELETE 전)
-- 2. 트랜잭션을 활용하여 안전하게 데이터를 수정하세요
-- 3. EXPLAIN을 사용하여 느린 쿼리를 분석하고 최적화하세요
-- 4. 인덱스가 잘 활용되고 있는지 확인하세요
-- 5. 소프트 딜리트를 사용할 때는 항상 WHERE deleted_at IS NULL 조건을 추가하세요
-- 6. JOIN 시 항목이 많을 때는 필요한 컬럼만 SELECT 하세요
-- 7. 집계 함수 사용 시 GROUP BY 절을 잊지 마세요
-- 8. 날짜/시간 함수는 데이터베이스마다 차이가 있으니 문서를 확인하세요
