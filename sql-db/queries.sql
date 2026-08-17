-- ==============================================================================
-- 📖 [초보자를 위한 교재용 해설] 핵심 SQL 쿼리 16선 + 보너스 3종 상세 해설
-- ------------------------------------------------------------------------------
-- 본 파일은 실무에서 가장 빈번하게 요구되는 기본 조회, 다중 조인, 집계/통계,
-- 서브쿼리, 데이터 변경/삭제, 인덱스 최적화 및 보너스 분석 쿼리를 집대성한 것입니다.
-- ==============================================================================

PRAGMA foreign_keys = ON;

-- ==============================================================================
-- 1. 기본 조회 4개 (WHERE, ORDER BY, LIMIT, LIKE 활용)
-- ==============================================================================

-- [Q01] 전체 도서 목록을 제목(가나다순) 오름차순으로 정렬하여 상위 5권만 조회
-- 작성 목적: 대량의 도서 데이터 중 페이징 처리를 위한 정렬(ORDER BY) 및 행 제한(LIMIT) 구문 실습
SELECT book_id, title, author, price 
FROM books 
ORDER BY title ASC 
LIMIT 5;

-- [Q02] 2026년 2월 1일 이후에 신규 가입한 회원 목록 조회
-- 작성 목적: 날짜(DATE) 컬럼을 대상으로 비교 연산자(>=)를 활용한 시계열 필터링 실습
SELECT member_id, name, email, join_date 
FROM members 
WHERE join_date >= '2026-02-01' 
ORDER BY join_date ASC;

-- [Q03] 저자명에 '로버트'라는 문자열이 포함된 모든 도서 검색
-- 작성 목적: 와일드카드 문자(%)와 LIKE 연산자를 이용한 부분 문자열 검색 패턴 실습
SELECT book_id, title, author, price 
FROM books 
WHERE author LIKE '%로버트%';

-- [Q04] Gmail 도메인(@gmail.com)을 사용하는 회원 중 ID 오름차순 상위 3명 조회
-- 작성 목적: 특정 이메일 서비스 사용자 필터링 및 조건 조합(WHERE LIKE + ORDER BY + LIMIT) 실습
SELECT member_id, name, email 
FROM members 
WHERE email LIKE '%@gmail.com' 
ORDER BY member_id ASC 
LIMIT 3;


-- ==============================================================================
-- 2. 조인 5개 (INNER JOIN 3개, LEFT JOIN 2개)
-- ==============================================================================

-- [Q05] [INNER JOIN] 도서 정보와 해당 도서가 속한 카테고리명을 결합하여 조회
-- 작성 목적: 두 테이블(books, categories)의 1:N 외래키 관계를 결합하는 표준 내부 조인(INNER JOIN) 실습
SELECT b.book_id, b.title, b.author, c.category_name
FROM books b
INNER JOIN categories c ON b.category_id = c.category_id
ORDER BY b.book_id;

-- [Q06] [INNER JOIN 3개 테이블] 전체 대여 상세 이력 조회 (회원명, 도서명, 카테고리명, 대여일)
-- 작성 목적: 4개 테이블(rentals, members, books, categories)을 다중 조인하여 N:M 관계의 완전한 비즈니스 데이터 도출
SELECT r.rental_id, m.name AS member_name, b.title AS book_title, c.category_name, r.rental_date
FROM rentals r
INNER JOIN members m ON r.member_id = m.member_id
INNER JOIN books b ON r.book_id = b.book_id
INNER JOIN categories c ON b.category_id = c.category_id
ORDER BY r.rental_date DESC;

-- [Q07] [INNER JOIN + WHERE] 'IT/프로그래밍' 카테고리에 속한 도서의 제목, 저자, 가격 조회
-- 작성 목적: 조인된 결과 셋에서 특정 비즈니스 조건을 걸어 데이터를 추출하는 필터링 실습
SELECT b.title, b.author, b.price, c.category_name
FROM books b
INNER JOIN categories c ON b.category_id = c.category_id
WHERE c.category_name = 'IT/프로그래밍';

