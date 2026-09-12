/**
 * StudyPulse FOCUS ENGINE — Core Application Engine
 * Tailored for Piyush Tiwari — Data Science & AI Engineering
 * Complete State Management, Web Audio Synthesizer, FSRS & Pomodoro Engine
 */

(function() {
  'use strict';

  // =========================================================================
  // STORAGE KEYS & CONSTANTS
  // =========================================================================
  const STORAGE_KEYS = {
    COMPLETED_TOPICS: 'studypulse_completed_topics_v2',
    TOPIC_NOTES: 'studypulse_topic_notes_v2',
    FOCUS_SECONDS: 'studypulse_focus_seconds_v2',
    DAILY_ACTIVITY: 'studypulse_daily_activity_v2',
    STREAK: 'studypulse_streak_v2',
    THEME: 'studypulse_theme_v2',
    XP: 'studypulse_xp_v2',
    FSRS: 'studypulse_fsrs_v2'
  };

  const RPG_LEVELS = [
    { lvl: 1, title: 'Code Initiate', minXp: 0, maxXp: 450 },
    { lvl: 2, title: 'Syntax Apprentice', minXp: 450, maxXp: 1200 },
    { lvl: 3, title: 'Algorithmic Nomad', minXp: 1200, maxXp: 2400 },
    { lvl: 4, title: 'Data Wrangler', minXp: 2400, maxXp: 4000 },
    { lvl: 5, title: 'Feature Architect', minXp: 4000, maxXp: 6200 },
    { lvl: 6, title: 'Gradient Disciple', minXp: 6200, maxXp: 9000 },
    { lvl: 7, title: 'Neural Pioneer', minXp: 9000, maxXp: 12500 },
    { lvl: 8, title: 'Transformer Adept', minXp: 12500, maxXp: 16800 },
    { lvl: 9, title: 'Latent Space Navigator', minXp: 16800, maxXp: 22000 },
    { lvl: 10, title: 'Distributed Systems Sapper', minXp: 22000, maxXp: 28000 },
    { lvl: 11, title: 'MLOps Commander', minXp: 28000, maxXp: 35000 },
    { lvl: 12, title: 'Raft Consensus Master', minXp: 35000, maxXp: 44000 },
    { lvl: 13, title: 'High-Throughput Architect', minXp: 44000, maxXp: 55000 },
    { lvl: 14, title: 'LLM Guardrail Guardian', minXp: 55000, maxXp: 70000 },
    { lvl: 15, title: 'AI Sovereign', minXp: 70000, maxXp: 100000 }
  ];

  // =========================================================================
  // APPLICATION STATE
  // =========================================================================
  const state = {
    user: 'Piyush Tiwari',
    theme: 'dark',
    activeView: 'dashboard',
    activeCourseId: 'campusx_dsmp',
    searchQuery: '',
    topicFilter: 'all',
    completedTopics: new Set(),
    topicNotes: {},
    totalFocusSeconds: 0,
    dailyActivity: {},
    streak: { count: 1, lastActive: getTodayDateString() },
    xp: 0,
    fsrs: {},
    
    // Pomodoro Timer State
    timer: {
      mode: 'pomo', // pomo, deep, short, long
      duration: 25 * 60,
      remaining: 25 * 60,
      isRunning: false,
      intervalId: null,
      sessionsCompleted: 0
    },

    // Audio Synthesizer State
    audio: {
      ctx: null,
      analyser: null,
      masterGain: null,
      isPlaying: false,
      channels: {
        binaural: { gain: null, osc1: null, osc2: null, vol: 0.35, active: false },
        rain: { gain: null, node: null, vol: 0.30, active: false },
        brown: { gain: null, node: null, vol: 0.25, active: false },
        lofi: { gain: null, oscs: [], vol: 0.20, active: false }
      }
    }
  };

  // Helper date string YYYY-MM-DD
  function getTodayDateString() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // =========================================================================
  // PERSISTENCE (LOCAL STORAGE)
  // =========================================================================
  function loadPersistedState() {
    try {
      const savedTopics = localStorage.getItem(STORAGE_KEYS.COMPLETED_TOPICS);
      if (savedTopics) state.completedTopics = new Set(JSON.parse(savedTopics));

      const savedNotes = localStorage.getItem(STORAGE_KEYS.TOPIC_NOTES);
      if (savedNotes) state.topicNotes = JSON.parse(savedNotes);

      const savedFocus = localStorage.getItem(STORAGE_KEYS.FOCUS_SECONDS);
      if (savedFocus) state.totalFocusSeconds = parseInt(savedFocus, 10) || 0;

      const savedActivity = localStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY);
      if (savedActivity) state.dailyActivity = JSON.parse(savedActivity);

      const savedStreak = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (savedStreak) state.streak = JSON.parse(savedStreak);

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme) state.theme = savedTheme;

      const savedXp = localStorage.getItem(STORAGE_KEYS.XP);
      if (savedXp) state.xp = parseInt(savedXp, 10) || 0;

      const savedFsrs = localStorage.getItem(STORAGE_KEYS.FSRS);
      if (savedFsrs) state.fsrs = JSON.parse(savedFsrs);
    } catch (e) {
      console.warn('[StudyPulse] Error loading localStorage state:', e);
    }

    validateStreak();
  }

  function savePersistedState(key) {
    try {
      if (!key || key === STORAGE_KEYS.COMPLETED_TOPICS) {
        localStorage.setItem(STORAGE_KEYS.COMPLETED_TOPICS, JSON.stringify(Array.from(state.completedTopics)));
      }
      if (!key || key === STORAGE_KEYS.TOPIC_NOTES) {
        localStorage.setItem(STORAGE_KEYS.TOPIC_NOTES, JSON.stringify(state.topicNotes));
      }
      if (!key || key === STORAGE_KEYS.FOCUS_SECONDS) {
        localStorage.setItem(STORAGE_KEYS.FOCUS_SECONDS, String(state.totalFocusSeconds));
      }
      if (!key || key === STORAGE_KEYS.DAILY_ACTIVITY) {
        localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY, JSON.stringify(state.dailyActivity));
      }
      if (!key || key === STORAGE_KEYS.STREAK) {
        localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(state.streak));
      }
      if (!key || key === STORAGE_KEYS.THEME) {
        localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
      }
      if (!key || key === STORAGE_KEYS.XP) {
        localStorage.setItem(STORAGE_KEYS.XP, String(state.xp));
      }
      if (!key || key === STORAGE_KEYS.FSRS) {
        localStorage.setItem(STORAGE_KEYS.FSRS, JSON.stringify(state.fsrs));
      }
    } catch (e) {
      console.warn('[StudyPulse] Error saving to localStorage:', e);
    }
  }

  // =========================================================================
  // STREAK & LOGGING
  // =========================================================================
  function validateStreak() {
    const today = getTodayDateString();
    if (!state.streak || !state.streak.lastActive) {
      state.streak = { count: 1, lastActive: today };
      savePersistedState(STORAGE_KEYS.STREAK);
      return;
    }

    const last = new Date(state.streak.lastActive);
    const curr = new Date(today);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Perfect streak continuation
    } else if (diffDays > 1) {
      // Streak broken, reset to 1
      state.streak.count = 1;
      state.streak.lastActive = today;
      savePersistedState(STORAGE_KEYS.STREAK);
    }
  }

  function recordActivity(type, amount = 1) {
    const today = getTodayDateString();
    if (!state.dailyActivity[today]) {
      state.dailyActivity[today] = { topics: 0, focusMinutes: 0 };
    }

    if (type === 'topic') {
      state.dailyActivity[today].topics += amount;
    } else if (type === 'focus') {
      state.dailyActivity[today].focusMinutes += amount;
    }

    // Update streak if not updated today
    if (state.streak.lastActive !== today) {
      state.streak.count += 1;
      state.streak.lastActive = today;
      savePersistedState(STORAGE_KEYS.STREAK);
    }

    savePersistedState(STORAGE_KEYS.DAILY_ACTIVITY);
    updateDashboardUI();
    renderActivityHeatmap();
  }

  // =========================================================================
  // RPG XP ENGINE
  // =========================================================================
  function addXP(amount, reason = '') {
    state.xp += amount;
    savePersistedState(STORAGE_KEYS.XP);
    updateRPGStatus();
    showToast(`+${amount} XP ${reason ? '• ' + reason : ''}`);
  }

  function getCurrentRPGLevel() {
    let current = RPG_LEVELS[0];
    for (const lvl of RPG_LEVELS) {
      if (state.xp >= lvl.minXp) {
        current = lvl;
      } else {
        break;
      }
    }
    return current;
  }

  function updateRPGStatus() {
    const lvl = getCurrentRPGLevel();
    const nextLevel = RPG_LEVELS.find(l => l.lvl === lvl.lvl + 1);

    let progressPct = 100;
    if (nextLevel) {
      const span = nextLevel.minXp - lvl.minXp;
      const earned = state.xp - lvl.minXp;
      progressPct = Math.min(100, Math.max(0, Math.round((earned / span) * 100)));
    }

    // Update Header Pill
    const headerLvl = document.getElementById('rpg-level-badge');
    const headerTitle = document.getElementById('rpg-title-badge');
    if (headerLvl) headerLvl.textContent = `LVL ${lvl.lvl}`;
    if (headerTitle) headerTitle.textContent = lvl.title;

    // Update Dashboard Card
    const dashLvl = document.getElementById('dash-rpg-level');
    const dashTitle = document.getElementById('dash-rpg-title');
    const dashXp = document.getElementById('dash-rpg-xp');
    const dashFill = document.getElementById('dash-rpg-fill');
    if (dashLvl) dashLvl.textContent = `LEVEL ${lvl.lvl}`;
    if (dashTitle) dashTitle.textContent = lvl.title;
    if (dashXp) dashXp.textContent = `${state.xp.toLocaleString()} XP`;
    if (dashFill) dashFill.style.width = `${progressPct}%`;
  }

  // =========================================================================
  // THEME ENGINE
  // =========================================================================
  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeColorMeta();
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }

  function toggleAppTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    savePersistedState(STORAGE_KEYS.THEME);
    updateThemeColorMeta();

    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
    hapticFeedback(12);
  }

  function updateThemeColorMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', state.theme === 'dark' ? '#060913' : '#f8fafc');
    }
  }

  // =========================================================================
  // VIEW NAVIGATION & ROUTING
  // =========================================================================
  function switchView(viewName) {
    if (state.activeView === viewName) return;
    state.activeView = viewName;

    // Update Nav Buttons (Desktop and Mobile)
    document.querySelectorAll('[data-view]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update View Panels
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });
    hapticFeedback(10);

    // Initialize Specialized 3D & Canvas Modules on Demand
    if (viewName === 'bookshelf' && typeof window.initBookshelf3D === 'function') {
      setTimeout(() => window.initBookshelf3D(), 50);
    }
    if (viewName === 'palace' && typeof window.initMemoryPalace === 'function') {
      setTimeout(() => window.initMemoryPalace(), 50);
    }
    if (viewName === 'chaos' && typeof window.initChaosSimulator === 'function') {
      setTimeout(() => window.initChaosSimulator(), 50);
    }
    if (viewName === 'analytics') {
      renderActivityHeatmap();
    }
  }

  // =========================================================================
  // CHRONO-BLOCK POMODORO FOCUS ENGINE
  // =========================================================================
  const TIMER_PRESETS = {
    pomo: 25 * 60,
    deep: 50 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  function setTimerMode(mode) {
    if (!TIMER_PRESETS[mode]) return;
    state.timer.mode = mode;
    state.timer.duration = TIMER_PRESETS[mode];
    state.timer.remaining = TIMER_PRESETS[mode];
    pauseTimer();

    document.querySelectorAll('.pomo-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    updateTimerDisplay();
    hapticFeedback(10);
  }

  function startTimer() {
    if (state.timer.isRunning) return;
    state.timer.isRunning = true;
    
    // Auto start audio synthesizer if user enabled
    if (document.getElementById('audio-autostart-toggle')?.checked) {
      startAudioSynthesizer();
    }

    const btn = document.getElementById('btn-timer-toggle');
    if (btn) btn.innerHTML = '<span>⏸</span> <span>Pause Session</span>';

    state.timer.intervalId = setInterval(() => {
      if (state.timer.remaining > 0) {
        state.timer.remaining -= 1;
        state.totalFocusSeconds += 1;
        
        // Save focus every minute
        if (state.totalFocusSeconds % 60 === 0) {
          savePersistedState(STORAGE_KEYS.FOCUS_SECONDS);
          recordActivity('focus', 1);
        }

        updateTimerDisplay();
      } else {
        completeTimerSession();
      }
    }, 1000);

    hapticFeedback(16);
  }

  function pauseTimer() {
    if (!state.timer.isRunning) return;
    state.timer.isRunning = false;
    clearInterval(state.timer.intervalId);
    state.timer.intervalId = null;

    const btn = document.getElementById('btn-timer-toggle');
    if (btn) btn.innerHTML = '<span>▶</span> <span>Start Sprint</span>';
    hapticFeedback(12);
  }

  function toggleTimer() {
    if (state.timer.isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function resetTimer() {
    pauseTimer();
    state.timer.remaining = state.timer.duration;
    updateTimerDisplay();
    hapticFeedback(10);
  }

  function skipTimer() {
    pauseTimer();
    state.timer.remaining = 0;
    completeTimerSession();
  }

  function completeTimerSession() {
    pauseTimer();
    playNotificationChime();
    hapticFeedback([80, 50, 80]);

    if (state.timer.mode === 'pomo' || state.timer.mode === 'deep') {
      state.timer.sessionsCompleted += 1;
      const xpEarned = state.timer.mode === 'deep' ? 200 : 100;
      addXP(xpEarned, 'Flow State Sprint Completed');
      showToast(`🎯 Session Completed! +${xpEarned} XP Awarded.`);
      setTimerMode('short');
    } else {
      showToast(`⚡ Break Finished! Ready for next sprint.`);
      setTimerMode('pomo');
    }
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timer.remaining / 60);
    const secs = state.timer.remaining % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    const digitEl = document.getElementById('timer-digits');
    if (digitEl) digitEl.textContent = timeStr;

    // SVG Circular Progress Ring (circumference = 2 * PI * 100 = ~628.3)
    const progressEl = document.getElementById('timer-svg-progress');
    if (progressEl) {
      const total = state.timer.duration;
      const progress = (total - state.timer.remaining) / total;
      const offset = 628.3 * (1 - progress);
      progressEl.style.strokeDashoffset = offset;
    }

    // Header mini timer
    const navClock = document.getElementById('nav-timer-clock');
    if (navClock) {
      navClock.textContent = `${timeStr} | ${state.timer.mode.toUpperCase()}`;
    }
  }

  function playNotificationChime() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.00, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.65);
    } catch (e) {
      // Web Audio blocked
    }
  }

  // =========================================================================
  // WEB AUDIO PROCEDURAL SYNTHESIZER
  // =========================================================================
  function initAudioContext() {
    if (state.audio.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    state.audio.ctx = new AudioCtx();
    state.audio.analyser = state.audio.ctx.createAnalyser();
    state.audio.analyser.fftSize = 64;
    state.audio.masterGain = state.audio.ctx.createGain();
    state.audio.masterGain.gain.setValueAtTime(0.5, state.audio.ctx.currentTime);

    state.audio.masterGain.connect(state.audio.analyser);
    state.audio.analyser.connect(state.audio.ctx.destination);

    startVisualizerFFT();
  }

  function toggleAudioSynthesizer() {
    initAudioContext();
    if (!state.audio.ctx) return;

    if (state.audio.ctx.state === 'suspended') {
      state.audio.ctx.resume();
    }

    if (state.audio.isPlaying) {
      stopAllAudioChannels();
      state.audio.isPlaying = false;
      document.getElementById('btn-audio-toggle')?.classList.remove('active');
    } else {
      startActiveAudioChannels();
      state.audio.isPlaying = true;
      document.getElementById('btn-audio-toggle')?.classList.add('active');
    }
    hapticFeedback(12);
  }

  function startAudioSynthesizer() {
    initAudioContext();
    if (!state.audio.ctx) return;
    if (state.audio.ctx.state === 'suspended') state.audio.ctx.resume();
    startActiveAudioChannels();
    state.audio.isPlaying = true;
    document.getElementById('btn-audio-toggle')?.classList.add('active');
  }

  function startActiveAudioChannels() {
    const ctx = state.audio.ctx;
    if (!ctx) return;

    // 1. 40Hz Gamma Focus Binaural Beats
    if (!state.audio.channels.binaural.osc1) {
      const g = ctx.createGain();
      g.gain.setValueAtTime(state.audio.channels.binaural.vol, ctx.currentTime);

      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.frequency.value = 200; // Left ear
      oscR.frequency.value = 240; // Right ear (40Hz difference)

      const merger = ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      merger.connect(g);
      g.connect(state.audio.masterGain);

      oscL.start();
      oscR.start();

      state.audio.channels.binaural.osc1 = oscL;
      state.audio.channels.binaural.osc2 = oscR;
      state.audio.channels.binaural.gain = g;
    }

    // 2. Nordic Rain (White noise buffer + low-pass filter)
    if (!state.audio.channels.rain.node) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      const g = ctx.createGain();
      g.gain.setValueAtTime(state.audio.channels.rain.vol, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(g);
      g.connect(state.audio.masterGain);
      whiteNoise.start();

      state.audio.channels.rain.node = whiteNoise;
      state.audio.channels.rain.gain = g;
    }

    // 3. Deep Brown Noise
    if (!state.audio.channels.brown.node) {
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const brownSource = ctx.createBufferSource();
      brownSource.buffer = buffer;
      brownSource.loop = true;

      const g = ctx.createGain();
      g.gain.setValueAtTime(state.audio.channels.brown.vol, ctx.currentTime);

      brownSource.connect(g);
      g.connect(state.audio.masterGain);
      brownSource.start();

      state.audio.channels.brown.node = brownSource;
      state.audio.channels.brown.gain = g;
    }
  }

  function stopAllAudioChannels() {
    try {
      if (state.audio.channels.binaural.osc1) {
        state.audio.channels.binaural.osc1.stop();
        state.audio.channels.binaural.osc2.stop();
        state.audio.channels.binaural.osc1 = null;
        state.audio.channels.binaural.osc2 = null;
      }
      if (state.audio.channels.rain.node) {
        state.audio.channels.rain.node.stop();
        state.audio.channels.rain.node = null;
      }
      if (state.audio.channels.brown.node) {
        state.audio.channels.brown.node.stop();
        state.audio.channels.brown.node = null;
      }
    } catch (e) {
      console.warn('[StudyPulse] Error stopping audio:', e);
    }
  }

  function setChannelVolume(channel, val) {
    const floatVal = parseFloat(val);
    if (state.audio.channels[channel]) {
      state.audio.channels[channel].vol = floatVal;
      if (state.audio.channels[channel].gain && state.audio.ctx) {
        state.audio.channels[channel].gain.gain.setValueAtTime(floatVal, state.audio.ctx.currentTime);
      }
    }
  }

  function startVisualizerFFT() {
    const canvas = document.getElementById('audio-fft-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const analyser = state.audio.analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    function draw() {
      requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 1.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = state.audio.isPlaying ? '#00f2ff' : 'rgba(148, 163, 184, 0.25)';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    }
    draw();
  }

  // =========================================================================
  // CURRICULUM MASTER MATRIX ENGINE
  // =========================================================================
  function renderCourseSelector() {
    const container = document.getElementById('course-selector-container');
    if (!container || !window.ALL_COURSES_DATA) return;

    container.innerHTML = '';
    window.ALL_COURSES_DATA.courses.forEach(c => {
      const chip = document.createElement('button');
      chip.className = `course-chip ${c.id === state.activeCourseId ? 'active' : ''}`;
      chip.innerHTML = `<span>${c.icon}</span> <span>${c.short_title || c.title}</span>`;
      chip.onclick = () => {
        state.activeCourseId = c.id;
        document.querySelectorAll('.course-chip').forEach(el => el.classList.remove('active'));
        chip.classList.add('active');
        renderCurriculumMatrix();
        hapticFeedback(10);
      };
      container.appendChild(chip);
    });
  }

  function renderCurriculumMatrix() {
    const listEl = document.getElementById('module-accordion-list');
    if (!listEl || !window.ALL_COURSES_DATA) return;

    const course = window.ALL_COURSES_DATA.courses.find(c => c.id === state.activeCourseId);
    if (!course) return;

    // Update Course Header Summary
    const titleEl = document.getElementById('active-course-title');
    const descEl = document.getElementById('active-course-desc');
    const countEl = document.getElementById('active-course-stats');
    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.focus;
    if (countEl) countEl.textContent = `${course.total_lectures} Lectures • ${course.total_topics} Topics • ${course.estimated_hours}h Content`;

    listEl.innerHTML = '';
    const query = state.searchQuery.toLowerCase().trim();

    course.modules.forEach((mod, modIdx) => {
      // Filter sessions & topics
      let matchingSessions = [];

      mod.sessions.forEach(sess => {
        const matchingTopics = (sess.topics || []).filter(top => {
          const matchesQuery = !query || top.title.toLowerCase().includes(query);
          const isDone = state.completedTopics.has(top.id);

          if (state.topicFilter === 'completed') return matchesQuery && isDone;
          if (state.topicFilter === 'pending') return matchesQuery && !isDone;
          return matchesQuery;
        });

        if (matchingTopics.length > 0 || (!query && (!sess.topics || sess.topics.length === 0))) {
          matchingSessions.push({ ...sess, filteredTopics: matchingTopics });
        }
      });

      if (matchingSessions.length === 0 && query) return;

      // Module Progress Calculation
      const allModTopics = mod.sessions.flatMap(s => s.topics || []);
      const completedModTopics = allModTopics.filter(t => state.completedTopics.has(t.id));
      const modPct = allModTopics.length > 0 ? Math.round((completedModTopics.length / allModTopics.length) * 100) : 0;

      const modCard = document.createElement('div');
      modCard.className = `module-card ${modIdx === 0 ? 'expanded' : ''}`;
      modCard.id = `mod-card-${mod.id}`;

      modCard.innerHTML = `
        <div class="module-header" onclick="window.toggleModuleAccordion('${mod.id}')">
          <div class="module-title-area">
            <span style="font-size: 1.1rem;">${mod.phase_icon || '📁'}</span>
            <div>
              <div class="module-title">${escapeHtml(mod.title)}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 2px;">
                ${mod.sessions.length} Lectures • ${allModTopics.length} Topics
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <span class="module-badge">${completedModTopics.length}/${allModTopics.length} (${modPct}%)</span>
            <div class="module-progress-bar">
              <div class="module-progress-fill" style="width: ${modPct}%;"></div>
            </div>
            <span class="module-chevron" style="transition: transform 0.2s ease;">▼</span>
          </div>
        </div>
        <div class="module-body">
          ${matchingSessions.map(sess => `
            <div style="margin-top: 14px; padding-bottom: 8px; border-bottom: 1px solid var(--surface-border);">
              <div style="font-size: 0.84rem; font-weight: 700; color: var(--accent-cyan); margin-bottom: 8px;">
                📖 ${escapeHtml(sess.title)}
              </div>
              <div class="topic-list">
                ${(sess.filteredTopics || []).map(top => {
                  const isDone = state.completedTopics.has(top.id);
                  const hasNote = !!state.topicNotes[top.id];
                  return `
                    <div class="topic-row ${isDone ? 'completed' : ''}" id="row-${top.id}">
                      <div class="topic-left">
                        <input type="checkbox" class="topic-checkbox" ${isDone ? 'checked' : ''} 
                               onchange="window.toggleTopicCheck('${top.id}', this.checked)">
                        <div class="topic-title">${escapeHtml(top.title)}</div>
                      </div>
                      <div class="topic-actions">
                        <button class="btn-topic-note" onclick="window.openTopicNoteModal('${top.id}', '${escapeAttr(top.title)}')" title="Study Notes">
                          ${hasNote ? '📝' : '✏️'}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      `;

      listEl.appendChild(modCard);
    });
  }

  function toggleModuleAccordion(modId) {
    const card = document.getElementById(`mod-card-${modId}`);
    if (card) {
      card.classList.toggle('expanded');
      hapticFeedback(8);
    }
  }

  function toggleTopicCheck(topicId, isChecked) {
    if (isChecked) {
      state.completedTopics.add(topicId);
      addXP(150, 'Topic Mastered');
      recordActivity('topic', 1);
    } else {
      state.completedTopics.delete(topicId);
      state.xp = Math.max(0, state.xp - 150);
      savePersistedState(STORAGE_KEYS.XP);
      updateRPGStatus();
    }

    savePersistedState(STORAGE_KEYS.COMPLETED_TOPICS);
    
    // Toggle row completed style
    const row = document.getElementById(`row-${topicId}`);
    if (row) row.classList.toggle('completed', isChecked);

    updateDashboardUI();
    hapticFeedback(14);
  }

  // =========================================================================
  // TOPIC NOTES MODAL
  // =========================================================================
  let currentEditingTopicId = null;

  function openTopicNoteModal(topicId, topicTitle) {
    currentEditingTopicId = topicId;
    const modal = document.getElementById('notes-modal-overlay');
    const titleEl = document.getElementById('notes-modal-topic-title');
    const textarea = document.getElementById('notes-modal-textarea');

    if (titleEl) titleEl.textContent = topicTitle;
    if (textarea) textarea.value = state.topicNotes[topicId] || '';
    if (modal) modal.style.display = 'flex';
  }

  function saveTopicNote() {
    if (!currentEditingTopicId) return;
    const textarea = document.getElementById('notes-modal-textarea');
    const text = textarea ? textarea.value.trim() : '';

    if (text) {
      state.topicNotes[currentEditingTopicId] = text;
      showToast('💾 Note saved successfully!');
    } else {
      delete state.topicNotes[currentEditingTopicId];
    }

    savePersistedState(STORAGE_KEYS.TOPIC_NOTES);
    closeTopicNoteModal();
    renderCurriculumMatrix();
    hapticFeedback(10);
  }

  function closeTopicNoteModal() {
    const modal = document.getElementById('notes-modal-overlay');
    if (modal) modal.style.display = 'none';
    currentEditingTopicId = null;
  }

  // =========================================================================
  // COGNITIVE DASHBOARD & HEATMAP
  // =========================================================================
  function updateDashboardUI() {
    const completedCount = state.completedTopics.size;
    const totalTopics = 1769;
    const focusHours = (state.totalFocusSeconds / 3600).toFixed(1);

    // Update Hero Stats
    const countEl = document.getElementById('dash-completed-count');
    const streakEl = document.getElementById('dash-streak-count');
    const hoursEl = document.getElementById('dash-focus-hours');
    const headerStreak = document.getElementById('header-streak-val');

    if (countEl) countEl.textContent = `${completedCount} / ${totalTopics}`;
    if (streakEl) streakEl.textContent = `${state.streak.count} Days`;
    if (hoursEl) hoursEl.textContent = `${focusHours}h`;
    if (headerStreak) headerStreak.textContent = `${state.streak.count} Days`;

    updateRPGStatus();
  }

  function renderActivityHeatmap() {
    const svg = document.getElementById('heatmap-grid-svg');
    if (!svg) return;

    svg.innerHTML = '';
    const today = new Date();
    const cellSize = 11;
    const cellGap = 3;
    const totalWeeks = 52;

    // Calculate dates backwards for 52 weeks
    const days = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: dateStr, dayOfWeek: d.getDay() });
    }

    days.forEach((item, index) => {
      const weekIndex = Math.floor(index / 7);
      const dayIndex = item.dayOfWeek;
      const x = weekIndex * (cellSize + cellGap);
      const y = dayIndex * (cellSize + cellGap);

      const activity = state.dailyActivity[item.date] || { topics: 0, focusMinutes: 0 };
      const score = (activity.topics * 2) + Math.floor(activity.focusMinutes / 15);

      let color = 'rgba(148, 163, 184, 0.12)';
      if (score >= 8) color = '#00f2ff';
      else if (score >= 4) color = '#0284c7';
      else if (score >= 2) color = '#0369a1';
      else if (score >= 1) color = '#075985';

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', cellSize);
      rect.setAttribute('height', cellSize);
      rect.setAttribute('fill', color);
      rect.setAttribute('class', 'heatmap-cell');

      rect.innerHTML = `<title>${item.date}: ${activity.topics} topics mastered, ${activity.focusMinutes}m focus</title>`;
      svg.appendChild(rect);
    });
  }

  // =========================================================================
  // UTILITIES & FEEDBACK
  // =========================================================================
  function hapticFeedback(pattern = 14) {
    if (typeof navigator.vibrate === 'function') {
      try { navigator.vibrate(pattern); } catch (e) {}
    }
  }

  function showToast(message) {
    let toast = document.getElementById('studypulse-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'studypulse-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 84px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 23, 42, 0.95);
        color: #f8fafc;
        border: 1px solid rgba(0, 242, 255, 0.4);
        padding: 10px 18px;
        border-radius: 9999px;
        font-size: 0.82rem;
        font-weight: 600;
        backdrop-filter: blur(12px);
        z-index: 3000;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        transition: opacity 0.25s ease, transform 0.25s ease;
        opacity: 0;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translate(-50%, 0)';

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translate(-50%, 8px)';
    }, 2400);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // =========================================================================
  // GLOBAL EXPORTS
  // =========================================================================
  window.switchView = switchView;
  window.toggleAppTheme = toggleAppTheme;
  window.toggleTimer = toggleTimer;
  window.resetTimer = resetTimer;
  window.skipTimer = skipTimer;
  window.setTimerMode = setTimerMode;
  window.toggleAudioSynthesizer = toggleAudioSynthesizer;
  window.setChannelVolume = setChannelVolume;
  window.toggleModuleAccordion = toggleModuleAccordion;
  window.toggleTopicCheck = toggleTopicCheck;
  window.openTopicNoteModal = openTopicNoteModal;
  window.saveTopicNote = saveTopicNote;
  window.closeTopicNoteModal = closeTopicNoteModal;

  // External Action Bridges
  window.launchStudySession = (topicName) => {
    switchView('dashboard');
    showToast(`⚡ Focused on: ${topicName}`);
    startTimer();
  };

  window.viewTopicInChecklist = (query) => {
    switchView('curriculum');
    const input = document.getElementById('curriculum-search-input');
    if (input) {
      input.value = query;
      state.searchQuery = query;
      renderCurriculumMatrix();
    }
  };

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    loadPersistedState();
    initTheme();
    updateTimerDisplay();
    renderCourseSelector();
    renderCurriculumMatrix();
    updateDashboardUI();
    renderActivityHeatmap();

    // Attach search input listener
    const searchInput = document.getElementById('curriculum-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderCurriculumMatrix();
      });
    }

    // Attach filter chip listeners
    document.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
        state.topicFilter = btn.dataset.filter;
        renderCurriculumMatrix();
        hapticFeedback(8);
      });
    });

    console.log('[StudyPulse FOCUS ENGINE] Successfully initialized for Piyush Tiwari.');
  });

})();
