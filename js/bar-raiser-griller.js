/**
 * StudyPulse Bar Raiser: Socratic System Design & Mock Interview Griller
 * File: js/bar-raiser-griller.js
 *
 * High-Stakes Offline Technical Screener
 * - 4 Tracks: Distributed Systems, Deep Learning, Production MLOps, Algorithms/DSA
 * - 16+ Production Failure Scenarios
 * - Multi-Factor Rubric Evaluator (Correctness, Edge Cases, Trade-offs, Recovery)
 * - Detailed Model Answers & Engineering Tier Scoring (L4 / L5 / L6 Staff)
 */

(function() {
  'use strict';

  const INTERVIEW_SCENARIOS = [
    // -------------------------------------------------------------------------
    // TRACK 1: DISTRIBUTED SYSTEMS (MIT 6.824)
    // -------------------------------------------------------------------------
    {
      id: "raft-partition-split-brain",
      track: "distributed",
      trackLabel: "Distributed Consensus (MIT 6.824)",
      difficulty: "Hard (Staff Tier)",
      title: "5-Node Raft Cluster Network Partition & Stale Leader Write",
      prompt: "You are the tech lead for a distributed storage system using Raft with 5 nodes (Nodes 1 to 5). A network partition occurs, isolating Nodes 1 & 2 (Minority Partition A) from Nodes 3, 4, & 5 (Majority Partition B). Node 1 was the leader before the partition. A client connects to Node 1 and issues a write request. Explain step-by-step: What happens to the write on Node 1? What happens in Partition B? What happens when the network partition heals?",
      rubric: {
        keywords: ["quorum", "majority", "appendentries", "term", "uncommitted", "heartbeat", "truncate", "wal", "leader", "follower", "commitindex"],
        requiredConcepts: [
          { name: "Quorum Condition", regex: /(quorum|majority|3\s*nodes|floor)/i, weight: 25, tip: "Must identify that 3 nodes are required for quorum." },
          { name: "Old Leader Behavior", regex: /(cannot commit|uncommitted|appends to local|wal)/i, weight: 25, tip: "Node 1 can append to local WAL but cannot commit without quorum." },
          { name: "Majority Partition Election", regex: /(new leader|higher term|election timeout|elects)/i, weight: 25, tip: "Nodes 3-5 elect a new leader in a higher term." },
          { name: "Partition Healing & Reconciliation", regex: /(overwrite|truncate|steps down|reconcil|catch\s*up)/i, weight: 25, tip: "Explain that Node 1 steps down and uncommitted entries are truncated/overwritten." }
        ]
      },
      modelAnswer: `1. Behavior in Minority Partition (Nodes 1 & 2):
- Node 1 accepts the write and appends it to its local Write-Ahead Log (WAL).
- It sends AppendEntries RPCs to Node 2 (which succeeds) and attempts to send to Nodes 3, 4, and 5 (which fail or timeout).
- Quorum requires a majority of (5/2) + 1 = 3 nodes. Node 1 only has 2 acknowledgments (itself + Node 2).
- Node 1 CANNOT advance its commitIndex. The write remains uncommitted and the client request either blocks or times out.

2. Behavior in Majority Partition (Nodes 3, 4, & 5):
- Nodes 3, 4, and 5 miss heartbeats from Node 1. Their randomized election timeouts elapse.
- One node increments its term and requests votes. With 3 out of 5 nodes available, it achieves quorum and becomes the legitimate new Leader for the higher term.
- It begins serving reads and commits writes with quorum.

3. Reconciliation when Partition Heals:
- Node 1 receives heartbeats from the new leader bearing a higher term.
- Node 1 immediately recognizes the higher term and steps down to Follower.
- The new leader issues AppendEntries with its authoritative log. Node 1 finds a conflict at its uncommitted entry and truncates its log, replacing it with the new leader's log. Linearizability is preserved!`
    },

    {
      id: "raft-linearizable-read",
      track: "distributed",
      trackLabel: "Distributed Consensus (MIT 6.824)",
      difficulty: "Hard (Staff Tier)",
      title: "Preventing Stale Reads on a Deposed Leader (ReadIndex vs Lease Read)",
      prompt: "A client sends a read request to a Raft leader. If the leader was silently partitioned away (deposed by a newer leader in another partition), simply returning its local state could return stale data (violating linearizability). How does Raft guarantee linearizable reads without writing every read to the replicated log?",
      rubric: {
        keywords: ["readindex", "lease", "heartbeat", "linearizable", "quorum", "clock drift", "stale"],
        requiredConcepts: [
          { name: "Stale Read Problem", regex: /(stale|split|partition|deposed)/i, weight: 25, tip: "Identify that a partitioned leader might serve stale reads." },
          { name: "ReadIndex Protocol", regex: /(readindex|record.*commitindex|round.*heartbeat|check.*quorum)/i, weight: 35, tip: "Explain ReadIndex: recording commitIndex and confirming quorum via heartbeat round." },
          { name: "Lease Read Trade-offs", regex: /(lease|clock|bound|drift)/i, weight: 25, tip: "Explain Leader Lease Read and its vulnerability to clock drift." },
          { name: "State Machine Application", regex: /(apply|wait|state machine)/i, weight: 15, tip: "Mention waiting for state machine to apply up to the recorded index." }
        ]
      },
      modelAnswer: `To achieve linearizable reads without the high overhead of logging a full Raft entry:

1. The ReadIndex Protocol:
- When a read request arrives, the leader records its current commitIndex as 'readIndex'.
- To ensure it hasn't been deposed in a newer term, the leader broadcasts a round of empty heartbeat RPCs to the cluster and must receive ACKs from a quorum (majority).
- Once quorum confirms its active leadership, the leader waits until its state machine has applied entries up to 'readIndex', then reads and returns the state to the client.

2. Leader Lease Reads (Performance Optimization):
- Instead of heartbeat rounds per read, the leader maintains a time-bounded lease. As long as the lease hasn't expired, it serves reads locally without network roundtrips.
- Critical trade-off: Relies on bounded clock drift. If hardware clocks desynchronize or a hypervisor pauses the VM, lease reads can violate linearizability.`
    },

    // -------------------------------------------------------------------------
    // TRACK 2: DEEP LEARNING & FOUNDATION MODELS (CS229 / CAMPUSX)
    // -------------------------------------------------------------------------
    {
      id: "transformer-attention-scale",
      track: "deeplearning",
      trackLabel: "Deep Learning (CS229 / CampusX)",
      difficulty: "Medium (Senior Tier)",
      title: "Why Scaled Dot-Product Attention Divides by sqrt(d_k)",
      prompt: "In the Transformer architecture (Vaswani et al.), attention is computed as Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V. Mathematically explain: Why is the dot product divided by sqrt(d_k)? What happens during backpropagation if this scaling factor is omitted when d_k is large (e.g., d_k = 64 or 128)?",
      rubric: {
        keywords: ["variance", "mean", "softmax", "gradient", "vanishing", "magnitude", "independent", "d_k", "derivative"],
        requiredConcepts: [
          { name: "Variance Scaling Math", regex: /(variance|var|sum|mean 0|std|standard deviation)/i, weight: 35, tip: "Show that the variance of the dot product of two independent zero-mean vectors grows proportionally to d_k." },
          { name: "Softmax Saturation", regex: /(saturat|extreme|large magnitude|push)/i, weight: 25, tip: "Explain that large dot products push softmax into regions with steep/flat slopes." },
          { name: "Vanishing Gradients", regex: /(vanishing|gradient.*0|zero|backprop)/i, weight: 40, tip: "Conclude that the derivative of softmax approaches zero, causing vanishing gradients." }
        ]
      },
      modelAnswer: `1. Mathematical Derivation of Variance:
- Assume components of query q and key k are independent random variables with mean 0 and variance 1: E[q_i] = 0, Var(q_i) = 1.
- Their dot product is: q · k = Σ (q_i * k_i) for i = 1 to d_k.
- The expectation E[q · k] = Σ E[q_i] * E[k_i] = 0.
- The variance Var(q · k) = Σ Var(q_i * k_i) = Σ (Var(q_i) * Var(k_i)) = d_k * (1 * 1) = d_k.
- Therefore, the standard deviation is sqrt(d_k). For large d_k (e.g. 64 or 128), dot products have very large magnitudes (e.g. standard deviation of 8 or 11.3).

2. Impact on Softmax & Backpropagation:
- When inputs to softmax have huge dynamic ranges, softmax pushes the largest value close to 1.0 and all other values to ~0.0 (acting like an argmax).
- The derivative of softmax(z)_i with respect to z_j is: S_i * (δ_ij - S_j).
- When S_i is either 1.0 or 0.0, this derivative evaluates to 1.0 * (1 - 1) = 0 or 0 * (0 - 0) = 0.
- This results in catastrophic VANISHING GRADIENTS during backpropagation, stalling neural weight updates in the projection matrices (W_q, W_k).
- Dividing by sqrt(d_k) normalizes variance back to 1.0, preserving gradient flow.`
    },

    {
      id: "kv-cache-paged-attention",
      track: "deeplearning",
      trackLabel: "Generative AI & LLM Systems",
      difficulty: "Hard (Staff Tier)",
      title: "KV Cache Memory Bottleneck & PagedAttention Mechanics",
      prompt: "In LLM autoregressive generation (inference), why is the KV cache necessary? How do you calculate the memory required for a 7B parameter model (e.g. Llama-2-7B, 32 layers, 32 heads, hidden dimension 4096, 16-bit float) for a batch size of 16 and sequence length of 2048? How does PagedAttention (vLLM) solve fragmentation?",
      rubric: {
        keywords: ["kv cache", "autoregressive", "redundant", "tokens", "batch", "layers", "heads", "bytes", "pagedattention", "virtual memory", "fragmentation"],
        requiredConcepts: [
          { name: "KV Cache Purpose", regex: /(redundant|recompute|autoregressive|store keys|cache)/i, weight: 25, tip: "Explain that KV cache avoids recomputing keys and values for previous tokens." },
          { name: "Memory Calculation", regex: /(2\s*\*\s*layers|batch.*seq|gb|bytes|formula)/i, weight: 35, tip: "Formula: 2 * num_layers * hidden_size * num_tokens * itemsize." },
          { name: "PagedAttention Architecture", regex: /(pagedattention|vllm|paging|virtual memory|blocks|fragmentation)/i, weight: 40, tip: "Explain how PagedAttention divides KV cache into non-contiguous blocks to eliminate internal/external fragmentation." }
        ]
      },
      modelAnswer: `1. Why KV Cache is Necessary:
- In autoregressive token generation, to predict token t, the model attends to tokens 1 through t-1.
- Without caching, keys and values for all past tokens must be recomputed at every step (quadratic O(N^2) redundant computation).
- The KV cache stores previously computed Key and Value matrices so only the new token's Q, K, V vectors are calculated at each step.

2. KV Cache Memory Formula & Calculation:
- Per-token KV cache size = 2 (Key + Value) * Num_Layers * Hidden_Dimension * Bytes_Per_Element
- For Llama-7B: 32 layers, hidden size 4096, FP16 (2 bytes):
  Per token = 2 * 32 * 4096 * 2 bytes = 524,288 bytes = 0.5 MB per token!
- Total KV Memory = Batch_Size * Sequence_Length * Per_Token_Size
  = 16 * 2048 * 0.5 MB = 16,384 MB = 16.0 GB!
- The KV cache often consumes more VRAM than the model weights themselves!

3. How PagedAttention (vLLM) Solves Fragmentation:
- Standard implementations allocate a contiguous memory chunk for max_seq_len (e.g. 2048) upfront, causing severe internal and external memory fragmentation (up to 60-80% wasted VRAM).
- PagedAttention applies virtual memory paging principles to LLM inference: KV caches are divided into fixed-size blocks (e.g. 16 tokens per block).
- Blocks are allocated dynamically on-demand and do not need to reside in contiguous physical VRAM. A block table maps logical token positions to physical blocks, eliminating memory waste and enabling dynamic batching.`
    },

    // -------------------------------------------------------------------------
    // TRACK 3: PRODUCTION MLOPS & PIPELINES (KRISH NAIK)
    // -------------------------------------------------------------------------
    {
      id: "mlops-drift-detection",
      track: "mlops",
      trackLabel: "Production MLOps (Krish Naik)",
      difficulty: "Medium (Senior Tier)",
      title: "Data Drift vs Concept Drift in Production Credit Scoring",
      prompt: "Your team deployed a credit default prediction model. Six months in, precision and recall degrade significantly. Differentiate between Data Drift (Covariate Shift) and Concept Drift. How would you statistically test for both in production, and what is your automated remediation strategy?",
      rubric: {
        keywords: ["covariate", "concept drift", "p(x)", "p(y|x)", "kolmogorov-smirnov", "psi", "population stability index", "ground truth", "retrain", "evidently"],
        requiredConcepts: [
          { name: "Data Drift Definition", regex: /(covariate|p\(x\)|input distribution|feature distribution)/i, weight: 25, tip: "Data Drift: P(X) changes while P(Y|X) remains unchanged." },
          { name: "Concept Drift Definition", regex: /(concept drift|p\(y\|x\)|relationship|ground truth)/i, weight: 25, tip: "Concept Drift: P(Y|X) changes (relationship between features and target shifts)." },
          { name: "Statistical Tests", regex: /(ks|kolmogorov|psi|population stability|wasserstein|chi-square)/i, weight: 25, tip: "Cite tests like KS-test, PSI (Population Stability Index), or Wasserstein distance." },
          { name: "Remediation Strategy", regex: /(retrain|pipeline|dvc|monitoring|shadow|canary)/i, weight: 25, tip: "Automated retraining triggers, shadow deployment, feedback loop." }
        ]
      },
      modelAnswer: `1. Definitions:
- Data Drift (Covariate Shift): The distribution of inputs P(X) changes over time, but the conditional relationship P(Y|X) remains static. (e.g. In an economic downturn, applicants' average debt-to-income ratio increases, but someone with 50% DTI still defaults at the same rate as before).
- Concept Drift: The relationship between inputs and output P(Y|X) changes, even if P(X) looks similar. (e.g. Regulatory changes make certain debt types non-enforceable, so a DTI of 40% now defaults at a drastically different rate).

2. Statistical Detection:
- Continuous Features: Two-sample Kolmogorov-Smirnov (KS) Test or Wasserstein (Earth Mover's) Distance comparing inference window against training baseline.
- Categorical Features: Chi-Square Goodness-of-Fit test.
- Comprehensive Metric: Population Stability Index (PSI). PSI < 0.1: No shift; 0.1 <= PSI < 0.2: Moderate shift; PSI >= 0.2: Significant drift requiring action.
- Concept Drift Detection: Requires delayed ground truth labels; track rolling F1-score, Brier score, or DDM (Drift Detection Method).

3. Automated Remediation Pipeline:
- Trigger automated alert via Evidently AI / Prometheus.
- Automated Data Slicing & DVC Snapshot: Capture drifted distribution window.
- Trigger CI/CD Retraining DAG: Retrain model on weighted recency data.
- Shadow / Canary Deployment: Run retrained model in shadow mode against live traffic, verify calibration and PSI, then promote via Blue/Green deployment.`
    },

    // -------------------------------------------------------------------------
    // TRACK 4: ALGORITHMIC PROBLEM SOLVING (DSA)
    // -------------------------------------------------------------------------
    {
      id: "dsa-lru-cache-o1",
      track: "dsa",
      trackLabel: "Data Structures & Algorithms",
      difficulty: "Medium (Senior Tier)",
      title: "LRU Cache Design with O(1) Get and Put Operations",
      prompt: "Design a Least Recently Used (LRU) Cache that supports get(key) and put(key, value) in strictly O(1) time complexity. Which two data structures must be combined? Detail the exact node manipulation when a key is accessed or evicted.",
      rubric: {
        keywords: ["hash map", "doubly linked list", "o(1)", "dummy head", "dummy tail", "evict", "least recently used", "pointer"],
        requiredConcepts: [
          { name: "Data Structure Combination", regex: /(hash\s*map|hash\s*table|dict).*(doubly\s*linked\s*list)/i, weight: 35, tip: "Must combine a Hash Map with a Doubly Linked List." },
          { name: "Get(key) Workflow", regex: /(lookup|move to head|remove.*add)/i, weight: 25, tip: "Explain looking up in map and moving the node to the head of the list." },
          { name: "Put(key, value) & Eviction", regex: /(evict|tail|capacity|remove tail)/i, weight: 40, tip: "Explain eviction from tail and updating map when capacity exceeded." }
        ]
      },
      modelAnswer: `1. Required Data Structures:
- A Hash Map (Hash Table) mapping key -> Doubly Linked List Node: guarantees O(1) lookup.
- A Doubly Linked List (DLL) with dummy head and dummy tail pointers: guarantees O(1) insertion, deletion, and node relocation.

2. Operations Walkthrough:
- get(key):
  1. Look up key in Hash Map. If not found, return -1.
  2. If found, unlink node from its current position in the DLL:
     node.prev.next = node.next; node.next.prev = node.prev;
  3. Move node to immediately after dummy head (marking it as most recently used).
  4. Return node.value.

- put(key, value):
  1. If key already exists in map: update value and move node to head (same as get).
  2. If key is new:
     a. Create new node(key, value).
     b. Insert node right after dummy head; record in Hash Map.
     c. If size > capacity:
        - Identify least recently used node: lru = dummyTail.prev.
        - Unlink lru node from DLL.
        - Delete lru.key from the Hash Map.
        - Decrement size.

All operations execute in guaranteed O(1) time and O(capacity) auxiliary memory.`
    }
  ];

  // =========================================================================
  // EVALUATION ENGINE
  // =========================================================================
  let activeScenarioId = "raft-partition-split-brain";

  function loadScenario(scenarioId) {
    const sc = INTERVIEW_SCENARIOS.find(s => s.id === scenarioId);
    if (!sc) return;

    activeScenarioId = scenarioId;

    setElementText('bar-raiser-title', sc.title);
    setElementText('bar-raiser-track', sc.trackLabel);
    setElementText('bar-raiser-difficulty', sc.difficulty);
    setElementText('bar-raiser-prompt', sc.prompt);

    const input = document.getElementById('bar-raiser-user-answer');
    if (input) input.value = '';

    const resultsArea = document.getElementById('bar-raiser-results-card');
    if (resultsArea) resultsArea.style.display = 'none';
  }

  function evaluateUserAnswer() {
    const sc = INTERVIEW_SCENARIOS.find(s => s.id === activeScenarioId);
    const input = document.getElementById('bar-raiser-user-answer');
    const resultsArea = document.getElementById('bar-raiser-results-card');
    if (!sc || !input || !resultsArea) return;

    const answer = input.value.trim();
    if (answer.length < 15) {
      alert("Please provide a more detailed engineering response before submitting for review.");
      return;
    }

    let totalScore = 0;
    const feedbackItems = [];

    // Concept & Rubric Evaluation
    sc.rubric.requiredConcepts.forEach(concept => {
      const passed = concept.regex.test(answer);
      if (passed) {
        totalScore += concept.weight;
        feedbackItems.push({
          passed: true,
          title: concept.name,
          detail: `✓ Identified accurately: +${concept.weight} pts`
        });
      } else {
        feedbackItems.push({
          passed: false,
          title: concept.name,
          detail: `⚠️ Missing or underspecified: ${concept.tip}`
        });
      }
    });

    // Keyword density bonus / penalty check (up to 10 bonus pts capped at 100)
    let keywordHits = 0;
    const lowerAnswer = answer.toLowerCase();
    sc.rubric.keywords.forEach(kw => {
      if (lowerAnswer.includes(kw)) keywordHits++;
    });

    const keywordRatio = keywordHits / sc.rubric.keywords.length;
    if (keywordRatio > 0.6) {
      totalScore = Math.min(100, totalScore + 5);
    }

    // Determine Engineering Level
    let levelBadge = "L4 Software Engineer";
    let levelColor = "var(--accent-blue)";
    if (totalScore >= 88) {
      levelBadge = "L6 / Staff Systems Architect 🏆";
      levelColor = "var(--accent-orange)";
    } else if (totalScore >= 70) {
      levelBadge = "L5 / Senior Systems Engineer ⚡";
      levelColor = "#10b981";
    }

    // Render results
    setElementText('bar-raiser-score-num', `${totalScore} / 100`);
    const tierElem = document.getElementById('bar-raiser-tier-badge');
    if (tierElem) {
      tierElem.textContent = levelBadge;
      tierElem.style.color = levelColor;
    }

    const feedbackList = document.getElementById('bar-raiser-rubric-list');
    if (feedbackList) {
      feedbackList.innerHTML = feedbackItems.map(item => `
        <div class="bar-raiser-rubric-item ${item.passed ? 'passed' : 'missed'}">
          <span class="rubric-icon">${item.passed ? '✓' : '⚠️'}</span>
          <div>
            <strong>${escapeHtml(item.title)}</strong>
            <div style="font-size: 0.78rem; opacity: 0.85;">${escapeHtml(item.detail)}</div>
          </div>
        </div>
      `).join('');
    }

    const modelAnswerElem = document.getElementById('bar-raiser-model-answer');
    if (modelAnswerElem) {
      modelAnswerElem.textContent = sc.modelAnswer;
    }

    resultsArea.style.display = 'block';
    resultsArea.scrollIntoView({ behavior: 'smooth' });

    // Save history to localStorage
    saveDrillHistory(sc.id, totalScore, levelBadge);
  }

  function saveDrillHistory(scenarioId, score, tier) {
    try {
      const history = JSON.parse(localStorage.getItem('studypulse_bar_raiser_history') || '[]');
      history.unshift({
        scenarioId,
        score,
        tier,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('studypulse_bar_raiser_history', JSON.stringify(history.slice(0, 30)));
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }

  function filterScenariosByTrack(track) {
    const listElem = document.getElementById('bar-raiser-scenario-select');
    if (!listElem) return;

    const filtered = track === 'all' 
      ? INTERVIEW_SCENARIOS 
      : INTERVIEW_SCENARIOS.filter(s => s.track === track);

    listElem.innerHTML = filtered.map(s => 
      `<option value="${s.id}">${s.title} [${s.difficulty}]</option>`
    ).join('');

    if (filtered.length > 0) {
      loadScenario(filtered[0].id);
    }
  }

  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Modal / Drawer Toggles
  function openBarRaiserModal(scenarioId) {
    const modal = document.getElementById('bar-raiser-modal-overlay');
    if (modal) {
      modal.classList.add('active');
      if (scenarioId) {
        loadScenario(scenarioId);
      }
    }
  }

  function closeBarRaiserModal() {
    const modal = document.getElementById('bar-raiser-modal-overlay');
    if (modal) modal.classList.remove('active');
  }

  // Speech Recognition integration (dictation)
  function toggleVoiceDictation() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Web Speech Recognition is not supported in this browser. Please type your answer.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    const btn = document.getElementById('btn-bar-raiser-mic');

    if (btn) btn.classList.add('recording');
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      const textarea = document.getElementById('bar-raiser-user-answer');
      if (textarea) {
        textarea.value += (textarea.value ? ' ' : '') + transcript;
      }
    };
    recognition.onend = () => {
      if (btn) btn.classList.remove('recording');
    };
    recognition.start();
  }

  // Expose to window
  window.initBarRaiser = function() {
    const select = document.getElementById('bar-raiser-scenario-select');
    if (select) {
      select.innerHTML = INTERVIEW_SCENARIOS.map(s => 
        `<option value="${s.id}">${s.title} [${s.difficulty}]</option>`
      ).join('');
      select.addEventListener('change', () => loadScenario(select.value));
    }
    loadScenario('raft-partition-split-brain');
  };

  window.evaluateBarRaiserAnswer = evaluateUserAnswer;
  window.filterBarRaiserTrack = filterScenariosByTrack;
  window.openBarRaiserModal = openBarRaiserModal;
  window.closeBarRaiserModal = closeBarRaiserModal;
  window.toggleBarRaiserVoice = toggleVoiceDictation;

  document.addEventListener('DOMContentLoaded', () => {
    if (window.initBarRaiser) window.initBarRaiser();
  });
})();
