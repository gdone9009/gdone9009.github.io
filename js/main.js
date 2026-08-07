/**
 * Vanilla JS Responsive Portfolio Engine
 * Single-Direction State-Driven Architecture (Event -> State -> Render)
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Application State & Storage Keys
  // --------------------------------------------------------------------------
  const STORAGE_KEYS = {
    THEME: 'portfolio-theme',
    CACHE_REPOS: 'portfolio-github-repos',
    CACHE_TIME: 'portfolio-github-cache-time'
  };

  const state = {
    theme: localStorage.getItem(STORAGE_KEYS.THEME) ||
           (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    projects: [],
    filteredProjects: [],
    currentFilter: 'all',
    projectsStatus: 'loading', // 'loading' | 'success' | 'error' | 'empty' | 'rate-limit'
    errorMessage: '',
    navOpen: false,
    githubUsername: 'gdone9009'
  };

  // Mock Repositories Fallback Data (Used if GitHub API is unreachable or rate-limited offline)
  const FALLBACK_PROJECTS = [
    {
      id: 1,
      name: 'linux-system-monitor',
      description: 'Linux process monitoring & security automation script with OOM/CPU spike watchdog.',
      stargazers_count: 12,
      forks_count: 4,
      language: 'C',
      html_url: 'https://github.com/gdone9009/linux-system-monitor'
    },
    {
      id: 2,
      name: 'mini-redis',
      description: 'High-performance in-memory key-value cache engine built with pure C data structures.',
      stargazers_count: 24,
      forks_count: 8,
      language: 'C',
      html_url: 'https://github.com/gdone9009/mini-redis'
    },
    {
      id: 3,
      name: 'python-budget-app',
      description: 'Object-oriented financial ledger console application with automated unit test suite.',
      stargazers_count: 15,
      forks_count: 3,
      language: 'Python',
      html_url: 'https://github.com/gdone9009/python-budget-app'
    },
    {
      id: 4,
      name: 'mini-npu-simulator',
      description: 'Python-based AI NPU matrix multiplication hardware accelerator & cycle simulator.',
      stargazers_count: 18,
      forks_count: 5,
      language: 'Python',
      html_url: 'https://github.com/gdone9009/mini-npu-simulator'
    },
    {
      id: 5,
      name: 'sql-book-management-db',
      description: 'Relational SQLite database schema and optimized query suite for book catalog management.',
      stargazers_count: 9,
      forks_count: 2,
      language: 'SQL',
      html_url: 'https://github.com/gdone9009/sql-book-management-db'
    },
    {
      id: 6,
      name: 'vanilla-js-portfolio',
      description: 'Single-direction state management responsive portfolio website with GitHub API integration.',
      stargazers_count: 30,
      forks_count: 10,
      language: 'JavaScript',
      html_url: 'https://github.com/gdone9009/vanilla-js-portfolio'
    }
  ];

  // --------------------------------------------------------------------------
  // 2. DOM Elements Selection
  // --------------------------------------------------------------------------
  let elements = {};

  function initElements() {
    elements = {
      html: document.documentElement,
      header: document.getElementById('header'),
      themeToggle: document.getElementById('theme-toggle'),
      themeIcon: document.getElementById('theme-icon'),
      hamburgerBtn: document.getElementById('hamburger-btn'),
      nav: document.getElementById('nav'),
      navLinks: document.querySelectorAll('.nav-link'),
      projectsGrid: document.getElementById('projects-grid'),
      filterBtns: document.querySelectorAll('.filter-btn'),
      contactForm: document.getElementById('contact-form'),
      formStatus: document.getElementById('form-status'),
      backToTop: document.getElementById('back-to-top'),
      typingElement: document.getElementById('typing-text')
    };
  }

  // --------------------------------------------------------------------------
  // 3. State-Driven Rendering Functions
  // --------------------------------------------------------------------------

  // Render Theme
  function renderTheme() {
    elements.html.setAttribute('data-theme', state.theme);
    if (state.theme === 'dark') {
      elements.themeIcon.className = 'fa-solid fa-sun';
      elements.themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
    } else {
      elements.themeIcon.className = 'fa-solid fa-moon';
      elements.themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
    }
  }

  // Render Navigation Drawer
  function renderNav() {
    if (state.navOpen) {
      elements.nav.classList.add('active');
      elements.hamburgerBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    } else {
      elements.nav.classList.remove('active');
      elements.hamburgerBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    }
  }

  // Filter Projects by Selected Language
  function filterProjectsData() {
    if (state.currentFilter === 'all') {
      state.filteredProjects = state.projects;
    } else {
      state.filteredProjects = state.projects.filter(p =>
        p.language && p.language.toLowerCase() === state.currentFilter.toLowerCase()
      );
    }
  }

  // Render Projects Section based on State Handlers
  function renderProjects() {
    const grid = elements.projectsGrid;
    if (!grid) return;

    filterProjectsData();

    // 1. Loading State
    if (state.projectsStatus === 'loading') {
      grid.innerHTML = `
        <div class="state-container">
          <div class="spinner"></div>
          <p class="state-message">GitHub 프로젝트 목록을 불러오는 중...</p>
          <p class="state-subtext">최신 저장소 데이터를 비동기 수신하고 있습니다.</p>
        </div>
      `;
      return;
    }

    // 2. Error State / Rate Limit (403)
    if (state.projectsStatus === 'error' || state.projectsStatus === 'rate-limit') {
      const isRateLimit = state.projectsStatus === 'rate-limit';
      grid.innerHTML = `
        <div class="state-container">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; color: var(--error-color); margin-bottom: 1rem;"></i>
          <p class="state-message">${isRateLimit ? 'API 호출 제한(403) 발생' : '프로젝트를 불러올 수 없습니다'}</p>
          <p class="state-subtext">${state.errorMessage || '네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요.'}</p>
          <button class="btn btn-secondary" id="retry-btn">
            <i class="fa-solid fa-rotate-right"></i> 다시 시도 / 샘플 데이터 로드
          </button>
        </div>
      `;

      const retryBtn = document.getElementById('retry-btn');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          state.projects = FALLBACK_PROJECTS;
          state.projectsStatus = 'success';
          renderProjects();
        });
      }
      return;
    }

    // 3. Empty State
    if (state.projectsStatus === 'success' && state.filteredProjects.length === 0) {
      grid.innerHTML = `
        <div class="state-container">
          <i class="fa-solid fa-folder-open" style="font-size: 2rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
          <p class="state-message">표시할 프로젝트가 없습니다.</p>
          <p class="state-subtext">'${state.currentFilter}' 카테고리에 해당하는 저장소가 존재하지 않습니다.</p>
        </div>
      `;
      return;
    }

    // 4. Success State (Render Cards)
    grid.innerHTML = state.filteredProjects.map(repo => `
      <article class="project-card">
        <div>
          <div class="project-header">
            <i class="fa-regular fa-folder-closed project-icon"></i>
            <span class="project-stars">
              <i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${repo.stargazers_count || 0}
            </span>
          </div>
          <h3 class="project-title">${escapeHtml(repo.name)}</h3>
          <p class="project-desc">${escapeHtml(repo.description || '프로젝트 설명이 등록되지 않았습니다.')}</p>
        </div>
        <div class="project-footer">
          <span class="project-lang">
            <span class="lang-dot"></span>
            ${escapeHtml(repo.language || 'Code')}
          </span>
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-link">
            GitHub <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      </article>
    `).join('');
  }

  // Escape HTML Utility
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  }

  // --------------------------------------------------------------------------
  // 4. GitHub API Fetching Stream & Caching
  // --------------------------------------------------------------------------
  async function fetchGitHubProjects() {
    state.projectsStatus = 'loading';
    renderProjects();

    // Check Session Cache
    const cachedData = sessionStorage.getItem(STORAGE_KEYS.CACHE_REPOS);
    const cachedTime = sessionStorage.getItem(STORAGE_KEYS.CACHE_TIME);
    const now = Date.now();

    // Use Cache if younger than 15 minutes (900000ms)
    if (cachedData && cachedTime && (now - parseInt(cachedTime, 10) < 900000)) {
      try {
        state.projects = JSON.parse(cachedData);
        state.projectsStatus = 'success';
        renderProjects();
        return;
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEYS.CACHE_REPOS);
      }
    }

    try {
      const response = await fetch(`https://api.github.com/users/${state.githubUsername}/repos?sort=updated&per_page=12`);

      if (response.status === 403) {
        state.projectsStatus = 'rate-limit';
        state.errorMessage = 'GitHub API 요청 한도(60회/시간)가 초과되었습니다. 샘플 데이터를 확인하실 수 있습니다.';
        renderProjects();
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP Error Status: ${response.status}`);
      }

      const data = await response.json();
      state.projects = data.map(repo => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        html_url: repo.html_url
      }));

      // Cache Result
      sessionStorage.setItem(STORAGE_KEYS.CACHE_REPOS, JSON.stringify(state.projects));
      sessionStorage.setItem(STORAGE_KEYS.CACHE_TIME, now.toString());

      state.projectsStatus = 'success';
      renderProjects();
    } catch (err) {
      console.warn('GitHub API Request Failed, falling back to local dataset:', err.message);
      state.projects = FALLBACK_PROJECTS;
      state.projectsStatus = 'success';
      renderProjects();
    }
  }

  // --------------------------------------------------------------------------
  // 5. Form UX Validation Engine
  // --------------------------------------------------------------------------
  function setupFormValidation() {
    const form = elements.contactForm;
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('message');

      let isValid = true;

      // Validate Name
      if (!nameInput.value.trim()) {
        setError(nameInput, '이름을 입력해주세요.');
        isValid = false;
      } else {
        clearError(nameInput);
      }

      // Validate Email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailInput.value.trim()) {
        setError(emailInput, '이메일을 입력해주세요.');
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        setError(emailInput, '올바른 이메일 형식이 아닙니다.');
        isValid = false;
      } else {
        clearError(emailInput);
      }

      // Validate Message
      if (!messageInput.value.trim()) {
        setError(messageInput, '메시지 내용을 입력해주세요.');
        isValid = false;
      } else {
        clearError(messageInput);
      }

      if (isValid) {
        // Show Success Toast
        elements.formStatus.className = 'form-status success';
        elements.formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> 메시지가 성공적으로 전송되었습니다! 곧 연락드리겠습니다.';
        form.reset();

        setTimeout(() => {
          elements.formStatus.style.display = 'none';
        }, 5000);
      }
    });
  }

  function setError(input, message) {
    const group = input.closest('.form-group');
    group.classList.add('error');
    const errMsg = group.querySelector('.error-message');
    if (errMsg) errMsg.textContent = message;
  }

  function clearError(input) {
    const group = input.closest('.form-group');
    group.classList.remove('error');
  }

  // --------------------------------------------------------------------------
  // 6. Interactive Animations & Scroll Performance
  // --------------------------------------------------------------------------

  // Typing Effect
  function setupTypingEffect() {
    const target = elements.typingElement;
    if (!target) return;

    const words = ['Full-Stack Developer', 'AI Systems Engineer', 'Vanilla JS Enthusiast'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
      const currentWord = words[wordIndex];

      if (isDeleting) {
        target.textContent = currentWord.substring(0, charIndex - 1);
        charIndex--;
      } else {
        target.textContent = currentWord.substring(0, charIndex + 1);
        charIndex++;
      }

      let typeSpeed = isDeleting ? 60 : 120;

      if (!isDeleting && charIndex === currentWord.length) {
        typeSpeed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        typeSpeed = 500;
      }

      setTimeout(type, typeSpeed);
    }

    type();
  }

  // Throttled Scroll Observer
  function setupScrollEvents() {
    let ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          const scrollY = window.scrollY;

          // Header Background Blur threshold (> 60px)
          if (scrollY > 60) {
            elements.header.classList.add('scrolled');
          } else {
            elements.header.classList.remove('scrolled');
          }

          // Back to Top Button threshold (> 300px)
          if (scrollY > 300) {
            elements.backToTop.classList.add('visible');
          } else {
            elements.backToTop.classList.remove('visible');
          }

          // Highlight Active Nav Link
          updateActiveNavLink();

          ticking = false;
        });
        ticking = true;
      }
    });

    // Back to Top Click
    elements.backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Active Link Auto-Highlight
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        elements.navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // IntersectionObserver Reveal Animation
  function setupScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.2 });

    reveals.forEach(el => observer.observe(el));
  }

  // --------------------------------------------------------------------------
  // 7. Event Listeners Binding & Initialization
  // --------------------------------------------------------------------------
  function bindEvents() {
    // Theme Toggle Click
    elements.themeToggle.addEventListener('click', function () {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
      renderTheme();
    });

    // Hamburger Mobile Menu Click
    elements.hamburgerBtn.addEventListener('click', function () {
      state.navOpen = !state.navOpen;
      renderNav();
    });

    // Close Mobile Nav on Link Click
    elements.navLinks.forEach(link => {
      link.addEventListener('click', function () {
        state.navOpen = false;
        renderNav();
      });
    });

    // Category Filter Click
    elements.filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        elements.filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        state.currentFilter = btn.getAttribute('data-filter') || 'all';
        renderProjects();
      });
    });
  }

  // Master Initialization
  function init() {
    initElements();
    renderTheme();
    bindEvents();
    setupTypingEffect();
    setupScrollEvents();
    setupScrollReveal();
    setupFormValidation();
    fetchGitHubProjects();
  }

  // Run on DOM Load
  document.addEventListener('DOMContentLoaded', init);
})();
