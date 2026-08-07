# 🛡️ 단방향 상태 관리 패턴 기반 반응형 포트폴리오 웹사이트 구축 프로젝트

![Vanilla JS](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-Tokens%2FGrid-blue?style=for-the-badge&logo=css3)
![GitHub API](https://img.shields.io/badge/GitHub%20API-v3-black?style=for-the-badge&logo=github)
![Build Status](https://img.shields.io/badge/Tests-4%2F4%20PASSED-brightgreen?style=for-the-badge)

---

## 1. 프로젝트 개요 (Overview)

### 1.1 목적 및 배경
본 프로젝트는 외부 프레임워크(React, Vue, Angular 등)의 추상화된 레이어에 의존하지 않고, 순수 바닐라 자바스크립트(Vanilla JavaScript ES6+)만으로 **"사용자 이벤트 → 상태(State) 변경 → DOM 업데이트"**로 이어지는 선언형 단방향 데이터 흐름 아키텍처를 설계하고 반응형 포트폴리오 웹사이트를 구축하는 프로젝트입니다.

브라우저 내장 API와 비동기 REST API 통신, 로컬스토리지 영속화, 4단계 UI 상태 머신(`loading`, `success`, `error`, `empty`) 및 스크롤 성능 최적화(Throttle & Intersection Observer)를 직접 엔지니어링하여 프론트엔드 기초 원리를 체득하는 것을 핵심 목표로 합니다.

---

## 2. 핵심 엔지니어링 기능 (Key Features)

### 2.1 HTML5 시맨틱 마크업 & 접근성 (A11y)
- **표준 시맨틱 태그 구조화**: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 계층화 적용
- **웹 접근성 표준 준수**: 모든 이미지에 의미 있는 `alt` 속성 지정, Contact 폼 요소 내 `<label for="...">` - `<input id="...">` 1:1 매칭 및 `aria-label` 부여

### 2.2 CSS3 디자인 토큰 & 반응형 Grid/Flexbox
- **글로벌 디자인 토큰**: `:root` (라이트 테마) 및 `[data-theme="dark"]` (다크 테마) 변수 체계 수립
- **유동형 레이아웃**: Header Navigation 1차원 Flexbox 배치 및 Projects 섹션 2차원 CSS Grid (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`)
- **모바일 퍼스트 반응형**: `768px` (태블릿), `1024px` (데스크톱) 브레이크포인트 미디어 쿼리 및 모바일 햄버거 토글 메뉴

### 2.3 Single-Direction State-Driven Engine (`js/main.js`)
- **단방향 상태 제어 (Event -> State -> Render)**:
  ```mermaid
  graph LR
      A[User Interaction] -->|Trigger Event| B[Update State Store]
      B -->|State Change| C[Invoke Render Function]
      C -->|DOM Mutate| D[UI Updated]
  ```
- **테마 영속화**: `localStorage` 저장/복원 및 `prefers-color-scheme` 시스템 테마 감지
- **코드 거버넌스**: `var` 키워드 전면 금지 (`const`/`let` 전용), `onclick` 대신 `addEventListener` 사용, `<script defer>` 적용

### 2.4 비동기 GitHub REST API 연동 & 4단계 UI 상태 머신
- **비동기 통신**: `fetch` 및 `async/await` 활용 (`https://api.github.com/users/gdone9009/repos`)
- **API 레이트 리밋(403) 방어**: `sessionStorage` 15분 임시 데이터 캐싱으로 불필요한 새로고침 차단
- **4단계 UI 상태 핸들러**:
  1. `loading`: 동적 CSS 애니메이션 스피너 노출
  2. `success`: GitHub 오픈소스 저장소 카드 리스트 바인딩
  3. `error / rate-limit`: 에러 메시지 + [다시 시도 / 샘플 데이터 로드] 버튼제공
  4. `empty`: 카테고리 필터링 시 결과 없음 안내 UI

### 2.5 Contact 폼 UX & 스크롤 성능 최적화
- **실시간/제출 유효성 검증**: 필수값 검증, 이메일 정규식(`^[^\s@]+@[^\s@]+\.[^\s@]+$`) 검증 및 에러 메시지 동적 표시
- **스크롤 Performance**: Throttle 기반 Header Alpha 변환 (>60px), Floating Top 버튼 (>300px) 및 `IntersectionObserver` 페이드인 모션 (threshold: 0.2)

---

## 3. 프로젝트 디렉토리 구조 (Directory Architecture)

```text
vanilla-js-portfolio/
├── index.html                  # [Main Entry] HTML5 시맨틱 메인 포트폴리오 문서
├── css/
│   └── style.css               # [Design Tokens] 라이트/다크 테마, Flexbox/Grid, 반응형 CSS
├── js/
│   └── main.js                 # [Core Engine] 단방향 상태 관리, GitHub API, Form validation
├── tests/
│   └── run_tests.py            # [Verification] 자동화 통합 검증 테스트 스위트 (4/4 PASS)
├── README.md                   # [Docs] 프로젝트 엔지니어링 기술 설명서
└── TOC.md                      # [Table of Contents] 미션 가이드 목차 문서
```

---

## 4. 검증 및 테스트 가이드 (Verification & Test Suite)

본 프로젝트는 자동화 테스트 스위트([`tests/run_tests.py`](file:///Users/gdone/dev/codyssey/vanilla-js-portfolio/tests/run_tests.py))를 탑재하여 기능 무결성을 자체적으로 검증합니다.

### 4.1 테스트 실행 방법
```bash
python3 tests/run_tests.py
```

### 4.2 테스트 결과 (4/4 ALL PASS)
```text
====== VANILLA JS PORTFOLIO TEST SUITE ======
✅ [PASS] Project File Structure Check (index.html, style.css, main.js)
✅ [PASS] HTML5 Semantic Structure & Accessibility Check
✅ [PASS] CSS3 Tokens, Flexbox & Grid Responsive Architecture Check
✅ [PASS] JavaScript ES6+ State-Driven Engine Check
=============================================
🎉 ALL TESTS PASSED SUCCESSFULLY! (4/4 PASS)
```

---

## 5. 로컬 개발 환경 실행 방법 (Local Run)

본 프로젝트는 순수 바닐라 웹 기술만으로 작성되었으므로 별도의 `npm install` 과정 없이 브라우저에서 즉시 실행 가능합니다.

### 옵션 A: Python 내장 웹 서버 실행
```bash
python3 -m http.server 8080
```
접속 URL: `http://localhost:8080`

### 옵션 B: VS Code Live Server
`index.html` 우클릭 -> **Open with Live Server** 클릭

---

## 6. 라이선스 및 저작권 (License)
(C) 2026 gdone9009. All rights reserved. Designed & Engineered with Pure Vanilla HTML/CSS/JavaScript.