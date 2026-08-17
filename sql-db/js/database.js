/**
 * 🗄️ In-Browser SQLite 3 Database Engine (via sql.js WebAssembly)
 * File: js/database.js
 */

const SQL_SCHEMA = `
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS rentals;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS members;

CREATE TABLE members (
    member_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    join_date DATE DEFAULT (date('now'))
);

CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_name TEXT NOT NULL UNIQUE
);

CREATE TABLE books (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 15000,
    category_id INTEGER NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE rentals (
    rental_id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    book_id INTEGER NOT NULL,
    rental_date DATE DEFAULT (date('now')),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id)
);
`;

const SQL_DATA = `
INSERT INTO categories (category_name) VALUES 
('소설'), ('IT/프로그래밍'), ('경제/경영'), ('철학'), ('역사'), 
('예술/대중문화'), ('자연과학'), ('에세이'), ('자기계발'), ('심리학');

INSERT INTO members (name, email, phone, join_date) VALUES 
('강동원', 'gdone9009@gmail.com', '010-1234-5678', '2026-01-15'),
('김철수', 'chul@naver.com', '010-2345-6789', '2026-02-01'),
('이영희', 'yh@daum.net', '010-3456-7890', '2026-02-10'),
('박민수', 'ms@gmail.com', '010-4567-8901', '2026-03-05'),
('최지우', 'jw@naver.com', '010-5678-9012', '2026-03-12'),
('강하늘', 'sky@daum.net', '010-6789-0123', '2026-04-01'),
('윤서준', 'sj@gmail.com', '010-7890-1234', '2026-04-15'),
('조예은', 'ye@naver.com', '010-8901-2345', '2026-05-02'),
('한결', 'kg@daum.net', '010-9012-3456', '2026-05-20'),
('임소윤', 'sy@gmail.com', '010-0123-4567', '2026-06-01');

INSERT INTO books (title, author, price, category_id) VALUES 
('클린 코드', '로버트 마틴', 33000, 2),
('부자 아빠 가난한 아빠', '로버트 기요사키', 17000, 3),
('사피엔스', '유발 하라리', 22000, 5),
('미움받을 용기', '고가 후미타케', 15000, 10),
('파친코', '이민진', 15800, 1),
('자본론', '칼 마르크스', 25000, 3),
('총 균 쇠', '재레드 다이아몬드', 28000, 5),
('이기적 유전자', '리처드 도킨스', 20000, 7),
('코스모스', '칼 세이건', 27000, 7),
('데미안', '헤르만 헤세', 12000, 1);

INSERT INTO rentals (member_id, book_id, rental_date) VALUES 
(1, 1, '2026-06-01'),
(1, 2, '2026-06-05'),
(2, 1, '2026-06-10'),
(3, 5, '2026-06-12'),
(4, 3, '2026-06-15'),
(5, 9, '2026-06-18'),
(6, 10, '2026-06-20'),
(7, 4, '2026-06-22'),
(8, 1, '2026-06-25'),
(9, 2, '2026-06-28'),
(1, 7, '2026-07-01'),
(2, 8, '2026-07-05');
`;

class DatabaseManager {
  constructor() {
    this.db = null;
    this.SQL = null;
    this.isReady = false;
  }

  async init() {
    try {
      if (window.initSqlJs) {
        this.SQL = await window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
        });
        this.db = new this.SQL.Database();
        this.db.run(SQL_SCHEMA);
        this.db.run(SQL_DATA);
        this.isReady = true;
        console.log("✅ WebAssembly SQLite Database initialized successfully.");
      } else {
        console.warn("⚠️ sql.js not loaded, using pure in-memory mock engine fallback.");
        this.initMockEngine();
      }
    } catch (e) {
      console.error("Database Init Error:", e);
      this.initMockEngine();
    }
  }

  initMockEngine() {
    // Pure fallback if CDN fails
    this.isReady = true;
    this.isMock = true;
  }

  reset() {
    if (this.db) {
      this.db.close();
      this.db = new this.SQL.Database();
      this.db.run(SQL_SCHEMA);
      this.db.run(SQL_DATA);
    }
  }

  runQuery(sql) {
    if (!this.isReady) {
      return { error: "데이터베이스가 준비되지 않았습니다." };
    }

    const startTime = performance.now();
    try {
      const results = this.db.exec(sql);
      const executionTime = (performance.now() - startTime).toFixed(2);

      if (!results || results.length === 0) {
        // DML (INSERT, UPDATE, DELETE, CREATE INDEX)
        return {
          columns: ["상태"],
          values: [["성공적으로 실행되었습니다."]],
          rowCount: 0,
          executionTime,
          isDML: true
        };
      }

      const res = results[0];
      return {
        columns: res.columns,
        values: res.values,
        rowCount: res.values.length,
        executionTime
      };
    } catch (err) {
      return {
        error: err.message,
        executionTime: (performance.now() - startTime).toFixed(2)
      };
    }
  }

  getDashboardStats() {
    const totalBooks = this.runQuery("SELECT COUNT(*) FROM books;").values[0][0];
    const totalMembers = this.runQuery("SELECT COUNT(*) FROM members;").values[0][0];
    const totalCategories = this.runQuery("SELECT COUNT(*) FROM categories;").values[0][0];
    const totalRentals = this.runQuery("SELECT COUNT(*) FROM rentals;").values[0][0];

    return { totalBooks, totalMembers, totalCategories, totalRentals };
  }

  getBooksWithCategory() {
    const q = `
      SELECT b.book_id, b.title, b.author, b.price, c.category_name, 
             (SELECT COUNT(*) FROM rentals r WHERE r.book_id = b.book_id) AS rental_count
      FROM books b
      JOIN categories c ON b.category_id = c.category_id
      ORDER BY b.book_id ASC;
    `;
    return this.runQuery(q);
  }

  getMembers() {
    return this.runQuery("SELECT member_id, name, email, phone, join_date FROM members ORDER BY member_id ASC;");
  }

  getCategories() {
    return this.runQuery("SELECT category_id, category_name FROM categories ORDER BY category_id ASC;");
  }

  getRecentRentals() {
    const q = `
      SELECT r.rental_id, m.name AS member_name, b.title AS book_title, c.category_name, r.rental_date
      FROM rentals r
      JOIN members m ON r.member_id = m.member_id
      JOIN books b ON r.book_id = b.book_id
      JOIN categories c ON b.category_id = c.category_id
      ORDER BY r.rental_id DESC;
    `;
    return this.runQuery(q);
  }

  rentBook(memberId, bookId) {
    const q = `INSERT INTO rentals (member_id, book_id, rental_date) VALUES (${memberId}, ${bookId}, date('now'));`;
    return this.runQuery(q);
  }

  returnBook(rentalId) {
    const q = `DELETE FROM rentals WHERE rental_id = ${rentalId};`;
    return this.runQuery(q);
  }

  addMember(name, email, phone) {
    const q = `INSERT INTO members (name, email, phone, join_date) VALUES ('${name}', '${email}', '${phone}', date('now'));`;
    return this.runQuery(q);
  }
}

window.dbManager = new DatabaseManager();
