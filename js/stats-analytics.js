/**
 * StudyPulse Multi-Dimensional Analytics & Study Stats Engine
 * Dedicated Modular Engine for Piyush Tiwari — Data Science & Distributed Systems
 * 
 * Provides 4 Comprehensive Statistical Dimensions:
 * 1. Date-wise Stats (Interactive Day Inspector with Quick Pickers)
 * 2. Weekly Stats (7-Day Mon-Sun Deep Dive with SVG Breakdown & WoW Growth)
 * 3. Monthly Stats (Monthly Consistency, Velocity & Month-End Projections)
 * 4. Day-wise Stats (Weekday Historical Patterns & Cognitive Pacing Insights)
 * 
 * 100% Offline, Zero Console Errors, Seamless Multi-Theme Architecture.
 */

(function() {
  'use strict';

  // =========================================================================
  // STORAGE KEYS & CONSTANTS
  // =========================================================================
  const STORAGE_KEYS = {
    DAILY_ACTIVITY: 'studypulse_daily_activity_v2',
    FOCUS_SECONDS: 'studypulse_focus_seconds_v2',
    COMPLETED_TOPICS: 'studypulse_completed_topics_v2',
    HABITS: 'studypulse_habits_v2',
    STREAK: 'studypulse_streak_v2',
    XP: 'studypulse_xp_v2',
    MILESTONES: 'studypulse_milestones_v2',
    TOPIC_NOTES: 'studypulse_topic_notes_v2',
    THEME: 'studypulse_theme_v3'
  };

  const WEEKDAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const WEEKDAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Engine Internal State
  const engineState = {
    activeTab: 'date', // 'date', 'week', 'month', 'weekday'
    inspectedDate: getTodayDateString(),
    selectedWeekOffset: 0, // 0 = current week, -1 = last week, -2 = 2 weeks ago
    selectedMonth: new Date().getMonth(), // 0-11
    selectedYear: new Date().getFullYear()
  };

  // =========================================================================
  // DATE HELPERS (TIMEZONE RESILIENT)
  // =========================================================================
  function getTodayDateString() {
    const d = new Date();
    return formatDate(d);
  }

  function formatDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseDateString(str) {
    if (!str || typeof str !== 'string') return new Date();
    const parts = str.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
      return new Date();
    }
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function offsetDays(dateStr, daysDelta) {
    const d = parseDateString(dateStr);
    d.setDate(d.getDate() + daysDelta);
    return formatDate(d);
  }

  function formatDisplayDate(dateStr) {
    const d = parseDateString(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    const year = d.getFullYear();
    return `${dayName}, ${monthName} ${day}, ${year}`;
  }

  function formatMinsToHours(mins) {
    const m = Math.max(0, Math.round(Number(mins) || 0));
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h === 0) return `${remM}m`;
    return `${h}h ${remM.toString().padStart(2, '0')}m`;
  }

  // =========================================================================
  // STATE & DATA RETRIEVAL (WITH SMART SYNTHESIS FALLBACK)
  // =========================================================================
  function getLiveAppState() {
    const winState = window.studyPulseState || window.state || {};
    let dailyActivity = {};
    let totalFocusSeconds = 0;
    let completedTopics = new Set();
    let habits = [];
    let streak = { count: 0, lastActive: null };
    let xp = 0;
    let milestones = { weeklyGoalHours: 15, targetTopicsCount: 20 };
    let topicNotes = {};

    try {
      // 1. Daily Activity
      if (winState.dailyActivity && typeof winState.dailyActivity === 'object') {
        dailyActivity = { ...winState.dailyActivity };
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY);
        if (raw) dailyActivity = JSON.parse(raw);
      }

      // 2. Focus Seconds
      if (typeof winState.totalFocusSeconds === 'number') {
        totalFocusSeconds = winState.totalFocusSeconds;
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.FOCUS_SECONDS);
        if (raw) totalFocusSeconds = parseInt(raw, 10) || 0;
      }

      // 3. Completed Topics
      if (winState.completedTopics instanceof Set) {
        completedTopics = winState.completedTopics;
      } else if (Array.isArray(winState.completedTopics)) {
        completedTopics = new Set(winState.completedTopics);
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_TOPICS);
        if (raw) completedTopics = new Set(JSON.parse(raw));
      }

      // 4. Habits
      if (Array.isArray(winState.habits) && winState.habits.length > 0) {
        habits = winState.habits;
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
        if (raw) habits = JSON.parse(raw);
      }

      // 5. Streak
      if (winState.streak && typeof winState.streak === 'object') {
        streak = winState.streak;
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.STREAK);
        if (raw) streak = JSON.parse(raw);
      }

      // 6. XP
      if (typeof winState.xp === 'number') {
        xp = winState.xp;
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.XP);
        if (raw) xp = parseInt(raw, 10) || 0;
      }

      // 7. Milestones
      if (winState.milestones && typeof winState.milestones === 'object') {
        milestones = Object.assign({}, milestones, winState.milestones);
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.MILESTONES);
        if (raw) milestones = Object.assign({}, milestones, JSON.parse(raw));
      }

      // 8. Topic Notes
      if (winState.topicNotes && typeof winState.topicNotes === 'object') {
        topicNotes = winState.topicNotes;
      } else {
        const raw = localStorage.getItem(STORAGE_KEYS.TOPIC_NOTES);
        if (raw) topicNotes = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('[StatsAnalytics] State parsing note:', err);
    }

    return {
      dailyActivity,
      totalFocusSeconds,
      completedTopics,
      habits,
      streak,
      xp,
      milestones,
      topicNotes
    };
  }

  /**
   * Retrieves unified telemetry for a single date string ("YYYY-MM-DD").
   * Strictly uses authentic user activity stored in phone storage (localStorage/IndexedDB).
   * Returns clean zero state if no activity was recorded on that date.
   */
  function getDateRecord(dateStr, liveState) {
    const raw = liveState.dailyActivity ? liveState.dailyActivity[dateStr] : null;

    // Check habits done on that date from habit history
    const completedHabitsList = [];
    if (Array.isArray(liveState.habits)) {
      liveState.habits.forEach(h => {
        if (h.history && h.history[dateStr] === true) {
          completedHabitsList.push(h);
        }
      });
    }

    // If explicit user activity exists, return verified real data
    if (raw && (raw.focus !== undefined || raw.focusMinutes !== undefined || raw.topic !== undefined || raw.topics !== undefined || raw.habit !== undefined || raw.habits !== undefined)) {
      const focusMins = Number(raw.focus !== undefined ? raw.focus : (raw.focusMinutes || 0));
      const topics = Number(raw.topic !== undefined ? raw.topic : (raw.topics || 0));
      const habitCount = Math.max(
        completedHabitsList.length,
        Number(raw.habit !== undefined ? raw.habit : (raw.habits || 0))
      );
      const sessions = raw.sessions || (focusMins > 0 ? Math.max(1, Math.round(focusMins / 30)) : 0);
      const notes = raw.notes !== undefined ? raw.notes : 0;
      const xp = raw.xp || (focusMins * 2 + topics * 50 + habitCount * 25);

      return {
        dateStr,
        focusMinutes: focusMins,
        topics,
        habits: habitCount,
        sessions,
        notes,
        xp,
        completedHabits: completedHabitsList,
        isSynthetic: false
      };
    }

    // If only habits were recorded on this date
    if (completedHabitsList.length > 0) {
      return {
        dateStr,
        focusMinutes: 0,
        topics: 0,
        habits: completedHabitsList.length,
        sessions: 0,
        notes: 0,
        xp: completedHabitsList.length * 25,
        completedHabits: completedHabitsList,
        isSynthetic: false
      };
    }

    // Authentic clean zero telemetry: No session was conducted on this date
    return {
      dateStr,
      focusMinutes: 0,
      topics: 0,
      habits: 0,
      sessions: 0,
      notes: 0,
      xp: 0,
      completedHabits: [],
      isSynthetic: false
    };
  }

  // =========================================================================
  // WEEKLY COMPUTATION HELPER (MON - SUN)
  // =========================================================================
  function getWeekBounds(targetDate, offsetWeeks = 0) {
    const d = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    d.setDate(d.getDate() + (offsetWeeks * 7));

    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...
    const distToMonday = (dayOfWeek + 6) % 7;

    const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - distToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      days.push({
        dateStr: formatDate(cur),
        dayIndex: i, // 0 = Mon, ..., 6 = Sun
        dayName: WEEKDAY_NAMES[i],
        dayShort: WEEKDAY_SHORT[i],
        dateNumber: cur.getDate(),
        monthShort: cur.toLocaleDateString('en-US', { month: 'short' }),
        dateObj: cur
      });
    }

    const sunday = days[6].dateObj;
    return { monday, sunday, days };
  }

  // =========================================================================
  // UI RENDERERS FOR THE 4 DIMENSIONS
  // =========================================================================

  /**
   * DIMENSION 1: DATE INSPECTOR
   */
  function renderDateInspector(container, liveState) {
    const dateStr = engineState.inspectedDate;
    const record = getDateRecord(dateStr, liveState);
    const todayStr = getTodayDateString();

    const isToday = dateStr === todayStr;
    const isYesterday = dateStr === offsetDays(todayStr, -1);
    const is2DaysAgo = dateStr === offsetDays(todayStr, -2);
    const is3DaysAgo = dateStr === offsetDays(todayStr, -3);
    const is7DaysAgo = dateStr === offsetDays(todayStr, -7);

    // Productivity Badge Logic
    let badgeText = 'No Activity Logged';
    let badgeClass = 'badge-rest';
    if (record.focusMinutes >= 200) {
      badgeText = '🔥 Elite Deep Sprint';
      badgeClass = 'badge-elite';
    } else if (record.focusMinutes >= 140) {
      badgeText = '⚡ High Focus Session';
      badgeClass = 'badge-high';
    } else if (record.focusMinutes >= 60) {
      badgeText = '🌱 Steady Progress';
      badgeClass = 'badge-steady';
    } else if (record.focusMinutes > 0) {
      badgeText = '☕ Light Review';
      badgeClass = 'badge-light';
    } else if (record.habits > 0) {
      badgeText = '✨ Disciplines Logged';
      badgeClass = 'badge-steady';
    }

    // Daily target (120m baseline)
    const targetMins = 120;
    const targetPct = Math.min(200, Math.round((record.focusMinutes / targetMins) * 100));

    let html = `
      <div class="stats-card-inner">
        <!-- Quick Date Selector Toolbar -->
        <div class="stats-quick-bar">
          <div class="stats-quick-pills">
            <button class="btn-stats-quick ${isToday ? 'active' : ''}" onclick="window.inspectDate('${todayStr}')">Today</button>
            <button class="btn-stats-quick ${isYesterday ? 'active' : ''}" onclick="window.inspectDate('${offsetDays(todayStr, -1)}')">Yesterday</button>
            <button class="btn-stats-quick ${is2DaysAgo ? 'active' : ''}" onclick="window.inspectDate('${offsetDays(todayStr, -2)}')">-2 Days</button>
            <button class="btn-stats-quick ${is3DaysAgo ? 'active' : ''}" onclick="window.inspectDate('${offsetDays(todayStr, -3)}')">-3 Days</button>
            <button class="btn-stats-quick ${is7DaysAgo ? 'active' : ''}" onclick="window.inspectDate('${offsetDays(todayStr, -7)}')">-7 Days</button>
          </div>
          
          <div class="stats-picker-group">
            <button class="btn-date-nav" onclick="window.inspectDate('${offsetDays(dateStr, -1)}')" title="Previous Day">‹</button>
            <input type="date" class="stats-date-input" id="stats-custom-date-picker" value="${dateStr}" max="${todayStr}" onchange="window.inspectDate(this.value)">
            <button class="btn-date-nav" onclick="window.inspectDate('${offsetDays(dateStr, 1)}')" title="Next Day" ${dateStr >= todayStr ? 'disabled' : ''}>›</button>
          </div>
        </div>

        <!-- Date Banner -->
        <div class="stats-hero-banner">
          <div>
            <div class="stats-hero-date">${formatDisplayDate(dateStr)}</div>
            <div class="stats-hero-sub">
              ${isToday ? '<span>📍 Current Study Session</span>' : `<span>Historical Log (${dateStr})</span>`}
              <span class="verified-tag">Phone Flash Storage</span>
            </div>
          </div>
          <div class="stats-badge ${badgeClass}">${badgeText}</div>
        </div>

        <!-- 6 Core Metric Blocks -->
        <div class="stats-metric-grid">
          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Focus Duration</span>
              <span class="stats-metric-icon">⏱️</span>
            </div>
            <div class="stats-metric-val">${formatMinsToHours(record.focusMinutes)}</div>
            <div class="stats-metric-sub">${record.focusMinutes} minutes total</div>
            <div class="stats-metric-meter-track">
              <div class="stats-metric-meter-bar" style="width: ${Math.min(100, targetPct)}%;"></div>
            </div>
            <div class="stats-metric-footer-note">${targetPct}% of 2.0h daily goal</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Deep Sessions</span>
              <span class="stats-metric-icon">🎯</span>
            </div>
            <div class="stats-metric-val">${record.sessions}</div>
            <div class="stats-metric-sub">Focus Blocks Logged</div>
            <div class="stats-metric-footer-note">${record.sessions > 0 ? `~${Math.round(record.focusMinutes / record.sessions)}m avg block` : 'No sessions'}</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Habits Ticked</span>
              <span class="stats-metric-icon">🔥</span>
            </div>
            <div class="stats-metric-val">${record.habits}</div>
            <div class="stats-metric-sub">Daily Routine Tasks</div>
            <div class="stats-metric-footer-note">${record.habits >= 4 ? '✨ Optimal consistency' : 'Light maintenance'}</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Topics Mastered</span>
              <span class="stats-metric-icon">📚</span>
            </div>
            <div class="stats-metric-val">${record.topics}</div>
            <div class="stats-metric-sub">Curriculum Modules</div>
            <div class="stats-metric-footer-note">+${record.topics * 50} Knowledge XP</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Notes Written</span>
              <span class="stats-metric-icon">📝</span>
            </div>
            <div class="stats-metric-val">${record.notes}</div>
            <div class="stats-metric-sub">Key Insights Captured</div>
            <div class="stats-metric-footer-note">FSRS Memory Sync</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">XP Gained</span>
              <span class="stats-metric-icon">⚡</span>
            </div>
            <div class="stats-metric-val">+${record.xp}</div>
            <div class="stats-metric-sub">RPG Engineering Score</div>
            <div class="stats-metric-footer-note">Rank Progression</div>
          </div>
        </div>

        <!-- Habits Breakdown List for this Date -->
        <div class="stats-detail-card">
          <div class="stats-detail-title">
            <span>📋 Habit Telemetry for ${formatDisplayDate(dateStr)}</span>
            <span class="stats-pill-tag">${record.habits} Completed</span>
          </div>
          <div class="stats-habits-mini-list">
    `;

    if (Array.isArray(liveState.habits) && liveState.habits.length > 0) {
      liveState.habits.forEach((habit, idx) => {
        const isCompleted = (habit.history && habit.history[dateStr] === true) || (record.habits > idx);
        html += `
          <div class="stats-habit-pill ${isCompleted ? 'is-completed' : 'is-pending'}">
            <span class="stats-habit-icon">${habit.icon || '🔥'}</span>
            <div class="stats-habit-info">
              <div class="stats-habit-name">${escapeHtml(habit.title || 'Habit')}</div>
              <div class="stats-habit-category">${escapeHtml(habit.category || 'ROUTINE')}</div>
            </div>
            <span class="stats-habit-check">${isCompleted ? '✓ Done' : '—'}</span>
          </div>
        `;
      });
    } else {
      html += `
        <div class="stats-empty-note">Default habits tracking active. Log habits from the Focus Console to enrich daily records.</div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * DIMENSION 2: WEEKLY DEEP DIVE (7-Day Mon-Sun Deep Dive)
   */
  function renderWeeklyDeepDive(container, liveState) {
    const today = parseDateString(getTodayDateString());
    const weekOffset = engineState.selectedWeekOffset;
    const { monday, sunday, days } = getWeekBounds(today, weekOffset);

    // Calculate previous week for Week-over-Week (WoW) comparison
    const prevWeek = getWeekBounds(today, weekOffset - 1);

    let totalMins = 0;
    let totalTopics = 0;
    let totalHabits = 0;
    let activeDaysCount = 0;
    let peakDayRecord = null;
    let maxDayMins = 0;

    const dayRecords = days.map(d => {
      const rec = getDateRecord(d.dateStr, liveState);
      totalMins += rec.focusMinutes;
      totalTopics += rec.topics;
      totalHabits += rec.habits;
      if (rec.focusMinutes > 0 || rec.topics > 0) activeDaysCount++;
      if (rec.focusMinutes > maxDayMins) {
        maxDayMins = rec.focusMinutes;
        peakDayRecord = { ...rec, dayName: d.dayName, dayShort: d.dayShort };
      }
      return { ...d, record: rec };
    });

    let prevTotalMins = 0;
    prevWeek.days.forEach(d => {
      const rec = getDateRecord(d.dateStr, liveState);
      prevTotalMins += rec.focusMinutes;
    });

    // Week-over-Week Growth Rate
    let wowGrowthPct = 0;
    let wowGrowthStr = '0.0%';
    let wowIsPositive = true;
    if (prevTotalMins > 0) {
      wowGrowthPct = ((totalMins - prevTotalMins) / prevTotalMins) * 100;
      wowGrowthStr = `${wowGrowthPct >= 0 ? '+' : ''}${wowGrowthPct.toFixed(1)}%`;
      wowIsPositive = wowGrowthPct >= 0;
    } else {
      wowGrowthStr = totalMins > 0 ? '+100%' : '0.0%';
      wowIsPositive = true;
    }

    const totalHours = (totalMins / 60).toFixed(1);
    const dailyAvgHours = (totalMins / 7 / 60).toFixed(1);
    const weeklyGoalHours = Number(liveState.milestones.weeklyGoalHours) || 15;
    const goalPct = Math.min(200, Math.round(((totalMins / 60) / weeklyGoalHours) * 100));

    const dateRangeLabel = `${days[0].monthShort} ${days[0].dateNumber} – ${days[6].monthShort} ${days[6].dateNumber}, ${days[0].dateObj.getFullYear()}`;

    // SVG Bar Chart Dimensions
    const svgWidth = 720;
    const svgHeight = 220;
    const chartTopPadding = 36;
    const chartBottomPadding = 48;
    const chartUsableHeight = svgHeight - chartTopPadding - chartBottomPadding;
    const colWidth = 64;
    const colSpacing = (svgWidth - (colWidth * 7)) / 8;

    // Scale reference ceiling: at least 240 mins (4.0h) or max day
    const scaleCeiling = Math.max(240, maxDayMins * 1.15);

    let html = `
      <div class="stats-card-inner">
        <!-- Week Selector Navigation -->
        <div class="stats-quick-bar">
          <div class="stats-quick-pills">
            <button class="btn-stats-quick ${weekOffset === 0 ? 'active' : ''}" onclick="window.selectStatsWeek(0)">This Week</button>
            <button class="btn-stats-quick ${weekOffset === -1 ? 'active' : ''}" onclick="window.selectStatsWeek(-1)">Last Week</button>
            <button class="btn-stats-quick ${weekOffset === -2 ? 'active' : ''}" onclick="window.selectStatsWeek(-2)">-2 Weeks</button>
          </div>

          <div class="stats-picker-group">
            <button class="btn-date-nav" onclick="window.selectStatsWeek(${weekOffset - 1})" title="Previous Week">‹ Prev Week</button>
            <span class="stats-week-range-text">${dateRangeLabel}</span>
            <button class="btn-date-nav" onclick="window.selectStatsWeek(${weekOffset + 1})" title="Next Week" ${weekOffset >= 0 ? 'disabled' : ''}>Next Week ›</button>
          </div>
        </div>

        <!-- 4 Comparative Metrics -->
        <div class="stats-metric-grid">
          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Total Focus Hours</span>
              <span class="stats-metric-icon">⏱️</span>
            </div>
            <div class="stats-metric-val">${totalHours}h</div>
            <div class="stats-metric-sub">${totalMins} total minutes</div>
            <div class="stats-metric-meter-track">
              <div class="stats-metric-meter-bar" style="width: ${Math.min(100, goalPct)}%;"></div>
            </div>
            <div class="stats-metric-footer-note">${goalPct}% of ${weeklyGoalHours}h target</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Daily Average</span>
              <span class="stats-metric-icon">📊</span>
            </div>
            <div class="stats-metric-val">${dailyAvgHours}h / day</div>
            <div class="stats-metric-sub">Across 7-day cycle</div>
            <div class="stats-metric-footer-note">${activeDaysCount} of 7 days active</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Week-over-Week</span>
              <span class="stats-metric-icon">${wowIsPositive ? '📈' : '📉'}</span>
            </div>
            <div class="stats-metric-val ${wowIsPositive ? 'text-sage' : 'text-crimson'}">${wowGrowthStr}</div>
            <div class="stats-metric-sub">vs ${(prevTotalMins / 60).toFixed(1)}h prior week</div>
            <div class="stats-metric-footer-note">${wowIsPositive ? '▲ Momentum expanding' : '▼ Pace consolidation'}</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Peak Study Day</span>
              <span class="stats-metric-icon">⭐</span>
            </div>
            <div class="stats-metric-val">${peakDayRecord ? peakDayRecord.dayShort : 'None'}</div>
            <div class="stats-metric-sub">${peakDayRecord ? formatMinsToHours(peakDayRecord.focusMinutes) : '0h 00m'} logged</div>
            <div class="stats-metric-footer-note">${peakDayRecord ? `${peakDayRecord.topics} topics mastered` : '—'}</div>
          </div>
        </div>

        <!-- 7-Day Interactive SVG Bar Chart -->
        <div class="stats-chart-card">
          <div class="stats-chart-header">
            <div>
              <div class="stats-chart-title">Mon–Sun 7-Day Focus Distribution</div>
              <div class="stats-chart-sub">Click any bar to inspect that day's granular telemetry</div>
            </div>
            <div class="stats-chart-legend">
              <span class="legend-dot active-dot"></span> <span>Study Focus</span>
              <span class="legend-line target-line-dot"></span> <span>Daily Goal (2.5h)</span>
            </div>
          </div>

          <div class="stats-svg-wrapper">
            <svg class="stats-week-svg" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="barGradientAmber" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#f59e0b" />
                  <stop offset="100%" stop-color="#d97706" />
                </linearGradient>
                <linearGradient id="barGradientPeak" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#ea580c" />
                  <stop offset="100%" stop-color="#c2410c" />
                </linearGradient>
                <linearGradient id="barGradientEmpty" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="rgba(217, 119, 6, 0.12)" />
                  <stop offset="100%" stop-color="rgba(217, 119, 6, 0.05)" />
                </linearGradient>
              </defs>

              <!-- Daily Goal Reference Line (2.5h = 150m) -->
              ${(() => {
                const targetY = svgHeight - chartBottomPadding - ((150 / scaleCeiling) * chartUsableHeight);
                return `
                  <line x1="${colSpacing}" y1="${targetY}" x2="${svgWidth - colSpacing}" y2="${targetY}" stroke="rgba(217, 119, 6, 0.35)" stroke-dasharray="4,4" stroke-width="1.2" />
                  <text x="${svgWidth - colSpacing - 4}" y="${targetY - 5}" fill="var(--text-muted, #8c827a)" font-size="9" font-family="var(--font-mono)" text-anchor="end">Goal: 2.5h</text>
                `;
              })()}

              <!-- Day Columns -->
              ${dayRecords.map((item, idx) => {
                const x = colSpacing + (idx * (colWidth + colSpacing));
                const barHeight = Math.max(6, (item.record.focusMinutes / scaleCeiling) * chartUsableHeight);
                const y = svgHeight - chartBottomPadding - barHeight;
                const isPeak = peakDayRecord && peakDayRecord.dateStr === item.dateStr && item.record.focusMinutes > 0;
                const isToday = item.dateStr === getTodayDateString();
                const fillGradient = isPeak ? 'url(#barGradientPeak)' : (item.record.focusMinutes > 0 ? 'url(#barGradientAmber)' : 'url(#barGradientEmpty)');

                return `
                  <g class="stats-svg-col" onclick="window.inspectDate('${item.dateStr}')" style="cursor: pointer;">
                    <!-- Exact Time Label Above Bar -->
                    <text x="${x + colWidth / 2}" y="${y - 8}" text-anchor="middle" font-family="var(--font-mono)" font-size="11" font-weight="700" fill="${isPeak ? 'var(--accent-blue, #c2410c)' : 'var(--text-primary, #292524)'}">
                      ${item.record.focusMinutes > 0 ? formatMinsToHours(item.record.focusMinutes) : '0m'}
                    </text>

                    <!-- Bar Background Pill (Clickable Area) -->
                    <rect x="${x}" y="${chartTopPadding}" width="${colWidth}" height="${chartUsableHeight}" rx="10" fill="transparent" class="bar-hover-bg" />

                    <!-- Main Progress Bar -->
                    <rect x="${x}" y="${y}" width="${colWidth}" height="${barHeight}" rx="8" fill="${fillGradient}" stroke="${isToday ? 'var(--accent-orange, #d97706)' : 'transparent'}" stroke-width="${isToday ? '2' : '0'}" class="stats-bar-rect">
                      <title>${item.dayName} (${item.dateStr}): ${formatMinsToHours(item.record.focusMinutes)} | ${item.record.topics} topics | ${item.record.habits} habits</title>
                    </rect>

                    ${isPeak ? `
                      <text x="${x + colWidth / 2}" y="${chartTopPadding - 8}" text-anchor="middle" font-size="11">👑</text>
                    ` : ''}

                    <!-- Day Label & Date -->
                    <text x="${x + colWidth / 2}" y="${svgHeight - chartBottomPadding + 18}" text-anchor="middle" font-family="var(--font-sans)" font-size="12" font-weight="${isToday ? '800' : '600'}" fill="${isToday ? 'var(--accent-orange, #d97706)' : 'var(--text-primary, #292524)'}">
                      ${item.dayShort} ${item.dateNumber}
                    </text>

                    <!-- Topics & Habits Indicators Below Bar -->
                    <text x="${x + colWidth / 2}" y="${svgHeight - chartBottomPadding + 34}" text-anchor="middle" font-family="var(--font-mono)" font-size="9.5" fill="var(--text-muted, #8c827a)">
                      📚${item.record.topics} 🔥${item.record.habits}
                    </text>
                  </g>
                `;
              }).join('')}
            </svg>
          </div>
        </div>

        <!-- Weekly Summary Banner -->
        <div class="stats-detail-card" style="margin-top: 18px;">
          <div class="stats-detail-title">
            <span>⚡ Weekly Execution Synthesis</span>
            <span class="stats-pill-tag">${totalTopics} Topics • ${totalHabits} Habits Checked</span>
          </div>
          <p class="stats-detail-body">
            You maintained a pacing velocity of <strong>${(totalTopics / 7).toFixed(1)} topics/day</strong> and logged 
            <strong>${totalHours} deep focus hours</strong> across this 7-day cycle. 
            ${peakDayRecord ? `Cognitive throughput peaked on <strong>${peakDayRecord.dayName}</strong> (${formatMinsToHours(peakDayRecord.focusMinutes)}).` : ''}
          </p>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * DIMENSION 3: MONTHLY STATS
   */
  function renderMonthlySummary(container, liveState) {
    const year = engineState.selectedYear;
    const month = engineState.selectedMonth; // 0-11
    const today = parseDateString(getTodayDateString());
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysElapsed = isCurrentMonth ? Math.min(today.getDate(), daysInMonth) : daysInMonth;

    let totalMins = 0;
    let totalTopics = 0;
    let totalHabits = 0;
    let activeDaysCount = 0;
    let peakDay = { dateStr: '', focusMinutes: 0 };

    const monthDays = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const curDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const rec = getDateRecord(curDateStr, liveState);
      
      if (day <= daysElapsed) {
        totalMins += rec.focusMinutes;
        totalTopics += rec.topics;
        totalHabits += rec.habits;
        if (rec.focusMinutes > 0 || rec.topics > 0) activeDaysCount++;
        if (rec.focusMinutes > peakDay.focusMinutes) {
          peakDay = { dateStr: curDateStr, focusMinutes: rec.focusMinutes, dayNumber: day };
        }
      }

      monthDays.push({
        dayNumber: day,
        dateStr: curDateStr,
        record: rec,
        isFuture: isCurrentMonth && day > daysElapsed
      });
    }

    const restDaysCount = Math.max(0, daysElapsed - activeDaysCount);
    const consistencyRate = daysElapsed > 0 ? Math.round((activeDaysCount / daysElapsed) * 100) : 0;
    const topicVelocity = daysElapsed > 0 ? (totalTopics / daysElapsed).toFixed(1) : '0.0';

    // Projected Month-End Hours
    let projectedHours = '0.0h';
    if (isCurrentMonth) {
      if (daysElapsed > 0) {
        const projMins = (totalMins / daysElapsed) * daysInMonth;
        projectedHours = `${(projMins / 60).toFixed(1)}h`;
      }
    } else {
      projectedHours = `${(totalMins / 60).toFixed(1)}h (Achieved)`;
    }

    const totalHours = (totalMins / 60).toFixed(1);

    let html = `
      <div class="stats-card-inner">
        <!-- Month Navigation Toolbar -->
        <div class="stats-quick-bar">
          <div class="stats-quick-pills">
            <button class="btn-stats-quick ${isCurrentMonth ? 'active' : ''}" onclick="window.selectStatsMonth(${today.getFullYear()}, ${today.getMonth()})">Current Month</button>
            <button class="btn-stats-quick" onclick="window.selectStatsMonth(${today.getFullYear()}, ${today.getMonth() - 1})">Prior Month</button>
          </div>

          <div class="stats-picker-group">
            <button class="btn-date-nav" onclick="window.navigateMonth(-1)" title="Previous Month">‹</button>
            <span class="stats-week-range-text" style="font-weight: 700;">${MONTH_NAMES[month]} ${year}</span>
            <button class="btn-date-nav" onclick="window.navigateMonth(1)" title="Next Month">›</button>
          </div>
        </div>

        <!-- 5 Core Monthly Metrics -->
        <div class="stats-metric-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Monthly Focus</span>
              <span class="stats-metric-icon">⏱️</span>
            </div>
            <div class="stats-metric-val">${totalHours}h</div>
            <div class="stats-metric-sub">${totalMins} logged minutes</div>
            <div class="stats-metric-footer-note">${daysElapsed} days evaluated</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Active vs Rest Days</span>
              <span class="stats-metric-icon">📅</span>
            </div>
            <div class="stats-metric-val">${activeDaysCount} / ${restDaysCount}</div>
            <div class="stats-metric-sub">Active Days / Rest Days</div>
            <div class="stats-metric-footer-note">${daysElapsed} total days</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Consistency Rate</span>
              <span class="stats-metric-icon">🔥</span>
            </div>
            <div class="stats-metric-val ${consistencyRate >= 80 ? 'text-sage' : 'text-amber'}">${consistencyRate}%</div>
            <div class="stats-metric-sub">Daily Habit Frequency</div>
            <div class="stats-metric-footer-note">${consistencyRate >= 85 ? '🌟 Elite consistency' : 'Good steady cadence'}</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Topic Velocity</span>
              <span class="stats-metric-icon">🚀</span>
            </div>
            <div class="stats-metric-val">${topicVelocity}</div>
            <div class="stats-metric-sub">Topics / Day Velocity</div>
            <div class="stats-metric-footer-note">${totalTopics} topics this month</div>
          </div>

          <div class="stats-metric-card">
            <div class="stats-metric-header">
              <span class="stats-metric-label">Projected Month-End</span>
              <span class="stats-metric-icon">🎯</span>
            </div>
            <div class="stats-metric-val">${projectedHours}</div>
            <div class="stats-metric-sub">At current pacing</div>
            <div class="stats-metric-footer-note">${isCurrentMonth ? `${daysInMonth - daysElapsed} days remaining` : 'Complete Cycle'}</div>
          </div>
        </div>

        <!-- Monthly Calendar Matrix -->
        <div class="stats-chart-card">
          <div class="stats-chart-header">
            <div>
              <div class="stats-chart-title">${MONTH_NAMES[month]} ${year} Study Heatmap Calendar</div>
              <div class="stats-chart-sub">Click on any calendar day to inspect its full stats</div>
            </div>
            <div class="stats-chart-legend">
              <span class="legend-cell level-0"></span> <span>Rest</span>
              <span class="legend-cell level-1"></span> <span>Light</span>
              <span class="legend-cell level-2"></span> <span>Med</span>
              <span class="legend-cell level-3"></span> <span>High</span>
              <span class="legend-cell level-4"></span> <span>Peak</span>
            </div>
          </div>

          <div class="stats-month-grid">
            <!-- Weekday Headers -->
            ${WEEKDAY_SHORT.map(wd => `<div class="month-grid-head">${wd}</div>`).join('')}

            <!-- Leading empty cells for month start alignment -->
            ${(() => {
              const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
              let empties = '';
              for (let i = 0; i < firstDayOfWeek; i++) {
                empties += `<div class="month-grid-cell is-empty"></div>`;
              }
              return empties;
            })()}

            <!-- Month Day Cells -->
            ${monthDays.map(item => {
              const mins = item.record.focusMinutes;
              let level = 0;
              if (mins >= 200) level = 4;
              else if (mins >= 140) level = 3;
              else if (mins >= 75) level = 2;
              else if (mins > 0) level = 1;

              const isToday = item.dateStr === getTodayDateString();

              return `
                <div class="month-grid-cell level-${level} ${item.isFuture ? 'is-future' : ''} ${isToday ? 'is-today' : ''}" 
                     onclick="window.inspectDate('${item.dateStr}')" 
                     title="${item.dateStr}: ${formatMinsToHours(mins)} | ${item.record.topics} topics | ${item.record.habits} habits">
                  <span class="month-cell-day">${item.dayNumber}</span>
                  ${mins > 0 ? `<span class="month-cell-mins">${formatMinsToHours(mins)}</span>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  /**
   * DIMENSION 4: DAY-WISE STATS (Weekday Historical Patterns & Cognitive Pacing)
   */
  function renderWeekdayPatterns(container, liveState) {
    const today = parseDateString(getTodayDateString());

    // Aggregate telemetry across the past 8 weeks (56 days)
    const weekdayBuckets = [
      { dayIndex: 0, name: 'Monday', short: 'Mon', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 },
      { dayIndex: 1, name: 'Tuesday', short: 'Tue', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 },
      { dayIndex: 2, name: 'Wednesday', short: 'Wed', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 },
      { dayIndex: 3, name: 'Thursday', short: 'Thu', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 },
      { dayIndex: 4, name: 'Friday', short: 'Fri', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 },
      { dayIndex: 5, name: 'Saturday', short: 'Sat', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 },
      { dayIndex: 6, name: 'Sunday', short: 'Sun', totalMins: 0, occurrences: 0, activeCount: 0, topics: 0, habits: 0 }
    ];

    // Scan backwards 56 days
    for (let i = 0; i < 56; i++) {
      const cur = new Date(today);
      cur.setDate(cur.getDate() - i);
      const dateStr = formatDate(cur);
      const dayIdx = (cur.getDay() + 6) % 7; // Mon = 0, ..., Sun = 6

      const rec = getDateRecord(dateStr, liveState);
      const b = weekdayBuckets[dayIdx];
      b.occurrences++;
      b.totalMins += rec.focusMinutes;
      b.topics += rec.topics;
      b.habits += rec.habits;
      if (rec.focusMinutes > 0 || rec.topics > 0) {
        b.activeCount++;
      }
    }

    // Compute averages
    let peakBucket = weekdayBuckets[0];
    let lowestBucket = weekdayBuckets[0];
    let maxAvgMins = 0;
    let minAvgMins = Infinity;

    weekdayBuckets.forEach(b => {
      b.avgMins = b.occurrences > 0 ? Math.round(b.totalMins / b.occurrences) : 0;
      b.consistency = b.occurrences > 0 ? Math.round((b.activeCount / b.occurrences) * 100) : 0;
      b.avgTopics = b.occurrences > 0 ? (b.topics / b.occurrences).toFixed(1) : '0.0';

      if (b.avgMins > maxAvgMins) {
        maxAvgMins = b.avgMins;
        peakBucket = b;
      }
      if (b.avgMins < minAvgMins) {
        minAvgMins = b.avgMins;
        lowestBucket = b;
      }
    });

    let html = `
      <div class="stats-card-inner">
        <!-- Peak Focus Day Cognitive Insight Card -->
        <div class="stats-cognitive-card">
          <div class="stats-cognitive-badge">⚡ COGNITIVE PACING ADVICE</div>
          <div class="stats-cognitive-title">
            ${maxAvgMins > 0 ? `Peak Focus Day: <span class="text-orange">${peakBucket.name}</span> (${formatMinsToHours(peakBucket.avgMins)} avg)` : `Ready to Map Your Cognitive Rhythm`}
          </div>
          <p class="stats-cognitive-text">
            ${maxAvgMins > 0 ? `Historical telemetry confirms your highest cognitive stamina lands on <strong>${peakBucket.name}s</strong>. Capitalize on this natural neurological peak by scheduling high-friction engineering subjects—such as <strong>Distributed Systems (Raft, Quorum logic)</strong>, <strong>Deep Transformers</strong>, and <strong>Hard DSA sets</strong>—during your peak ${peakBucket.name} window.` : `No deep work sessions recorded yet across the past 8 weeks. Complete your first focus sprint on the Study Desk to begin mapping your peak performance weekdays and stamina cycles!`}
          </p>
          <div class="stats-cognitive-strategy-grid">
            <div class="stats-strategy-item">
              <div class="strategy-icon">🚀</div>
              <div class="strategy-content">
                <div class="strategy-name">${maxAvgMins > 0 ? `${peakBucket.name} Sprint Strategy` : `Primary Sprint Strategy`}</div>
                <div class="strategy-desc">${maxAvgMins > 0 ? `Schedule 50m extended mastery blocks. Protect this day from low-leverage administrative distractions.` : `Complete 25m or 50m sprints to establish your cognitive foundation.`}</div>
              </div>
            </div>
            <div class="stats-strategy-item">
              <div class="strategy-icon">🧘</div>
              <div class="strategy-content">
                <div class="strategy-name">${maxAvgMins > 0 ? `${lowestBucket.name} Recovery Strategy` : `Rest & Review Strategy`}</div>
                <div class="strategy-desc">${maxAvgMins > 0 ? `Your lowest volume day (${formatMinsToHours(lowestBucket.avgMins)} avg). Treat as deliberate consolidation: FSRS reviews & 3D Memory Palace exploration.` : `Deliberate recovery and review days maintain long-term learning momentum.`}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visual Bar Comparison of All 7 Weekdays -->
        <div class="stats-chart-card">
          <div class="stats-chart-header">
            <div>
              <div class="stats-chart-title">Weekday Historical Performance Patterns (8-Week Aggregation)</div>
              <div class="stats-chart-sub">Average focus time and consistency rate per day of the week</div>
            </div>
          </div>

          <div class="weekday-bars-container">
            ${weekdayBuckets.map(b => {
              const barPct = maxAvgMins > 0 ? Math.round((b.avgMins / maxAvgMins) * 100) : 0;
              const isPeak = b.name === peakBucket.name;

              return `
                <div class="weekday-bar-row ${isPeak ? 'is-peak-row' : ''}">
                  <div class="weekday-label-col">
                    <span class="weekday-row-name">${b.name}</span>
                    ${isPeak ? '<span class="weekday-peak-star">★ Peak</span>' : ''}
                  </div>

                  <div class="weekday-progress-col">
                    <div class="weekday-progress-track">
                      <div class="weekday-progress-fill ${isPeak ? 'fill-peak' : ''}" style="width: ${barPct}%;">
                        <span class="weekday-bar-inner-text">${formatMinsToHours(b.avgMins)}</span>
                      </div>
                    </div>
                  </div>

                  <div class="weekday-stats-col">
                    <span class="weekday-stat-item" title="Consistency rate">🔥 ${b.consistency}%</span>
                    <span class="weekday-stat-item" title="Average topics">📚 ${b.avgTopics}/day</span>
                    <span class="weekday-stat-item total-col" title="Total hours over 8 weeks">${(b.totalMins / 60).toFixed(0)}h total</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  // =========================================================================
  // CSS INJECTION (SEAMLESS WARM LINEN THEME & DARK MODE SUPPORT)
  // =========================================================================
  function injectStatsHubStyles() {
    if (document.getElementById('studypulse-stats-hub-styles')) return;

    const styleEl = document.createElement('style');
    styleEl.id = 'studypulse-stats-hub-styles';
    styleEl.textContent = `
      /* =========================================================================
         StudyPulse Stats Hub Styles
         ========================================================================= */
      #study-stats-hub {
        margin: 28px 0;
        width: 100%;
      }

      .stats-hub-card {
        background: var(--bg-primary, #faf7f2);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-lg, 22px);
        padding: 24px;
        box-shadow: 0 4px 20px rgba(68, 54, 42, 0.04);
        position: relative;
        overflow: hidden;
      }

      .stats-hub-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 22px;
        padding-bottom: 18px;
        border-bottom: 1px solid var(--surface-border-subtle, rgba(68, 54, 42, 0.06));
      }

      .stats-hub-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: var(--radius-full, 9999px);
        background: var(--accent-orange-soft, rgba(217, 119, 6, 0.12));
        color: var(--accent-orange, #d97706);
        font-family: var(--font-mono, monospace);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        margin-bottom: 6px;
      }

      .stats-hub-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--accent-orange, #d97706);
        box-shadow: 0 0 8px var(--accent-orange, #d97706);
      }

      .stats-hub-title {
        font-family: var(--font-serif, serif);
        font-size: 1.45rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
        margin: 0 0 4px 0;
      }

      .stats-hub-subtitle {
        font-size: 0.85rem;
        color: var(--text-secondary, #57534e);
        margin: 0;
      }

      .stats-hub-quick-pills {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .stats-lifetime-pill {
        padding: 6px 14px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-secondary, #f4ede4);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary, #292524);
        font-family: var(--font-mono, monospace);
      }

      /* Segmented Pill Tabs */
      .stats-hub-tabs {
        display: flex;
        gap: 8px;
        background: var(--bg-secondary, #f4ede4);
        padding: 6px;
        border-radius: var(--radius-full, 9999px);
        margin-bottom: 24px;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
      }

      .stats-tab-btn {
        flex: 1;
        min-width: 140px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 10px 18px;
        border-radius: var(--radius-full, 9999px);
        border: none;
        background: transparent;
        color: var(--text-secondary, #57534e);
        font-family: var(--font-sans, sans-serif);
        font-size: 0.88rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-fast, 0.18s ease);
        white-space: nowrap;
      }

      .stats-tab-btn:hover {
        color: var(--text-primary, #292524);
        background: rgba(255, 255, 255, 0.4);
      }

      .stats-tab-btn.active {
        background: var(--accent-orange, #d97706);
        color: #ffffff !important;
        box-shadow: 0 4px 14px rgba(217, 119, 6, 0.32);
      }

      /* Quick Toolbar */
      .stats-quick-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 20px;
        padding: 12px 16px;
        background: var(--bg-secondary, #f4ede4);
        border-radius: var(--radius-md, 16px);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
      }

      .stats-quick-pills {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .btn-stats-quick {
        padding: 6px 13px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.12));
        background: var(--bg-primary, #faf7f2);
        color: var(--text-primary, #292524);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-stats-quick:hover {
        border-color: var(--accent-orange, #d97706);
        color: var(--accent-orange, #d97706);
      }

      .btn-stats-quick.active {
        background: var(--accent-orange, #d97706);
        color: #ffffff;
        border-color: var(--accent-orange, #d97706);
      }

      .stats-picker-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-date-nav {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-full, 9999px);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.14));
        background: var(--bg-primary, #faf7f2);
        color: var(--text-primary, #292524);
        font-size: 1rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-date-nav:hover:not(:disabled) {
        border-color: var(--accent-orange, #d97706);
        color: var(--accent-orange, #d97706);
      }

      .btn-date-nav:disabled {
        opacity: 0.35;
        cursor: not-allowed;
      }

      .stats-date-input {
        padding: 6px 12px;
        border-radius: var(--radius-sm, 10px);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.16));
        background: var(--bg-primary, #faf7f2);
        color: var(--text-primary, #292524);
        font-family: var(--font-mono, monospace);
        font-size: 0.84rem;
        font-weight: 600;
      }

      .stats-week-range-text {
        font-size: 0.85rem;
        color: var(--text-primary, #292524);
        font-family: var(--font-mono, monospace);
      }

      /* Hero Banner */
      .stats-hero-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px 20px;
        background: var(--bg-secondary, #f4ede4);
        border-radius: var(--radius-md, 16px);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        margin-bottom: 20px;
      }

      .stats-hero-date {
        font-family: var(--font-serif, serif);
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
      }

      .stats-hero-sub {
        font-size: 0.82rem;
        color: var(--text-secondary, #57534e);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 3px;
      }

      .synthetic-tag {
        font-size: 0.68rem;
        padding: 2px 7px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(217, 119, 6, 0.12);
        color: var(--accent-orange, #d97706);
        font-family: var(--font-mono, monospace);
      }

      .verified-tag {
        font-size: 0.68rem;
        padding: 2px 7px;
        border-radius: var(--radius-full, 9999px);
        background: rgba(5, 150, 105, 0.12);
        color: var(--accent-sage, #059669);
        font-family: var(--font-mono, monospace);
      }

      .stats-badge {
        padding: 7px 14px;
        border-radius: var(--radius-full, 9999px);
        font-size: 0.84rem;
        font-weight: 700;
      }

      .badge-elite {
        background: rgba(194, 65, 12, 0.12);
        color: var(--accent-blue, #c2410c);
        border: 1px solid rgba(194, 65, 12, 0.28);
      }

      .badge-high {
        background: rgba(217, 119, 6, 0.12);
        color: var(--accent-orange, #d97706);
        border: 1px solid rgba(217, 119, 6, 0.28);
      }

      .badge-steady {
        background: rgba(5, 150, 105, 0.12);
        color: var(--accent-sage, #059669);
        border: 1px solid rgba(5, 150, 105, 0.28);
      }

      .badge-light {
        background: rgba(140, 130, 122, 0.12);
        color: var(--text-secondary, #57534e);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.12));
      }

      .badge-rest {
        background: rgba(140, 130, 122, 0.08);
        color: var(--text-muted, #8c827a);
        border: 1px solid var(--surface-border-subtle, rgba(68, 54, 42, 0.06));
      }

      /* Metric Grid */
      .stats-metric-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }

      .stats-metric-card {
        background: var(--bg-secondary, #f4ede4);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-md, 16px);
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 3px;
        position: relative;
        overflow: hidden;
        transition: transform var(--transition-fast, 0.18s ease), box-shadow var(--transition-fast, 0.18s ease);
      }

      .stats-metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(68, 54, 42, 0.06);
      }

      .stats-metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .stats-metric-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 700;
        color: var(--text-muted, #8c827a);
        font-family: var(--font-mono, monospace);
      }

      .stats-metric-icon {
        font-size: 1.1rem;
      }

      .stats-metric-val {
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary, #292524);
        font-family: var(--font-sans, sans-serif);
        line-height: 1.2;
        margin-top: 2px;
      }

      .stats-metric-sub {
        font-size: 0.78rem;
        color: var(--text-secondary, #57534e);
      }

      .stats-metric-meter-track {
        height: 5px;
        background: rgba(68, 54, 42, 0.08);
        border-radius: 9999px;
        margin-top: 8px;
        overflow: hidden;
      }

      .stats-metric-meter-bar {
        height: 100%;
        background: var(--accent-orange, #d97706);
        border-radius: 9999px;
      }

      .stats-metric-footer-note {
        font-size: 0.72rem;
        color: var(--text-muted, #8c827a);
        margin-top: 6px;
        font-family: var(--font-mono, monospace);
      }

      /* Detail Card */
      .stats-detail-card {
        background: var(--bg-secondary, #f4ede4);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-md, 16px);
        padding: 18px 20px;
        margin-top: 14px;
      }

      .stats-detail-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.92rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
        margin-bottom: 14px;
      }

      .stats-pill-tag {
        font-size: 0.75rem;
        padding: 3px 10px;
        border-radius: var(--radius-full, 9999px);
        background: var(--bg-primary, #faf7f2);
        color: var(--text-secondary, #57534e);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        font-family: var(--font-mono, monospace);
      }

      .stats-detail-body {
        font-size: 0.88rem;
        color: var(--text-secondary, #57534e);
        line-height: 1.6;
        margin: 0;
      }

      /* Habits List in Date Inspector */
      .stats-habits-mini-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 10px;
      }

      .stats-habit-pill {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        background: var(--bg-primary, #faf7f2);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-sm, 10px);
        transition: all 0.15s ease;
      }

      .stats-habit-pill.is-completed {
        border-color: rgba(5, 150, 105, 0.3);
      }

      .stats-habit-pill.is-pending {
        opacity: 0.65;
      }

      .stats-habit-icon {
        font-size: 1.25rem;
      }

      .stats-habit-info {
        flex: 1;
        min-width: 0;
      }

      .stats-habit-name {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-primary, #292524);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .stats-habit-category {
        font-size: 0.68rem;
        color: var(--text-muted, #8c827a);
        font-family: var(--font-mono, monospace);
      }

      .stats-habit-check {
        font-size: 0.74rem;
        font-weight: 700;
        color: var(--accent-sage, #059669);
        font-family: var(--font-mono, monospace);
      }

      /* Chart Cards & SVG */
      .stats-chart-card {
        background: var(--bg-secondary, #f4ede4);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-md, 16px);
        padding: 20px;
        margin-top: 18px;
      }

      .stats-chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
        margin-bottom: 18px;
      }

      .stats-chart-title {
        font-family: var(--font-serif, serif);
        font-size: 1.15rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
      }

      .stats-chart-sub {
        font-size: 0.8rem;
        color: var(--text-secondary, #57534e);
      }

      .stats-chart-legend {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 0.74rem;
        color: var(--text-muted, #8c827a);
        font-family: var(--font-mono, monospace);
      }

      .legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }

      .active-dot {
        background: var(--accent-orange, #d97706);
      }

      .target-line-dot {
        width: 14px;
        height: 2px;
        background: rgba(217, 119, 6, 0.5);
        display: inline-block;
      }

      .stats-svg-wrapper {
        width: 100%;
        overflow-x: auto;
      }

      .stats-week-svg {
        width: 100%;
        min-width: 600px;
        height: auto;
        display: block;
      }

      .stats-svg-col:hover .bar-hover-bg {
        fill: rgba(217, 119, 6, 0.07);
      }

      .stats-svg-col:hover .stats-bar-rect {
        filter: brightness(1.08);
      }

      /* Monthly Calendar Grid */
      .stats-month-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 8px;
      }

      .month-grid-head {
        text-align: center;
        font-family: var(--font-mono, monospace);
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted, #8c827a);
        padding: 6px 0;
      }

      .month-grid-cell {
        aspect-ratio: 1.1;
        background: var(--bg-primary, #faf7f2);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-sm, 10px);
        padding: 6px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .month-grid-cell:hover:not(.is-empty) {
        transform: translateY(-2px);
        border-color: var(--accent-orange, #d97706);
      }

      .month-grid-cell.is-empty {
        background: transparent;
        border: none;
        cursor: default;
      }

      .month-grid-cell.is-today {
        border: 2px solid var(--accent-orange, #d97706);
        box-shadow: 0 0 10px rgba(217, 119, 6, 0.2);
      }

      .month-grid-cell.is-future {
        opacity: 0.4;
      }

      .month-cell-day {
        font-size: 0.76rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
      }

      .month-cell-mins {
        font-size: 0.68rem;
        font-family: var(--font-mono, monospace);
        color: var(--text-secondary, #57534e);
        align-self: flex-end;
      }

      .month-grid-cell.level-1 { background: rgba(217, 119, 6, 0.10); }
      .month-grid-cell.level-2 { background: rgba(5, 150, 105, 0.15); border-color: rgba(5, 150, 105, 0.25); }
      .month-grid-cell.level-3 { background: rgba(194, 65, 12, 0.16); border-color: rgba(194, 65, 12, 0.28); }
      .month-grid-cell.level-4 { background: rgba(217, 119, 6, 0.28); border-color: rgba(217, 119, 6, 0.45); }

      /* Weekday Patterns & Insight Card */
      .stats-cognitive-card {
        background: linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(194, 65, 12, 0.06) 100%);
        border: 1px solid var(--surface-border-active, rgba(217, 119, 6, 0.45));
        border-radius: var(--radius-md, 16px);
        padding: 22px;
        margin-bottom: 20px;
      }

      .stats-cognitive-badge {
        font-family: var(--font-mono, monospace);
        font-size: 0.72rem;
        font-weight: 800;
        color: var(--accent-orange, #d97706);
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }

      .stats-cognitive-title {
        font-family: var(--font-serif, serif);
        font-size: 1.35rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
        margin-bottom: 10px;
      }

      .stats-cognitive-text {
        font-size: 0.9rem;
        color: var(--text-secondary, #57534e);
        line-height: 1.65;
        margin-bottom: 16px;
      }

      .stats-cognitive-strategy-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 12px;
      }

      .stats-strategy-item {
        display: flex;
        gap: 12px;
        background: var(--bg-primary, #faf7f2);
        padding: 14px 16px;
        border-radius: var(--radius-sm, 10px);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
      }

      .strategy-icon {
        font-size: 1.4rem;
      }

      .strategy-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
        margin-bottom: 3px;
      }

      .strategy-desc {
        font-size: 0.78rem;
        color: var(--text-secondary, #57534e);
        line-height: 1.45;
      }

      .weekday-bars-container {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .weekday-bar-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 14px;
        background: var(--bg-primary, #faf7f2);
        border: 1px solid var(--surface-border, rgba(68, 54, 42, 0.08));
        border-radius: var(--radius-sm, 10px);
        transition: all 0.15s ease;
      }

      .weekday-bar-row.is-peak-row {
        border-color: rgba(217, 119, 6, 0.45);
        background: rgba(217, 119, 6, 0.04);
      }

      .weekday-label-col {
        width: 110px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .weekday-row-name {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-primary, #292524);
      }

      .weekday-peak-star {
        font-size: 0.65rem;
        padding: 2px 6px;
        border-radius: 9999px;
        background: var(--accent-orange, #d97706);
        color: #ffffff;
        font-family: var(--font-mono, monospace);
        font-weight: 700;
      }

      .weekday-progress-col {
        flex: 1;
        min-width: 100px;
      }

      .weekday-progress-track {
        height: 24px;
        background: rgba(68, 54, 42, 0.06);
        border-radius: 9999px;
        overflow: hidden;
        display: flex;
      }

      .weekday-progress-fill {
        height: 100%;
        background: var(--accent-orange, #d97706);
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
        min-width: 40px;
        transition: width 0.3s ease;
      }

      .weekday-progress-fill.fill-peak {
        background: linear-gradient(90deg, #d97706, #c2410c);
      }

      .weekday-bar-inner-text {
        font-size: 0.74rem;
        font-family: var(--font-mono, monospace);
        font-weight: 700;
        color: #ffffff;
      }

      .weekday-stats-col {
        display: flex;
        gap: 10px;
        align-items: center;
        font-size: 0.78rem;
        font-family: var(--font-mono, monospace);
        color: var(--text-secondary, #57534e);
      }

      .text-sage { color: var(--accent-sage, #059669) !important; }
      .text-amber { color: var(--accent-orange, #d97706) !important; }
      .text-orange { color: var(--accent-orange, #d97706) !important; }
      .text-crimson { color: var(--accent-crimson, #e11d48) !important; }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .stats-hub-card {
          padding: 16px;
        }
        .stats-tab-btn {
          min-width: 110px;
          padding: 8px 12px;
          font-size: 0.8rem;
        }
        .weekday-label-col {
          width: 80px;
        }
        .weekday-stats-col .total-col {
          display: none;
        }
      }
    `;

    document.head.appendChild(styleEl);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // MASTER ORCHESTRATOR & TAB CONTROLLER
  // =========================================================================
  function renderActiveStatsTab() {
    const hub = document.getElementById('study-stats-hub');
    if (!hub) return;

    injectStatsHubStyles();

    // Ensure master template structure exists
    let panelsContainer = hub.querySelector('.stats-hub-panels');
    if (!panelsContainer) {
      hub.innerHTML = `
        <div class="stats-hub-card">
          <div class="stats-hub-header">
            <div>
              <div class="stats-hub-badge">
                <span class="stats-hub-badge-dot"></span>
                ANALYTICS & STUDY STATS ENGINE
              </div>
              <h2 class="stats-hub-title">Multi-Dimensional Study Analytics</h2>
              <p class="stats-hub-subtitle">Comprehensive temporal telemetry across Date, Week, Month & Weekday cycles</p>
            </div>
            <div class="stats-hub-quick-pills">
              <span class="stats-lifetime-pill" id="stats-quick-focus">⏱️ 0.0h Deep Focus</span>
              <span class="stats-lifetime-pill" id="stats-quick-streak">🔥 0-Day Streak</span>
            </div>
          </div>

          <div class="stats-hub-tabs" role="tablist">
            <button class="stats-tab-btn ${engineState.activeTab === 'date' ? 'active' : ''}" data-tab="date" onclick="window.switchStatsTab('date')" role="tab">
              <span>📅</span> <span>Date Inspector</span>
            </button>
            <button class="stats-tab-btn ${engineState.activeTab === 'week' ? 'active' : ''}" data-tab="week" onclick="window.switchStatsTab('week')" role="tab">
              <span>📊</span> <span>Weekly Deep Dive</span>
            </button>
            <button class="stats-tab-btn ${engineState.activeTab === 'month' ? 'active' : ''}" data-tab="month" onclick="window.switchStatsTab('month')" role="tab">
              <span>🗓️</span> <span>Monthly Summary</span>
            </button>
            <button class="stats-tab-btn ${engineState.activeTab === 'weekday' ? 'active' : ''}" data-tab="weekday" onclick="window.switchStatsTab('weekday')" role="tab">
              <span>⚡</span> <span>Weekday Patterns</span>
            </button>
          </div>

          <div class="stats-hub-panels">
            <div id="stats-panel-content"></div>
          </div>
        </div>
      `;
      panelsContainer = hub.querySelector('.stats-hub-panels');
    }

    // Update Quick Lifetime Pills in Header
    const liveState = getLiveAppState();
    const quickFocusEl = hub.querySelector('#stats-quick-focus');
    const quickStreakEl = hub.querySelector('#stats-quick-streak');
    if (quickFocusEl) {
      const h = (liveState.totalFocusSeconds / 3600).toFixed(1);
      quickFocusEl.textContent = `⏱️ ${h}h Deep Focus`;
    }
    if (quickStreakEl) {
      quickStreakEl.textContent = `🔥 ${liveState.streak.count || 0}-Day Streak`;
    }

    // Update Tab Button Active States
    hub.querySelectorAll('.stats-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === engineState.activeTab);
    });

    // Render Tab Content
    const contentEl = hub.querySelector('#stats-panel-content') || panelsContainer;
    if (engineState.activeTab === 'date') {
      renderDateInspector(contentEl, liveState);
    } else if (engineState.activeTab === 'week') {
      renderWeeklyDeepDive(contentEl, liveState);
    } else if (engineState.activeTab === 'month') {
      renderMonthlySummary(contentEl, liveState);
    } else if (engineState.activeTab === 'weekday') {
      renderWeekdayPatterns(contentEl, liveState);
    }
  }

  // =========================================================================
  // PUBLIC API EXPOSURES TO WINDOW
  // =========================================================================
  window.initStudyStatsHub = function(containerId) {
    if (containerId && containerId !== 'study-stats-hub') {
      const el = document.getElementById(containerId);
      if (el) el.id = 'study-stats-hub';
    }
    renderActiveStatsTab();
  };

  window.switchStatsTab = function(tabName) {
    if (['date', 'week', 'month', 'weekday'].includes(tabName)) {
      engineState.activeTab = tabName;
      renderActiveStatsTab();
      if (typeof window.hapticFeedback === 'function') {
        window.hapticFeedback(10);
      }
    }
  };

  window.inspectDate = function(dateStr) {
    if (!dateStr) return;
    engineState.inspectedDate = dateStr;
    engineState.activeTab = 'date';
    renderActiveStatsTab();

    // Scroll gently into view if user clicked from another tab
    const hub = document.getElementById('study-stats-hub');
    if (hub) {
      hub.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (typeof window.hapticFeedback === 'function') {
      window.hapticFeedback(8);
    }
  };

  window.selectStatsWeek = function(offset) {
    engineState.selectedWeekOffset = Number(offset) || 0;
    renderActiveStatsTab();
    if (typeof window.hapticFeedback === 'function') {
      window.hapticFeedback(8);
    }
  };

  window.selectStatsMonth = function(year, month) {
    engineState.selectedYear = Number(year);
    engineState.selectedMonth = Number(month);
    // Wrap around boundaries
    if (engineState.selectedMonth < 0) {
      engineState.selectedMonth = 11;
      engineState.selectedYear--;
    } else if (engineState.selectedMonth > 11) {
      engineState.selectedMonth = 0;
      engineState.selectedYear++;
    }
    renderActiveStatsTab();
    if (typeof window.hapticFeedback === 'function') {
      window.hapticFeedback(8);
    }
  };

  window.navigateMonth = function(delta) {
    window.selectStatsMonth(engineState.selectedYear, engineState.selectedMonth + delta);
  };

  window.getStudyStatsData = function(dateStr) {
    const liveState = getLiveAppState();
    return getDateRecord(dateStr || getTodayDateString(), liveState);
  };

  // =========================================================================
  // BOOTSTRAP ON LOAD
  // =========================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.initStudyStatsHub();
      }, 50);
    });
  } else {
    setTimeout(() => {
      window.initStudyStatsHub();
    }, 50);
  }

})();
