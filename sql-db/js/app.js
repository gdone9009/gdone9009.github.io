/**
 * 🎯 Main Application Logic & UI Orchestration
 * File: js/app.js
 */

const PRESET_QUERIES = [
  // 1. 기본 조회 (4개)
  {
    id: "Q01",
    cat: "기본 조회",
    title: "전체 도서 제목순 정렬 상위 5권",
    sql: "SELECT book_id, title, author, price FROM books ORDER BY title ASC LIMIT 5;",
    desc: "ORDER BY와 LIMIT를 활용한 도서 가나다순 페이징 조회"
  },
  {
    id: "Q02",
    cat: "기본 조회",
    title: "2026년 2월 이후 가입한 회원",
    sql: "SELECT member_id, name, email, join_date FROM members WHERE join_date >= '2026-02-01' ORDER BY join_date ASC;",
    desc: "WHERE 날짜 비교 연산자를 활용한 신규 회원 필터링"
  },
  {
    id: "Q03",
    cat: "기본 조회",
    title: "저자명에 '로버트'가 포함된 도서",
    sql: "SELECT book_id, title, author, price FROM books WHERE author LIKE '%로버트%';",
    desc: "LIKE 와일드카드(%)를 이용한 부분 문자열 검색"
  },
  {
    id: "Q04",
    cat: "기본 조회",
    title: "Gmail 도메인 사용하는 회원 3명",
    sql: "SELECT member_id, name, email FROM members WHERE email LIKE '%@gmail.com' ORDER BY member_id ASC LIMIT 3;",
    desc: "이메일 패턴 검색 및 LIMIT 제한"
  },

  // 2. 조인 (5개)
  {
    id: "Q05",
    cat: "조인 (JOIN)",
    title: "도서 제목과 카테고리명 결합",
    sql: "SELECT b.book_id, b.title, b.author, c.category_name FROM books b INNER JOIN categories c ON b.category_id = c.category_id ORDER BY b.book_id;",
    desc: "1:N 외래키 관계를 결합하는 2개 테이블 INNER JOIN"
  },
  {
    id: "Q06",
    cat: "조인 (JOIN)",
    title: "대여 상세 이력 (4개 테이블 다중 조인)",
    sql: "SELECT r.rental_id, m.name AS member_name, b.title AS book_title, c.category_name, r.rental_date FROM rentals r INNER JOIN members m ON r.member_id = m.member_id INNER JOIN books b ON r.book_id = b.book_id INNER JOIN categories c ON b.category_id = c.category_id ORDER BY r.rental_date DESC;",
    desc: "회원, 도서, 카테고리, 대여 테이블을 모두 결합한 비즈니스 데이터"
  },
  {
    id: "Q07",
    cat: "조인 (JOIN)",
    title: "'IT/프로그래밍' 도서 및 저자/가격",
    sql: "SELECT b.title, b.author, b.price, c.category_name FROM books b INNER JOIN categories c ON b.category_id = c.category_id WHERE c.category_name = 'IT/프로그래밍';",
    desc: "INNER JOIN 후 WHERE 조건으로 특정 카테고리 필터링"
  },
  {
    id: "Q08",
    cat: "조인 (JOIN)",
    title: "모든 카테고리와 도서 (미보유 포함)",
    sql: "SELECT c.category_name, b.title AS book_title FROM categories c LEFT JOIN books b ON c.category_id = b.category_id ORDER BY c.category_id;",
    desc: "도서가 없는 카테고리도 누락 없이 표시하는 LEFT JOIN"
  },
  {
    id: "Q09",
    cat: "조인 (JOIN)",
    title: "전체 회원 및 대여 기록 (미대여 포함)",
    sql: "SELECT m.name AS member_name, m.email, r.rental_id, r.rental_date FROM members m LEFT JOIN rentals r ON m.member_id = r.member_id ORDER BY m.member_id;",
    desc: "대여 이력이 없는 신규 회원도 함께 조회하는 LEFT JOIN"
  },

  // 3. 집계 및 통계 (3개)
  {
    id: "Q10",
    cat: "집계 / 통계",
    title: "카테고리별 도서 보유 수량",
    sql: "SELECT c.category_name, COUNT(b.book_id) AS total_books FROM categories c LEFT JOIN books b ON c.category_id = b.category_id GROUP BY c.category_id, c.category_name ORDER BY total_books DESC;",
    desc: "COUNT와 GROUP BY를 활용한 카테고리별 도서 수 집계"
  },
  {
    id: "Q11",
    cat: "집계 / 통계",
    title: "회원별 대출 건수 및 최다 대출 회원 TOP 3",
    sql: "SELECT m.name AS member_name, COUNT(r.rental_id) AS total_rentals FROM members m INNER JOIN rentals r ON m.member_id = r.member_id GROUP BY m.member_id, m.name ORDER BY total_rentals DESC LIMIT 3;",
    desc: "집계 함수 + GROUP BY + ORDER BY + LIMIT 결합 랭킹 쿼리"
  },
  {
    id: "Q12",
    cat: "집계 / 통계",
    title: "카테고리별 평균가 및 총 재고 자산 금액",
    sql: "SELECT c.category_name, COUNT(b.book_id) AS book_count, ROUND(AVG(b.price), 0) AS avg_price, SUM(b.price) AS total_value FROM categories c INNER JOIN books b ON c.category_id = b.category_id GROUP BY c.category_id, c.category_name ORDER BY total_value DESC;",
    desc: "SUM, AVG, COUNT, ROUND 다중 집계 함수 실습"
  },

  // 4. 서브쿼리 (1개)
  {
    id: "Q13",
    cat: "서브쿼리",
    title: "한 번도 대여된 적 없는 미대여 도서",
    sql: "SELECT book_id, title, author, price FROM books WHERE book_id NOT IN (SELECT DISTINCT book_id FROM rentals);",
    desc: "NOT IN 중첩 서브쿼리로 미대여 도서 필터링"
  },

  // 5. 수정 및 삭제 (2개)
  {
    id: "Q14",
    cat: "수정 / 삭제",
    title: "'강동원' 회원 연락처 정보 수정",
    sql: "UPDATE members SET phone = '010-9999-8888' WHERE name = '강동원';",
    desc: "특정 레코드의 컬럼 값을 변경하는 UPDATE 실습"
  },
  {
    id: "Q15",
    cat: "수정 / 삭제",
    title: "대여 기록 없는 임시 도서 조건부 삭제",
    sql: "DELETE FROM books WHERE title = '임시 테스트 책' AND book_id NOT IN (SELECT book_id FROM rentals);",
    desc: "참조 무결성을 침해하지 않는 안전한 조건부 DELETE"
  },

  // 6. 인덱스 (1개)
  {
    id: "Q16",
    cat: "인덱스 최적화",
    title: "books.category_id 컬럼 인덱스 생성",
    sql: "CREATE INDEX IF NOT EXISTS idx_books_category_id ON books(category_id);",
    desc: "외래키 컬럼 B-Tree 인덱스 생성으로 JOIN 속도 O(log N) 최적화"
  },

  // 7. 보너스 과제 3종
  {
    id: "Bonus_01A",
    cat: "보너스 과제",
    title: "보너스 1-A: JOIN 방식 IT도서 조회",
    sql: "SELECT b.title, b.author FROM books b JOIN categories c ON b.category_id = c.category_id WHERE c.category_name = 'IT/프로그래밍';",
    desc: "JOIN으로 푸는 동일 요구사항"
  },
  {
    id: "Bonus_01B",
    cat: "보너스 과제",
    title: "보너스 1-B: 서브쿼리 방식 IT도서 조회",
    sql: "SELECT title, author FROM books WHERE category_id = (SELECT category_id FROM categories WHERE category_name = 'IT/프로그래밍');",
    desc: "중첩 서브쿼리로 푸는 동일 요구사항"
  },
  {
    id: "Bonus_02",
    cat: "보너스 과제",
    title: "보너스 2: 외래키(FK) 위반 에러 유도",
    sql: "INSERT INTO rentals (member_id, book_id, rental_date) VALUES (999, 1, '2026-08-01');",
    desc: "부모에 없는 999번 회원 대여 삽입 시도 ➔ FK 제약조건 차단 검증"
  },
  {
    id: "Bonus_03A",
    cat: "보너스 과제",
    title: "보너스 3-1: 가장 인기 있는 도서 TOP 3",
    sql: "SELECT b.title, COUNT(r.rental_id) AS rental_count FROM books b JOIN rentals r ON b.book_id = r.book_id GROUP BY b.book_id, b.title ORDER BY rental_count DESC LIMIT 3;",
    desc: "대여 횟수 기준 인기도서 랭킹"
  },
  {
    id: "Bonus_03B",
    cat: "보너스 과제",
    title: "보너스 3-2: 카테고리별 자산 총액 및 평균가",
    sql: "SELECT c.category_name, COUNT(b.book_id) AS book_count, SUM(b.price) AS total_asset_price, ROUND(AVG(b.price), 0) AS avg_book_price FROM categories c JOIN books b ON c.category_id = b.category_id GROUP BY c.category_id, c.category_name ORDER BY total_asset_price DESC;",
    desc: "카테고리별 재고 자산 건전성 지표"
  },
  {
    id: "Bonus_03C",
    cat: "보너스 과제",
    title: "보너스 3-3: 회원 대여 서비스 활성 참여율",
    sql: "SELECT COUNT(DISTINCT r.member_id) AS active_members, (SELECT COUNT(*) FROM members) AS total_members, ROUND(CAST(COUNT(DISTINCT r.member_id) AS FLOAT) / (SELECT COUNT(*) FROM members) * 100, 1) || '%' AS participation_rate FROM rentals r;",
    desc: "전체 회원 중 최소 1회 이상 대여한 활성 회원 비율"
  }
];

