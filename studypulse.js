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
    THEME: 'studypulse_theme_v3',
    XP: 'studypulse_xp_v2',
    FSRS: 'studypulse_fsrs_v2',
    MILESTONES: 'studypulse_milestones_v2',
    HABITS: 'studypulse_habits_v2',
    FOCUSPRO_STEP: 'studypulse_focuspro_step_v2'
  };

  const DEFAULT_MILESTONES = {
    weeklyGoalHours: 15,
    targetTopicsCount: 20,
    examTitle: "Data Science & Distributed Systems Mastery",
    targetDate: "2026-11-15"
  };

  const DEFAULT_HABITS = [
    {
      id: 'habit_morning_deep_work',
      title: 'Morning Deep Work Sprint',
      category: 'DEEP FOCUS',
      icon: '🌅',
      target: '45m deep focus algorithmic study',
      streak: 0,
      history: {}
    },
    {
      id: 'habit_dsa_problem',
      title: 'Solve 1 LeetCode / DSA Problem',
      category: 'ALGORITHMS',
      icon: '🧩',
      target: 'Graph, Tree, or Dynamic Programming',
      streak: 0,
      history: {}
    },
    {
      id: 'habit_system_design',
      title: 'Study 1 System Design / AI Topic',
      category: 'SYSTEMS & ML',
      icon: '🏛️',
      target: 'Raft, MLOps, or Transformers',
      streak: 0,
      history: {}
    },
    {
      id: 'habit_paper_reading',
      title: 'Research Paper / ArXiv Deep Read',
      category: 'RESEARCH',
      icon: '📄',
      target: '20m reading & note taking',
      streak: 0,
      history: {}
    },
    {
      id: 'habit_hydration_wellness',
      title: 'Hydration & Posture Reset',
      category: 'WELLBEING',
      icon: '💧',
      target: '3L water & mobility stretches',
      streak: 0,
      history: {}
    },
    {
      id: 'habit_nightly_review',
      title: 'Nightly Reflection & Journal Log',
      category: 'DAILY ROUTINE',
      icon: '🌙',
      target: 'FSRS flashcard review & sync notes',
      streak: 0,
      history: {}
    }
  ];

  const FOCUSPRO_CYCLE_STEPS = [
    { step: 1, name: 'Deep Work', durationMins: 25, mode: 'pomo', type: 'focus', prompt: 'Deep cognitive sprint on core algorithmic concepts.' },
    { step: 2, name: 'Restorative Pause', durationMins: 5, mode: 'short', type: 'break', prompt: 'Stand up, hydrate, and relax optical focus.' },
    { step: 3, name: 'Deep Work', durationMins: 25, mode: 'pomo', type: 'focus', prompt: 'Active coding and distributed systems synthesis.' },
    { step: 4, name: 'Restorative Pause', durationMins: 5, mode: 'short', type: 'break', prompt: 'Quick breathwork and neck/shoulder stretch.' },
    { step: 5, name: 'Extended Mastery', durationMins: 50, mode: 'deep', type: 'focus', prompt: 'High-leverage project implementation and deep learning.' },
    { step: 6, name: 'Restorative Pause', durationMins: 5, mode: 'short', type: 'break', prompt: 'Re-hydrate and prepare cognitive workspace.' },
    { step: 7, name: 'Deep Work', durationMins: 25, mode: 'pomo', type: 'focus', prompt: 'System design review and test-case edge testing.' },
    { step: 8, name: 'Long Recovery', durationMins: 15, mode: 'long', type: 'break', prompt: 'Consolidate memory, review journal, walk away from screen.' }
  ];

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
    theme: 'light',
    activeView: 'dashboard',
    activeCourseId: 'campusx_dsmp',
    searchQuery: '',
    topicFilter: 'all',
    completedTopics: new Set(),
    topicNotes: {},
    totalFocusSeconds: 0,
    dailyActivity: {},
    streak: { count: 0, lastActive: null },
    xp: 0,
    fsrs: {},
    milestones: { ...DEFAULT_MILESTONES },
    habits: [],
    focusProStep: 1,
    selectedHabitIcon: '🌅',
    
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

      const savedMilestones = localStorage.getItem(STORAGE_KEYS.MILESTONES);
      if (savedMilestones) {
        state.milestones = Object.assign({}, DEFAULT_MILESTONES, JSON.parse(savedMilestones));
      } else {
        state.milestones = { ...DEFAULT_MILESTONES };
      }

      const savedHabits = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (savedHabits) {
        try {
          state.habits = JSON.parse(savedHabits);
        } catch (e) {
          state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
        }
      } else {
        state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
      }

      // Sanitize habit streaks: calculate strictly from authentic history
      if (Array.isArray(state.habits)) {
        const todayStr = getTodayDateString();
        state.habits.forEach(h => {
          if (!h.history || typeof h.history !== 'object') {
            h.history = {};
            h.streak = 0;
          } else {
            let count = 0;
            let checkDate = new Date();
            let dStr = todayStr;
            if (!h.history[dStr]) {
              checkDate.setDate(checkDate.getDate() - 1);
              dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            }
            while (h.history[dStr] === true) {
              count++;
              checkDate.setDate(checkDate.getDate() - 1);
              dStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
            }
            h.streak = count;
          }
        });
        savePersistedState(STORAGE_KEYS.HABITS);
      }

      const savedStep = localStorage.getItem(STORAGE_KEYS.FOCUSPRO_STEP);
      if (savedStep) {
        state.focusProStep = parseInt(savedStep, 10) || 1;
      }

      // Remove stale dummy data: if user hasn't studied yet, reset streak & XP to 0
      if (state.completedTopics.size === 0 && state.totalFocusSeconds === 0 && (!state.dailyActivity || Object.keys(state.dailyActivity).length === 0)) {
        state.streak = { count: 0, lastActive: null };
        state.xp = 0;
        savePersistedState(STORAGE_KEYS.STREAK);
        savePersistedState(STORAGE_KEYS.XP);
      }
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
      if (!key || key === STORAGE_KEYS.MILESTONES) {
        localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(state.milestones));
      }
      if (!key || key === STORAGE_KEYS.HABITS) {
        localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(state.habits));
      }
      if (!key || key === STORAGE_KEYS.FOCUSPRO_STEP) {
        localStorage.setItem(STORAGE_KEYS.FOCUSPRO_STEP, String(state.focusProStep));
      }

      // Mirror to IndexedDB on phone storage
      syncStateToIndexedDB();
    } catch (e) {
      console.warn('[StudyPulse] Error saving to localStorage:', e);
    }
  }

  // =========================================================================
  // PHONE STORAGE VAULT: INDEXEDDB & PERSISTENT STORAGE
  // =========================================================================
  const DB_NAME = 'StudyPulsePhoneVault';
  const DB_VERSION = 1;
  const STORE_NAME = 'user_study_data';
  let idbInstance = null;

  function initIndexedDBVault() {
    if (!window.indexedDB) {
      console.warn('[PhoneStorage] IndexedDB not supported on this device.');
      return;
    }
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function(e) {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = function(e) {
        idbInstance = e.target.result;
        console.log('[PhoneStorage] IndexedDB Phone Vault Active.');
        syncStateToIndexedDB();
      };
      request.onerror = function(e) {
        console.warn('[PhoneStorage] IndexedDB error:', e);
      };
    } catch (err) {
      console.warn('[PhoneStorage] Error opening IndexedDB:', err);
    }
  }

  function syncStateToIndexedDB() {
    if (!idbInstance) return;
    try {
      const tx = idbInstance.transaction([STORE_NAME], 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const snapshot = {
        user: state.user,
        theme: state.theme,
        completedTopics: Array.from(state.completedTopics),
        topicNotes: state.topicNotes,
        totalFocusSeconds: state.totalFocusSeconds,
        dailyActivity: state.dailyActivity,
        streak: state.streak,
        xp: state.xp,
        fsrs: state.fsrs,
        milestones: state.milestones,
        habits: state.habits,
        focusProStep: state.focusProStep,
        lastSavedAt: new Date().toISOString()
      };
      store.put(snapshot, 'app_state_backup');
    } catch (err) {
      console.warn('[PhoneStorage] Could not write snapshot to IndexedDB:', err);
    }
  }

  function requestPhoneStoragePersistence() {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted => {
        console.log('[PhoneStorage] Persistent storage granted:', granted);
        const badge = document.getElementById('phone-storage-status-text');
        if (badge) {
          badge.textContent = granted ? 'Phone Flash Storage (Persistent)' : 'Phone Storage (Standard)';
        }
      }).catch(() => {});
    }
  }

  function exportPhoneStorageBackup() {
    const backupData = {
      app: 'StudyPulse',
      version: '3.0',
      exportedAt: new Date().toISOString(),
      user: state.user,
      theme: state.theme,
      completedTopics: Array.from(state.completedTopics),
      topicNotes: state.topicNotes,
      totalFocusSeconds: state.totalFocusSeconds,
      dailyActivity: state.dailyActivity,
      streak: state.streak,
      xp: state.xp,
      fsrs: state.fsrs,
      milestones: state.milestones,
      habits: state.habits,
      focusProStep: state.focusProStep
    };

    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = getTodayDateString();
    a.href = url;
    a.download = `StudyPulse_Phone_Backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('💾 Backup saved to Phone Storage (Downloads)!');
    hapticFeedback([40, 30, 40]);
  }

  function importPhoneStorageBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid backup file format.');
        }

        if (Array.isArray(data.completedTopics)) {
          state.completedTopics = new Set(data.completedTopics);
        }
        if (data.topicNotes) state.topicNotes = data.topicNotes;
        if (typeof data.totalFocusSeconds === 'number') state.totalFocusSeconds = data.totalFocusSeconds;
        if (data.dailyActivity) state.dailyActivity = data.dailyActivity;
        if (data.streak) state.streak = data.streak;
        if (typeof data.xp === 'number') state.xp = data.xp;
        if (data.milestones) state.milestones = data.milestones;
        if (Array.isArray(data.habits)) state.habits = data.habits;
        if (data.theme) state.theme = data.theme;
        if (data.focusProStep) state.focusProStep = data.focusProStep;

        savePersistedState();
        syncStateToIndexedDB();

        updateDashboardUI();
        renderActivityHeatmap();
        renderHabitsGrid();
        renderMilestoneCountdown();
        if (typeof window.initStudyStatsHub === 'function') {
          window.initStudyStatsHub();
        }

        closePhoneStorageModal();
        showToast('✅ Study data restored from Phone Storage!');
        hapticFeedback([60, 40, 60]);
      } catch (err) {
        alert('Could not restore backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function resetAllUserData() {
    if (!confirm('Are you sure you want to reset all data to a clean slate? This will clear all study progress, streaks, and habits.')) {
      return;
    }
    state.completedTopics = new Set();
    state.topicNotes = {};
    state.totalFocusSeconds = 0;
    state.dailyActivity = {};
    state.streak = { count: 0, lastActive: null };
    state.xp = 0;
    state.fsrs = {};
    state.milestones = { ...DEFAULT_MILESTONES };
    state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
    state.focusProStep = 1;

    savePersistedState();
    syncStateToIndexedDB();

    updateDashboardUI();
    renderActivityHeatmap();
    renderHabitsGrid();
    renderMilestoneCountdown();
    if (typeof window.initStudyStatsHub === 'function') {
      window.initStudyStatsHub();
    }

    closePhoneStorageModal();
    showToast('🧹 Clean slate: All data cleared. Ready for your study journey!');
    hapticFeedback([80, 50, 80]);
  }

  function openPhoneStorageModal() {
    const overlay = document.getElementById('phone-storage-modal-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';

    // Update storage status metrics
    const hours = (state.totalFocusSeconds / 3600).toFixed(1);
    const completedCount = state.completedTopics.size;
    const habitsCount = (state.habits || []).length;
    const streakCount = state.streak.count || 0;

    const statsEl = document.getElementById('storage-modal-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-item"><div class="stat-num">${completedCount}</div><div class="stat-label">Topics</div></div>
        <div class="stat-item"><div class="stat-num">${hours}h</div><div class="stat-label">Focus</div></div>
        <div class="stat-item"><div class="stat-num">${streakCount}</div><div class="stat-label">Streak</div></div>
        <div class="stat-item"><div class="stat-num">${habitsCount}</div><div class="stat-label">Habits</div></div>
      `;
    }
    hapticFeedback(10);
  }

  function closePhoneStorageModal() {
    const overlay = document.getElementById('phone-storage-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    hapticFeedback(8);
  }

  // =========================================================================
  // STREAK & LOGGING
  // =========================================================================
  function validateStreak() {
    if (!state.streak || typeof state.streak.count !== 'number' || !state.streak.lastActive) {
      state.streak = { count: 0, lastActive: null };
      return;
    }

    const today = getTodayDateString();
    if (state.streak.lastActive === today) {
      return;
    }

    const last = new Date(state.streak.lastActive);
    const curr = new Date(today);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Streak intact from yesterday, waiting for today's study session
    } else if (diffDays > 1) {
      // Streak broken, reset to 0
      state.streak.count = 0;
      state.streak.lastActive = null;
      savePersistedState(STORAGE_KEYS.STREAK);
    }
  }

  function recordActivity(type, amount = 1) {
    const today = getTodayDateString();
    if (!state.dailyActivity[today]) {
      state.dailyActivity[today] = { topics: 0, focusMinutes: 0, habits: 0, tags: {} };
    }
    if (!state.dailyActivity[today].tags) {
      state.dailyActivity[today].tags = {};
    }

    if (type === 'topic') {
      state.dailyActivity[today].topics = (state.dailyActivity[today].topics || 0) + amount;
    } else if (type === 'focus') {
      state.dailyActivity[today].focusMinutes = (state.dailyActivity[today].focusMinutes || 0) + amount;
      const curTag = state.currentTag || 'General Study';
      state.dailyActivity[today].tags[curTag] = (state.dailyActivity[today].tags[curTag] || 0) + amount;
    } else if (type === 'habit') {
      state.dailyActivity[today].habits = (state.dailyActivity[today].habits || 0) + amount;
    }

    // Update streak if not updated today
    if (state.streak.lastActive !== today) {
      state.streak.count = (state.streak.count || 0) + 1;
      state.streak.lastActive = today;
      savePersistedState(STORAGE_KEYS.STREAK);
    }

    savePersistedState(STORAGE_KEYS.DAILY_ACTIVITY);
    updateDashboardUI();
    renderActivityHeatmap();
    if (typeof window.initStudyStatsHub === 'function') {
      window.initStudyStatsHub();
    }
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
  function getThemeIcon(theme) {
    if (theme === 'crimson') return '🔴';
    if (theme === 'dark') return '🌙';
    return '☀️';
  }

  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeColorMeta();
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = getThemeIcon(state.theme);
  }

  function toggleAppTheme() {
    // Theme switching cycle: Light (☀️) → Dark Mocha (🌙) → Crimson OLED (🔴) → Light (☀️)
    if (state.theme === 'light') {
      state.theme = 'dark';
    } else if (state.theme === 'dark') {
      state.theme = 'crimson';
    } else {
      state.theme = 'light';
    }

    document.documentElement.setAttribute('data-theme', state.theme);
    savePersistedState(STORAGE_KEYS.THEME);
    updateThemeColorMeta();

    const icon = document.getElementById('theme-toggle-icon');
    if (icon) icon.textContent = getThemeIcon(state.theme);
    
    // Re-render heatmap blocks so SVG colors match the active theme
    renderActivityHeatmap();
    hapticFeedback(12);
  }

  function updateThemeColorMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      if (state.theme === 'crimson') {
        meta.setAttribute('content', '#000000');
      } else if (state.theme === 'dark') {
        meta.setAttribute('content', '#2e2521');
      } else {
        meta.setAttribute('content', '#faf7f2');
      }
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
    if (viewName === 'bookshelf') {
      document.body.classList.add('view-bookshelf-active');
      setTimeout(() => {
        if (typeof window.initBookshelf3D === 'function') {
          window.initBookshelf3D('bookshelf-3d-canvas-container');
        }
        if (typeof window.bookshelf3DResize === 'function') {
          window.bookshelf3DResize();
        }
      }, 60);
    } else {
      document.body.classList.remove('view-bookshelf-active');
      const shelf = document.getElementById('bookshelf-container');
      if (shelf && shelf.classList.contains('is-fullscreen')) {
        toggleBookshelfFullscreen(false);
      }
    }
    if (viewName === 'palace') {
      setTimeout(() => {
        if (typeof window.initMemoryPalace === 'function') {
          window.initMemoryPalace('memory-palace-3d-canvas');
        }
        if (typeof window.memoryPalaceResize === 'function') {
          window.memoryPalaceResize();
        }
      }, 60);
    }
    if (viewName === 'chaos') {
      setTimeout(() => {
        if (typeof window.initChaosSimulator === 'function') {
          window.initChaosSimulator('chaos-canvas-wrapper');
        }
      }, 60);
    }
    if (viewName === 'analytics') {
      renderActivityHeatmap();
      if (typeof window.initStudyStatsHub === 'function') {
        window.initStudyStatsHub();
      }
    }
    if (viewName === 'dashboard') {
      updateDashboardUI();
    }
  }

  // =========================================================================
  // 3D LIBRARY FULLSCREEN CONTROLLER
  // =========================================================================
  function toggleBookshelfFullscreen(forceState) {
    const shelf = document.getElementById('bookshelf-container') || document.querySelector('.bookshelf-container');
    const view = document.getElementById('view-bookshelf');
    const fsIcon = document.getElementById('bookshelf-fs-icon');
    const fsLabel = document.getElementById('bookshelf-fs-label');
    if (!shelf) return;

    const isCurrentFs = shelf.classList.contains('is-fullscreen');
    const targetFs = forceState !== undefined ? forceState : !isCurrentFs;

    if (targetFs) {
      shelf.classList.add('is-fullscreen');
      if (view) view.classList.add('is-fullscreen');
      document.body.classList.add('bookshelf-fullscreen-active');
      if (fsIcon) fsIcon.textContent = '✕';
      if (fsLabel) fsLabel.textContent = 'Exit Fullscreen';

      try {
        if (!document.fullscreenElement && shelf.requestFullscreen) {
          shelf.requestFullscreen().catch(() => {});
        } else if (!document.webkitFullscreenElement && shelf.webkitRequestFullscreen) {
          shelf.webkitRequestFullscreen();
        }
      } catch (e) {}
    } else {
      shelf.classList.remove('is-fullscreen');
      if (view) view.classList.remove('is-fullscreen');
      document.body.classList.remove('bookshelf-fullscreen-active');
      if (fsIcon) fsIcon.textContent = '⛶';
      if (fsLabel) fsLabel.textContent = 'Fullscreen';

      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      } catch (e) {}
    }

    hapticFeedback(14);

    setTimeout(() => {
      if (typeof window.bookshelf3DResize === 'function') {
        window.bookshelf3DResize();
      }
    }, 60);
    setTimeout(() => {
      if (typeof window.bookshelf3DResize === 'function') {
        window.bookshelf3DResize();
      }
    }, 280);
  }

  document.addEventListener('fullscreenchange', () => {
    const shelf = document.getElementById('bookshelf-container');
    if (!document.fullscreenElement && shelf && shelf.classList.contains('is-fullscreen')) {
      toggleBookshelfFullscreen(false);
    }
  });

  document.addEventListener('webkitfullscreenchange', () => {
    const shelf = document.getElementById('bookshelf-container');
    if (!document.webkitFullscreenElement && shelf && shelf.classList.contains('is-fullscreen')) {
      toggleBookshelfFullscreen(false);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const shelf = document.getElementById('bookshelf-container');
      if (shelf && shelf.classList.contains('is-fullscreen')) {
        toggleBookshelfFullscreen(false);
      }
    }
  });

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
      advanceAutoFlowStep(true);
    } else {
      showToast(`⚡ Break Finished! Ready for next sprint.`);
      advanceAutoFlowStep(true);
    }

    calculateProductivityScore();
    generateFocusProAdvice();
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
        ctx.fillStyle = state.audio.isPlaying ? '#ff8a3d' : 'rgba(148, 163, 184, 0.25)';
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

    // Update Course Header Summary with Researched Metadata
    const titleEl = document.getElementById('active-course-title');
    const descEl = document.getElementById('active-course-desc');
    const pillsEl = document.getElementById('active-course-pills');
    if (titleEl) titleEl.textContent = course.title;
    if (descEl) descEl.textContent = course.focus;
    if (pillsEl) {
      const instructor = course.instructor || (course.id === 'campusx_dsmp' ? 'Nitish Singh (CampusX)' : 'Krish Naik');
      const sections = course.sections_count || course.total_modules;
      const videoLec = course.video_lectures_count || course.total_lectures;
      const topicsCnt = course.topics_count || course.total_topics;
      const hours = course.estimated_hours;

      pillsEl.innerHTML = `
        <span class="meta-pill highlight">👨‍🏫 ${escapeHtml(instructor)}</span>
        <span class="meta-pill">📁 ${sections} ${course.sections_count ? 'Sections' : 'Modules'}</span>
        <span class="meta-pill">🎥 ${videoLec} Lectures</span>
        <span class="meta-pill">🏷️ ${topicsCnt} Topics</span>
        <span class="meta-pill highlight">⏱️ ${hours} Hours Total</span>
      `;
    }

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
                      <label class="topic-left" style="cursor: pointer; -webkit-tap-highlight-color: transparent;">
                        <input type="checkbox" class="topic-checkbox" ${isDone ? 'checked' : ''} 
                               onchange="window.toggleTopicCheck('${top.id}', this.checked)">
                        <div class="topic-title">${escapeHtml(top.title)}</div>
                      </label>
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
  // FEATURE 5: WEEKLY TARGET & EXAM MILESTONE ENGINE
  // =========================================================================
  function getCurrentWeekDates() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
    const distToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - distToMonday);
    monday.setHours(0, 0, 0, 0);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
    return { monday, dates };
  }

  function calculateWeeklyProgress() {
    const { dates } = getCurrentWeekDates();
    let totalFocusMinutes = 0;
    let totalTopics = 0;

    dates.forEach(dateStr => {
      const act = state.dailyActivity ? state.dailyActivity[dateStr] : null;
      if (act) {
        totalFocusMinutes += (Number(act.focusMinutes) || 0);
        totalTopics += (Number(act.topics) || 0);
      }
    });

    const loggedHours = totalFocusMinutes / 60;
    const goalHours = Number(state.milestones.weeklyGoalHours) || 15;
    const goalTopics = Number(state.milestones.targetTopicsCount) || 20;

    const hoursPct = goalHours > 0 ? Math.min(100, Math.round((loggedHours / goalHours) * 100)) : 0;
    const rawHoursPct = goalHours > 0 ? Math.round((loggedHours / goalHours) * 100) : 0;
    const topicsPct = goalTopics > 0 ? Math.min(100, Math.round((totalTopics / goalTopics) * 100)) : 0;

    return {
      loggedMinutes: totalFocusMinutes,
      loggedHours: parseFloat(loggedHours.toFixed(1)),
      goalHours,
      hoursPct,
      rawHoursPct,
      loggedTopics: totalTopics,
      goalTopics,
      topicsPct
    };
  }

  function calculateMilestoneCountdown() {
    const targetStr = state.milestones.targetDate || '2026-11-15';
    const now = new Date();
    const parts = targetStr.split('-');

    if (parts.length !== 3) {
      return { days: 0, hours: 0, totalHours: 0, isPast: true, formatted: 'Invalid date' };
    }

    const target = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 23, 59, 59);
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) {
      return { days: 0, hours: 0, totalHours: 0, isPast: true, formatted: 'Goal reached' };
    }

    const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;

    return {
      days,
      hours,
      totalHours,
      isPast: false,
      formatted: `${days}d ${hours}h`
    };
  }

  function updateMilestoneWidget() {
    const weekly = calculateWeeklyProgress();
    const countdown = calculateMilestoneCountdown();

    const hoursEl = document.getElementById('milestone-logged-hours');
    const goalHoursEl = document.getElementById('milestone-goal-hours');
    const barFillEl = document.getElementById('milestone-progress-bar-fill');
    const pctBadgeEl = document.getElementById('milestone-hours-pct');
    const topicsEl = document.getElementById('milestone-topics-progress');

    if (hoursEl) hoursEl.textContent = `${weekly.loggedHours.toFixed(1)}h`;
    if (goalHoursEl) goalHoursEl.textContent = `${weekly.goalHours}h`;
    if (barFillEl) barFillEl.style.width = `${weekly.hoursPct}%`;
    if (pctBadgeEl) pctBadgeEl.textContent = `${weekly.rawHoursPct}%`;
    if (topicsEl) topicsEl.textContent = `${weekly.loggedTopics} / ${weekly.goalTopics} topics`;

    const titleEl = document.getElementById('milestone-exam-title');
    const targetDateEl = document.getElementById('milestone-target-date-display');
    const daysEl = document.getElementById('milestone-countdown-days');
    const hoursElCountdown = document.getElementById('milestone-countdown-hours');
    const statusPillEl = document.getElementById('milestone-status-pill');

    if (titleEl) titleEl.textContent = state.milestones.examTitle || 'Data Science & Distributed Systems Mastery';

    if (targetDateEl) {
      try {
        const parts = (state.milestones.targetDate || '2026-11-15').split('-');
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        targetDateEl.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      } catch (e) {
        targetDateEl.textContent = state.milestones.targetDate;
      }
    }

    if (daysEl) daysEl.textContent = countdown.days;
    if (hoursElCountdown) hoursElCountdown.textContent = countdown.hours;

    if (statusPillEl) {
      if (countdown.isPast) {
        statusPillEl.textContent = 'Due Today';
        statusPillEl.className = 'milestone-status-pill due';
      } else if (countdown.days <= 7) {
        statusPillEl.textContent = 'Sprint Mode';
        statusPillEl.className = 'milestone-status-pill sprint';
      } else {
        statusPillEl.textContent = `${countdown.days}d left`;
        statusPillEl.className = 'milestone-status-pill active';
      }
    }
  }

  function editMilestoneGoal(customSettings) {
    if (customSettings && typeof customSettings === 'object' && !(customSettings instanceof Event)) {
      if (customSettings.weeklyGoalHours !== undefined) {
        state.milestones.weeklyGoalHours = Math.max(1, parseFloat(customSettings.weeklyGoalHours) || 15);
      }
      if (customSettings.targetTopicsCount !== undefined) {
        state.milestones.targetTopicsCount = Math.max(1, parseInt(customSettings.targetTopicsCount, 10) || 20);
      }
      if (customSettings.examTitle !== undefined) {
        state.milestones.examTitle = String(customSettings.examTitle).trim() || 'Mastery Milestone';
      }
      if (customSettings.targetDate !== undefined) {
        state.milestones.targetDate = String(customSettings.targetDate);
      }
      savePersistedState(STORAGE_KEYS.MILESTONES);
      updateMilestoneWidget();
      showToast('🎯 Milestone targets updated!');
      hapticFeedback(12);
      return;
    }

    const modal = document.getElementById('milestone-modal-overlay');
    const hoursInput = document.getElementById('milestone-input-weekly-hours');
    const topicsInput = document.getElementById('milestone-input-weekly-topics');
    const titleInput = document.getElementById('milestone-input-exam-title');
    const dateInput = document.getElementById('milestone-input-target-date');

    if (hoursInput) hoursInput.value = state.milestones.weeklyGoalHours || 15;
    if (topicsInput) topicsInput.value = state.milestones.targetTopicsCount || 20;
    if (titleInput) titleInput.value = state.milestones.examTitle || 'Data Science & Distributed Systems Mastery';
    if (dateInput) dateInput.value = state.milestones.targetDate || '2026-11-15';

    if (modal) modal.style.display = 'flex';
    hapticFeedback(10);
  }

  function saveMilestoneGoal() {
    const hoursInput = document.getElementById('milestone-input-weekly-hours');
    const topicsInput = document.getElementById('milestone-input-weekly-topics');
    const titleInput = document.getElementById('milestone-input-exam-title');
    const dateInput = document.getElementById('milestone-input-target-date');

    const newWeeklyHours = hoursInput ? Math.max(1, parseFloat(hoursInput.value) || 15) : state.milestones.weeklyGoalHours;
    const newWeeklyTopics = topicsInput ? Math.max(1, parseInt(topicsInput.value, 10) || 20) : state.milestones.targetTopicsCount;
    const newTitle = titleInput && titleInput.value.trim() ? titleInput.value.trim() : state.milestones.examTitle;
    const newDate = dateInput && dateInput.value ? dateInput.value : state.milestones.targetDate;

    state.milestones.weeklyGoalHours = newWeeklyHours;
    state.milestones.targetTopicsCount = newWeeklyTopics;
    state.milestones.examTitle = newTitle;
    state.milestones.targetDate = newDate;

    savePersistedState(STORAGE_KEYS.MILESTONES);
    closeMilestoneModal();
    updateMilestoneWidget();
    showToast('🎯 Milestone targets updated successfully!');
    hapticFeedback(12);
  }

  function closeMilestoneModal() {
    const modal = document.getElementById('milestone-modal-overlay');
    if (modal) modal.style.display = 'none';
    hapticFeedback(8);
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

    // Regain Real-time Tracking UI Updates
    const totalMins = Math.floor(state.totalFocusSeconds / 60);
    const hrs = Math.floor(totalMins / 60);
    const remMins = totalMins % 60;
    const timeFormatted = `${hrs}h ${String(remMins).padStart(2, '0')}m`;

    const regainTodayEl = document.getElementById('regain-today-focus-time');
    if (regainTodayEl) regainTodayEl.textContent = timeFormatted;

    // Dynamic 7-day weekly tracker & tag breakdown from real phone storage data
    renderDashboardWeeklyTracker();

    updateRPGStatus();
    updateMilestoneWidget();
    updateJournalStats();
    renderHabitsGrid();
    calculateProductivityScore();
    generateFocusProAdvice();
  }

  function renderDashboardWeeklyTracker() {
    // 1. Weekly Bars (Mon - Sun)
    const chartContainer = document.getElementById('regain-week-chart');
    if (chartContainer) {
      const today = new Date();
      const dayOfWeek = (today.getDay() + 6) % 7; // Mon = 0 ... Sun = 6
      const monday = new Date(today);
      monday.setDate(today.getDate() - dayOfWeek);

      const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      let html = '';

      for (let i = 0; i < 7; i++) {
        const cur = new Date(monday);
        cur.setDate(monday.getDate() + i);
        const dateStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}-${String(cur.getDate()).padStart(2, '0')}`;
        const isToday = i === dayOfWeek;

        const dayRec = state.dailyActivity[dateStr];
        const mins = dayRec ? (dayRec.focusMinutes || dayRec.focus || 0) : 0;
        const pct = Math.min(100, Math.round((mins / 120) * 100));

        html += `
          <div class="regain-chart-col ${isToday ? 'is-today' : ''}" title="${dateStr}: ${mins} mins logged">
            <div class="regain-chart-bar-bg">
              <div class="regain-chart-bar-fill" ${isToday ? 'id="today-bar-fill"' : ''} style="height: ${pct}%;"></div>
            </div>
            <span class="regain-chart-label">${dayNames[i]}</span>
          </div>
        `;
      }
      chartContainer.innerHTML = html;
    }

    // 2. Real Tag Distribution
    const tagTotals = {
      'DSA & LeetCode': 0,
      'Generative AI & LLMs': 0,
      'CampusX Machine Learning': 0,
      'Systems & Docker': 0
    };

    Object.values(state.dailyActivity || {}).forEach(day => {
      if (day.tags && typeof day.tags === 'object') {
        Object.entries(day.tags).forEach(([tag, mins]) => {
          if (tagTotals[tag] !== undefined) {
            tagTotals[tag] += Number(mins) || 0;
          } else if (tag.includes('DSA') || tag.includes('LeetCode')) {
            tagTotals['DSA & LeetCode'] += Number(mins) || 0;
          } else if (tag.includes('AI') || tag.includes('LLM')) {
            tagTotals['Generative AI & LLMs'] += Number(mins) || 0;
          } else if (tag.includes('Machine') || tag.includes('DSMP')) {
            tagTotals['CampusX Machine Learning'] += Number(mins) || 0;
          } else if (tag.includes('System') || tag.includes('Docker')) {
            tagTotals['Systems & Docker'] += Number(mins) || 0;
          }
        });
      }
    });

    const maxTagMins = Math.max(1, ...Object.values(tagTotals));

    const updateTagUI = (timeId, tagName) => {
      const timeEl = document.getElementById(timeId);
      if (timeEl) {
        const m = tagTotals[tagName] || 0;
        timeEl.textContent = m > 0 ? (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`) : '0m';
        const row = timeEl.closest('.regain-tag-row');
        const barFill = row ? row.querySelector('.regain-tag-fill') : null;
        if (barFill) {
          const w = m > 0 ? Math.min(100, Math.round((m / maxTagMins) * 100)) : 0;
          barFill.style.width = `${w}%`;
        }
      }
    };

    updateTagUI('regain-tag-dsa-time', 'DSA & LeetCode');
    updateTagUI('regain-tag-ai-time', 'Generative AI & LLMs');
    updateTagUI('regain-tag-ml-time', 'CampusX Machine Learning');
    updateTagUI('regain-tag-sys-time', 'Systems & Docker');
  }

  function updateJournalStats() {
    const activeDaysEl = document.getElementById('journal-active-days');
    const totalFocusEl = document.getElementById('journal-total-focus');
    const masteredEl = document.getElementById('journal-mastered-topics');
    const streakEl = document.getElementById('journal-current-streak');

    const activeDaysCount = Object.keys(state.dailyActivity).length;
    const totalHours = (state.totalFocusSeconds / 3600).toFixed(1);

    if (activeDaysEl) activeDaysEl.textContent = `${activeDaysCount} Days`;
    if (totalFocusEl) totalFocusEl.textContent = `${totalHours}h`;
    if (masteredEl) masteredEl.textContent = `${state.completedTopics.size} / 1,769`;
    if (streakEl) streakEl.textContent = `${state.streak.count || 0} Days`;
  }

  function renderActivityHeatmap() {
    const svg = document.getElementById('heatmap-grid-svg');
    if (!svg) return;

    svg.innerHTML = '';
    const currentTheme = document.documentElement.getAttribute('data-theme') || state.theme;
    const isCrimson = currentTheme === 'crimson';
    const isDark = currentTheme === 'dark';

    const lightColors = [
      '#e5ddd0',                      // 0: visible warm parchment block
      'rgba(217, 119, 6, 0.42)',      // 1: soft amber
      '#059669',                      // 2: warm sage
      '#c2410c',                      // 3: terracotta
      '#d97706'                       // 4: deep golden amber
    ];
    const darkColors = [
      'rgba(245, 235, 224, 0.08)',    // 0: subtle espresso block
      'rgba(245, 158, 11, 0.40)',     // 1: soft amber
      '#10b981',                      // 2: bright sage
      '#ea580c',                      // 3: terracotta
      '#f59e0b'                       // 4: vivid amber
    ];
    const crimsonColors = [
      '#181112',                      // 0: dark smoked red-tinted box with rgba(239, 68, 68, 0.15) border
      'rgba(239, 68, 68, 0.40)',      // 1: soft crimson accent
      '#dc2626',                      // 2: pure crimson scarlet
      '#ef4444',                      // 3: electric crimson red
      '#ff3b3b'                       // 4: neon scarlet glow
    ];
    const palette = isCrimson ? crimsonColors : (isDark ? darkColors : lightColors);
    const strokeColor = isCrimson ? 'rgba(239, 68, 68, 0.15)' : (isDark ? 'rgba(245, 235, 224, 0.04)' : 'rgba(68, 54, 42, 0.10)');
    const textColor = isCrimson ? '#fca5a5' : (isDark ? '#ab9e95' : '#8c827a');

    const today = new Date();
    const cellSize = 11;
    const cellGap = 3;
    const xOffset = 26;
    const yOffset = 22;

    // Day labels (Mon, Wed, Fri) on the left
    const dayLabels = [
      { text: 'M', row: 1 },
      { text: 'W', row: 3 },
      { text: 'F', row: 5 }
    ];
    dayLabels.forEach(dl => {
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', 6);
      text.setAttribute('y', yOffset + (dl.row * (cellSize + cellGap)) + 9);
      text.setAttribute('fill', textColor);
      text.setAttribute('font-family', 'var(--font-mono)');
      text.setAttribute('font-size', '9');
      text.setAttribute('font-weight', '600');
      text.textContent = dl.text;
      svg.appendChild(text);
    });

    // Calculate dates backwards for 52 weeks (364 days)
    const days = [];
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      days.push({ date: dateStr, dayOfWeek: d.getDay(), month: d.getMonth(), dayOfMonth: d.getDate() });
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    days.forEach((item, index) => {
      const weekIndex = Math.floor(index / 7);
      const dayIndex = item.dayOfWeek;
      const x = xOffset + (weekIndex * (cellSize + cellGap));
      const y = yOffset + (dayIndex * (cellSize + cellGap));

      // Month header label when month starts
      if (dayIndex === 0 && item.month !== lastMonth) {
        lastMonth = item.month;
        const mText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mText.setAttribute('x', x);
        mText.setAttribute('y', 13);
        mText.setAttribute('fill', textColor);
        mText.setAttribute('font-family', 'var(--font-mono)');
        mText.setAttribute('font-size', '9');
        mText.setAttribute('font-weight', '600');
        mText.textContent = monthNames[item.month];
        svg.appendChild(mText);
      }

      const activity = state.dailyActivity[item.date] || { topics: 0, focusMinutes: 0 };
      const score = (activity.topics * 2) + Math.floor(activity.focusMinutes / 15);

      let level = 0;
      if (score >= 8) level = 4;
      else if (score >= 4) level = 3;
      else if (score >= 2) level = 2;
      else if (score >= 1) level = 1;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', x);
      rect.setAttribute('y', y);
      rect.setAttribute('width', cellSize);
      rect.setAttribute('height', cellSize);
      rect.setAttribute('rx', 3);
      rect.setAttribute('ry', 3);
      rect.setAttribute('fill', palette[level]);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', '0.5');
      rect.setAttribute('class', `heatmap-cell level-${level}`);

      rect.innerHTML = `<title>${item.date}: ${activity.topics} topics mastered, ${activity.focusMinutes}m focus</title>`;
      svg.appendChild(rect);
    });

    updateJournalStats();
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
        bottom: calc(var(--bottom-nav-height) + 16px);
        left: 50%;
        transform: translateX(-50%);
        background: rgba(28, 25, 23, 0.96);
        color: #fafaf9;
        border: 1px solid rgba(245, 158, 11, 0.45);
        padding: 10px 18px;
        border-radius: 9999px;
        font-size: 0.84rem;
        font-weight: 600;
        font-family: var(--font-sans);
        z-index: 9999;
        pointer-events: none;
        box-shadow: 0 10px 30px rgba(18, 14, 12, 0.6);
        backdrop-filter: blur(12px);
        transition: opacity 0.25s ease, transform 0.25s ease;
        opacity: 0;
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

  // =========================================================================
  // STUDY PACE & COMPLETION FORECASTER ("KITNA TIME LAGEGA?")
  // =========================================================================
  let currentStudyPace = 2.5;

  function updateStudyPaceForecast(paceVal) {
    currentStudyPace = parseFloat(paceVal) || 2.5;

    const badge = document.getElementById('pace-display-badge');
    if (badge) badge.textContent = `${currentStudyPace.toFixed(1)} hrs/day`;

    const totalHours = 634.6;
    const completedHours = parseFloat((state.totalFocusSeconds / 3600).toFixed(1));
    const remainingHours = Math.max(0, totalHours - completedHours);

    const totalDays = Math.ceil(remainingHours / currentStudyPace);
    const targetDate = new Date(Date.now() + totalDays * 86400000);
    const targetMonthYear = targetDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    const totalDaysEl = document.getElementById('forecaster-total-days');
    const targetDateEl = document.getElementById('forecaster-target-date');
    const completedHoursEl = document.getElementById('forecaster-completed-hours');
    const weeklyHoursEl = document.getElementById('forecaster-weekly-hours');

    if (totalDaysEl) totalDaysEl.textContent = `${totalDays} Days`;
    if (targetDateEl) targetDateEl.textContent = targetMonthYear;
    if (completedHoursEl) completedHoursEl.textContent = `${completedHours}h / ${totalHours}h`;
    if (weeklyHoursEl) weeklyHoursEl.textContent = `${(currentStudyPace * 7).toFixed(1)}h/wk`;

    renderForecasterTable();
  }

  function toggleForecasterTable() {
    const wrapper = document.getElementById('forecaster-table-wrapper');
    const txt = document.getElementById('forecaster-table-toggle-txt');
    if (!wrapper) return;

    const isHidden = wrapper.style.display === 'none';
    wrapper.style.display = isHidden ? 'block' : 'none';
    if (txt) txt.textContent = isHidden ? 'Hide Research Table' : 'View Research Table';
    if (isHidden) renderForecasterTable();
    hapticFeedback(8);
  }

  function renderForecasterTable() {
    const tbody = document.getElementById('forecaster-table-body');
    if (!tbody || !window.ALL_COURSES_DATA) return;

    tbody.innerHTML = '';
    let cumulativeHours = 0;

    window.ALL_COURSES_DATA.courses.forEach((c, idx) => {
      const hours = c.estimated_hours || 0;
      cumulativeHours += hours;
      const daysForThis = Math.ceil(hours / currentStudyPace);
      const daysCumulative = Math.ceil(cumulativeHours / currentStudyPace);
      const finishDate = new Date(Date.now() + daysCumulative * 86400000);
      const finishStr = finishDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold);">${idx + 1}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(c.short_title || c.title)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(c.focus || '')}</div>
        </td>
        <td><span class="meta-pill" style="padding: 2px 8px; font-size: 0.72rem;">${escapeHtml(c.instructor || '')}</span></td>
        <td style="font-family: var(--font-mono); font-weight: 600;">${c.sections_count || c.total_modules}</td>
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--accent-sage);">${c.video_lectures_count || c.total_lectures}</td>
        <td style="font-family: var(--font-mono);">${c.topics_count || c.total_topics}</td>
        <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold);">${hours.toFixed(1)}h</td>
        <td style="font-family: var(--font-mono);">${daysForThis} Days</td>
        <td style="font-family: var(--font-mono); font-weight: 600; color: var(--accent-gold);">${finishStr}</td>
      `;
      tbody.appendChild(tr);
    });

    // Grand Totals Row
    const trTotal = document.createElement('tr');
    trTotal.style.background = 'rgba(160, 140, 120, 0.08)';
    trTotal.style.fontWeight = '700';
    const totalDaysAll = Math.ceil(cumulativeHours / currentStudyPace);
    const finalFinishDate = new Date(Date.now() + totalDaysAll * 86400000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    trTotal.innerHTML = `
      <td colspan="3" style="font-family: var(--font-serif); font-size: 0.92rem; color: var(--accent-gold);">
        GRAND TOTAL (ALL 7 PROGRAMS)
      </td>
      <td style="font-family: var(--font-mono);">113</td>
      <td style="font-family: var(--font-mono); color: var(--accent-sage);">1,014+</td>
      <td style="font-family: var(--font-mono);">1,769</td>
      <td style="font-family: var(--font-mono); color: var(--accent-gold);">${cumulativeHours.toFixed(1)}h</td>
      <td style="font-family: var(--font-mono);">${totalDaysAll} Days</td>
      <td style="font-family: var(--font-mono); color: var(--accent-gold);">${finalFinishDate}</td>
    `;
    tbody.appendChild(trTotal);
  }

  // Global Exports
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
  window.updateStudyPaceForecast = updateStudyPaceForecast;
  window.toggleForecasterTable = toggleForecasterTable;
  window.toggleBookshelfFullscreen = toggleBookshelfFullscreen;

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
  // REGAIN COMPLETE FEATURE ARCHITECTURE
  // 1. Tag Selector Popover (Study ▾)
  // 2. Strict Focus Mode Lock (🔒)
  // 3. Focus Companion Mascot Interactions & Quotes
  // 4. Daily Study Schedule Routines
  // 5. Weekly Tracker Day Navigation
  // 6. Slide-In Navigation Drawer (≡)
  // =========================================================================

  // 1. TAG POPOVER
  function toggleTagPopover(e) {
    if (e) e.stopPropagation();
    const pop = document.getElementById('regain-tag-popover');
    if (!pop) return;
    const isShowing = pop.style.display === 'flex';
    pop.style.display = isShowing ? 'none' : 'flex';
    hapticFeedback(8);
  }

  function selectTag(tagName) {
    state.currentTag = tagName;
    const label = document.getElementById('active-tag-label');
    if (label) label.textContent = tagName;

    document.querySelectorAll('.regain-tag-option').forEach(opt => {
      opt.classList.toggle('selected', opt.textContent.includes(tagName));
    });

    const pop = document.getElementById('regain-tag-popover');
    if (pop) pop.style.display = 'none';

    showToast(`🎯 Focus Program Tag: ${tagName}`);
    hapticFeedback(12);
  }

  // Close tag popover on outside click
  document.addEventListener('click', (e) => {
    const pop = document.getElementById('regain-tag-popover');
    if (pop && pop.style.display === 'flex') {
      if (!e.target.closest('#regain-session-pill') && !e.target.closest('#regain-tag-popover')) {
        pop.style.display = 'none';
      }
    }
  });

  // 2. STRICT FOCUS LOCK
  let strictModeEnabled = false;

  function toggleStrictMode() {
    strictModeEnabled = !strictModeEnabled;
    const btnTimer = document.getElementById('btn-timer-lock');
    const btnHeader = document.getElementById('header-strict-lock-btn');

    if (btnTimer) btnTimer.classList.toggle('active-lock', strictModeEnabled);
    if (btnHeader) {
      btnHeader.style.color = strictModeEnabled ? 'var(--accent-orange)' : '';
      btnHeader.style.boxShadow = strictModeEnabled ? '0 0 12px rgba(255, 138, 61, 0.4)' : '';
    }

    if (strictModeEnabled) {
      showToast('🔒 Strict Study Lock ON: Tab switching is monitored to protect your streak!');
      hapticFeedback([60, 40, 60]);
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      showToast('🔓 Strict Study Lock Paused');
      hapticFeedback(14);
    }
  }

  // Monitor visibility for strict lock
  document.addEventListener('visibilitychange', () => {
    if (strictModeEnabled && document.hidden) {
      hapticFeedback([100, 50, 100]);
      showToast('⚠️ Strict Mode Alert: Return to Study Desk to preserve streak focus!');
    }
  });

  // 3. COMPANION MASCOT INTERACTIONS
  const MASCOT_QUOTES = [
    "Consistency beats intensity! Let's conquer this sprint, Piyush. 🚀",
    "No reels, no shorts. Just pure algorithms and systems mastery! 🧠",
    "25 minutes of deep focus today builds lifelong career freedom. 💡",
    "Great work! You're operating with elite engineering discipline. ⭐",
    "Stay hydrated and maintain your posture. You've got this! ☕",
    "Every mastered topic is another foundation block in your engineering career. 🏛️"
  ];
  let quoteIdx = 0;
  let mascotTimeout = null;

  function mascotInteract() {
    const bubble = document.getElementById('regain-speech-bubble');
    const avatar = document.getElementById('regain-mascot-avatar');
    if (!bubble) return;

    bubble.textContent = MASCOT_QUOTES[quoteIdx % MASCOT_QUOTES.length];
    quoteIdx++;

    bubble.style.display = 'block';
    if (avatar) {
      avatar.style.transform = 'scale(1.15) rotate(10deg)';
      setTimeout(() => { avatar.style.transform = ''; }, 300);
    }

    hapticFeedback(14);

    clearTimeout(mascotTimeout);
    mascotTimeout = setTimeout(() => {
      bubble.style.display = 'none';
    }, 4000);
  }

  // 4. DAILY STUDY ROUTINES
  function activateRoutine(routineId, tagName, durationMins) {
    document.querySelectorAll('.regain-routine-card').forEach(card => {
      card.classList.toggle('active', card.id === `routine-card-${routineId}`);
    });

    selectTag(tagName);

    state.timer.duration = durationMins * 60;
    state.timer.remaining = durationMins * 60;
    pauseTimer();
    updateTimerDisplay();

    showToast(`📅 Routine Loaded: ${tagName} (${durationMins}m)`);
    hapticFeedback(16);
  }

  // 5. WEEKLY TRACKER NAVIGATION
  const DAYS_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  let currentChartDayIdx = 6; // Sunday / Today

  function navigateChartDay(delta) {
    currentChartDayIdx = (currentChartDayIdx + delta + 7) % 7;
    const label = document.getElementById('regain-chart-date-label');
    if (label) {
      if (currentChartDayIdx === 6) {
        label.textContent = 'Today - Active Tracking';
      } else {
        label.textContent = `${DAYS_LABELS[currentChartDayIdx]} - Logged Session`;
      }
    }
    hapticFeedback(10);
  }

  // 6. SLIDE-IN REGAIN DRAWER
  function toggleRegainDrawer(force) {
    const overlay = document.getElementById('regain-drawer-overlay');
    const drawer = document.getElementById('regain-drawer');
    if (!overlay || !drawer) return;

    const isOpen = drawer.classList.contains('open');
    const shouldOpen = typeof force === 'boolean' ? force : !isOpen;

    if (shouldOpen) {
      overlay.style.display = 'block';
      setTimeout(() => drawer.classList.add('open'), 10);
    } else {
      drawer.classList.remove('open');
      setTimeout(() => { overlay.style.display = 'none'; }, 280);
    }
    hapticFeedback(10);
  }

  // Expose Regain features to window
  window.toggleTagPopover = toggleTagPopover;
  window.selectTag = selectTag;
  window.toggleStrictMode = toggleStrictMode;
  window.mascotInteract = mascotInteract;
  window.activateRoutine = activateRoutine;
  window.navigateChartDay = navigateChartDay;
  window.toggleRegainDrawer = toggleRegainDrawer;
  window.editMilestoneGoal = editMilestoneGoal;
  window.saveMilestoneGoal = saveMilestoneGoal;
  window.closeMilestoneModal = closeMilestoneModal;
  window.updateMilestoneWidget = updateMilestoneWidget;

  // =========================================================================
  // FOCUSPRO AI ADVISOR & AUTO-FLOW CYCLE ENGINE (Focus Pro AI App Integration)
  // =========================================================================
  function initFocusProAutoFlow() {
    if (!state.focusProStep || state.focusProStep < 1 || state.focusProStep > 8) {
      state.focusProStep = 1;
    }
    const stepConfig = FOCUSPRO_CYCLE_STEPS[state.focusProStep - 1] || FOCUSPRO_CYCLE_STEPS[0];
    const stepTextEl = document.getElementById('focuspro-step-text');
    if (stepTextEl) {
      stepTextEl.textContent = `Step ${stepConfig.step}/8 · ${stepConfig.name} (${stepConfig.durationMins}m)`;
    }
    calculateProductivityScore();
    generateFocusProAdvice();
  }

  function advanceAutoFlowStep(silent = false) {
    state.focusProStep = (state.focusProStep % 8) + 1;
    savePersistedState(STORAGE_KEYS.FOCUSPRO_STEP);

    const stepConfig = FOCUSPRO_CYCLE_STEPS[state.focusProStep - 1];
    setTimerMode(stepConfig.mode);

    const stepTextEl = document.getElementById('focuspro-step-text');
    if (stepTextEl) {
      stepTextEl.textContent = `Step ${stepConfig.step}/8 · ${stepConfig.name} (${stepConfig.durationMins}m)`;
    }

    calculateProductivityScore();
    generateFocusProAdvice();

    if (!silent) {
      playNotificationChime();
      hapticFeedback([40, 20, 40]);
      showToast(`⚡ FocusPro Flow: Step ${stepConfig.step}/8 — ${stepConfig.name}`);
    }
  }

  function calculateProductivityScore() {
    const today = getTodayDateString();
    const todayFocusMins = state.dailyActivity[today]?.focusMinutes || state.dailyActivity[today]?.focus || Math.floor(state.totalFocusSeconds / 60);

    // 1. Focus time component (up to 40 pts, target: 90 mins)
    const focusPts = Math.min(40, Math.round((todayFocusMins / 90) * 40));

    // 2. Habits completion rate (up to 35 pts)
    const completedHabits = (state.habits || []).filter(h => h.history && h.history[today] === true).length;
    const totalHabits = (state.habits || []).length || 1;
    const habitRate = completedHabits / totalHabits;
    const habitPts = Math.round(habitRate * 35);

    // 3. Streak momentum (up to 15 pts)
    const streakPts = Math.min(15, (state.streak.count || 0) * 3);

    // 4. Curriculum mastery (up to 10 pts)
    const masteryPts = Math.min(10, Math.round((state.completedTopics.size / 30) * 10));

    // Total score (0 to 100)
    const rawScore = focusPts + habitPts + streakPts + masteryPts;
    const totalScore = Math.min(100, rawScore);

    let status = 'Ready to Start';
    if (totalScore >= 85) status = 'Peak Flow';
    else if (totalScore >= 70) status = 'Optimal Flow';
    else if (totalScore >= 40) status = 'Steady Rhythm';
    else if (totalScore > 0) status = 'Priming Flow';

    // Update Status Bar Pill
    const scoreTextEl = document.getElementById('focuspro-score-text');
    if (scoreTextEl) {
      scoreTextEl.textContent = `AI Score: ${totalScore}/100 · ${status}`;
    }

    // Update Modal Metrics
    const modalScoreEl = document.getElementById('modal-ai-score');
    if (modalScoreEl) modalScoreEl.textContent = `${totalScore} / 100`;

    const modalStatusEl = document.getElementById('modal-ai-status');
    if (modalStatusEl) modalStatusEl.textContent = status;

    const modalRoutineEl = document.getElementById('modal-ai-routine-rate');
    if (modalRoutineEl) modalRoutineEl.textContent = `${Math.round(habitRate * 100)}% Done`;

    return totalScore;
  }

  function generateFocusProAdvice() {
    const today = getTodayDateString();
    const hour = new Date().getHours();
    const stepConfig = FOCUSPRO_CYCLE_STEPS[(state.focusProStep - 1) % 8] || FOCUSPRO_CYCLE_STEPS[0];
    const pendingHabits = (state.habits || []).filter(h => !h.history || !h.history[today]);
    const completedHabits = (state.habits || []).filter(h => h.history && h.history[today]).length;
    const totalHabits = (state.habits || []).length;
    const remaining = totalHabits - completedHabits;

    let timeContext = '';
    if (hour >= 5 && hour < 12) {
      timeContext = 'Morning high-neuroplasticity window active.';
    } else if (hour >= 12 && hour < 17) {
      timeContext = 'Afternoon peak analytical capacity.';
    } else if (hour >= 17 && hour < 22) {
      timeContext = 'Evening deep synthesis window.';
    } else {
      timeContext = 'Late hours — cognitive consolidation & memory pacing.';
    }

    let habitContext = remaining === 0
      ? 'All daily disciplines accomplished! 100% routine consistency reached today.'
      : `${remaining} habit${remaining > 1 ? 's' : ''} left today. Recommended next: "${(pendingHabits[0] || {}).title || 'Deep Work Sprint'}".`;

    const advice = `${timeContext} Currently in Step ${stepConfig.step}/8 (${stepConfig.name}). ${habitContext}`;

    const adviceEl = document.getElementById('focuspro-advice-text');
    if (adviceEl) adviceEl.textContent = advice;

    const modalInsight = document.getElementById('focuspro-modal-insight-text');
    if (modalInsight) modalInsight.textContent = `${advice} Recommended: Maintain uninterrupted attention for ${stepConfig.durationMins} minutes.`;

    const topicRec = document.getElementById('focuspro-modal-topic-recommendation');
    if (topicRec) {
      const activeTopics = [
        'MIT 6.824 · Raft Consensus & State Machine Replication',
        'CS197 · Transformer Multi-Head Attention Internals',
        'Stanford CS229 · Gradient Boosting & Loss Landscapes',
        'System Design · Distributed Rate Limiter & Token Bucket Architecture',
        'CMU 15-445 · B+ Tree Concurrency & Buffer Pool Management'
      ];
      const topicIndex = (state.focusProStep + state.completedTopics.size) % activeTopics.length;
      topicRec.textContent = `${activeTopics[topicIndex]}. High exam weightage and aligns with your Weekly Milestone Goal.`;
    }

    const recoveryEl = document.getElementById('focuspro-modal-recovery-text');
    if (recoveryEl) {
      if (stepConfig.type === 'break') {
        recoveryEl.textContent = `Active Break (${stepConfig.durationMins}m): Disengage optical focus, hydrate with 250ml water, and reset neck posture before starting Step ${(state.focusProStep % 8) + 1}.`;
      } else {
        recoveryEl.textContent = `Pacing cadence: After completing this ${stepConfig.name} session, take a 5m pause with 40Hz binaural beats to prevent cognitive fatigue.`;
      }
    }
  }

  function openFocusProAIModal(topic) {
    calculateProductivityScore();
    generateFocusProAdvice();
    if (topic) {
      askFocusProQuestion(topic);
    }
    const overlay = document.getElementById('focuspro-ai-modal-overlay');
    if (overlay) overlay.style.display = 'flex';
    hapticFeedback(10);
  }

  function closeFocusProAIModal() {
    const overlay = document.getElementById('focuspro-ai-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    hapticFeedback(10);
  }

  function askFocusProQuestion(topic) {
    const adviceEl = document.getElementById('focuspro-advice-text');
    const modalInsight = document.getElementById('focuspro-modal-insight-text');

    let answer = '';
    if (topic === 'schedule') {
      answer = '⚡ Schedule Optimization: Partition today into 3 deep blocks (25m Deep Work, 5m Pause, 50m Extended Mastery). Tackle the heaviest distributed systems logic before 2 PM when focus capacity is highest.';
    } else if (topic === 'algorithm') {
      answer = '💻 DSA Practice Recommendation: Focus on Graph Traversal (BFS/DFS) and Topological Sort today. Verify edge cases (empty graphs, disjoint components, and cyclic dependencies).';
    } else if (topic === 'fatigue') {
      answer = '🧘 Anti-Burnout Protocol: Activate 40Hz binaural beats, keep 20-20-20 visual pauses, drink 300ml water every hour, and wind down with a nightly review by 10:30 PM.';
    } else if (topic === 'strategy') {
      answer = '🧠 Study Strategy: Apply active recall using FSRS flashcards after reading, then write runnable code in Systems Lab before moving to the next topic.';
    } else {
      answer = `AI Insight: Maintain steady momentum on Step ${state.focusProStep}/8. Consistency beats intensity over long horizons.`;
    }

    if (adviceEl) adviceEl.textContent = answer;
    if (modalInsight) modalInsight.textContent = answer;
    hapticFeedback(12);
    showToast('🤖 FocusPro AI Coach updated advice');
  }

  // =========================================================================
  // DAILY ROUTINE & HABIT TRACKER ENGINE (Habit Tracker Daily Routine App Integration)
  // =========================================================================
  function renderHabitsGrid() {
    const grid = document.getElementById('habits-grid');
    if (!grid) return;

    if (!Array.isArray(state.habits) || state.habits.length === 0) {
      state.habits = JSON.parse(JSON.stringify(DEFAULT_HABITS));
    }

    const today = getTodayDateString();
    const todayDate = new Date();

    // 7-day contribution dots (last 7 days, M-T-W-T-F-S-S)
    const last7Days = [];
    const dayLetters = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // getDay() 0=Sun..6=Sat
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayDate);
      d.setDate(d.getDate() - i);
      const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      last7Days.push({
        dateStr: dStr,
        letter: dayLetters[d.getDay()],
        isToday: i === 0
      });
    }

    let completedCount = 0;
    const totalCount = (state.habits || []).length;

    grid.innerHTML = '';

    (state.habits || []).forEach(habit => {
      const isDoneToday = habit.history && habit.history[today] === true;
      if (isDoneToday) completedCount += 1;

      const card = document.createElement('div');
      card.className = `habit-card ${isDoneToday ? 'completed' : ''}`;
      card.id = `habit-card-${habit.id}`;

      const dotsHtml = last7Days.map(day => {
        const isDone = habit.history && habit.history[day.dateStr] === true;
        return `
          <div class="history-dot-wrap">
            <span class="history-dot-letter" style="${day.isToday ? 'color: var(--accent-orange); font-weight: 700;' : ''}">${day.letter}</span>
            <div class="history-dot ${isDone ? 'active' : ''}" title="${day.dateStr}: ${isDone ? 'Completed' : 'Pending'}"></div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div class="habit-card-top">
          <span class="habit-category-tag">${escapeHtml(habit.category || 'DAILY ROUTINE')}</span>
          <span class="habit-streak-badge">🔥 ${habit.streak || 0}d</span>
        </div>
        <div class="habit-card-body">
          <div class="habit-icon-wrap">${habit.icon || '🔥'}</div>
          <div class="habit-text-wrap">
            <h4 class="habit-title">${escapeHtml(habit.title)}</h4>
            <div class="habit-target-desc">${escapeHtml(habit.target || 'Daily Goal')}</div>
          </div>
        </div>
        <div class="habit-card-bottom">
          <div class="habit-history-dots">
            ${dotsHtml}
          </div>
          <button class="btn-habit-toggle ${isDoneToday ? 'done' : ''}" onclick="window.toggleHabitCheck('${habit.id}')" title="Toggle routine completion">
            <span>${isDoneToday ? '✓' : '○'}</span>
            <span>${isDoneToday ? 'Done' : 'Mark'}</span>
          </button>
        </div>
      `;

      grid.appendChild(card);
    });

    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const pill = document.getElementById('habits-routine-pill');
    if (pill) pill.textContent = `${completedCount}/${totalCount} Done · ${pct}%`;

    const fill = document.getElementById('habits-progress-fill');
    if (fill) fill.style.width = `${pct}%`;

    const label = document.getElementById('habits-progress-label-text');
    if (label) label.textContent = `${completedCount} of ${totalCount} routines completed today`;

    const streakLabel = document.getElementById('habits-streak-label');
    if (streakLabel) {
      const maxStreak = (state.habits || []).reduce((acc, h) => Math.max(acc, h.streak || 0), 0);
      streakLabel.textContent = `🔥 ${maxStreak} Day Routine Streak`;
    }
  }

  function toggleHabitCheck(habitId) {
    const habit = (state.habits || []).find(h => h.id === habitId);
    if (!habit) return;

    if (!habit.history) habit.history = {};
    const today = getTodayDateString();
    const wasDone = habit.history[today] === true;

    if (wasDone) {
      habit.history[today] = false;
      habit.streak = Math.max(0, (habit.streak || 1) - 1);
      showToast(`Routine "${habit.title}" unmarked.`);
    } else {
      habit.history[today] = true;
      habit.streak = (habit.streak || 0) + 1;
      addXP(25, `Routine Done: ${habit.title}`);
      recordActivity('habit', 1);
      playNotificationChime();
      hapticFeedback([40, 30, 40]);
      showToast(`🔥 Discipline Maintained! "${habit.title}" (+25 XP)`);
    }

    savePersistedState(STORAGE_KEYS.HABITS);
    renderHabitsGrid();
    calculateProductivityScore();
    generateFocusProAdvice();
  }

  function openAddHabitModal() {
    const overlay = document.getElementById('add-habit-modal-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    const titleInput = document.getElementById('habit-input-title');
    if (titleInput) {
      titleInput.value = '';
      titleInput.focus();
    }
    const targetInput = document.getElementById('habit-input-target');
    if (targetInput) targetInput.value = '';
    state.selectedHabitIcon = '🌅';
    updateIconSelectorUI();
    hapticFeedback(10);
  }

  function closeAddHabitModal() {
    const overlay = document.getElementById('add-habit-modal-overlay');
    if (overlay) overlay.style.display = 'none';
    hapticFeedback(10);
  }

  function selectHabitIcon(icon) {
    state.selectedHabitIcon = icon;
    updateIconSelectorUI();
    hapticFeedback(8);
  }

  function updateIconSelectorUI() {
    document.querySelectorAll('.btn-icon-opt').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.icon === state.selectedHabitIcon);
    });
  }

  function saveNewHabit() {
    const titleInput = document.getElementById('habit-input-title');
    const categorySelect = document.getElementById('habit-input-category');
    const targetInput = document.getElementById('habit-input-target');

    const title = titleInput ? titleInput.value.trim() : '';
    if (!title) {
      showToast('Please enter a habit name.');
      if (titleInput) titleInput.focus();
      return;
    }

    const category = categorySelect ? categorySelect.options[categorySelect.selectedIndex].text : 'DAILY ROUTINE';
    const target = targetInput && targetInput.value.trim() ? targetInput.value.trim() : 'Daily consistency';

    const newHabit = {
      id: 'habit_' + Date.now(),
      title: title,
      category: category,
      icon: state.selectedHabitIcon || '🔥',
      target: target,
      streak: 1,
      history: {}
    };

    const today = getTodayDateString();
    newHabit.history[today] = true;

    state.habits.push(newHabit);
    addXP(25, `New Habit Created: ${title}`);
    recordActivity('habit', 1);
    savePersistedState(STORAGE_KEYS.HABITS);

    renderHabitsGrid();
    calculateProductivityScore();
    generateFocusProAdvice();
    closeAddHabitModal();

    playNotificationChime();
    hapticFeedback([40, 40, 60]);
    showToast(`✨ Habit "${title}" created and logged for today! (+25 XP)`);
  }

  function jumpToHabitsSection() {
    toggleRegainDrawer(false);
    switchView('dashboard');
    const el = document.getElementById('habits-widget-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    hapticFeedback(10);
  }

  // Expose FocusPro AI & Habit Tracker to window
  window.advanceAutoFlowStep = advanceAutoFlowStep;
  window.calculateProductivityScore = calculateProductivityScore;
  window.generateFocusProAdvice = generateFocusProAdvice;
  window.openFocusProAIModal = openFocusProAIModal;
  window.closeFocusProAIModal = closeFocusProAIModal;
  window.askFocusProQuestion = askFocusProQuestion;
  window.renderHabitsGrid = renderHabitsGrid;
  window.toggleHabitCheck = toggleHabitCheck;
  window.openAddHabitModal = openAddHabitModal;
  window.closeAddHabitModal = closeAddHabitModal;
  window.selectHabitIcon = selectHabitIcon;
  window.saveNewHabit = saveNewHabit;
  window.jumpToHabitsSection = jumpToHabitsSection;

  // Expose Phone Storage API
  window.openPhoneStorageModal = openPhoneStorageModal;
  window.closePhoneStorageModal = closePhoneStorageModal;
  window.exportPhoneStorageBackup = exportPhoneStorageBackup;
  window.importPhoneStorageBackup = importPhoneStorageBackup;
  window.resetAllUserData = resetAllUserData;

  // =========================================================================
  // INITIALIZATION ON DOM READY
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    loadPersistedState();
    initIndexedDBVault();
    requestPhoneStoragePersistence();
    initTheme();
    updateTimerDisplay();
    renderCourseSelector();
    renderCurriculumMatrix();
    updateDashboardUI();
    renderActivityHeatmap();
    updateStudyPaceForecast(2.5);
    renderHabitsGrid();
    initFocusProAutoFlow();

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

    // Initialize Study Stats Hub
    if (typeof window.initStudyStatsHub === 'function') {
      window.initStudyStatsHub();
    }

    console.log('[StudyPulse FOCUS ENGINE] Successfully initialized for Piyush Tiwari with Phone Storage Active.');
  });

  // Expose state to window for analytics engine
  window.studyPulseState = state;
  window.state = window.state || state;

})();
