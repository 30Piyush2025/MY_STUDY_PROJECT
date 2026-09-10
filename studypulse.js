/**
 * StudyPulse FOCUS ENGINE — Main Application Controller
 * Matches Exact UI/UX from StudyPulse App Screenshots
 */

(function() {
  'use strict';

  // State
  const AppState = {
    currentTab: 'dashboard',
    pomo: {
      totalSeconds: 25 * 60,
      remainingSeconds: 24 * 60 + 18,
      isRunning: false,
      intervalId: null,
      mode: 'pomodoro', // pomodoro | deep | break
      audioMode: '40hz',
      volume: 0.35,
      audioCtx: null,
      audioNodes: null
    },
    flashcards: {
      currentDeck: 'dist-sys',
      currentIndex: 0,
      isFlipped: false,
      cards: [
        {
          id: 1,
          deck: 'dist-sys',
          topic: 'CONSENSUS MECHANISMS',
          difficulty: 'HARD',
          question: 'Explain the Raft Leader Election process when an election timeout expires without receiving heartbeats from the leader.',
          diagram: `[Follower] --(election timeout)--> [Candidate] --(RequestVote RPC)--> [Cluster Quorum]\n                                     |\n                          (votes >= (N/2) + 1)\n                                     v\n                                 [Leader] --(AppendEntries Heartbeat)--> [Followers]`,
          answer: `1. Election Timeout Trigger: A follower transitions to Candidate state, increments currentTerm, and votes for itself.\n2. RequestVote RPC Broadcast: It issues parallel RequestVote RPCs to all peers in the cluster.\n3. Quorum Requirement: If it receives votes from a majority ((N/2) + 1 nodes), it establishes authority as Leader.\n4. Heartbeat Emission: Immediately sends empty AppendEntries RPCs to establish dominance and prevent election timeouts on other peers.\n5. Split-Vote Invariant: Randomized election timeouts in range [150ms, 300ms] prevent split-brain quorums.`,
          formula: 'Quorum Q = floor(N / 2) + 1 · ElectionTimeout ~ Uniform(T, 2T)'
        },
        {
          id: 2,
          deck: 'dist-sys',
          topic: 'LOG REPLICATION',
          difficulty: 'MEDIUM',
          question: 'What invariant guarantees that committed log entries in Raft are durable and never overwritten by future leaders?',
          diagram: `Leader Term 2: [T1, 1] [T1, 2] [T2, 3*] (Committed on Majority)\n                               ^\nLeader Term 3: Must contain [T2, 3*] by Leader Completeness Property`,
          answer: `The Leader Completeness Property: If a log entry is committed in a given term, then that entry will be present in the logs of the leaders for all higher-numbered terms.\n\nEnforced during Leader Election: A voter denies its vote if the candidate's log is less up-to-date than its own log (measured by lastLogTerm, then lastLogIndex).`,
          formula: 'Candidate.lastTerm > Voter.lastTerm OR (equal AND Candidate.lastIndex >= Voter.lastIndex)'
        },
        {
          id: 3,
          deck: 'dsa',
          topic: 'BINARY SEARCH TREES',
          difficulty: 'MEDIUM',
          question: 'What is the time complexity of searching, inserting, and deleting in an AVL tree vs an un-balanced BST?',
          diagram: `   Balanced AVL (Height = O(log n))         Degenerate BST (Height = O(n))\n              (10)                                     (10)\n             /    \\                                       \\\n           (5)    (15)                                    (15)\n          /   \\                                             \\\n        (2)   (7)                                           (20)`,
          answer: `AVL Trees maintain a strict balance factor in {-1, 0, 1} through rotations.\n• Search: O(log n) guaranteed\n• Insert: O(log n) (at most 2 rotations)\n• Delete: O(log n) (up to O(log n) rotations)\n\nUnbalanced BST can degenerate into a linked list with worst-case O(n) operations.`,
          formula: 'BalanceFactor = Height(LeftSubtree) - Height(RightSubtree) in {-1, 0, +1}'
        },
        {
          id: 4,
          deck: 'ml',
          topic: 'OPTIMIZATION & GRADIENTS',
          difficulty: 'HARD',
          question: 'Derive the Adam (Adaptive Moment Estimation) optimizer update rule incorporating momentum and adaptive learning rates.',
          diagram: `g_t = grad_w(Loss)\nm_t = beta1 * m_{t-1} + (1 - beta1) * g_t          (1st Moment: Momentum)\nv_t = beta2 * v_{t-1} + (1 - beta2) * g_t^2        (2nd Moment: RMSProp)\nm_hat = m_t / (1 - beta1^t)                        (Bias Correction)\nv_hat = v_t / (1 - beta2^t)\nw_t = w_{t-1} - (lr / (sqrt(v_hat) + eps)) * m_hat`,
          answer: `Adam combines AdaGrad/RMSProp (scaling gradients inversely by second raw moment) with classical Momentum (exponentially moving average of gradients).\n\nBias correction counters the zero-initialization bias in early iterations when beta1=0.9 and beta2=0.999.`,
          formula: 'w_t = w_{t-1} - alpha * m_hat_t / (sqrt(v_hat_t) + epsilon)'
        }
      ]
    },
    checklist: {
      completedCount: 142,
      totalCount: 210,
      activeFilter: 'all',
      searchQuery: ''
    }
  };

  // DOM Elements
  let els = {};

  // Horizontal Scroll Lockdown: Ensure screen never wobbles or pans left/right
  function initHorizontalScrollLock() {
    window.addEventListener('scroll', () => {
      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY);
      }
    }, { passive: true });

    document.addEventListener('touchmove', () => {
      if (window.scrollX !== 0) {
        window.scrollTo(0, window.scrollY);
      }
    }, { passive: true });
  }

  function initApp() {
    initHorizontalScrollLock();
    initTheme();
    cacheElements();
    bindEvents();
    initTopologyCanvas();
    initUserActivityState();
    startEqualizerVisualizer();
    updatePomoDisplay();
    renderFlashcard();
    initHeatmap();
    setupChecklistListeners();
    updateRPGDisplay();
    initPeerReview();

    // Keydown shortcuts
    window.addEventListener('keydown', handleGlobalKeydown);

    console.log("StudyPulse FOCUS ENGINE Initialized.");
  }

  function cacheElements() {
    els.navTabs = document.querySelectorAll('.nav-tab-btn');
    els.sections = document.querySelectorAll('.view-section');
    els.navTimer = document.getElementById('nav-timer-clock');
    els.pomoTime = document.getElementById('pomo-time-display');
    els.pomoToggleBtn = document.getElementById('btn-pomo-toggle');
    els.pomoResetBtn = document.getElementById('btn-pomo-reset');
    els.pomoSkipBtn = document.getElementById('btn-pomo-skip');
    els.pomoAudioSelect = document.getElementById('pomo-audio-select');
    els.fcCard = document.getElementById('fc-interactive-card');
    els.fcRatingPanel = document.getElementById('fc-rating-panel');
    els.fcCardNum = document.getElementById('fc-card-num');
    els.fcCardFill = document.getElementById('fc-card-fill');
    els.fcQuestion = document.getElementById('fc-question');
    els.fcDiagram = document.getElementById('fc-diagram');
    els.fcAnswer = document.getElementById('fc-answer');
    els.fcFormula = document.getElementById('fc-formula');
    els.fcDeckSelect = document.getElementById('fc-deck-select');
  }

  function bindEvents() {
    // Nav Tab Switching
    els.navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;
        switchTab(targetView);
      });
    });

    // Pomodoro Engine
    if (els.pomoToggleBtn) {
      els.pomoToggleBtn.addEventListener('click', togglePomodoro);
    }
    if (els.pomoResetBtn) {
      els.pomoResetBtn.addEventListener('click', resetPomodoro);
    }
    if (els.pomoSkipBtn) {
      els.pomoSkipBtn.addEventListener('click', () => {
        AppState.pomo.remainingSeconds = 25 * 60;
        updatePomoDisplay();
      });
    }
    if (els.pomoAudioSelect) {
      els.pomoAudioSelect.addEventListener('change', (e) => {
        AppState.pomo.audioMode = e.target.value;
        if (AppState.pomo.isRunning) {
          playAudioTone(AppState.pomo.audioMode);
        }
      });
    }

    // Flashcard Flip & Deck
    if (els.fcCard) {
      els.fcCard.addEventListener('click', flipFlashcard);
    }
    if (els.fcDeckSelect) {
      els.fcDeckSelect.addEventListener('change', (e) => {
        AppState.flashcards.currentDeck = e.target.value;
        AppState.flashcards.currentIndex = 0;
        AppState.flashcards.isFlipped = false;
        renderFlashcard();
      });
    }

    // FSRS Rating buttons
    const ratingButtons = document.querySelectorAll('.btn-fsrs-rating');
    ratingButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        nextFlashcard();
      });
    });

    // AI Tutor Send
    const btnAiSend = document.getElementById('btn-ai-tutor-send');
    const inputAi = document.getElementById('ai-tutor-input');
    if (btnAiSend && inputAi) {
      const handleAiSend = () => {
        const text = inputAi.value.trim();
        if (!text) return;
        const chatArea = document.getElementById('ai-tutor-chat');
        const userMsg = document.createElement('div');
        userMsg.style.margin = '6px 0';
        userMsg.style.color = '#38bdf8';
        userMsg.innerHTML = `<strong>You:</strong> ${escapeHtml(text)}`;
        chatArea.appendChild(userMsg);
        inputAi.value = '';

        // Response
        setTimeout(() => {
          const aiMsg = document.createElement('div');
          aiMsg.style.margin = '6px 0';
          aiMsg.style.color = '#34d399';
          aiMsg.innerHTML = `<strong>Neural Tutor:</strong> In Raft consensus, invariants strictly enforce that committed entries remain immutable across terms. If election timeout elapses without heartbeats, candidate initiates voting round with randomized backoff (150-300ms) to ensure leader convergence.`;
          chatArea.appendChild(aiMsg);
          chatArea.scrollTop = chatArea.scrollHeight;
        }, 500);
      };

      btnAiSend.addEventListener('click', handleAiSend);
      inputAi.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAiSend();
      });
    }

    // Filter pills in Checklist
    const filterPills = document.querySelectorAll('.filter-pill-btn');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const subj = pill.dataset.subject;
        filterCurriculumBySubject(subj);
      });
    });

    // Search filter in Checklist
    const searchInput = document.getElementById('checklist-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        filterCurriculumBySearch(e.target.value.toLowerCase());
      });
    }
  }

  function switchTab(viewId, pushHistory = true) {
    AppState.currentTab = viewId;

    els.navTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.view === viewId);
    });

    document.querySelectorAll('.android-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewId);
    });

    if (pushHistory && window.history && window.history.pushState) {
      window.history.pushState({ view: viewId }, "", "#" + viewId);
    }

    if (navigator.vibrate) {
      try { navigator.vibrate(14); } catch(e) {}
    }

    els.sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === `view-${viewId}`);
    });

    // Special trigger for 3D Bookshelf
    if (viewId === 'bookshelf') {
      setTimeout(() => {
        if (typeof window.initBookshelf3D === 'function') {
          window.initBookshelf3D('bookshelf-canvas-container');
        }
      }, 50);
    }
    // Special trigger for System Design Chaos Lab
    if (viewId === 'system-design') {
      setTimeout(() => {
        if (typeof window.initChaosSimulator === 'function') {
          window.initChaosSimulator('chaos-sim-canvas-container');
        }
      }, 50);
    }
  }

  // =========================================================================
  // Pomodoro Engine & Web Audio
  // =========================================================================
  function togglePomodoro() {
    if (AppState.pomo.isRunning) {
      pausePomodoro();
    } else {
      startPomodoro();
    }
  }

  // Biohacking Audio Synthesizer & Multi-Channel Mixer State
  let audioMixer = {
    master: 0.75,
    gamma: 0.35,
    rain: 0.15,
    brown: 0.0,
    lofi: 0.0,
    voice: true
  };
  let analyserNode = null;
  let masterGainNode = null;
  let activeAudioChannels = {};
  let equalizerAnimId = null;

  function getAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AppState.pomo.audioCtx) {
      AppState.pomo.audioCtx = new AudioContext();
    }
    const ctx = AppState.pomo.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    if (!analyserNode) {
      analyserNode = ctx.createAnalyser();
      analyserNode.fftSize = 64;
      masterGainNode = ctx.createGain();
      masterGainNode.gain.setValueAtTime(audioMixer.master, ctx.currentTime);
      masterGainNode.connect(analyserNode);
      analyserNode.connect(ctx.destination);
    }
    return ctx;
  }

  function startEqualizerVisualizer() {
    const canvas = document.getElementById('audio-equalizer-canvas');
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    const statusEl = document.getElementById('equalizer-status-text');

    function renderEq() {
      const w = canvas.width;
      const h = canvas.height;
      ctx2d.clearRect(0, 0, w, h);

      const isPlaying = analyserNode && (AppState.pomo.isRunning || Object.keys(activeAudioChannels).length > 0);

      if (isPlaying) {
        if (statusEl) statusEl.textContent = 'TRANSMITTING // ACTIVE';
        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserNode.getByteFrequencyData(dataArray);

        const barCount = 20;
        const barWidth = (w / barCount) - 3;

        for (let i = 0; i < barCount; i++) {
          const val = dataArray[i] || 0;
          const barHeight = Math.max(3, (val / 255) * (h - 6));
          const x = i * (barWidth + 3) + 2;
          const y = h - barHeight - 2;

          const grad = ctx2d.createLinearGradient(0, y, 0, h);
          grad.addColorStop(0, '#38bdf8');
          grad.addColorStop(0.6, '#a855f7');
          grad.addColorStop(1, '#06b6d4');

          ctx2d.fillStyle = grad;
          ctx2d.fillRect(x, y, barWidth, barHeight);

          // Peak needle indicator
          ctx2d.fillStyle = val > 160 ? '#f43f5e' : '#38bdf8';
          ctx2d.fillRect(x, Math.max(0, y - 2), barWidth, 1.5);
        }
      } else {
        if (statusEl) statusEl.textContent = 'STANDBY // MUTED';
        // Idle scanline wave
        ctx2d.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        const time = Date.now() * 0.003;
        for (let x = 0; x < w; x += 4) {
          const y = h / 2 + Math.sin(x * 0.04 + time) * 3;
          if (x === 0) ctx2d.moveTo(x, y);
          else ctx2d.lineTo(x, y);
        }
        ctx2d.stroke();
      }

      equalizerAnimId = requestAnimationFrame(renderEq);
    }

    if (equalizerAnimId) cancelAnimationFrame(equalizerAnimId);
    renderEq();
  }

  function startPomodoro() {
    AppState.pomo.isRunning = true;
    if (els.pomoToggleBtn) {
      els.pomoToggleBtn.innerHTML = '⏸ Pause Session';
    }
    speakVoiceCue('Focus session initiated. Deep work protocol active.');
    applyAudioPreset('focus');

    AppState.pomo.intervalId = setInterval(() => {
      if (AppState.pomo.remainingSeconds > 0) {
        AppState.pomo.remainingSeconds--;
        updatePomoDisplay();
      } else {
        pausePomodoro();
        speakVoiceCue('Focus interval completed. Excellent work! 150 XP awarded.');
        addFocusMinutes(25);
        addXP(150, 'Completed 25m Focus Block');
        showToast('🎉 Focus Block Completed! (+150 XP)');
      }
    }, 1000);
  }

  function pausePomodoro() {
    AppState.pomo.isRunning = false;
    clearInterval(AppState.pomo.intervalId);
    if (els.pomoToggleBtn) {
      els.pomoToggleBtn.innerHTML = '▶ Resume Focus';
    }
    speakVoiceCue('Focus session paused.');
    stopAudioTone();
  }

  function resetPomodoro() {
    pausePomodoro();
    AppState.pomo.remainingSeconds = 25 * 60;
    updatePomoDisplay();
  }

  function updatePomoDisplay() {
    const mins = Math.floor(AppState.pomo.remainingSeconds / 60);
    const secs = AppState.pomo.remainingSeconds % 60;
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    if (els.pomoTime) els.pomoTime.textContent = timeStr;
    if (els.navTimer) els.navTimer.textContent = `${timeStr} | POMODORO`;
  }

  function playAudioTone(mode) {
    if (mode === 'off') {
      stopAudioTone();
      return;
    }
    if (mode === '40hz') applyAudioPreset('focus');
    else if (mode === 'rain') applyAudioPreset('rain');
    else if (mode === 'brown') applyAudioPreset('brown');
    else if (mode === 'lofi') applyAudioPreset('lofi');
  }

  function applyAudioPreset(preset) {
    document.querySelectorAll('.btn-preset-pill').forEach(p => {
      p.classList.toggle('active', p.textContent.toLowerCase().includes(preset));
    });

    if (preset === 'focus') {
      setAudioMixerChannel('gamma', 0.35);
      setAudioMixerChannel('rain', 0.15);
      setAudioMixerChannel('brown', 0.0);
      setAudioMixerChannel('lofi', 0.0);
    } else if (preset === 'deep') {
      setAudioMixerChannel('gamma', 0.0);
      setAudioMixerChannel('rain', 0.0);
      setAudioMixerChannel('brown', 0.35);
      setAudioMixerChannel('lofi', 0.15);
    } else if (preset === 'rain') {
      setAudioMixerChannel('gamma', 0.0);
      setAudioMixerChannel('rain', 0.35);
      setAudioMixerChannel('brown', 0.0);
      setAudioMixerChannel('lofi', 0.0);
    } else if (preset === 'brown') {
      setAudioMixerChannel('gamma', 0.0);
      setAudioMixerChannel('rain', 0.0);
      setAudioMixerChannel('brown', 0.35);
      setAudioMixerChannel('lofi', 0.0);
    } else if (preset === 'lofi') {
      setAudioMixerChannel('gamma', 0.0);
      setAudioMixerChannel('rain', 0.0);
      setAudioMixerChannel('brown', 0.0);
      setAudioMixerChannel('lofi', 0.3);
    } else if (preset === 'mute') {
      stopAudioTone();
    }
    syncMixerSlidersUI();
  }

  function setAudioMixerChannel(channel, val) {
    val = Math.max(0, Math.min(1, parseFloat(val)));
    audioMixer[channel] = val;

    const ctx = getAudioContext();
    if (val <= 0.001) {
      if (activeAudioChannels[channel]) {
        activeAudioChannels[channel].nodes.forEach(n => {
          try {
            if (n.stop) n.stop();
            if (n.disconnect) n.disconnect();
          } catch(e) {}
        });
        delete activeAudioChannels[channel];
      }
      return;
    }

    if (activeAudioChannels[channel]) {
      activeAudioChannels[channel].gainNode.gain.setValueAtTime(val, ctx.currentTime);
      return;
    }

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(val, ctx.currentTime);
    gainNode.connect(masterGainNode);

    if (channel === 'gamma') {
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.type = 'sine'; oscL.frequency.setValueAtTime(200, ctx.currentTime);
      oscR.type = 'sine'; oscR.frequency.setValueAtTime(240, ctx.currentTime);
      oscL.connect(gainNode);
      oscR.connect(gainNode);
      oscL.start();
      oscR.start();
      activeAudioChannels['gamma'] = { nodes: [oscL, oscR, gainNode], gainNode };
    } else if (channel === 'brown') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5;
      }
      const brownNoise = ctx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(240, ctx.currentTime);
      brownNoise.connect(filter);
      filter.connect(gainNode);
      brownNoise.start();
      activeAudioChannels['brown'] = { nodes: [brownNoise, filter, gainNode], gainNode };
    } else if (channel === 'rain') {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.1;
      }
      const rainNoise = ctx.createBufferSource();
      rainNoise.buffer = noiseBuffer;
      rainNoise.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      rainNoise.connect(filter);
      filter.connect(gainNode);
      rainNoise.start();
      activeAudioChannels['rain'] = { nodes: [rainNoise, filter, gainNode], gainNode };
    } else if (channel === 'lofi') {
      const chords = [220, 261.63, 329.63, 392.00];
      const nodes = [];
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const subGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        subGain.gain.setValueAtTime(1.0 / chords.length, ctx.currentTime);
        osc.connect(subGain);
        subGain.connect(gainNode);
        osc.start();
        nodes.push(osc, subGain);
      });
      nodes.push(gainNode);
      activeAudioChannels['lofi'] = { nodes, gainNode };
    }
  }

  function setAudioMixerMaster(val) {
    audioMixer.master = Math.max(0, Math.min(1, parseFloat(val)));
    if (masterGainNode && AppState.pomo.audioCtx) {
      masterGainNode.gain.setValueAtTime(audioMixer.master, AppState.pomo.audioCtx.currentTime);
    }
  }

  function stopAudioTone() {
    Object.keys(activeAudioChannels).forEach(ch => {
      activeAudioChannels[ch].nodes.forEach(n => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch(e) {}
      });
    });
    activeAudioChannels = {};
    audioMixer.gamma = 0;
    audioMixer.rain = 0;
    audioMixer.brown = 0;
    audioMixer.lofi = 0;
    syncMixerSlidersUI();
  }

  function syncMixerSlidersUI() {
    const sGamma = document.getElementById('mixer-slider-gamma');
    const sRain = document.getElementById('mixer-slider-rain');
    const sBrown = document.getElementById('mixer-slider-brown');
    const sLofi = document.getElementById('mixer-slider-lofi');
    if (sGamma) sGamma.value = Math.round(audioMixer.gamma * 100);
    if (sRain) sRain.value = Math.round(audioMixer.rain * 100);
    if (sBrown) sBrown.value = Math.round(audioMixer.brown * 100);
    if (sLofi) sLofi.value = Math.round(audioMixer.lofi * 100);
  }

  function speakVoiceCue(text) {
    if (!audioMixer.voice || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 1.05;
      utt.pitch = 0.95;
      window.speechSynthesis.speak(utt);
    } catch(e) {}
  }

  // =========================================================================
  // Interactive Hero Topology Canvas (Screenshot 1)
  // =========================================================================
  function initTopologyCanvas() {
    const canvas = document.getElementById('topology-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = canvas.parentElement.clientHeight;

    const nodes = [
      { x: width * 0.18, y: height * 0.35, label: 'Distributed Systems', r: 6, vx: 0.2, vy: 0.15 },
      { x: width * 0.42, y: height * 0.22, label: 'Raft Consensus', r: 7, vx: -0.15, vy: 0.18 },
      { x: width * 0.35, y: height * 0.72, label: 'Paxos Algorithm', r: 5, vx: 0.18, vy: -0.2 },
      { x: width * 0.65, y: height * 0.38, label: 'Vector Clocks', r: 6, vx: -0.12, vy: -0.14 },
      { x: width * 0.78, y: height * 0.68, label: 'Byzantine Fault', r: 6, vx: 0.15, vy: 0.12 },
      { x: width * 0.52, y: height * 0.55, label: 'Gossip Protocols', r: 5, vx: -0.2, vy: 0.16 }
    ];

    function renderTopology() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.35 * (1 - dist / 180)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      nodes.forEach((n, idx) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 20 || n.x > width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > height - 20) n.vy *= -1;

        // Outer pulse
        ctx.fillStyle = idx === 1 ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.15)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + 5, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.fillStyle = idx === 1 ? '#38bdf8' : '#10b981';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();

        // Node label
        ctx.font = '10px "DM Mono", monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(n.label, n.x + 10, n.y + 3);
      });

      requestAnimationFrame(renderTopology);
    }
    renderTopology();

    window.addEventListener('resize', () => {
      if (canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    });
  }

  // =========================================================================
  // Flashcards / Active Recall Engine (Screenshots 3 & 4)
  // =========================================================================
  function renderFlashcard() {
    const card = AppState.flashcards.cards[AppState.flashcards.currentIndex];
    if (!card) return;

    if (els.fcCardNum) {
      els.fcCardNum.textContent = `Card ${AppState.flashcards.currentIndex + 1} of ${AppState.flashcards.cards.length}`;
    }
    if (els.fcCardFill) {
      const pct = ((AppState.flashcards.currentIndex + 1) / AppState.flashcards.cards.length) * 100;
      els.fcCardFill.style.width = `${pct}%`;
    }
    if (els.fcQuestion) els.fcQuestion.textContent = card.question;
    if (els.fcDiagram) els.fcDiagram.textContent = card.diagram;
    if (els.fcAnswer) els.fcAnswer.innerHTML = card.answer.replace(/\n/g, '<br>');
    if (els.fcFormula) els.fcFormula.textContent = card.formula;

    if (els.fcCard) {
      els.fcCard.classList.remove('flipped');
    }
    if (els.fcRatingPanel) {
      els.fcRatingPanel.style.opacity = '0.35';
      els.fcRatingPanel.style.pointerEvents = 'none';
    }
    AppState.flashcards.isFlipped = false;
  }

  function flipFlashcard() {
    if (!els.fcCard) return;
    AppState.flashcards.isFlipped = !AppState.flashcards.isFlipped;
    els.fcCard.classList.toggle('flipped', AppState.flashcards.isFlipped);

    if (els.fcRatingPanel) {
      els.fcRatingPanel.style.opacity = AppState.flashcards.isFlipped ? '1' : '0.35';
      els.fcRatingPanel.style.pointerEvents = AppState.flashcards.isFlipped ? 'auto' : 'none';
    }
  }

  function nextFlashcard() {
    AppState.flashcards.currentIndex = (AppState.flashcards.currentIndex + 1) % AppState.flashcards.cards.length;
    renderFlashcard();
  }

  // =========================================================================
  // Daily Cognitive Density Heatmap (Screenshot 5)
  // =========================================================================
  function initHeatmap() {
    const heatmapContainer = document.getElementById('density-heatmap-grid');
    if (!heatmapContainer) return;
    heatmapContainer.innerHTML = '';

    const history = JSON.parse(localStorage.getItem("studyPulseActivityHistory") || "{}");
    const today = new Date();

    // Render 196 cells (28 weeks x 7 days) ending today
    for (let i = 195; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const mins = history[dStr] || 0;

      const cell = document.createElement('div');
      cell.className = 'heatmap-cell';

      if (mins >= 120) cell.classList.add('l4');
      else if (mins >= 60) cell.classList.add('l3');
      else if (mins >= 25) cell.classList.add('l2');
      else if (mins > 0) cell.classList.add('l1');

      cell.title = `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}: ${mins} mins focus logged`;
      heatmapContainer.appendChild(cell);
    }
  }

  // =========================================================================
  // Topic Checklist & Module Master Matrix (Screenshot 6)
  // =========================================================================

  // =========================================================================
  // REAL USER STATE & PERSISTENCE ENGINE (No Fake Data)
  // =========================================================================
  function initUserActivityState() {
    const todayStr = new Date().toISOString().split("T")[0];

    // Today Focus Minutes
    const focusData = JSON.parse(localStorage.getItem("studyPulseTodayFocus") || "{}");
    let todayMinutes = 0;
    if (focusData.date === todayStr) {
      todayMinutes = focusData.minutes || 0;
    } else {
      focusData.date = todayStr;
      focusData.minutes = 0;
      localStorage.setItem("studyPulseTodayFocus", JSON.stringify(focusData));
    }

    // Daily Streak Calculation
    const streakData = JSON.parse(localStorage.getItem("studyPulseStreak") || "{}");
    let streakCount = streakData.count || 1;
    if (streakData.lastActiveDate) {
      const lastDate = new Date(streakData.lastActiveDate);
      const todayDate = new Date(todayStr);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streakCount += 1;
      } else if (diffDays > 1) {
        streakCount = 1; // streak broke
      }
    }
    streakData.lastActiveDate = todayStr;
    streakData.count = streakCount;
    localStorage.setItem("studyPulseStreak", JSON.stringify(streakData));

    updateDashboardMetricsUI(todayMinutes, streakCount);
  }

  function addFocusMinutes(mins) {
    const todayStr = new Date().toISOString().split("T")[0];
    const focusData = JSON.parse(localStorage.getItem("studyPulseTodayFocus") || "{}");
    let currentMins = (focusData.date === todayStr ? focusData.minutes : 0) + mins;
    focusData.date = todayStr;
    focusData.minutes = currentMins;
    localStorage.setItem("studyPulseTodayFocus", JSON.stringify(focusData));

    // Daily activity history for heatmap
    const history = JSON.parse(localStorage.getItem("studyPulseActivityHistory") || "{}");
    history[todayStr] = (history[todayStr] || 0) + mins;
    localStorage.setItem("studyPulseActivityHistory", JSON.stringify(history));

    const streakData = JSON.parse(localStorage.getItem("studyPulseStreak") || "{}");
    updateDashboardMetricsUI(currentMins, streakData.count || 1);
  }

  function updateDashboardMetricsUI(todayMinutes, streakCount) {
    const hours = Math.floor(todayMinutes / 60);
    const mins = todayMinutes % 60;
    const focusStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

    const elTodayFocus = document.getElementById("metric-today-focus");
    if (elTodayFocus) elTodayFocus.textContent = focusStr;

    const elStreak = document.getElementById("metric-active-streak");
    if (elStreak) elStreak.textContent = `${streakCount} Day${streakCount > 1 ? "s" : ""}`;

    const elHeaderStreak = document.getElementById("header-streak-val");
    if (elHeaderStreak) elHeaderStreak.textContent = `${streakCount} Day${streakCount > 1 ? "s" : ""}`;

    const elTotalVolume = document.getElementById("analytics-total-volume");
    if (elTotalVolume) elTotalVolume.textContent = `${(todayMinutes / 60).toFixed(1)}h`;
  }

  function setupChecklistListeners() {
    // Accordion expand/collapse
    const headers = document.querySelectorAll('.module-header');
    headers.forEach(h => {
      h.addEventListener('click', () => {
        const card = h.closest('.module-card');
        card.classList.toggle('expanded');
      });
    });

    // Load saved checklist state from localStorage
    const savedChecked = JSON.parse(localStorage.getItem("studyPulseCheckedTopics") || "[]");
    const allRows = document.querySelectorAll('.topic-row');

    allRows.forEach(row => {
      const titleSpan = row.querySelector('.topic-title-span');
      const title = titleSpan ? titleSpan.textContent.trim() : "";
      const cb = row.querySelector('.custom-checkbox');
      if (!cb) return;

      const isChecked = savedChecked.includes(title);
      cb.classList.toggle('checked', isChecked);
      row.classList.toggle('completed', isChecked);

      cb.addEventListener('click', (e) => {
        e.stopPropagation();
        const checkedList = JSON.parse(localStorage.getItem("studyPulseCheckedTopics") || "[]");
        const nowChecked = !cb.classList.contains('checked');

        cb.classList.toggle('checked', nowChecked);
        row.classList.toggle('completed', nowChecked);

        if (nowChecked) {
          if (!checkedList.includes(title)) checkedList.push(title);
          addXP(150, `Mastered: ${title.substring(0, 20)}...`);
        } else {
          const idx = checkedList.indexOf(title);
          if (idx !== -1) checkedList.splice(idx, 1);
        }

        localStorage.setItem("studyPulseCheckedTopics", JSON.stringify(checkedList));
        recalcMasteryGauge();
      });
    });

    recalcMasteryGauge();
  }

  function recalcMasteryGauge() {
    const allCbs = document.querySelectorAll('.custom-checkbox');
    const checkedCbs = document.querySelectorAll('.custom-checkbox.checked');
    const total = allCbs.length || 10;
    const completed = checkedCbs.length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    const gaugeVal = document.getElementById('matrix-gauge-val');
    const gaugeCircle = document.getElementById('matrix-circle-fill');
    const progressFill = document.getElementById('matrix-global-fill');
    const statText = document.getElementById('matrix-mastered-stat');

    if (gaugeVal) gaugeVal.textContent = `${pct}%`;
    if (gaugeCircle) gaugeCircle.setAttribute('stroke-dasharray', `${pct}, 100`);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (statText) statText.textContent = `${completed} of ${total} Topics Mastered`;

    // Dashboard 4-tile sync
    const elDashMastered = document.getElementById("metric-topics-mastered");
    const elDashPct = document.getElementById("metric-topics-pct");
    if (elDashMastered) elDashMastered.textContent = `${completed} / ${total}`;
    if (elDashPct) elDashPct.textContent = `${pct}%`;

    // Update each module header progress stat dynamically
    document.querySelectorAll('.module-card').forEach(mod => {
      const modCbs = mod.querySelectorAll('.custom-checkbox');
      const modDone = mod.querySelectorAll('.custom-checkbox.checked');
      const modFill = mod.querySelector('.module-mini-fill');
      const modStat = mod.querySelector('.module-progress-stat');
      if (modCbs.length > 0 && modStat && modFill) {
        const modPct = Math.round((modDone.length / modCbs.length) * 100);
        modFill.style.width = `${modPct}%`;
        modStat.textContent = `${modDone.length}/${modCbs.length} (${modPct}%)`;
      }
    });
  }

  function filterCurriculumBySubject(subj) {
    const cards = document.querySelectorAll('.module-card');
    cards.forEach(card => {
      if (subj === 'all' || card.dataset.subject === subj) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function filterCurriculumBySearch(query) {
    const rows = document.querySelectorAll('.topic-row');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? 'flex' : 'none';
    });
  }

  function handleGlobalKeydown(e) {
    // Escape to close open book in 3D bookshelf
    if (e.key === 'Escape') {
      if (typeof window.bookshelf3DClose === 'function') {
        window.bookshelf3DClose();
      }
    }
    // Spacebar to flip flashcard
    if (e.code === 'Space' && AppState.currentTab === 'flashcards' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      flipFlashcard();
    }
    // Number keys 1-4 for FSRS ratings
    if (['1', '2', '3', '4'].includes(e.key) && AppState.currentTab === 'flashcards' && AppState.flashcards.isFlipped) {
      nextFlashcard();
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  // Global Bridge Functions
  window.launchStudySession = function(topicName) {
    switchTab('dashboard');
    const focusTaskPill = document.getElementById('pomo-task-name');
    if (focusTaskPill) focusTaskPill.textContent = topicName;
    startPomodoro();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.viewTopicInChecklist = function(shortTitle) {
    switchTab('curriculum');
    const searchInput = document.getElementById('checklist-search-input');
    if (searchInput) {
      searchInput.value = shortTitle;
      filterCurriculumBySearch(shortTitle.toLowerCase());
    }
  };

  window.switchAppTab = switchTab;

  
  // =========================================================================
  // ENHANCEMENT: RPG Skill Tree & Level Progression Engine
  // =========================================================================
  const RPGState = {
    xp: parseInt(localStorage.getItem('studyPulseXP') || '0', 10),
    level: 14,
    title: 'NEURAL ARCHITECT',
    get levelNumber() {
      return Math.floor(this.xp / 350) + 1;
    },
    get currentLevelXP() {
      return this.xp % 350;
    },
    get nextLevelXP() {
      return 350;
    },
    getTitle(lvl) {
      if (lvl < 5) return 'CODE INITIATE';
      if (lvl < 10) return 'ALGORITHM ALCHEMIST';
      if (lvl < 18) return 'NEURAL ARCHITECT';
      return 'AI SOVEREIGN';
    }
  };

  function addXP(points, reason) {
    const oldLevel = RPGState.levelNumber;
    RPGState.xp += points;
    localStorage.setItem('studyPulseXP', String(RPGState.xp));
    const newLevel = RPGState.levelNumber;

    updateRPGDisplay();
    showToast(`⚡ +${points} XP: ${reason}`);

    if (newLevel > oldLevel) {
      playLevelUpSound();
      showToast(`🎉 LEVEL UP! You attained Level ${newLevel}: ${RPGState.getTitle(newLevel)}!`, 4000);
    }
  }

  function updateRPGDisplay() {
    const lvlPill = document.getElementById('nav-rpg-level');
    const xpFill = document.getElementById('nav-rpg-xp-fill');
    const lvlTitle = document.getElementById('nav-rpg-title');
    if (lvlPill) lvlPill.textContent = `LVL ${RPGState.levelNumber}`;
    if (lvlTitle) lvlTitle.textContent = RPGState.getTitle(RPGState.levelNumber);
    if (xpFill) {
      const pct = Math.round((RPGState.currentLevelXP / RPGState.nextLevelXP) * 100);
      xpFill.style.width = `${pct}%`;
    }
  }

  // =========================================================================
  // ENHANCEMENT: Advanced Web Audio Soundscapes (Lo-Fi, Brown Noise, Paper)
  // =========================================================================
  function playPaperFlutterSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const bufferSize = ctx.sampleRate * 0.22;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.05));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);
      filter.Q.setValueAtTime(1.5, ctx.currentTime);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch(e) {}
  }

  function playShelfThudSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch(e) {}
  }

  function playLevelUpSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } catch(e) {}
  }

  window.playPaperFlutterSound = playPaperFlutterSound;
  window.playShelfThudSound = playShelfThudSound;

  // =========================================================================
  // ENHANCEMENT: Peer Review & Feedback Drawer
  // =========================================================================
  let selectedReviewRating = 5;

  function initPeerReview() {
    const stars = document.querySelectorAll('.review-star');
    stars.forEach(s => {
      s.addEventListener('click', () => {
        const val = parseInt(s.dataset.val, 10);
        selectedReviewRating = val;
        stars.forEach(st => {
          st.classList.toggle('selected', parseInt(st.dataset.val, 10) <= val);
        });
      });
    });

    renderPeerReviews();
  }

  function togglePeerReviewDrawer(forceState) {
    const drawer = document.getElementById('peer-review-drawer');
    if (!drawer) return;
    if (typeof forceState === 'boolean') {
      drawer.classList.toggle('open', forceState);
    } else {
      drawer.classList.toggle('open');
    }
  }

  function submitPeerReview() {
    const nameInput = document.getElementById('review-author-name');
    const commentInput = document.getElementById('review-comment-text');
    const author = nameInput?.value.trim() || 'Anonymous Reviewer';
    const comment = commentInput?.value.trim() || 'Impressive curriculum and smooth 3D interactions!';

    const reviews = JSON.parse(localStorage.getItem('studyPulseReviews') || '[]');
    const newRev = {
      id: Date.now(),
      author,
      rating: selectedReviewRating,
      comment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    reviews.unshift(newRev);
    localStorage.setItem('studyPulseReviews', JSON.stringify(reviews));

    if (commentInput) commentInput.value = '';
    renderPeerReviews();
    addXP(100, 'Peer Review Feedback Submitted');
    showToast('⭐ Peer review recorded! Thank you!');
  }

  function renderPeerReviews() {
    const list = document.getElementById('peer-reviews-list');
    if (!list) return;
    const reviews = JSON.parse(localStorage.getItem('studyPulseReviews') || '[]');

    if (reviews.length === 0) {
      list.innerHTML = `
        <div class="review-item-card" style="text-align: center; padding: 1.5rem; color: var(--text-dim);">
          <div style="font-size: 1.4rem; margin-bottom: 6px;">💬</div>
          <div style="font-weight: 600; color: var(--text-muted);">No Peer Reviews Yet</div>
          <p style="color: var(--text-dim); font-size: 0.74rem; margin-top: 4px;">Share your link with friends or submit your own study reflection above!</p>
        </div>
      `;
      return;
    }

    list.innerHTML = reviews.map(r => `
      <div class="review-item-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="color: #fbbf24;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          <span style="font-size:0.68rem; color:var(--text-dim);">${r.date}</span>
        </div>
        <div style="font-weight: 600; margin: 3px 0; color:#fff;">${escapeHtml(r.author)}</div>
        <p style="color: var(--text-muted); font-size: 0.76rem;">"${escapeHtml(r.comment)}"</p>
      </div>
    `).join('');
  }

  function copyReviewerLink() {
    const url = window.location.origin + window.location.pathname + '?review=peer';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('📋 Reviewer link copied to clipboard!');
      }).catch(() => {
        prompt('Copy this review link:', url);
      });
    } else {
      prompt('Copy this review link:', url);
    }
  }

  // =========================================================================
  // ENHANCEMENT: Native Browser Notifications for FSRS
  // =========================================================================
  function requestFSRSNotifications() {
    if (!('Notification' in window)) {
      showToast('⚠️ Notifications not supported in this browser.');
      return;
    }

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('🔔 FSRS Active Recall alerts enabled!');
        new Notification('StudyPulse FOCUS ENGINE', {
          body: '🎯 28 Flashcards due today for Raft Consensus & LeetCode!',
          icon: 'favicon.svg'
        });
      } else {
        showToast('ℹ️ Notification permission denied or closed.');
      }
    });
  }

  // Toast notice helper
  function showToast(msg, duration = 3000) {
    let toast = document.getElementById('study-toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'study-toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // Toggle between 2D Topology Canvas and 3D Celestial Knowledge Galaxy
  function toggleTopologyGalaxyView() {
    const canvas = document.getElementById('topology-canvas');
    const galaxyCont = document.getElementById('galaxy-3d-container');
    const btn = document.getElementById('btn-toggle-topology-mode');
    if (!canvas || !galaxyCont) return;

    if (galaxyCont.style.display === 'none' || !galaxyCont.style.display) {
      canvas.style.display = 'none';
      galaxyCont.style.display = 'block';
      if (btn) btn.innerHTML = '📊 2D Topology Graph';
      if (typeof window.init3DKnowledgeGalaxy === 'function') {
        window.init3DKnowledgeGalaxy('galaxy-3d-container');
      }
      showToast('🌌 3D Knowledge Galaxy active: Drag to orbit, click nodes to jump to syllabus!');
    } else {
      galaxyCont.style.display = 'none';
      canvas.style.display = 'block';
      if (btn) btn.innerHTML = '🌌 3D Knowledge Galaxy';
    }
  }

  function toggleMemoryPalaceMode() {
    const deck = document.getElementById('flashcard-standard-container');
    const palace = document.getElementById('memory-palace-container');
    const btn = document.getElementById('btn-toggle-palace-mode');
    if (!deck || !palace) return;

    if (palace.style.display === 'none' || !palace.style.display) {
      deck.style.display = 'none';
      palace.style.display = 'block';
      if (btn) btn.innerHTML = '📇 Classic Flashcards';
      if (typeof window.initMemoryPalace === 'function') {
        window.initMemoryPalace('memory-palace-canvas-container');
      }
      showToast('🏛️ Memory Palace active: Orbit around pedestals and click holographic crystals to recall!');
    } else {
      palace.style.display = 'none';
      deck.style.display = 'block';
      if (btn) btn.innerHTML = '🏛️ 3D Memory Palace Sanctuary';
    }
  }

  function toggleAndroidAppMenu() {
    const sheet = document.getElementById('android-app-sheet');
    const backdrop = document.getElementById('android-sheet-backdrop');
    if (!sheet || !backdrop) return;
    const isOpen = sheet.classList.contains('show');
    sheet.classList.toggle('show', !isOpen);
    backdrop.classList.toggle('show', !isOpen);
    if (navigator.vibrate) {
      try { navigator.vibrate(15); } catch(e) {}
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      showToast("📱 Immersive Fullscreen App Mode Active");
    } else {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      showToast("📱 Exited Fullscreen Mode");
    }
  }

  function downloadApkDirect() {
    const a = document.createElement('a');
    a.href = "StudyPulse.apk";
    a.download = "StudyPulse.apk";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("📦 Downloading StudyPulse.apk...");
  }

  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.view) {
      switchTab(e.state.view, false);
    }
  });

  // =========================================================================
  // THEME ENGINE: Light & Dark Modes
  // =========================================================================
  function initTheme() {
    const saved = localStorage.getItem("studyPulseTheme") || "dark";
    setTheme(saved);
  }

  function setTheme(theme) {
    const isLight = theme === "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("studyPulseTheme", theme);

    // Update icons
    const icon = document.getElementById("theme-toggle-icon");
    if (icon) icon.textContent = isLight ? "🌙" : "☀️";

    const sheetIcon = document.getElementById("sheet-theme-icon");
    const sheetName = document.getElementById("sheet-theme-name");
    if (sheetIcon) sheetIcon.textContent = isLight ? "🌙" : "☀️";
    if (sheetName) sheetName.textContent = isLight ? "Dark Theme" : "Light Theme";

    // Update Android status bar theme-color
    const metaTheme = document.querySelector("meta[name='theme-color']");
    if (metaTheme) {
      metaTheme.setAttribute("content", isLight ? "#f1f5f9" : "#060913");
    }

    // Update Three.js scene backgrounds if initialized
    if (typeof window.bookshelfUpdateTheme === "function") {
      window.bookshelfUpdateTheme(theme);
    }

    if (window.showToast) {
      window.showToast(isLight ? "☀️ Material Light Theme Active" : "🌙 Obsidian Dark Theme Active");
    }
  }

  function toggleAppTheme() {
    const cur = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "light" ? "dark" : "light";
    setTheme(next);
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch(e) {}
    }
  }

  function handleFabClick() {
    if (AppState.currentTab === "dashboard") {
      togglePomodoro();
    } else {
      switchTab("dashboard");
      startPomodoro();
    }
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch(e) {}
    }
  }

  window.toggleAppTheme = toggleAppTheme;
  window.handleFabClick = handleFabClick;

  window.toggleAndroidAppMenu = toggleAndroidAppMenu;
  window.toggleFullscreen = toggleFullscreen;
  window.downloadApkDirect = downloadApkDirect;
  window.toggleMemoryPalaceMode = toggleMemoryPalaceMode;
  window.applyAudioPreset = applyAudioPreset;
  window.setAudioMixerChannel = setAudioMixerChannel;
  window.setAudioMixerMaster = setAudioMixerMaster;
  window.toggleVoiceAlerts = (checked) => { audioMixer.voice = checked; };
  window.testVoiceCue = () => { speakVoiceCue('Voice protocol operational. Focus session ready.'); };
  window.toggleTopologyGalaxyView = toggleTopologyGalaxyView;
  window.togglePeerReviewDrawer = togglePeerReviewDrawer;
  window.submitPeerReview = submitPeerReview;
  window.copyReviewerLink = copyReviewerLink;
  window.requestFSRSNotifications = requestFSRSNotifications;
  window.addXP = addXP;

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
