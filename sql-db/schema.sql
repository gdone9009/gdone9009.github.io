-- ==============================================================================
-- 📖 [초보자를 위한 교재용 해설] 도서 관리 시스템 (Book Management System) DB 스키마
-- ------------------------------------------------------------------------------
-- 본 DDL(Data Definition Language) 스크립트는 도서관 대여 도메인을 모델링한 것으로,
-- 회원(members), 카테고리(categories), 도서(books), 대여(rentals) 총 4개 테이블로 구성됩니다.
-- 데이터 중복을 최소화하는 제3정규형(3NF)을 준수하며, 강력한 무결성 제약조건을 가집니다.
-- ==============================================================================

-- [1] SQLite 외래 키(Foreign Key) 제약 조건 강제 활성화
-- SQLite는 기본적으로 하위 호환성을 위해 FK 검사를 비활성화하므로 반드시 아래 명령을 실행해야 합니다.
PRAGMA foreign_keys = ON;

-- [2] 기존 테이블이 존재할 경우 참조 관계의 역순으로 안전하게 삭제 (Drop Cascade 순서)
-- rentals(자식) -> books(자식) -> categories(부모) -> members(부모)
DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS members;

-- ------------------------------------------------------------------------------
-- 1. 회원 (members) 테이블
-- ------------------------------------------------------------------------------
-- 역할: 도서관 서비스를 이용하는 회원의 기본 인적사항과 가입일자를 관리합니다.
CREATE TABLE members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT, -- [PK] 회원 식별 고유 정수 ID (자동 증가)
    name TEXT NOT NULL,                         -- [NOT NULL] 회원 이름 (필수 입력)
    email TEXT UNIQUE NOT NULL,                  -- [UNIQUE + NOT NULL] 계정 식별 이메일 (중복 불가, 필수 입력)
    phone TEXT,                                  -- [선택] 연락처 (형식: 010-XXXX-XXXX)
    join_date DATE DEFAULT (date('now'))         -- [DEFAULT] 가입일자 (기본값: 시스템 현재 날짜)
);

-- ------------------------------------------------------------------------------
-- 2. 카테고리 (categories) 테이블
-- ------------------------------------------------------------------------------
-- 역할: 도서의 장르 및 학문 분야(IT, 소설, 경제 등)를 체계적으로 분류하는 기준 테이블입니다.
CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT, -- [PK] 카테고리 식별 고유 ID (자동 증가)
    category_name TEXT NOT NULL UNIQUE            -- [UNIQUE + NOT NULL] 분류명 (중복 방지, 필수 입력)
);

-- ------------------------------------------------------------------------------
-- 3. 도서 (books) 테이블
-- ------------------------------------------------------------------------------
-- 역할: 도서관이 보유한 도서 자산(제목, 저자, 정가)을 등록하며, 카테고리(categories)와 1:N 관계를 맺습니다.
CREATE TABLE books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,   -- [PK] 도서 고유 번호 (자동 증가)
    title TEXT NOT NULL,                         -- [NOT NULL] 도서 제목 (필수 입력)
    author TEXT NOT NULL,                        -- [NOT NULL] 저자명 (필수 입력)
    price INTEGER NOT NULL DEFAULT 15000,        -- [NOT NULL + DEFAULT] 도서 정가 (통계 집계 SUM/AVG 실습용)
    category_id INTEGER NOT NULL,                -- [FK] 카테고리 참조 외래 키
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
        ON UPDATE CASCADE                        -- 카테고리 ID 변경 시 도서 테이블도 동시 반영
        ON DELETE RESTRICT                       -- 도서가 등록된 카테고리는 임의 삭제 차단
);

-- ------------------------------------------------------------------------------
-- 4. 대여 (rentals) 테이블
-- ------------------------------------------------------------------------------
-- 역할: 회원(members)과 도서(books) 간의 다대다(N:M) 비즈니스 관계를 1:N 2개로 해소하는 교차(연결) 테이블입니다.
CREATE TABLE rentals (
    rental_id INTEGER PRIMARY KEY AUTOINCREMENT, -- [PK] 대여 트랜잭션 고유 ID (자동 증가)
    member_id INTEGER NOT NULL,                  -- [FK] 대여를 실행한 회원 ID (members 참조)
    book_id INTEGER NOT NULL,                    -- [FK] 대여된 대상 도서 ID (books 참조)
    rental_date DATE DEFAULT (date('now')),      -- [DEFAULT] 대여 실행 일자 (기본값: 오늘)
    FOREIGN KEY (member_id) REFERENCES members(member_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,                      -- 대여 이력이 존재하는 회원은 임의 탈퇴/삭제 방지
    FOREIGN KEY (book_id) REFERENCES books(book_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT                       -- 대여 이력이 존재하는 도서는 임의 폐기/삭제 방지
);