-- [Q08] [LEFT JOIN] 모든 카테고리와 해당 카테고리에 등록된 도서 목록 조회
-- 작성 목적: 도서가 등록되지 않은 비어있는 카테고리(NULL)도 누락 없이 표시하는 외부 조인(LEFT OUTER JOIN) 실습
SELECT c.category_name, b.title AS book_title
FROM categories c
LEFT JOIN books b ON c.category_id = b.category_id
ORDER BY c.category_id;

-- [Q09] [LEFT JOIN] 전체 회원과 대여 기록 조회 (대여 이력이 없는 신규 회원도 포함)
-- 작성 목적: 기준 테이블(members)의 모든 데이터를 유지하면서 대여 이력 유무를 판별하는 LEFT JOIN 실습
SELECT m.name AS member_name, m.email, r.rental_id, r.rental_date
FROM members m
LEFT JOIN rentals r ON m.member_id = r.member_id
ORDER BY m.member_id;


-- ==============================================================================
-- 3. 집계 및 통계 3개 (COUNT, SUM, AVG + GROUP BY)
-- ==============================================================================

-- [Q10] [COUNT + GROUP BY] 카테고리별 등록된 보유 도서 수량 집계
-- 작성 목적: 그룹화(GROUP BY)를 통해 범주형 데이터의 항목별 빈도수(COUNT)를 도출하고 내림차순 정렬
SELECT c.category_name, COUNT(b.book_id) AS total_books
FROM categories c
LEFT JOIN books b ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_books DESC;

-- [Q11] [COUNT + GROUP BY + LIMIT] 회원별 총 대출 횟수 집계 및 최다 대출 회원(대출왕) TOP 3
-- 작성 목적: 집계 함수와 정렬/제한을 결합하여 비즈니스 핵심 랭킹 데이터(TOP N)를 산출
SELECT m.name AS member_name, COUNT(r.rental_id) AS total_rentals
FROM members m
INNER JOIN rentals r ON m.member_id = r.member_id
GROUP BY m.member_id, m.name
ORDER BY total_rentals DESC
LIMIT 3;

-- [Q12] [SUM + AVG + COUNT + GROUP BY] 카테고리별 도서 평균 가격(AVG) 및 총 재고 가치(SUM) 산출
-- 작성 목적: 다중 집계 함수를 동시에 사용하여 카테고리별 재무/자산 가치를 정량적으로 계산 (반올림 ROUND 활용)
SELECT c.category_name, 
       COUNT(b.book_id) AS book_count,
       ROUND(AVG(b.price), 0) AS avg_price,
       SUM(b.price) AS total_value
FROM categories c
INNER JOIN books b ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_value DESC;


-- ==============================================================================
-- 4. 서브쿼리 1개 (Subquery)
-- ==============================================================================

-- [Q13] [중첩 서브쿼리 - NOT IN] 대여 이력이 한 번도 없는 미대여 도서 목록 조회
-- 작성 목적: 서브쿼리로 rentals 테이블의 book_id 목록을 동적으로 생성한 후, 본 쿼리에서 NOT IN으로 대조
SELECT book_id, title, author, price
FROM books
WHERE book_id NOT IN (SELECT DISTINCT book_id FROM rentals);


-- ==============================================================================
-- 5. 데이터 수정 및 삭제 2개 (UPDATE, DELETE)
-- ==============================================================================

-- [Q14] [UPDATE] '정창석' 회원의 연락처 정보를 새로운 번호로 갱신
-- 작성 목적: 기존 레코드의 특정 컬럼 값을 안전하게 변경하는 DML 문법 실습
UPDATE members 
SET phone = '010-9999-8888' 
WHERE name = '정창석';

-- [Q15] [DELETE + 서브쿼리] 대여 이력이 전혀 없는 임시 테스트 도서 삭제
-- 작성 목적: 참조 무결성을 침해하지 않는 안전한 조건부 레코드 삭제 실습
DELETE FROM books 
WHERE title = '임시 테스트 책' AND book_id NOT IN (SELECT book_id FROM rentals);