document.addEventListener("DOMContentLoaded", async () => {
  initTheme();
  setupNavigation();

  // Initialize DB
  await window.dbManager.init();

  renderStats();
  renderLibraryApp();
  renderSQLStudio();
  renderDashboard();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);

  const themeBtn = document.getElementById("btn-theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById("theme-icon");
  if (icon) {
    icon.textContent = theme === "dark" ? "🌙" : "☀️";
  }
}

// Navigation Tabs
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link[data-tab]");
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const tabId = link.getAttribute("data-tab");
      switchTab(tabId);
    });
  });

  // Check URL Hash on load
  const hash = window.location.hash.replace("#", "");
  if (hash && document.getElementById(hash)) {
    switchTab(hash);
  }
}

function switchTab(tabId) {
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

  const targetLink = document.querySelector(`.nav-link[data-tab="${tabId}"]`);
  const targetPane = document.getElementById(tabId);

  if (targetLink) targetLink.classList.add("active");
  if (targetPane) targetPane.classList.add("active");

  window.location.hash = tabId;

  // Refresh view contents
  if (tabId === "library-app") renderLibraryApp();
  if (tabId === "dashboard") renderDashboard();
  renderStats();
}

// Global Stats Bar
function renderStats() {
  const stats = window.dbManager.getDashboardStats();
  const elBooks = document.getElementById("stat-books");
  const elMembers = document.getElementById("stat-members");
  const elCategories = document.getElementById("stat-categories");
  const elRentals = document.getElementById("stat-rentals");

  if (elBooks) elBooks.textContent = stats.totalBooks;
  if (elMembers) elMembers.textContent = stats.totalMembers;
  if (elCategories) elCategories.textContent = stats.totalCategories;
  if (elRentals) elRentals.textContent = stats.totalRentals;
}

