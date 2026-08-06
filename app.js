/**
 * Big Data Analysis Engineer CBT Exam Web Application
 * Single Page Application Logic
 */

(function () {
  'use strict';

  // State Store
  const state = {
    allExamRounds: {},      // { "1": [], "2": [], "3": [], "4": [] }
    currentRound: 1,        // 1..4
    questions: [],
    userAnswers: {},       // { qId: optionNo (1..4) }
    bookmarks: new Set(),   // Set of qIds
    examMode: 'exam',       // 'exam' | 'practice'
    viewMode: 'page',       // 'focus' | 'page' | 'all'
    currentSubject: 0,      // 0: All, 1..4: Subject 1..4
    currentPage: 1,         // 1..16 for page mode, 1..80 for focus mode
    timerSeconds: 120 * 60, // 120 minutes in seconds
    isTimerRunning: true,
    timerInterval: null,
    isSubmitted: false,
    omrSubjectFilter: 'all', // 'all' | '1' | '2' | '3' | '4'
    reviewFilter: 'all',    // 'all' | 'wrong' | 'bookmarked'
    focusedQId: 1
  };

  // Subject Titles
  const SUBJECT_NAMES = {
    1: '제1과목: 빅데이터 분석기획',
    2: '제2과목: 빅데이터 탐색',
    3: '제3과목: 빅데이터 모델링',
    4: '제4과목: 빅데이터 결과 해석'
  };

  const NUM_MAP = { 1: '①', 2: '②', 3: '③', 4: '④' };

  // DOM Elements Cache
  const el = {};

  // Initialize App
  document.addEventListener('DOMContentLoaded', async () => {
    cacheDOMElements();
    await fetchQuestions();
    loadLocalStorageState();
    setupEventListeners();
    setupKeyboardShortcuts();
    startTimer();
    renderAll();
    lucide.createIcons();
  });

  function cacheDOMElements() {
    el.examRoundSelect = document.getElementById('exam-round-select');
    el.questionsList = document.getElementById('questions-list');
    el.omrContainer = document.getElementById('omr-list-container');
    el.timerDisplay = document.getElementById('timer-display');
    el.timerToggleBtn = document.getElementById('timer-toggle-btn');
    
    el.modeExamBtn = document.getElementById('mode-exam-btn');
    el.modePracticeBtn = document.getElementById('mode-practice-btn');
    
    el.viewFocusBtn = document.getElementById('view-focus-btn');
    el.viewPageBtn = document.getElementById('view-page-btn');
    el.viewAllBtn = document.getElementById('view-all-btn');
    
    el.resetExamBtn = document.getElementById('reset-exam-btn');
    el.submitExamBtn = document.getElementById('submit-exam-btn');
    el.sidebarSubmitBtn = document.getElementById('sidebar-submit-btn');
    
    el.pageNavBanner = document.getElementById('page-nav-banner');
    el.currentPageBadge = document.getElementById('current-page-badge');
    el.currentPageTitle = document.getElementById('current-page-title');
    el.prevPageBtn = document.getElementById('prev-page-btn');
    el.nextPageBtn = document.getElementById('next-page-btn');
    
    el.bottomPageNav = document.getElementById('bottom-page-nav');
    el.bottomPrevBtn = document.getElementById('bottom-prev-btn');
    el.bottomNextBtn = document.getElementById('bottom-next-btn');
    el.bottomPageIndicator = document.getElementById('bottom-page-indicator');
    
    el.answeredCountBadge = document.getElementById('answered-count-badge');
    el.progressBarInner = document.getElementById('progress-bar-inner');
    el.bookmarkCountNum = document.getElementById('bookmark-count-num');
    
    el.resultBanner = document.getElementById('result-banner');
    el.passFailBadge = document.getElementById('pass-fail-badge');
    el.bannerTotalScore = document.getElementById('banner-total-score');
    el.bannerCorrectCount = document.getElementById('banner-correct-count');
    el.showScoreModalBtn = document.getElementById('show-score-modal-btn');
    el.filterWrongBtn = document.getElementById('filter-wrong-btn');
    el.filterAllReviewBtn = document.getElementById('filter-all-review-btn');
    
    // Modals
    el.scoreModal = document.getElementById('score-modal');
    el.closeScoreModalBtn = document.getElementById('close-score-modal-btn');
    el.modalPassTag = document.getElementById('modal-pass-tag');
    el.modalTotalScore = document.getElementById('modal-total-score');
    el.modalCorrectCount = document.getElementById('modal-correct-count');
    el.modalAccuracyRate = document.getElementById('modal-accuracy-rate');
    el.modalSubjectList = document.getElementById('modal-subject-list');
    el.modalReviewWrongBtn = document.getElementById('modal-review-wrong-btn');
    el.modalReviewAllBtn = document.getElementById('modal-review-all-btn');
    
    el.unansweredModal = document.getElementById('unanswered-modal');
    el.unansweredCountNum = document.getElementById('unanswered-count-num');
    el.cancelSubmitBtn = document.getElementById('cancel-submit-btn');
    el.confirmSubmitBtn = document.getElementById('confirm-submit-btn');
  }

  // Load JSON Data
  async function fetchQuestions() {
    try {
      const res = await fetch('questions.json');
      if (!res.ok) throw new Error('Failed to load questions.json');
      const data = await res.json();
      state.allExamRounds = data;
      if (Array.isArray(data)) {
        state.questions = data;
      } else {
        state.questions = data[state.currentRound] || data["1"] || [];
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
      el.questionsList.innerHTML = `<div class="p-6 bg-rose-50 text-rose-700 rounded-xl">문제를 불러오는 데 실패했습니다: ${err.message}</div>`;
    }
  }

  // Local Storage Save / Load
  function saveLocalStorageState() {
    try {
      const data = {
        currentRound: state.currentRound,
        userAnswers: state.userAnswers,
        bookmarks: Array.from(state.bookmarks),
        isSubmitted: state.isSubmitted,
        timerSeconds: state.timerSeconds
      };
      localStorage.setItem('cbt_exam_state', JSON.stringify(data));
    } catch (e) {}
  }

  function loadLocalStorageState() {
    try {
      const saved = localStorage.getItem('cbt_exam_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentRound) {
          state.currentRound = parsed.currentRound;
          if (state.allExamRounds && state.allExamRounds[state.currentRound]) {
            state.questions = state.allExamRounds[state.currentRound];
          }
        }
        state.userAnswers = parsed.userAnswers || {};
        state.bookmarks = new Set(parsed.bookmarks || []);
        state.isSubmitted = parsed.isSubmitted || false;
        if (typeof parsed.timerSeconds === 'number') {
          state.timerSeconds = parsed.timerSeconds;
        }
      }
    } catch (e) {}
  }

  // Timer Handler
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      if (state.isTimerRunning && !state.isSubmitted) {
        if (state.timerSeconds > 0) {
          state.timerSeconds--;
          updateTimerDisplay();
        } else {
          clearInterval(state.timerInterval);
          alert('시험 시간이 종료되었습니다! 정답을 자동 제출합니다.');
          submitExam();
        }
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timerSeconds / 60);
    const secs = state.timerSeconds % 60;
    el.timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Event Listeners
  function setupEventListeners() {
    // Round Selector Listener
    if (el.examRoundSelect) {
      el.examRoundSelect.value = String(state.currentRound);
      el.examRoundSelect.addEventListener('change', (e) => {
        const roundVal = e.target.value;
        state.currentRound = parseInt(roundVal);
        if (state.allExamRounds && state.allExamRounds[roundVal]) {
          state.questions = state.allExamRounds[roundVal];
          state.userAnswers = {};
          state.bookmarks.clear();
          state.isSubmitted = false;
          state.timerSeconds = 120 * 60;
          state.currentPage = 1;
          state.reviewFilter = 'all';
          saveLocalStorageState();
          renderAll();
        }
      });
    }

    // Timer toggle
    el.timerToggleBtn.addEventListener('click', () => {
      state.isTimerRunning = !state.isTimerRunning;
      el.timerToggleBtn.innerHTML = state.isTimerRunning 
        ? '<i data-lucide="pause-circle" class="w-4 h-4"></i>'
        : '<i data-lucide="play-circle" class="w-4 h-4 text-emerald-400"></i>';
      lucide.createIcons();
    });

    // Mode Buttons
    el.modeExamBtn.addEventListener('click', () => setExamMode('exam'));
    el.modePracticeBtn.addEventListener('click', () => setExamMode('practice'));

    // View Mode Buttons
    el.viewFocusBtn.addEventListener('click', () => setViewMode('focus'));
    el.viewPageBtn.addEventListener('click', () => setViewMode('page'));
    el.viewAllBtn.addEventListener('click', () => setViewMode('all'));

    // Subject Navigation Tabs
    document.querySelectorAll('.subject-tab').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const subj = parseInt(e.currentTarget.getAttribute('data-subject'));
        setSubjectFilter(subj);
      });
    });

    // OMR Subject Filter Tabs
    document.querySelectorAll('.omr-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.omr-filter-btn').forEach(b => {
          b.classList.remove('active-omr-filter', 'bg-blue-600', 'text-white', 'font-bold');
          b.classList.add('bg-slate-100', 'text-slate-600', 'font-medium');
        });
        const filterVal = e.currentTarget.getAttribute('data-omr-filter');
        e.currentTarget.classList.add('active-omr-filter', 'bg-blue-600', 'text-white', 'font-bold');
        e.currentTarget.classList.remove('bg-slate-100', 'text-slate-600', 'font-medium');
        state.omrSubjectFilter = filterVal;
        renderOMRSheet();
      });
    });

    // Pagination Buttons
    el.prevPageBtn.addEventListener('click', prevPage);
    el.nextPageBtn.addEventListener('click', nextPage);
    el.bottomPrevBtn.addEventListener('click', prevPage);
    el.bottomNextBtn.addEventListener('click', nextPage);

    // Reset & Submit
    el.resetExamBtn.addEventListener('click', () => {
      if (confirm('모든 답안과 북마크를 초기화하고 시험을 처음부터 다시 시작하시겠습니까?')) {
        state.userAnswers = {};
        state.bookmarks.clear();
        state.isSubmitted = false;
        state.timerSeconds = 120 * 60;
        state.reviewFilter = 'all';
        saveLocalStorageState();
        renderAll();
      }
    });

    el.submitExamBtn.addEventListener('click', handlePreSubmit);
    el.sidebarSubmitBtn.addEventListener('click', handlePreSubmit);

    // Modal Actions
    el.closeScoreModalBtn.addEventListener('click', () => el.scoreModal.classList.add('hidden'));
    el.showScoreModalBtn.addEventListener('click', () => el.scoreModal.classList.remove('hidden'));
    
    el.cancelSubmitBtn.addEventListener('click', () => el.unansweredModal.classList.add('hidden'));
    el.confirmSubmitBtn.addEventListener('click', () => {
      el.unansweredModal.classList.add('hidden');
      submitExam();
    });

    el.filterWrongBtn.addEventListener('click', () => {
      state.reviewFilter = 'wrong';
      renderQuestions();
    });

    el.filterAllReviewBtn.addEventListener('click', () => {
      state.reviewFilter = 'all';
      renderQuestions();
    });

    el.modalReviewWrongBtn.addEventListener('click', () => {
      el.scoreModal.classList.add('hidden');
      state.reviewFilter = 'wrong';
      renderQuestions();
    });

    el.modalReviewAllBtn.addEventListener('click', () => {
      el.scoreModal.classList.add('hidden');
      state.reviewFilter = 'all';
      renderQuestions();
    });
  }

  // Keyboard Shortcuts (1, 2, 3, 4, Left, Right, B)
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts inside text inputs
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (['1', '2', '3', '4'].includes(e.key)) {
        const optionNo = parseInt(e.key);
        selectAnswer(state.focusedQId, optionNo);
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'b' || e.key === 'B') {
        toggleBookmark(state.focusedQId);
      }
    });
  }

  // Mode Change Handlers
  function setExamMode(mode) {
    state.examMode = mode;
    if (mode === 'exam') {
      el.modeExamBtn.className = 'px-3 py-1 rounded-md font-semibold transition-all bg-blue-600 text-white shadow';
      el.modePracticeBtn.className = 'px-3 py-1 rounded-md font-medium text-slate-400 hover:text-slate-200 transition-all';
    } else {
      el.modePracticeBtn.className = 'px-3 py-1 rounded-md font-semibold transition-all bg-emerald-600 text-white shadow';
      el.modeExamBtn.className = 'px-3 py-1 rounded-md font-medium text-slate-400 hover:text-slate-200 transition-all';
    }
    renderQuestions();
  }

  function setViewMode(mode) {
    state.viewMode = mode;
    
    [el.viewFocusBtn, el.viewPageBtn, el.viewAllBtn].forEach(b => {
      b.className = 'px-2.5 py-1 rounded-md font-medium text-slate-400 hover:text-white transition-all';
    });

    if (mode === 'focus') {
      el.viewFocusBtn.className = 'px-2.5 py-1 rounded-md font-semibold bg-slate-700 text-white shadow transition-all';
      el.pageNavBanner.classList.remove('hidden');
      el.bottomPageNav.classList.remove('hidden');
    } else if (mode === 'page') {
      el.viewPageBtn.className = 'px-2.5 py-1 rounded-md font-semibold bg-slate-700 text-white shadow transition-all';
      el.pageNavBanner.classList.remove('hidden');
      el.bottomPageNav.classList.remove('hidden');
    } else {
      el.viewAllBtn.className = 'px-2.5 py-1 rounded-md font-semibold bg-slate-700 text-white shadow transition-all';
      el.pageNavBanner.classList.add('hidden');
      el.bottomPageNav.classList.add('hidden');
    }

    renderQuestions();
    updatePaginationUI();
  }

  function setSubjectFilter(subjNo) {
    state.currentSubject = subjNo;
    document.querySelectorAll('.subject-tab').forEach(btn => {
      const bSubj = parseInt(btn.getAttribute('data-subject'));
      if (bSubj === subjNo) {
        btn.className = 'subject-tab active-tab px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all bg-blue-50 text-blue-700 border border-blue-200';
      } else {
        btn.className = 'subject-tab px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all';
      }
    });

    if (subjNo > 0) {
      state.currentPage = (subjNo - 1) * 4 + 1; // 1 -> page 1, 2 -> page 5, 3 -> page 9, 4 -> page 13
      state.focusedQId = (subjNo - 1) * 20 + 1;
    } else {
      state.currentPage = 1;
      state.focusedQId = 1;
    }

    renderQuestions();
    updatePaginationUI();
    renderOMRSheet();
  }

  function prevPage() {
    if (state.viewMode === 'focus') {
      if (state.focusedQId > 1) {
        scrollToQuestion(state.focusedQId - 1);
      }
    } else if (state.viewMode === 'page') {
      if (state.currentPage > 1) {
        state.currentPage--;
        state.focusedQId = (state.currentPage - 1) * 5 + 1;
        renderQuestions();
        updatePaginationUI();
        renderOMRSheet();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  function nextPage() {
    if (state.viewMode === 'focus') {
      if (state.focusedQId < 80) {
        scrollToQuestion(state.focusedQId + 1);
      }
    } else if (state.viewMode === 'page') {
      if (state.currentPage < 16) {
        state.currentPage++;
        state.focusedQId = (state.currentPage - 1) * 5 + 1;
        renderQuestions();
        updatePaginationUI();
        renderOMRSheet();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  function updatePaginationUI() {
    if (state.viewMode === 'page') {
      const startQ = (state.currentPage - 1) * 5 + 1;
      const endQ = state.currentPage * 5;
      const subjNo = Math.floor((startQ - 1) / 20) + 1;
      
      el.currentPageBadge.textContent = `페이지 ${state.currentPage} / 16`;
      el.currentPageTitle.textContent = `${SUBJECT_NAMES[subjNo]} (Q${String(startQ).padStart(2,'0')} ~ Q${String(endQ).padStart(2,'0')})`;
      el.bottomPageIndicator.textContent = `${state.currentPage} / 16 페이지`;

      el.prevPageBtn.disabled = state.currentPage === 1;
      el.nextPageBtn.disabled = state.currentPage === 16;
      el.bottomPrevBtn.disabled = state.currentPage === 1;
      el.bottomNextBtn.disabled = state.currentPage === 16;
    } else if (state.viewMode === 'focus') {
      el.currentPageBadge.textContent = `문항 ${state.focusedQId} / 80`;
      const qObj = state.questions.find(q => q.id === state.focusedQId);
      el.currentPageTitle.textContent = qObj ? `${SUBJECT_NAMES[qObj.subjectNo]}` : '';
      el.bottomPageIndicator.textContent = `${state.focusedQId} / 80 문항`;

      el.prevPageBtn.disabled = state.focusedQId === 1;
      el.nextPageBtn.disabled = state.focusedQId === 80;
      el.bottomPrevBtn.disabled = state.focusedQId === 1;
      el.bottomNextBtn.disabled = state.focusedQId === 80;
    }
  }

  // Answer & Bookmark Handlers
  function selectAnswer(qId, optionNo) {
    if (state.isSubmitted && state.examMode === 'exam') {
      // In post-submit mode, option selection is disabled
      return;
    }
    if (state.userAnswers[qId] === optionNo) {
      delete state.userAnswers[qId]; // toggle off
    } else {
      state.userAnswers[qId] = optionNo;
    }
    saveLocalStorageState();
    renderQuestions();
    renderOMRSheet();
    updateProgressUI();
  }

  function toggleBookmark(qId) {
    if (state.bookmarks.has(qId)) {
      state.bookmarks.delete(qId);
    } else {
      state.bookmarks.add(qId);
    }
    saveLocalStorageState();
    renderQuestions();
    renderOMRSheet();
    updateProgressUI();
  }

  // Render All
  function renderAll() {
    renderQuestions();
    renderOMRSheet();
    updateProgressUI();
    updatePaginationUI();
    updateTimerDisplay();
    if (state.isSubmitted) {
      showSubmissionResults();
    } else {
      if (el.resultBanner) el.resultBanner.classList.add('hidden');
    }
  }

  // Render Questions List
  function renderQuestions() {
    if (!state.questions.length) return;

    let displayQuestions = [...state.questions];

    // Filter by subject if tab selected
    if (state.currentSubject > 0) {
      displayQuestions = displayQuestions.filter(q => q.subjectNo === state.currentSubject);
    }

    // Filter by view mode (Page vs Focus vs All)
    if (state.viewMode === 'page') {
      const startQ = (state.currentPage - 1) * 5 + 1;
      const endQ = state.currentPage * 5;
      displayQuestions = displayQuestions.filter(q => q.id >= startQ && q.id <= endQ);
    } else if (state.viewMode === 'focus') {
      displayQuestions = displayQuestions.filter(q => q.id === state.focusedQId);
    }

    // Filter by review mode if submitted
    if (state.isSubmitted) {
      if (state.reviewFilter === 'wrong') {
        displayQuestions = displayQuestions.filter(q => state.userAnswers[q.id] !== q.answer);
      } else if (state.reviewFilter === 'bookmarked') {
        displayQuestions = displayQuestions.filter(q => state.bookmarks.has(q.id));
      }
    }

    if (!displayQuestions.length) {
      el.questionsList.innerHTML = `
        <div class="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
          <i data-lucide="check-circle" class="w-12 h-12 text-slate-300 mx-auto mb-3"></i>
          <p class="font-bold text-slate-700">해당 조건에 해당하는 문제가 없습니다.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }

    el.questionsList.innerHTML = displayQuestions.map(q => renderQuestionCard(q)).join('');
    lucide.createIcons();

    // Attach Click Events to options and bookmarks
    displayQuestions.forEach(q => {
      // Option buttons
      for (let i = 1; i <= 4; i++) {
        const btn = document.getElementById(`opt-${q.id}-${i}`);
        if (btn) {
          btn.addEventListener('click', () => {
            state.focusedQId = q.id;
            selectAnswer(q.id, i);
          });
        }
      }

      // Bookmark button
      const bmBtn = document.getElementById(`bm-btn-${q.id}`);
      if (bmBtn) {
        bmBtn.addEventListener('click', () => toggleBookmark(q.id));
      }

      // Practice mode explanation toggle
      const expToggleBtn = document.getElementById(`exp-toggle-${q.id}`);
      if (expToggleBtn) {
        expToggleBtn.addEventListener('click', () => {
          const expBox = document.getElementById(`exp-box-${q.id}`);
          if (expBox) expBox.classList.toggle('hidden');
        });
      }
    });
  }

  // Render Individual Question Card HTML
  function renderQuestionCard(q) {
    const isBookmarked = state.bookmarks.has(q.id);
    const userAnswer = state.userAnswers[q.id];
    const isCorrect = userAnswer === q.answer;
    const isAnswered = userAnswer !== undefined;

    // Border and status classes
    let statusBadge = '';
    let cardBorderClass = 'border-slate-200';

    if (state.isSubmitted || state.examMode === 'practice') {
      if (isAnswered) {
        if (isCorrect) {
          cardBorderClass = 'border-emerald-300 ring-1 ring-emerald-200';
          statusBadge = `
            <span class="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
              <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> 정답
            </span>
          `;
        } else {
          cardBorderClass = 'border-rose-300 ring-1 ring-rose-200';
          statusBadge = `
            <span class="bg-rose-100 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-rose-200">
              <i data-lucide="x" class="w-3.5 h-3.5 text-rose-600"></i> 오답 (선택: ${NUM_MAP[userAnswer]} / 정답: ${NUM_MAP[q.answer]})
            </span>
          `;
        }
      } else if (state.isSubmitted) {
        cardBorderClass = 'border-amber-300';
        statusBadge = `
          <span class="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200">
            <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-amber-600"></i> 미풀이 (정답: ${NUM_MAP[q.answer]})
          </span>
        `;
      }
    }

    return `
      <div id="q-card-${q.id}" class="bg-white rounded-2xl border ${cardBorderClass} shadow-sm p-6 space-y-4 transition-all hover:shadow-md">
        
        <!-- Card Header: Badges & Bookmark -->
        <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="bg-slate-900 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg">
              Q${String(q.id).padStart(2, '0')}
            </span>
            <span class="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-lg border border-blue-100">
              ${q.subjectName}
            </span>
            ${statusBadge}
          </div>

          <button id="bm-btn-${q.id}" title="나중에 다시 볼 문제로 표시" class="p-1.5 rounded-lg transition-colors ${isBookmarked ? 'bg-amber-100 text-amber-600' : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'}">
            <i data-lucide="star" class="w-5 h-5 ${isBookmarked ? 'fill-amber-400 text-amber-500' : ''}"></i>
          </button>
        </div>

        <!-- Question Text -->
        <h3 class="text-base md:text-lg font-bold text-slate-900 leading-relaxed">
          ${q.id}. ${q.question}
        </h3>

        <!-- Extra Callout Box (<보기>) if exists -->
        ${q.boxContent ? `
          <div class="callout-box p-4 rounded-xl text-sm text-slate-800 space-y-1 font-medium leading-relaxed my-3 border border-slate-200/80 shadow-inner">
            <div class="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
              <i data-lucide="file-text" class="w-3.5 h-3.5"></i> [보기]
            </div>
            ${q.boxContent.split('\n').map(line => `<div>${line}</div>`).join('')}
          </div>
        ` : ''}

        <!-- Options (① ② ③ ④) -->
        <div class="grid grid-cols-1 gap-2.5 pt-2">
          ${q.options.map(opt => {
            const isSelected = userAnswer === opt.no;
            let optStyleClass = 'border-slate-200 hover:border-blue-400 bg-white text-slate-800';

            if (state.isSubmitted || (state.examMode === 'practice' && isAnswered)) {
              if (opt.no === q.answer) {
                optStyleClass = 'correct-option border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
              } else if (isSelected) {
                optStyleClass = 'wrong-option border-rose-500 bg-rose-50 text-rose-900 font-bold';
              }
            } else if (isSelected) {
              optStyleClass = 'selected-option border-blue-600 bg-blue-50/80 text-blue-900 font-semibold';
            }

            return `
              <button id="opt-${q.id}-${opt.no}" class="option-btn w-full text-left p-3.5 rounded-xl border ${optStyleClass} flex items-start gap-3 text-sm transition-all">
                <span class="cir-num w-6 h-6 rounded-full border border-slate-300 bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-colors">
                  ${opt.no}
                </span>
                <span class="flex-1 leading-normal pt-0.5">${opt.text}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Explanation Section -->
        ${(state.isSubmitted || state.examMode === 'practice') ? `
          <div class="pt-3 border-t border-slate-100">
            <button id="exp-toggle-${q.id}" class="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1.5 py-1">
              <i data-lucide="help-circle" class="w-4 h-4"></i>
              <span>상세 해설 보기/접기</span>
            </button>

            <div id="exp-box-${q.id}" class="${(state.isSubmitted || isAnswered) ? '' : 'hidden'} mt-3 bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2 leading-relaxed border border-slate-800 shadow-inner">
              <div class="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                <span class="font-bold text-amber-400 flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> 정답: ${NUM_MAP[q.answer]}
                </span>
                <span class="text-[11px] text-slate-400">${q.subjectName}</span>
              </div>
              <p class="text-slate-300 font-normal pt-1">${q.explanation || '해설이 제공됩니다.'}</p>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  }

  // Render OMR Sheet Sidebar
  function renderOMRSheet() {
    if (!state.questions.length) return;

    let omrQuestions = [...state.questions];
    if (state.omrSubjectFilter !== 'all') {
      const subjNo = parseInt(state.omrSubjectFilter);
      omrQuestions = omrQuestions.filter(q => q.subjectNo === subjNo);
    }

    el.omrContainer.innerHTML = omrQuestions.map(q => {
      const userAnswer = state.userAnswers[q.id];
      const isBookmarked = state.bookmarks.has(q.id);
      const isCurrent = state.focusedQId === q.id;

      return `
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors ${isCurrent ? 'bg-blue-50/50 border-blue-300 ring-1 ring-blue-200' : ''}">
          
          <div class="flex items-center gap-2 cursor-pointer" onclick="window.scrollToQuestion(${q.id})">
            <span class="text-xs font-bold ${userAnswer !== undefined ? 'text-blue-600' : 'text-slate-400'} w-7">
              Q${String(q.id).padStart(2, '0')}
            </span>
            ${isBookmarked ? '<i data-lucide="star" class="w-3.5 h-3.5 fill-amber-400 text-amber-500"></i>' : ''}
          </div>

          <div class="flex items-center gap-1">
            ${[1, 2, 3, 4].map(optNo => {
              const isSelected = userAnswer === optNo;
              let bubbleClass = 'border-slate-300 bg-white text-slate-600 hover:border-blue-500';

              if (state.isSubmitted) {
                if (optNo === q.answer) {
                  bubbleClass = 'correct-bubble border-emerald-600 bg-emerald-600 text-white font-bold';
                } else if (isSelected) {
                  bubbleClass = 'wrong-bubble border-rose-600 bg-rose-600 text-white font-bold';
                }
              } else if (isSelected) {
                bubbleClass = 'selected-bubble border-blue-600 bg-blue-600 text-white font-bold';
              }

              return `
                <button onclick="window.selectOMRAnswer(${q.id}, ${optNo})" class="omr-bubble w-6 h-6 rounded-full border text-[11px] flex items-center justify-center font-semibold ${bubbleClass}">
                  ${optNo}
                </button>
              `;
            }).join('')}
          </div>

        </div>
      `;
    }).join('');

    lucide.createIcons();
  }

  // Global window functions for inline onclick handler
  window.scrollToQuestion = function (qId) {
    state.focusedQId = qId;

    // Auto sync current subject if target question is from another subject
    const qObj = state.questions.find(q => q.id === qId);
    if (qObj && state.currentSubject > 0 && qObj.subjectNo !== state.currentSubject) {
      setSubjectFilter(qObj.subjectNo);
      return;
    }

    if (state.viewMode === 'page') {
      state.currentPage = Math.floor((qId - 1) / 5) + 1;
    } else if (state.viewMode === 'focus') {
      state.focusedQId = qId;
    }
    renderQuestions();
    updatePaginationUI();
    renderOMRSheet();

    setTimeout(() => {
      const card = document.getElementById(`q-card-${qId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  window.selectOMRAnswer = function (qId, optionNo) {
    state.focusedQId = qId;
    selectAnswer(qId, optionNo);
  };

  // Update Progress UI
  function updateProgressUI() {
    const answeredCount = Object.keys(state.userAnswers).length;
    el.answeredCountBadge.textContent = `${answeredCount} / 80`;
    
    const pct = Math.round((answeredCount / 80) * 100);
    el.progressBarInner.style.width = `${pct}%`;

    el.bookmarkCountNum.textContent = state.bookmarks.size;
  }

  // Pre-Submit Handler
  function handlePreSubmit() {
    const answeredCount = Object.keys(state.userAnswers).length;
    const unansweredCount = 80 - answeredCount;

    if (unansweredCount > 0) {
      el.unansweredCountNum.textContent = `${unansweredCount}개`;
      el.unansweredModal.classList.remove('hidden');
    } else {
      if (confirm('모든 문항의 정답을 기입했습니다. 정답을 제출하시겠습니까?')) {
        submitExam();
      }
    }
  }

  // Submit Exam & Calculate Scores
  function submitExam() {
    state.isSubmitted = true;
    state.isTimerRunning = false;
    saveLocalStorageState();
    showSubmissionResults();
    renderAll();
    el.scoreModal.classList.remove('hidden');
  }

  // Calculate & Display Results Report
  function showSubmissionResults() {
    let totalCorrect = 0;
    const subjectScores = {
      1: { correct: 0, total: 20 },
      2: { correct: 0, total: 20 },
      3: { correct: 0, total: 20 },
      4: { correct: 0, total: 20 }
    };

    state.questions.forEach(q => {
      const userAnswer = state.userAnswers[q.id];
      if (userAnswer === q.answer) {
        totalCorrect++;
        if (subjectScores[q.subjectNo]) {
          subjectScores[q.subjectNo].correct++;
        }
      }
    });

    const totalScore = (totalCorrect * 1.25).toFixed(1);
    const accuracyRate = Math.round((totalCorrect / 80) * 100);

    // Pass / Fail Determination: Average >= 60 AND all subjects >= 40 (i.e. correct >= 8 per subject)
    let isPass = parseFloat(totalScore) >= 60.0;
    let hasFailedSubject = false;

    for (let s = 1; s <= 4; s++) {
      const sScore = subjectScores[s].correct * 5; // 20 questions * 5 = 100 points
      if (sScore < 40) {
        hasFailedSubject = true;
      }
    }

    if (hasFailedSubject) {
      isPass = false;
    }

    // Update Result Banner
    el.resultBanner.classList.remove('hidden');
    el.bannerTotalScore.textContent = `${totalScore}점`;
    el.bannerCorrectCount.textContent = `${totalCorrect}문항`;

    if (isPass) {
      el.passFailBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-emerald-500 text-white shadow-lg shadow-emerald-500/30';
      el.passFailBadge.textContent = '최종 합격 (PASS)';
    } else {
      el.passFailBadge.className = 'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-500 text-white shadow-lg shadow-rose-500/30';
      el.passFailBadge.textContent = hasFailedSubject ? '불합격 (과락 발생)' : '불합격 (총점 미달)';
    }

    // Update Modal
    el.modalTotalScore.textContent = totalScore;
    el.modalCorrectCount.textContent = `${totalCorrect}개`;
    el.modalAccuracyRate.textContent = `${accuracyRate}%`;

    if (isPass) {
      el.modalPassTag.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-700 border border-emerald-200';
      el.modalPassTag.textContent = '🎉 최종 합격 기준 달성';
    } else {
      el.modalPassTag.className = 'inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200';
      el.modalPassTag.textContent = hasFailedSubject ? '⚠️ 과락 과목 존재 (40점 미만)' : '⚠️ 총점 미달 (60점 미만)';
    }

    // Render Subject List in Modal
    el.modalSubjectList.innerHTML = [1, 2, 3, 4].map(sNo => {
      const sObj = subjectScores[sNo];
      const score = sObj.correct * 5;
      const isSubjectPass = score >= 40;

      return `
        <div class="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="font-bold text-slate-800">${SUBJECT_NAMES[sNo]}</span>
            <div class="flex items-center gap-2">
              <span class="font-black text-slate-900 text-sm">${score}점</span>
              <span class="text-slate-500 text-xs">(${sObj.correct}/20)</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold ${isSubjectPass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                ${isSubjectPass ? '통과' : '과락'}
              </span>
            </div>
          </div>
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="h-2 rounded-full ${isSubjectPass ? 'bg-blue-600' : 'bg-rose-500'}" style="width: ${score}%"></div>
          </div>
        </div>
      `;
    }).join('');
  }

})();