-- ==============================================================================
-- 6. 인덱스 생성 1개 (CREATE INDEX)
-- ==============================================================================

-- [Q16] [CREATE INDEX] books 테이블의 외래키 컬럼(category_id)에 B-Tree 인덱스 생성
-- 적용 이유: 카테고리별 도서 조회 및 categories 테이블과의 JOIN 조건절(ON b.category_id = c.category_id)
-- 실행 시 풀 테이블 스캔(Full Table Scan)을 방지하고 B-Tree 탐색 속도를 O(log N)으로 최적화합니다.
CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);


-- ==============================================================================
-- 7. 보너스 과제 3종 (Bonus Tasks)
-- ==============================================================================

-- [보너스 1] 동일한 비즈니스 요구사항을 JOIN과 서브쿼리 두 가지 방식으로 해결 및 비교
-- 요구사항: 'IT/프로그래밍' 카테고리에 속한 도서 목록(제목, 저자) 조회

-- 방식 A (JOIN 방식):
SELECT b.title, b.author 
FROM books b 
JOIN categories c ON b.category_id = c.category_id 
WHERE c.category_name = 'IT/프로그래밍';

-- 방식 B (서브쿼리 방식):
SELECT title, author 
FROM books 
WHERE category_id = (SELECT category_id FROM categories WHERE category_name = 'IT/프로그래밍');

-- 💡 [비교 분석]:
-- 1. 가독성(Readability): 서브쿼리는 조건절에 단일 ID를 치환하므로 직관적이지만, JOIN은 관계형 데이터의 물리적 결합을 명확히 명시합니다.
-- 2. 성능(Performance): 실무 대용량 DB 환경에서는 쿼리 최적화기(Optimizer)가 JOIN을 인덱스 스캔과 병렬 처리로 최적화하므로 복잡한 쿼리일수록 JOIN이 유리합니다.

-- [보너스 2] 외래키(FK) 참조 무결성 제약조건 위반 에러 유도 및 복구 시연
-- 실행 의도: 부모 테이블(members)에 존재하지 않는 회원 ID(999번)로 대여 기록(rentals) 삽입 시도
-- 주석 해제 후 실행 시: 'FOREIGN KEY constraint failed' 에러 발생으로 데이터베이스 오염 원천 차단
-- INSERT INTO rentals (member_id, book_id, rental_date) VALUES (999, 1, '2026-08-01');
-- 💡 [해결 방안]: 부모 테이블인 members에 999번 회원을 먼저 INSERT하거나, 유효한 member_id(1~10)를 참조하여 입력해야 무결성이 유지됩니다.

-- [보너스 3] 미니 리포트 - 도서관 시스템 핵심 경영/운영 지표 3선
-- 지표 1: 가장 인기 있는 대여 도서 TOP 3 (도서별 대여 빈도 집계)
SELECT b.title, COUNT(r.rental_id) AS rental_count
FROM books b
JOIN rentals r ON b.book_id = r.book_id
GROUP BY b.book_id, b.title
ORDER BY rental_count DESC
LIMIT 3;

-- 지표 2: 카테고리별 자산 총액 및 평균 도서 가격 (재고 자산 건전성 분석)
SELECT c.category_name, COUNT(b.book_id) AS book_count, SUM(b.price) AS total_asset_price, ROUND(AVG(b.price), 0) AS avg_book_price
FROM categories c
JOIN books b ON c.category_id = b.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_asset_price DESC;

-- 지표 3: 전체 회원 중 최소 1회 이상 대여를 진행한 회원의 비율 (서비스 활성 사용자 참여율)
SELECT 
    COUNT(DISTINCT r.member_id) AS active_members,
    (SELECT COUNT(*) FROM members) AS total_members,
    ROUND(CAST(COUNT(DISTINCT r.member_id) AS FLOAT) / (SELECT COUNT(*) FROM members) * 100, 1) || '%' AS participation_rate
FROM rentals r;