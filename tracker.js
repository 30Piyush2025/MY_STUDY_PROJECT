/**
 * Piyush Tiwari • Multi-Course AI & Data Science Learning Hub
 * Multi-Page Routing, Animations, Multi-Course Architecture & Dynamic Forecaster
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'piyush_multicourse_tracker_v2';

  // Default Persistent State
  const defaultState = {
    activeCourseId: 'campusx_dsmp',
    activePage: 'dashboard',
    targetHoursPerDay: 2.5,
    completedTopics: {},    // { [topicId]: true }
    completedLectures: {},  // { [lectureId]: true }
    lectureNotes: {},       // { [lectureId]: string }
    dailyLogs: [],          // [ { id, date, durationMin, courseId, lectureId, lectureTitle, notes, timestamp } ]
    activePhase: 'all',
    activeStatus: 'all',
    searchQuery: '',
    expandedModules: {}
  };

  let appState = (function () {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return Object.assign({}, defaultState, JSON.parse(saved));
      }
      // Migrate from old v1 if exists
      const old = localStorage.getItem('campusx_dsmp_tracker_v1');
      if (old) {
        const oldData = JSON.parse(old);
        return Object.assign({}, defaultState, oldData);
      }
    } catch (e) {
      console.warn('Could not read state', e);
    }
    return Object.assign({}, defaultState);
  })();

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
      showToast('⚠️ Storage limit reached', 'warning');
    }
  }

  // Timer Variables
  let timerInterval = null;
  let timerRunning = false;
  let timerStartTime = 0;
  let timerAccumulatedSeconds = 0;
  let selectedLectureForTimer = null;

  // Data References
  let allData = null;
  let currentCourse = null;
  const courseMap = new Map();
  const lectureMap = new Map();
  const topicMap = new Map();

  function initData() {
    allData = window.ALL_COURSES_DATA;
    if (!allData || !allData.courses) {
      console.error('ALL_COURSES_DATA not loaded');
      return;
    }

    allData.courses.forEach(c => {
      courseMap.set(c.id, c);
      c.modules.forEach(m => {
        m.sessions.forEach(s => {
          lectureMap.set(s.id, { lecture: s, module: m, course: c });
          s.topics.forEach(t => {
            topicMap.set(t.id, { topic: t, lecture: s, module: m, course: c });
          });
        });
      });
    });

    if (!courseMap.has(appState.activeCourseId)) {
      appState.activeCourseId = 'campusx_dsmp';
    }
    currentCourse = courseMap.get(appState.activeCourseId);
  }

  // --- Multi-Page Router ---
  function navigateToPage(pageId, pushHash = true) {
    const validPages = ['dashboard', 'curriculum', 'planner', 'analytics', 'notes'];
    if (!validPages.includes(pageId)) pageId = 'dashboard';

    appState.activePage = pageId;
    saveState();

    // Update Nav Tab UI
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.page === pageId);
    });

    // Update Page View Visibility
    document.querySelectorAll('.app-page').forEach(page => {
      if (page.id === `page-${pageId}`) {
        page.classList.add('active');
      } else {
        page.classList.remove('active');
      }
    });

    if (pushHash) {
      window.location.hash = pageId;
    }

    // Refresh contents of target page
    if (pageId === 'dashboard') {
      renderDashboard();
    } else if (pageId === 'curriculum') {
      renderCurriculumPage();
    } else if (pageId === 'planner') {
      renderPlannerPage();
    } else if (pageId === 'analytics') {
      renderAnalyticsPage();
    } else if (pageId === 'notes') {
      renderNotesPage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleHashChange() {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      navigateToPage(hash, false);
    } else {
      navigateToPage(appState.activePage || 'dashboard', false);
    }
  }

  // --- Metrics Calculation Engine ---
  function getCourseMetrics(c) {
    const totalLectures = c.total_lectures || 0;
    const totalTopics = c.total_topics || 0;
    const totalHours = c.estimated_hours || 0;

    let completedLecturesCount = 0;
    let completedTopicsCount = 0;
    let completedMinutes = 0;

    c.modules.forEach(m => {
      m.sessions.forEach(s => {
        const isLecDone = !!appState.completedLectures[s.id];
        let sessTopicsDone = 0;

        s.topics.forEach(t => {
          if (appState.completedTopics[t.id]) {
            sessTopicsDone++;
            completedTopicsCount++;
          }
        });

        if (isLecDone || (s.topics.length > 0 && sessTopicsDone === s.topics.length)) {
          completedLecturesCount++;
          completedMinutes += s.estimated_minutes;
        } else if (sessTopicsDone > 0 && s.topics.length > 0) {
          completedMinutes += s.estimated_minutes * (sessTopicsDone / s.topics.length);
        }
      });
    });

    const completedHours = completedMinutes / 60;
    const remainingHours = Math.max(0, totalHours - completedHours);
    const lecturePercent = totalLectures > 0 ? Math.min(100, Math.round((completedLecturesCount / totalLectures) * 100)) : 0;
    const topicPercent = totalTopics > 0 ? Math.min(100, Math.round((completedTopicsCount / totalTopics) * 100)) : 0;

    return {
      totalLectures,
      completedLecturesCount,
      remainingLecturesCount: totalLectures - completedLecturesCount,
      lecturePercent,
      totalTopics,
      completedTopicsCount,
      remainingTopicsCount: totalTopics - completedTopicsCount,
      topicPercent,
      totalHours: roundOne(totalHours),
      completedHours: roundOne(completedHours),
      remainingHours: roundOne(remainingHours)
    };
  }

  function getGlobalMetrics() {
    let totalLecs = 0;
    let completedLecs = 0;
    let totalTops = 0;
    let completedTops = 0;
    let totalHrs = 0;
    let completedHrs = 0;

    allData.courses.forEach(c => {
      const m = getCourseMetrics(c);
      totalLecs += m.totalLectures;
      completedLecs += m.completedLecturesCount;
      totalTops += m.totalTopics;
      completedTops += m.completedTopicsCount;
      totalHrs += m.totalHours;
      completedHrs += m.completedHours;
    });

    const remainingHrs = Math.max(0, totalHrs - completedHrs);
    const overallPercent = totalLecs > 0 ? Math.min(100, Math.round((completedLecs / totalLecs) * 100)) : 0;

    // Today's Study Time
    const todayStr = getTodayDateString();
    let todayMinutes = 0;
    let totalLoggedMinutes = 0;
    appState.dailyLogs.forEach(l => {
      totalLoggedMinutes += l.durationMin || 0;
      if (l.date === todayStr) {
        todayMinutes += l.durationMin || 0;
      }
    });

    return {
      totalLecs,
      completedLecs,
      remainingLecs: totalLecs - completedLecs,
      totalTops,
      completedTops,
      totalHrs: roundOne(totalHrs),
      completedHrs: roundOne(completedHrs),
      remainingHrs: roundOne(remainingHrs),
      overallPercent,
      todayMinutes,
      totalLoggedMinutes,
      streak: computeStudyStreak()
    };
  }

  function roundOne(n) {
    return Math.round(n * 10) / 10;
  }

  function getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function computeStudyStreak() {
    if (!appState.dailyLogs || appState.dailyLogs.length === 0) return 0;
    const dates = new Set(appState.dailyLogs.map(l => l.date));
    let streak = 0;
    let curr = new Date();
    const todayStr = getTodayDateString();
    if (!dates.has(todayStr)) {
      curr.setDate(curr.getDate() - 1);
    }
    while (true) {
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, '0');
      const d = String(curr.getDate()).padStart(2, '0');
      if (dates.has(`${y}-${m}-${d}`)) {
        streak++;
        curr.setDate(curr.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  // --- PAGE 1: RENDER DASHBOARD ---
  function renderDashboard() {
    const g = getGlobalMetrics();

    // Stats Grid
    animateCounter('dash-overall-percent', g.overallPercent, '%');
    document.getElementById('dash-overall-bar').style.width = `${g.overallPercent}%`;
    document.getElementById('dash-overall-sub').textContent = `${g.completedLecs} of ${g.totalLecs} Lectures Done`;

    animateCounter('dash-total-hours-rem', g.remainingHrs, 'h');
    document.getElementById('dash-hours-sub').textContent = `${g.completedHrs}h completed of ${g.totalHrs}h`;

    const todayH = Math.floor(g.todayMinutes / 60);
    const todayM = g.todayMinutes % 60;
    document.getElementById('dash-today-time').textContent = `${todayH}h ${todayM}m`;
    document.getElementById('dash-streak-badge').textContent = `🔥 ${g.streak}-Day Streak`;

    document.getElementById('dash-total-courses').textContent = allData.courses.length;

    // Render Course Cards in Grid
    const container = document.getElementById('dash-courses-grid');
    if (!container) return;
    container.innerHTML = '';

    allData.courses.forEach(c => {
      const m = getCourseMetrics(c);
      const card = document.createElement('div');
      card.className = 'course-card';
      card.innerHTML = `
        <div class="course-card-top">
          <div class="course-card-header">
            <div class="course-icon-badge">${c.icon}</div>
            <span class="course-instructor-badge">${escapeHTML(c.instructor)}</span>
          </div>
          <h3 class="course-card-title">${escapeHTML(c.title)}</h3>
          <p class="course-card-focus">${escapeHTML(c.focus || '')}</p>
          <div class="course-meta-tags">
            <span>📚 ${c.total_modules} Modules</span>
            <span>•</span>
            <span>🎥 ${c.total_lectures} Lectures</span>
            <span>•</span>
            <span>⏱️ ${c.estimated_hours}h</span>
          </div>
        </div>
        <div class="course-card-bottom">
          <div class="course-progress-row">
            <span>Progress</span>
            <strong>${m.completedLecturesCount}/${m.totalLectures} (${m.lecturePercent}%)</strong>
          </div>
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" style="width: ${m.lecturePercent}%;"></div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
            <span style="font-size: 0.74rem; color: var(--text-sub);">${m.remainingHours}h left</span>
            <button class="btn btn-sm btn-primary btn-open-course" data-course-id="${c.id}">
              Open Curriculum →
            </button>
          </div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-open-course') || !e.target.closest('button')) {
          switchCourse(c.id);
          navigateToPage('curriculum');
        }
      });

      container.appendChild(card);
    });

    populateTimerDropdown();
  }

  function switchCourse(courseId) {
    if (!courseMap.has(courseId)) return;
    appState.activeCourseId = courseId;
    currentCourse = courseMap.get(courseId);
    appState.activePhase = 'all';
    appState.searchQuery = '';
    saveState();
  }

  // --- PAGE 2: RENDER CURRICULUM PAGE ---
  function renderCurriculumPage() {
    if (!currentCourse) currentCourse = courseMap.get(appState.activeCourseId) || allData.courses[0];

    // Populate Course Selectors
    const selector = document.getElementById('curriculum-course-select');
    if (selector) {
      selector.innerHTML = '';
      allData.courses.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = `${c.icon} ${c.title}`;
        opt.selected = c.id === currentCourse.id;
        selector.appendChild(opt);
      });
      selector.onchange = () => {
        switchCourse(selector.value);
        renderCurriculumPage();
      };
    }

    // Update Heading
    document.getElementById('curriculum-course-title').textContent = currentCourse.title;
    document.getElementById('curriculum-course-instructor').textContent = `Instructor: ${currentCourse.instructor} • ${currentCourse.estimated_hours} Hours`;
    document.getElementById('curriculum-course-icon').textContent = currentCourse.icon;

    // Course Progress
    const cm = getCourseMetrics(currentCourse);
    document.getElementById('course-curriculum-metric').textContent = `${cm.completedLecturesCount} / ${cm.totalLectures} Lectures (${cm.lecturePercent}%)`;
    document.getElementById('course-curriculum-bar').style.width = `${cm.lecturePercent}%`;

    // Render Modules
    renderCourseModules();
  }

  function renderCourseModules() {
    const container = document.getElementById('curriculum-modules-list');
    if (!container) return;
    container.innerHTML = '';

    const query = (appState.searchQuery || '').trim().toLowerCase();
    const statusFilter = appState.activeStatus;

    let visibleCount = 0;

    currentCourse.modules.forEach((mod, modIdx) => {
      const filteredSessions = mod.sessions.filter(sess => {
        const isCompleted = !!appState.completedLectures[sess.id];
        const hasSomeTopics = sess.topics.some(t => appState.completedTopics[t.id]);
        const isInProgress = !isCompleted && hasSomeTopics;
        const isPending = !isCompleted && !hasSomeTopics;

        if (statusFilter === 'completed' && !isCompleted) return false;
        if (statusFilter === 'inprogress' && !isInProgress) return false;
        if (statusFilter === 'pending' && !isPending) return false;

        if (query) {
          const modMatch = mod.title.toLowerCase().includes(query);
          const sessMatch = sess.title.toLowerCase().includes(query);
          const topMatch = sess.topics.some(t => t.title.toLowerCase().includes(query));
          return modMatch || sessMatch || topMatch;
        }
        return true;
      });

      if (filteredSessions.length === 0 && query) return;

      visibleCount++;
      const isExpanded = !!appState.expandedModules[mod.id] || !!query || modIdx === 0;

      let modDoneCount = 0;
      mod.sessions.forEach(s => {
        if (appState.completedLectures[s.id]) modDoneCount++;
      });

      const modCard = document.createElement('div');
      modCard.className = `module-card ${isExpanded ? 'expanded' : ''}`;
      modCard.id = `modcard-${mod.id}`;

      modCard.innerHTML = `
        <div class="module-header">
          <div class="module-title-group">
            <span class="module-phase-tag">${mod.phase_icon || '📁'} ${mod.phase}</span>
            <h4 class="module-title">${escapeHTML(mod.title)}</h4>
          </div>
          <div class="module-right-group">
            <span class="module-stat-pill">${modDoneCount}/${mod.sessions.length} done</span>
            <button class="btn btn-sm btn-secondary btn-mark-mod-complete" data-mod-id="${mod.id}" title="Complete all in module">
              ✓ Module Done
            </button>
            <svg class="module-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <div class="module-body">
          <div class="lectures-container" id="lecs-${mod.id}"></div>
        </div>
      `;

      // Header click toggle
      modCard.querySelector('.module-header').addEventListener('click', (e) => {
        if (e.target.closest('.btn-mark-mod-complete')) return;
        const willExpand = !modCard.classList.contains('expanded');
        modCard.classList.toggle('expanded', willExpand);
        appState.expandedModules[mod.id] = willExpand;
        saveState();
      });

      // Mark module complete
      modCard.querySelector('.btn-mark-mod-complete').addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm(`Mark all ${mod.sessions.length} lectures in "${mod.title}" as completed?`)) {
          mod.sessions.forEach(s => {
            appState.completedLectures[s.id] = true;
            s.topics.forEach(t => appState.completedTopics[t.id] = true);
          });
          saveState();
          renderCurriculumPage();
          showToast(`🌟 Completed all in "${mod.title}"!`, 'success');
        }
      });

      const lecsContainer = modCard.querySelector('.lectures-container');
      filteredSessions.forEach(sess => {
        const lecEl = renderLectureRow(sess, mod);
        lecsContainer.appendChild(lecEl);
      });

      container.appendChild(modCard);
    });

    if (visibleCount === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle);">
          <div style="font-size: 2rem; margin-bottom: 8px;">🔍</div>
          <h4 style="color: white; margin-bottom: 4px;">No matching lectures found</h4>
          <p style="font-size: 0.84rem;">Try clearing your search query.</p>
        </div>
      `;
    }
  }

  function renderLectureRow(sess, mod) {
    const isDone = !!appState.completedLectures[sess.id];
    const hasNote = !!appState.lectureNotes[sess.id];

    let topicsDone = 0;
    sess.topics.forEach(t => {
      if (appState.completedTopics[t.id]) topicsDone++;
    });

    let statusClass = isDone ? 'status-completed' : (topicsDone > 0 ? 'status-inprogress' : '');

    const div = document.createElement('div');
    div.className = `lecture-item ${statusClass}`;
    div.id = `lecitem-${sess.id}`;

    div.innerHTML = `
      <div class="lecture-row">
        <div class="lecture-left">
          <div class="lecture-checkbox-custom ${isDone ? 'checked' : ''}" data-lec-id="${sess.id}" title="Toggle Lecture Done"></div>
          <div>
            <div class="lecture-title">${escapeHTML(sess.title)}</div>
            <div class="lecture-meta">
              <span>⏱️ ~${sess.estimated_minutes} min</span>
              <span>•</span>
              <span>📋 ${sess.topics.length} topics</span>
              ${hasNote ? '<span style="color: #fbbf24;">📝 Note</span>' : ''}
            </div>
          </div>
        </div>
        <div class="lecture-actions">
          <button class="btn btn-sm btn-secondary btn-study-lec" title="Link to Stopwatch">
            ⏱️ Study
          </button>
          <button class="btn btn-sm btn-secondary btn-note-lec" title="Notes & Links">
            📝 Note
          </button>
          ${sess.topics.length > 0 ? `
            <button class="btn btn-sm btn-secondary btn-toggle-top">
              Topics (${topicsDone}/${sess.topics.length}) ▾
            </button>
          ` : ''}
        </div>
      </div>
      ${sess.topics.length > 0 ? `
        <div class="topics-container">
          ${sess.topics.map(t => {
            const topDone = !!appState.completedTopics[t.id];
            return `
              <div class="topic-row">
                <div class="topic-check-custom ${topDone ? 'checked' : ''}" data-top-id="${t.id}"></div>
                <div class="topic-text ${topDone ? 'completed' : ''}">${escapeHTML(t.title)}</div>
                ${t.timestamp ? `<span class="topic-timestamp-tag">⏱️ ${t.timestamp}</span>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      ` : ''}
    `;

    // Lecture Checkbox
    div.querySelector('.lecture-checkbox-custom').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLecture(sess, !isDone);
    });

    // Topic Checkboxes
    div.querySelectorAll('.topic-check-custom').forEach(chk => {
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        const tid = chk.dataset.topId;
        toggleTopic(tid, !appState.completedTopics[tid], sess);
      });
    });

    // Toggle topics drawer
    const toggleBtn = div.querySelector('.btn-toggle-top');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        div.classList.toggle('topics-open');
      });
    }

    // Study Now Button
    div.querySelector('.btn-study-lec').addEventListener('click', () => {
      selectLectureForTimer(sess, currentCourse);
      navigateToPage('dashboard');
      showToast(`⏱️ Stopwatch linked to: ${sess.title}`, 'info');
    });

    // Notes Button
    div.querySelector('.btn-note-lec').addEventListener('click', () => {
      openNotesModal(sess.id, sess.title);
    });

    return div;
  }

  function toggleLecture(sess, markDone) {
    if (markDone) {
      appState.completedLectures[sess.id] = true;
      sess.topics.forEach(t => appState.completedTopics[t.id] = true);
      showToast(`🎉 Lecture completed: ${sess.title}`, 'success');
    } else {
      delete appState.completedLectures[sess.id];
      sess.topics.forEach(t => delete appState.completedTopics[t.id]);
    }
    saveState();
    renderCurriculumPage();
  }

  function toggleTopic(topId, markDone, sess) {
    if (markDone) {
      appState.completedTopics[topId] = true;
    } else {
      delete appState.completedTopics[topId];
    }
    // Check parent
    const allDone = sess.topics.length > 0 && sess.topics.every(t => appState.completedTopics[t.id]);
    if (allDone) {
      appState.completedLectures[sess.id] = true;
    } else if (!markDone) {
      delete appState.completedLectures[sess.id];
    }
    saveState();
    renderCurriculumPage();
  }

  // --- PAGE 3: RENDER PLANNER & FORECAST PAGE ("Kitna Time Lagega") ---
  function renderPlannerPage() {
    const pace = parseFloat(appState.targetHoursPerDay) || 2.5;
    const slider = document.getElementById('planner-slider');
    const sliderVal = document.getElementById('planner-slider-val');
    if (slider) {
      slider.value = pace;
      sliderVal.textContent = `${pace.toFixed(1)} hrs / day`;
      slider.oninput = () => {
        appState.targetHoursPerDay = parseFloat(slider.value) || 2.5;
        sliderVal.textContent = `${appState.targetHoursPerDay.toFixed(1)} hrs / day`;
        saveState();
        updatePlannerCalculations();
      };
    }
    updatePlannerCalculations();
  }

  function updatePlannerCalculations() {
    const pace = parseFloat(appState.targetHoursPerDay) || 2.5;
    const g = getGlobalMetrics();

    // Global Forecast
    const totalDays = Math.ceil(g.remainingHrs / pace);
    const finishDate = new Date();
    finishDate.setDate(finishDate.getDate() + totalDays);
    const dateFormatted = finishDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

    document.getElementById('plan-days-total').textContent = `${totalDays} Days`;
    document.getElementById('plan-finish-date').textContent = dateFormatted;
    document.getElementById('plan-hours-total').textContent = `${g.remainingHrs}h left`;

    document.getElementById('plan-summary-banner').innerHTML = `
      At <strong>${pace.toFixed(1)} hrs/day</strong>, you will complete your entire curriculum across all courses in <strong>${totalDays} study days (~${(totalDays / 30.4).toFixed(1)} months)</strong> by <strong>${dateFormatted}</strong>.
    `;

    // Populate Course-by-Course Forecast Table
    const tbody = document.getElementById('plan-courses-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    allData.courses.forEach(c => {
      const m = getCourseMetrics(c);
      const days = Math.ceil(m.remainingHours / pace);
      const cFinish = new Date();
      cFinish.setDate(cFinish.getDate() + days);
      const cDateStr = m.remainingHours > 0 ? cFinish.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '🎉 Completed!';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: white; display: flex; align-items: center; gap: 8px;">
            <span>${c.icon}</span> <span>${escapeHTML(c.title)}</span>
          </div>
          <span style="font-size: 0.74rem; color: var(--text-muted);">${c.instructor}</span>
        </td>
        <td><strong>${m.totalHours}h</strong></td>
        <td><span style="color: #38bdf8; font-weight: 700;">${m.remainingHours}h</span> (${m.lecturePercent}% done)</td>
        <td><strong>${days} Days</strong></td>
        <td style="color: #34d399; font-weight: 600;">${cDateStr}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- PAGE 4: RENDER ANALYTICS & DAILY LOGS ---
  function renderAnalyticsPage() {
    const g = getGlobalMetrics();
    document.getElementById('analytics-streak-num').textContent = g.streak;
    document.getElementById('analytics-today-time').textContent = `${Math.floor(g.todayMinutes / 60)}h ${g.todayMinutes % 60}m`;
    document.getElementById('analytics-alltime-hours').textContent = `${(g.totalLoggedMinutes / 60).toFixed(1)}h`;

    const tbody = document.getElementById('analytics-logs-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!appState.dailyLogs || appState.dailyLogs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 24px; color: var(--text-muted);">No study logs yet. Start the stopwatch or use quick add!</td></tr>`;
      return;
    }

    appState.dailyLogs.forEach((log, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHTML(log.date)}</td>
        <td><strong>${log.durationMin} min</strong> (${(log.durationMin / 60).toFixed(1)}h)</td>
        <td>${escapeHTML(log.lectureTitle || 'General Study')}</td>
        <td>${escapeHTML(log.notes || '-')}</td>
        <td>
          <button class="btn btn-sm btn-danger btn-del-log" data-idx="${idx}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-del-log').forEach(b => {
      b.addEventListener('click', () => {
        const i = parseInt(b.dataset.idx, 10);
        appState.dailyLogs.splice(i, 1);
        saveState();
        renderAnalyticsPage();
        showToast('Log entry removed', 'info');
      });
    });
  }

  // --- PAGE 5: RENDER REVISION NOTES VAULT ---
  function renderNotesPage() {
    const container = document.getElementById('notes-cards-container');
    if (!container) return;
    container.innerHTML = '';

    const entries = Object.entries(appState.lectureNotes);
    if (entries.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); grid-column: 1 / -1; border: 1px dashed var(--border-subtle);">
          <div style="font-size: 2rem; margin-bottom: 8px;">📝</div>
          <h4 style="color: white; margin-bottom: 4px;">No lecture notes added yet</h4>
          <p style="font-size: 0.85rem;">Click the "Note" button on any lecture in the Curriculum tab to save your revision notes and code links!</p>
        </div>
      `;
      return;
    }

    entries.forEach(([lecId, noteText]) => {
      const meta = lectureMap.get(lecId);
      const lecTitle = meta ? meta.lecture.title : 'Lecture';
      const cTitle = meta ? meta.course.short_title : '';

      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
          <span class="user-tag" style="font-size: 0.7rem;">${escapeHTML(cTitle)}</span>
          <button class="btn btn-sm btn-secondary btn-edit-vault-note" data-lec-id="${lecId}">Edit</button>
        </div>
        <h4 class="note-card-title">${escapeHTML(lecTitle)}</h4>
        <div class="note-card-body">${escapeHTML(noteText)}</div>
      `;

      card.querySelector('.btn-edit-vault-note').addEventListener('click', () => {
        openNotesModal(lecId, lecTitle);
      });

      container.appendChild(card);
    });
  }

  // --- SMART NEXT LECTURE JUMP ---
  function jumpToNextLecture() {
    if (!currentCourse) currentCourse = courseMap.get(appState.activeCourseId) || allData.courses[0];

    let target = null;
    let targetMod = null;

    for (const m of currentCourse.modules) {
      for (const s of m.sessions) {
        if (!appState.completedLectures[s.id]) {
          target = s;
          targetMod = m;
          break;
        }
      }
      if (target) break;
    }

    if (!target) {
      showToast('🏆 All lectures completed in this course! Excellent!', 'success');
      return;
    }

    // Switch to curriculum page
    navigateToPage('curriculum');
    appState.expandedModules[targetMod.id] = true;
    appState.searchQuery = '';
    saveState();
    renderCurriculumPage();

    setTimeout(() => {
      const elRow = document.getElementById(`lecitem-${target.id}`);
      if (elRow) {
        elRow.classList.add('topics-open');
        elRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        elRow.style.boxShadow = '0 0 25px rgba(56, 189, 248, 0.8)';
        setTimeout(() => elRow.style.boxShadow = '', 2500);
        showToast(`🎯 Next up: ${target.title}`, 'info');
      }
    }, 150);
  }

  // --- TIMER & STOPWATCH LOGIC ---
  function selectLectureForTimer(sess, course) {
    selectedLectureForTimer = sess;
    const txt = sess ? `${sess.title} (${course ? course.short_title : ''})` : 'General Study Session';
    document.getElementById('dash-timer-lecture-name').textContent = txt;
    const sel = document.getElementById('dash-timer-select');
    if (sel && sess) sel.value = sess.id;
  }

  function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    timerStartTime = Date.now() - (timerAccumulatedSeconds * 1000);

    timerInterval = setInterval(() => {
      timerAccumulatedSeconds = Math.floor((Date.now() - timerStartTime) / 1000);
      updateTimerClock();
    }, 500);

    document.getElementById('btn-dash-timer-start').style.display = 'none';
    document.getElementById('btn-dash-timer-pause').style.display = 'inline-flex';
    document.getElementById('nav-timer-indicator').style.display = 'inline-flex';
    showToast('⏱️ Study stopwatch running', 'info');
  }

  function pauseTimer() {
    if (!timerRunning) return;
    timerRunning = false;
    clearInterval(timerInterval);
    document.getElementById('btn-dash-timer-start').style.display = 'inline-flex';
    document.getElementById('btn-dash-timer-pause').style.display = 'none';
    document.getElementById('nav-timer-indicator').style.display = 'none';
  }

  function resetTimer() {
    pauseTimer();
    timerAccumulatedSeconds = 0;
    updateTimerClock();
  }

  function updateTimerClock() {
    const s = timerAccumulatedSeconds % 60;
    const m = Math.floor(timerAccumulatedSeconds / 60) % 60;
    const h = Math.floor(timerAccumulatedSeconds / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    const clockStr = `${pad(h)}:${pad(m)}:${pad(s)}`;

    const elClock = document.getElementById('dash-timer-clock');
    if (elClock) elClock.textContent = clockStr;
    const navClock = document.getElementById('nav-timer-clock');
    if (navClock) navClock.textContent = clockStr;
  }

  function saveTimerLog() {
    const mins = Math.max(1, Math.round(timerAccumulatedSeconds / 60));
    const todayStr = getTodayDateString();
    const sess = selectedLectureForTimer;

    appState.dailyLogs.unshift({
      id: 'log_' + Date.now(),
      date: todayStr,
      durationMin: mins,
      lectureId: sess ? sess.id : null,
      lectureTitle: sess ? sess.title : 'General Study',
      notes: sess ? `Studied ${sess.title}` : 'Self study',
      timestamp: Date.now()
    });

    resetTimer();
    saveState();
    renderDashboard();
    showToast(`✅ Saved ${mins} mins to study logs!`, 'success');
  }

  function populateTimerDropdown() {
    const sel = document.getElementById('dash-timer-select');
    if (!sel) return;
    sel.innerHTML = '<option value="">-- Link Timer to Lecture (Optional) --</option>';

    allData.courses.forEach(c => {
      const grp = document.createElement('optgroup');
      grp.label = `${c.icon} ${c.title}`;
      c.modules.forEach(m => {
        m.sessions.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = `${s.number}. ${s.title}`;
          grp.appendChild(opt);
        });
      });
      sel.appendChild(grp);
    });

    sel.onchange = () => {
      const val = sel.value;
      if (val && lectureMap.has(val)) {
        const meta = lectureMap.get(val);
        selectLectureForTimer(meta.lecture, meta.course);
      } else {
        selectLectureForTimer(null, null);
      }
    };
  }

  // --- NOTES MODAL LOGIC ---
  let currentNoteLecId = null;

  function openNotesModal(lecId, title) {
    currentNoteLecId = lecId;
    document.getElementById('modal-notes-title').textContent = `Notes: ${title}`;
    document.getElementById('modal-notes-textarea').value = appState.lectureNotes[lecId] || '';
    document.getElementById('modal-notes').classList.add('active');
    document.getElementById('modal-notes-textarea').focus();
  }

  function saveNoteModal() {
    if (!currentNoteLecId) return;
    const txt = document.getElementById('modal-notes-textarea').value.trim();
    if (txt) {
      appState.lectureNotes[currentNoteLecId] = txt;
    } else {
      delete appState.lectureNotes[currentNoteLecId];
    }
    saveState();
    document.getElementById('modal-notes').classList.remove('active');
    if (appState.activePage === 'curriculum') renderCurriculumPage();
    if (appState.activePage === 'notes') renderNotesPage();
    showToast('💾 Notes saved!', 'success');
  }

  // --- BACKUP (EXPORT / IMPORT / RESET) ---
  function exportBackup() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(appState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Piyush_Study_Tracker_Backup_${getTodayDateString()}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('📥 Backup downloaded!', 'success');
  }

  function importBackup(file) {
    if (!file) return;
    const r = new FileReader();
    r.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (parsed.completedLectures || parsed.completedTopics) {
          appState = Object.assign({}, defaultState, parsed);
          saveState();
          navigateToPage(appState.activePage || 'dashboard');
          document.getElementById('modal-backup').classList.remove('active');
          showToast('🚀 Backup restored successfully!', 'success');
        }
      } catch (err) {
        showToast('⚠️ Could not parse JSON file', 'danger');
      }
    };
    r.readAsText(file);
  }

  function resetProgress() {
    if (confirm('⚠️ Are you sure you want to reset all checklist progress and study logs?')) {
      appState = Object.assign({}, defaultState);
      saveState();
      navigateToPage('dashboard');
      document.getElementById('modal-backup').classList.remove('active');
      showToast('All progress reset.', 'info');
    }
  }

  // --- UTILITIES & ANIMATIONS ---
  function animateCounter(id, targetVal, suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = `${targetVal}${suffix}`;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      setTimeout(() => t.remove(), 300);
    }, 3000);
  }

  // --- SETUP LISTENERS ---
  function setupEvents() {
    // Navigation Tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        navigateToPage(tab.dataset.page);
      });
    });

    window.addEventListener('hashchange', handleHashChange);

    // Smart Jump Button in Header
    const resumeBtn = document.getElementById('btn-resume-next');
    if (resumeBtn) resumeBtn.addEventListener('click', jumpToNextLecture);

    // Stopwatch Controls
    document.getElementById('btn-dash-timer-start').addEventListener('click', startTimer);
    document.getElementById('btn-dash-timer-pause').addEventListener('click', pauseTimer);
    document.getElementById('btn-dash-timer-reset').addEventListener('click', resetTimer);
    document.getElementById('btn-dash-timer-save').addEventListener('click', saveTimerLog);

    // Quick Add Buttons (+30m, etc.)
    document.querySelectorAll('.quick-add-btn').forEach(b => {
      b.addEventListener('click', () => {
        const mins = parseInt(b.dataset.mins, 10);
        if (mins) {
          appState.dailyLogs.unshift({
            id: 'log_' + Date.now(),
            date: getTodayDateString(),
            durationMin: mins,
            lectureTitle: 'Quick Add',
            notes: `+${mins}m quick logged`,
            timestamp: Date.now()
          });
          saveState();
          renderDashboard();
          showToast(`✅ Added +${mins} mins!`, 'success');
        }
      });
    });

    // Search Input in Curriculum Page
    const searchInput = document.getElementById('curriculum-search-input');
    if (searchInput) {
      let st;
      searchInput.addEventListener('input', () => {
        clearTimeout(st);
        st = setTimeout(() => {
          appState.searchQuery = searchInput.value;
          renderCourseModules();
        }, 180);
      });
    }

    // Status Filter Pills
    document.querySelectorAll('.status-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        appState.activeStatus = pill.dataset.status;
        renderCourseModules();
      });
    });

    // Expand / Collapse All
    const expBtn = document.getElementById('btn-expand-all');
    if (expBtn) {
      expBtn.addEventListener('click', () => {
        currentCourse.modules.forEach(m => appState.expandedModules[m.id] = true);
        document.querySelectorAll('.module-card').forEach(c => c.classList.add('expanded'));
        saveState();
      });
    }
    const colBtn = document.getElementById('btn-collapse-all');
    if (colBtn) {
      colBtn.addEventListener('click', () => {
        appState.expandedModules = {};
        document.querySelectorAll('.module-card').forEach(c => c.classList.remove('expanded'));
        saveState();
      });
    }

    // Notes Modal
    document.getElementById('btn-save-notes').addEventListener('click', saveNoteModal);
    document.getElementById('btn-close-notes').addEventListener('click', () => {
      document.getElementById('modal-notes').classList.remove('active');
    });

    // Backup Modal
    document.getElementById('btn-open-backup').addEventListener('click', () => {
      document.getElementById('modal-backup').classList.add('active');
    });
    document.getElementById('btn-close-backup').addEventListener('click', () => {
      document.getElementById('modal-backup').classList.remove('active');
    });
    document.getElementById('btn-export-json').addEventListener('click', exportBackup);
    document.getElementById('import-file-input').addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) importBackup(e.target.files[0]);
    });
    document.getElementById('btn-reset-all').addEventListener('click', resetProgress);
  }

  // --- INITIALIZATION ---
  function init() {
    initData();
    setupEvents();

    const hash = window.location.hash.replace('#', '');
    navigateToPage(hash || appState.activePage || 'dashboard', false);
    console.log('Multi-Course Learning Hub initialized successfully!');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
