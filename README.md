# 🎓 빅데이터 분석기사 필기 CBT 모의고사 웹 애플리케이션

이 프로젝트는 **빅데이터 분석기사 필기 시험(총 80문항 / 4개 과목 / 16페이지)** 데이터를 바탕으로 구축된 **클라이언트 사이드 CBT(Computer Based Test) 웹 애플리케이션**입니다.

웹 서버나 DB 구축 없이 HTML, CSS, JavaScript, JSON 파일로만 구성되어 있어 **GitHub Pages, Vercel, Netlify** 등의 무료 호스팅 서비스에 올리면 즉시 웹사이트로 서비스할 수 있습니다.

---

## ✨ 주요 기능

- **실제 CBT 웹 화면 구현**: 좌측 문제 영역과 우측 interactive OMR 답안지 실시간 연동
- **과목별 & 전체 자동 채점**: 총점(100점 만점) 및 과목별 점수 산출
- **합격 / 과락 판정**: 평균 60점 이상 및 매 과목 40점 이상(과락 40점 미만 시 불합격) 자동 계산
- **시험 모드 vs 연습 모드**:
  - **시험 모드**: 실제 시험처럼 정답/해설 숨김 후 제출 시 채점
  - **연습 모드**: 문제 풀이 즉시 정답 및 상세 해설 확인 가능
- **다양한 뷰 모드**: `1문제 집중 보기`, `5문제 페이지 보기 (16페이지)`, `전체 80문항 보기`
- **120분 타이머**: 시험 카운트다운 타이머 (일시정지/재개 지원)
- **북마크 (나중에 풀기)**: 헷갈리는 문항 ⭐ 표시 및 OMR 모아보기
- **오답 노트**: 제출 후 틀린 문제만 필터링하여 복습
- **키보드 단축키 지원**: `1`, `2`, `3`, `4` (답안 선택), `←`/`→` (이전/다음 문항), `B` (북마크)
- **자동 저장**: 브라우저 `localStorage` 기반 풀이 상태 자동 보존

---

## 📁 파일 구조

```text
├── index.html                       # 메인 SPA 웹페이지
├── app.js                           # CBT 응시 / OMR / 채점 / 타이머 로직
├── styles.css                       # UI 및 OMR 버블 / 애니메이션 스타일
├── questions.json                   # 80문항 전체 데이터 (문제, 선택지, 정답, 해설)
└── bigdata_analyst_exam_16pages.md  # 마크다운 문제집 데이터
```

---

## 🚀 GitHub Pages에 무료 배포하는 방법

1. **GitHub 저장소(Repository) 생성**
   - GitHub(https://github.com) 로그인 후 **New repository** 클릭
   - 저장소 이름 입력 (예: `bigdata-cbt-exam`) 후 **Create repository** 클릭

2. **코드 업로드 (Git 커밋 & 푸시)**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Big Data CBT Exam App"
   git branch -M main
   git remote add origin https://github.com/사용자아이디/bigdata-cbt-exam.git
   git push -u origin main
   ```

3. **GitHub Pages 활성화**
   - 생성한 GitHub 저장소 페이지 상단의 **Settings** 메뉴 클릭
   - 좌측 메뉴에서 **Pages** 선택
   - **Build and deployment** 항목의 Source를 `Deploy from a branch`로 설정
   - Branch를 `main` ( / `root` )으로 선택하고 **Save** 클릭
   - 약 1~2분 후 생성되는 무료 접속 주소(예: `https://<username>.github.io/bigdata-cbt-exam/`)로 접속하여 사용!

---

## 📜 출처
- 문제 출처: 영진닷컴 이기적 CBT (한국데이터산업진흥원 시행 빅데이터 분석기사)