// ------------------------------------------------------------------------------
// TAB 1: Library Web Application
// ------------------------------------------------------------------------------
function renderLibraryApp() {
  renderBookTable();
  renderRecentRentalsTable();
  populateCategoryFilter();
}

function populateCategoryFilter() {
  const select = document.getElementById("filter-category");
  if (!select) return;

  const categories = window.dbManager.getCategories();
  if (categories.values) {
    select.innerHTML = '<option value="">전체 카테고리</option>';
    categories.values.forEach(row => {
      select.innerHTML += `<option value="${row[1]}">${row[1]}</option>`;
    });
  }

  select.onchange = () => renderBookTable();
  const searchInput = document.getElementById("search-book");
  if (searchInput) {
    searchInput.oninput = () => renderBookTable();
  }
}

function renderBookTable() {
  const tbody = document.getElementById("books-table-body");
  if (!tbody) return;

  const searchKeyword = (document.getElementById("search-book")?.value || "").toLowerCase();
  const selectedCat = document.getElementById("filter-category")?.value || "";

  const booksData = window.dbManager.getBooksWithCategory();
  tbody.innerHTML = "";

  if (!booksData.values || booksData.values.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">도서가 없습니다.</td></tr>`;
    return;
  }

  const filtered = booksData.values.filter(b => {
    const [id, title, author, price, cat, count] = b;
    const matchSearch = title.toLowerCase().includes(searchKeyword) || author.toLowerCase().includes(searchKeyword);
    const matchCat = selectedCat === "" || cat === selectedCat;
    return matchSearch && matchCat;
  });

  filtered.forEach(b => {
    const [id, title, author, price, cat, count] = b;
    const isRented = count > 0;
    const badgeHtml = isRented 
      ? `<span class="badge badge-warning">대여 중 (${count}회)</span>` 
      : `<span class="badge badge-success">대여 가능</span>`;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>#${id}</strong></td>
      <td><strong>${escapeHtml(title)}</strong></td>
      <td>${escapeHtml(author)}</td>
      <td><span class="badge badge-primary">${escapeHtml(cat)}</span></td>
      <td>${Number(price).toLocaleString()}원</td>
      <td>${badgeHtml}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="openRentalModal(${id}, '${escapeHtml(title)}')">
          📖 대여하기
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function renderRecentRentalsTable() {
  const tbody = document.getElementById("rentals-table-body");
  if (!tbody) return;

  const rentals = window.dbManager.getRecentRentals();
  tbody.innerHTML = "";

  if (!rentals.values || rentals.values.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:1.5rem; color:var(--text-muted);">현재 대여 기록이 없습니다.</td></tr>`;
    return;
  }

  rentals.values.forEach(r => {
    const [rentalId, memberName, bookTitle, cat, date] = r;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>#${rentalId}</td>
      <td><strong>${escapeHtml(memberName)}</strong></td>
      <td>${escapeHtml(bookTitle)}</td>
      <td><span class="badge badge-primary">${escapeHtml(cat)}</span></td>
      <td>${date}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="handleReturnBook(${rentalId})">
          반납 완료
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Modals & Actions
window.openRentalModal = (bookId, bookTitle) => {
  const modal = document.getElementById("rental-modal");
  const modalBookTitle = document.getElementById("modal-book-title");
  const selectMember = document.getElementById("modal-select-member");
  const hiddenBookId = document.getElementById("modal-book-id");

  if (!modal || !selectMember) return;

  modalBookTitle.textContent = bookTitle;
  hiddenBookId.value = bookId;

  // Populate members
  const members = window.dbManager.getMembers();
  selectMember.innerHTML = "";
  if (members.values) {
    members.values.forEach(m => {
      selectMember.innerHTML += `<option value="${m[0]}">${escapeHtml(m[1])} (${escapeHtml(m[2])})</option>`;
    });
  }

  modal.classList.add("show");
};

window.closeRentalModal = () => {
  document.getElementById("rental-modal")?.classList.remove("show");
};

window.submitRental = () => {
  const bookId = document.getElementById("modal-book-id")?.value;
  const memberId = document.getElementById("modal-select-member")?.value;

  if (bookId && memberId) {
    const res = window.dbManager.rentBook(memberId, bookId);
    if (res.error) {
      alert("❌ 대여 실패: " + res.error);
    } else {
      closeRentalModal();
      renderLibraryApp();
      renderStats();
      renderDashboard();
    }
  }
};

window.handleReturnBook = (rentalId) => {
  if (confirm("해당 도서를 반납 처리하시겠습니까?")) {
    window.dbManager.returnBook(rentalId);
    renderLibraryApp();
    renderStats();
    renderDashboard();
  }
};

window.openAddMemberModal = () => {
  document.getElementById("member-modal")?.classList.add("show");
};

window.closeAddMemberModal = () => {
  document.getElementById("member-modal")?.classList.remove("show");
};

window.submitAddMember = () => {
  const name = document.getElementById("input-member-name")?.value;
  const email = document.getElementById("input-member-email")?.value;
  const phone = document.getElementById("input-member-phone")?.value || "010-0000-0000";

  if (!name || !email) {
    alert("이름과 이메일은 필수 입력 사항입니다.");
    return;
  }

  const res = window.dbManager.addMember(name, email, phone);
  if (res.error) {
    alert("❌ 회원 등록 실패 (중복 이메일 등 제약조건 위반): " + res.error);
  } else {
    alert("✅ 신규 회원이 성공적으로 등록되었습니다!");
    closeAddMemberModal();
    renderStats();
    renderDashboard();
  }
};

window.handleResetDB = () => {
  if (confirm("데이터베이스를 초기 상태(schema.sql + data.sql)로 복원하시겠습니까?")) {
    window.dbManager.reset();
    renderLibraryApp();
    renderStats();
    renderDashboard();
    alert("✅ 데이터베이스가 초기화되었습니다.");
  }
};

// ------------------------------------------------------------------------------
// TAB 2: Interactive SQL Studio
// ------------------------------------------------------------------------------
function renderSQLStudio() {
  const listContainer = document.getElementById("preset-query-list");
  if (!listContainer) return;

  listContainer.innerHTML = "";
  let currentCat = "";

  PRESET_QUERIES.forEach((q, idx) => {
    if (q.cat !== currentCat) {
      currentCat = q.cat;
      const catTitle = document.createElement("div");
      catTitle.className = "preset-category";
      catTitle.textContent = currentCat;
      listContainer.appendChild(catTitle);
    }

    const item = document.createElement("div");
    item.className = "preset-item";
    item.innerHTML = `
      <div class="preset-id">${q.id}</div>
      <div class="preset-desc">${escapeHtml(q.title)}</div>
    `;
    item.onclick = () => loadPresetQuery(q, item);
    listContainer.appendChild(item);
  });

  // Load first query by default
  if (PRESET_QUERIES.length > 0) {
    loadPresetQuery(PRESET_QUERIES[0], listContainer.querySelector(".preset-item"));
  }

  const runBtn = document.getElementById("btn-run-sql");
  if (runBtn) {
    runBtn.onclick = () => executeCustomSQL();
  }
}

function loadPresetQuery(queryObj, itemEl) {
  document.querySelectorAll(".preset-item").forEach(el => el.classList.remove("active"));
  if (itemEl) itemEl.classList.add("active");

  const textarea = document.getElementById("custom-sql-input");
  const queryTitle = document.getElementById("current-query-title");
  const queryDesc = document.getElementById("current-query-desc");

  if (textarea) textarea.value = queryObj.sql;
  if (queryTitle) queryTitle.textContent = `[${queryObj.id}] ${queryObj.title}`;
  if (queryDesc) queryDesc.textContent = queryObj.desc;

  executeCustomSQL();
}

function executeCustomSQL() {
  const textarea = document.getElementById("custom-sql-input");
  const resultContainer = document.getElementById("sql-result-container");
  const execInfo = document.getElementById("sql-exec-info");

  if (!textarea || !resultContainer) return;

  const sql = textarea.value.trim();
  if (!sql) {
    resultContainer.innerHTML = `<div style="padding:1rem; color:var(--text-muted);">SQL 쿼리를 입력하세요.</div>`;
    return;
  }

  const result = window.dbManager.runQuery(sql);

  if (result.error) {
    if (execInfo) execInfo.textContent = `실행 에러 (${result.executionTime}ms)`;
    resultContainer.innerHTML = `
      <div style="background:var(--danger-bg); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:1rem; color:var(--danger);">
        <strong>❌ SQL 에러 발생:</strong><br>
        <code>${escapeHtml(result.error)}</code>
      </div>
    `;
    return;
  }

  if (execInfo) {
    execInfo.textContent = `총 ${result.rowCount}행 조회 (${result.executionTime}ms)`;
  }

  let tableHtml = `<div class="table-responsive"><table><thead><tr>`;
  result.columns.forEach(col => {
    tableHtml += `<th>${escapeHtml(col)}</th>`;
  });
  tableHtml += `</tr></thead><tbody>`;

  result.values.forEach(row => {
    tableHtml += `<tr>`;
    row.forEach(val => {
      tableHtml += `<td>${val !== null ? escapeHtml(String(val)) : '<span style="color:var(--text-muted);">NULL</span>'}</td>`;
    });
    tableHtml += `</tr>`;
  });

  tableHtml += `</tbody></table></div>`;
  resultContainer.innerHTML = tableHtml;
}

// ------------------------------------------------------------------------------
// TAB 3: Business Intelligence Dashboard
// ------------------------------------------------------------------------------
function renderDashboard() {
  // Bonus 3-1: Top 3 Books
  const topBooksRes = window.dbManager.runQuery(
    "SELECT b.title, COUNT(r.rental_id) AS rental_count FROM books b JOIN rentals r ON b.book_id = r.book_id GROUP BY b.book_id, b.title ORDER BY rental_count DESC LIMIT 3;"
  );
  const topBooksContainer = document.getElementById("chart-top-books");
  if (topBooksContainer && topBooksRes.values) {
    topBooksContainer.innerHTML = "";
    const maxVal = Math.max(...topBooksRes.values.map(v => v[1]), 1);
    topBooksRes.values.forEach((r, idx) => {
      const [title, count] = r;
      const pct = (count / maxVal) * 100;
      topBooksContainer.innerHTML += `
        <div class="bar-chart-item">
          <div class="bar-chart-header">
            <span><strong>${idx + 1}위. ${escapeHtml(title)}</strong></span>
            <span>${count}회 대여</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%; background:var(--accent-primary);"></div>
          </div>
        </div>
      `;
    });
  }

  // Bonus 3-2: Category Total Asset Value
  const assetRes = window.dbManager.runQuery(
    "SELECT c.category_name, SUM(b.price) AS total_asset FROM categories c JOIN books b ON c.category_id = b.category_id GROUP BY c.category_id, c.category_name ORDER BY total_asset DESC LIMIT 4;"
  );
  const assetContainer = document.getElementById("chart-category-assets");
  if (assetContainer && assetRes.values) {
    assetContainer.innerHTML = "";
    const maxAsset = Math.max(...assetRes.values.map(v => v[1]), 1);
    assetRes.values.forEach(r => {
      const [cat, sum] = r;
      const pct = (sum / maxAsset) * 100;
      assetContainer.innerHTML += `
        <div class="bar-chart-item">
          <div class="bar-chart-header">
            <span>${escapeHtml(cat)}</span>
            <span>${Number(sum).toLocaleString()}원</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%; background:var(--success);"></div>
          </div>
        </div>
      `;
    });
  }

  // Bonus 3-3: Active Member Participation Rate
  const partRes = window.dbManager.runQuery(
    "SELECT COUNT(DISTINCT r.member_id) AS active_members, (SELECT COUNT(*) FROM members) AS total_members FROM rentals r;"
  );
  if (partRes.values) {
    const [active, total] = partRes.values[0];
    const rate = total > 0 ? ((active / total) * 100).toFixed(1) : "0.0";
    const gaugeVal = document.getElementById("gauge-participation-val");
    const gaugeSub = document.getElementById("gauge-participation-sub");
    if (gaugeVal) gaugeVal.textContent = `${rate}%`;
    if (gaugeSub) gaugeSub.textContent = `전체 ${total}명 중 ${active}명 대여 활동`;
  }
}

window.runBonus2Simulator = () => {
  const res = window.dbManager.runQuery("INSERT INTO rentals (member_id, book_id, rental_date) VALUES (999, 1, '2026-08-01');");
  const resultBox = document.getElementById("bonus2-result-box");
  if (resultBox) {
    resultBox.innerHTML = `
      <div style="background:var(--danger-bg); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-md); padding:1rem; color:var(--danger); margin-top:1rem;">
        <strong>🛡️ 외래키(FK) 참조 무결성 엔진 작동 결과:</strong><br>
        <code>${escapeHtml(res.error || "에러 발생")}</code>
        <div style="margin-top:0.5rem; font-size:0.85rem; color:var(--text-primary);">
          👉 <strong>원인:</strong> <code>members</code> 부모 테이블에 999번 회원이 존재하지 않아 엔진 차원에서 고아 데이터 생성을 방지했습니다.<br>
          👉 <strong>해결:</strong> 부모 테이블에 회원을 먼저 등록하거나 유효한 회원 ID(1~10)를 지정해야 합니다.
        </div>
      </div>
    `;
  }
};

function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
