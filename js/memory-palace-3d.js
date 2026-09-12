/**
 * StudyPulse 3D Memory Palace Sanctuary
 * Spatial Spaced Repetition (Method of Loci) in WebGL / Three.js
 */

(function() {
  "use strict";

  const PALACE_CARDS = [
    {
      id: "palace-raft",
      title: "Raft Leader Election & Heartbeat Quorum",
      category: "DISTRIBUTED SYSTEMS",
      stability: 92,
      question: "How does Raft guarantee that at most one leader can be elected in a given term, and what triggers an election?",
      answer: "Followers reset an election timeout (150-300ms randomized) upon receiving AppendEntries heartbeats. If timeout elapses without heartbeat, follower increments currentTerm and becomes Candidate, voting for itself and requesting votes. A candidate needs majority quorum (floor(N/2)+1). Because each server can vote for at most one candidate per term on a first-come basis, at most one candidate can win majority.",
      code: "// Election Safety Invariant:\nif (votesReceived > totalNodes / 2) {\n  state = LEADER;\n  broadcastHeartbeats();\n}"
    },
    {
      id: "palace-attn",
      title: "Multi-Head Scaled Dot-Product Attention",
      category: "FOUNDATION MODELS",
      stability: 64,
      question: "Why does Scaled Dot-Product Attention divide QK^T by sqrt(d_k)? What happens if scaling is omitted?",
      answer: "For large projection dimension d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients (vanishing gradients). Dividing by sqrt(d_k) normalizes variance back to 1.0 assuming zero-mean unit-variance components.",
      code: "Attention(Q, K, V) = softmax( (Q * K.T) / sqrt(d_k) ) * V"
    },
    {
      id: "palace-backprop",
      title: "Backpropagation & Matrix Chain Rule",
      category: "DEEP LEARNING",
      stability: 88,
      question: "In a dense layer Y = WX + b with loss L, write the exact gradient expressions for dL/dW and dL/dX.",
      answer: "Given incoming upstream gradient dL/dY (delta):\n- dL/dW = delta * X^T\n- dL/db = sum(delta, axis=0)\n- dL/dX = W^T * delta (propagated back to previous layer). Dimension matching requires transposition.",
      code: "dW = np.dot(delta, X.T)\ndX = np.dot(W.T, delta)\ndb = np.sum(delta, axis=1, keepdims=True)"
    },
    {
      id: "palace-lsm",
      title: "B-Tree vs LSM-Tree Write Amplification",
      category: "DATABASE INTERNALS",
      stability: 42,
      question: "Why do Log-Structured Merge (LSM) Trees achieve significantly higher write throughput than standard B-Trees?",
      answer: "B-Trees perform in-place random writes to fixed-size 4KB/8KB disk pages, requiring random I/O and double-write buffers to prevent page corruption. LSM-Trees append writes sequentially to an in-memory MemTable (skip list) and WAL log. Once full, MemTable flushes sequentially to immutable SSTable disk files, converting random writes into optimal sequential I/O.",
      code: "Write Flow: MemTable (RAM) -> WAL (Seq Disk) -> SSTable L0 -> Leveled Compaction (L1..Ln)"
    },
    {
      id: "palace-cap",
      title: "CAP Theorem & PACELC Tradeoffs",
      category: "SYSTEM DESIGN",
      stability: 95,
      question: "Explain the PACELC theorem extension beyond standard Brewer CAP theorem.",
      answer: "PACELC states: In case of Partition (P), choose Availability (A) or Consistency (C); Else (E), when system runs normally without partitions, choose Latency (L) or Consistency (C). Example: DynamoDB / Cassandra are PA/EL (eventually consistent low-latency), while Spanner / CockroachDB are PC/EC.",
      code: "Normal Mode (No Partition) -> Tradeoff between Latency vs Strong Consistency"
    },
    {
      id: "palace-window",
      title: "Monotonic Queue for Sliding Window Max",
      category: "ALGORITHMS & DSA",
      stability: 55,
      question: "How do you find the maximum value in every sliding window of size k in O(N) time?",
      answer: "Use a Monotonic Decreasing Deque storing indices. For each index i:\n1. Pop indices from front if out of current window (i - k).\n2. Pop indices from back while nums[back] <= nums[i] (preserving descending order).\n3. Push i to back.\n4. Deque front holds the maximum element index for the window. Each index pushed/popped at most once -> O(N).",
      code: "while q and nums[q[-1]] <= nums[i]: q.pop()\nq.append(i)\nif q[0] <= i - k: q.popleft()"
    },
    {
      id: "palace-adam",
      title: "Adam Optimizer Momentum & RMSprop",
      category: "MACHINE LEARNING",
      stability: 82,
      question: "What are the bias correction terms in Adam, and why are they necessary in early training steps?",
      answer: "Adam initializes 1st moment m_0 = 0 (momentum) and 2nd moment v_0 = 0 (RMSprop). Because they start at zero, moving averages are heavily biased toward zero in early steps. Bias correction divides m_t by (1 - beta_1^t) and v_t by (1 - beta_2^t), scaling up estimates when t is small.",
      code: "m_hat = m_t / (1 - beta1**t)\nv_hat = v_t / (1 - beta2**t)\nparam -= lr * m_hat / (sqrt(v_hat) + eps)"
    },
    {
      id: "palace-cgroups",
      title: "Linux Namespaces vs Control Groups (CGroups)",
      category: "CONTAINER RUNTIMES",
      stability: 38,
      question: "What is the fundamental difference between Linux Namespaces and CGroups in container isolation?",
      answer: "Namespaces isolate what a process can SEE (PID, Mount, Network, IPC, UTS, User), giving each container its own private virtualized view of the OS. CGroups (Control Groups) restrict and meter what a process can USE (CPU shares, memory limits, blkio bandwidth, pids count).",
      code: "Namespaces = Virtual Scope Isolation (Visibility)\nCGroups v2 = Resource Limits (CPU / RAM Quotas)"
    }
  ];

  let palaceScene, palaceCamera, palaceRenderer;
  let palaceContainer = null;
  let palaceAnimId = null;
  let pedestals = [];
  let crystalMeshes = [];
  let sparks = [];
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let cameraAngle = { yaw: 0, pitch: 0.35, radius: 14 };
  let targetLook = { x: 0, y: 1.2, z: 0 };
  let currentLook = { x: 0, y: 1.2, z: 0 };
  let targetCamPos = null;
  let activeCardIndex = null;
  let isCardFlipped = false;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function getStabilityColor(stab) {
    if (stab >= 80) return 0x10b981; // Emerald Green
    if (stab >= 50) return 0xf59e0b; // Amber
    return 0xf43f5e; // Crimson Red
  }

  function initMemoryPalace(containerId = "memory-palace-3d-canvas") {
    palaceContainer = document.getElementById(containerId || "memory-palace-3d-canvas");
    if (!palaceContainer) return;

    if (palaceContainer.dataset.initialized === "true") {
      onPalaceResize();
      return;
    }
    palaceContainer.dataset.initialized = "true";

    palaceContainer.innerHTML = "";
    crystalMeshes = [];
    pedestals = [];
    sparks = [];

    const savedStab = JSON.parse(localStorage.getItem("studyPulsePalaceStability") || "{}");
    PALACE_CARDS.forEach(c => {
      if (savedStab[c.id] !== undefined) c.stability = savedStab[c.id];
    });

    const w = palaceContainer.clientWidth || 800;
    const h = palaceContainer.clientHeight || 540;

    palaceScene = new THREE.Scene();
    palaceScene.background = new THREE.Color(0x060913);
    palaceScene.fog = new THREE.FogExp2(0x060913, 0.04);

    palaceCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    updateCameraPosition();

    palaceRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    palaceRenderer.setSize(w, h);
    palaceRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (THREE.sRGBEncoding) palaceRenderer.outputEncoding = THREE.sRGBEncoding;
    palaceContainer.appendChild(palaceRenderer.domElement);

    // Ambient & Directional Lights
    const ambLight = new THREE.AmbientLight(0x38bdf8, 0.5);
    palaceScene.add(ambLight);

    const centerLight = new THREE.PointLight(0x38bdf8, 1.2, 18);
    centerLight.position.set(0, 5, 0);
    palaceScene.add(centerLight);

    // Floor Platform (Cybernetic Temple Sanctuary)
    buildPalaceSanctuaryFloor();

    // Spawn 8 Architectural Pedestals in a Circle
    const radius = 6.2;
    const count = PALACE_CARDS.length;

    for (let i = 0; i < count; i++) {
      const card = PALACE_CARDS[i];
      const angle = (i / count) * Math.PI * 2;
      const px = Math.sin(angle) * radius;
      const pz = Math.cos(angle) * radius;

      // Sculpted Obsidian Pedestal Base
      const pedGroup = new THREE.Group();
      pedGroup.position.set(px, 0, pz);

      const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 1.8, 16);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.8
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.9;
      pedGroup.add(baseMesh);

      // Glowing Rune Ring around pedestal rim
      const ringCol = getStabilityColor(card.stability);
      const ringGeo = new THREE.TorusGeometry(0.72, 0.035, 8, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: ringCol });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 1.78;
      pedGroup.add(ringMesh);

      // Floating Holographic Crystal Tablet
      const crystalGeo = new THREE.OctahedronGeometry(0.55, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: ringCol,
        emissive: ringCol,
        emissiveIntensity: 0.65,
        roughness: 0.1,
        metalness: 0.9,
        wireframe: false
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 2.45;
      crystal.userData = { cardIndex: i, card, baseCol: ringCol, ringMesh };
      pedGroup.add(crystal);
      crystalMeshes.push(crystal);

      // Wireframe overlay for cyber facet aesthetic
      const wireGeo = new THREE.OctahedronGeometry(0.57, 0);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.25 });
      const wireMesh = new THREE.Mesh(wireGeo, wireMat);
      crystal.add(wireMesh);

      // Spot light focused on pedestal
      const spot = new THREE.PointLight(ringCol, 0.8, 5);
      spot.position.set(0, 3, 0);
      pedGroup.add(spot);

      palaceScene.add(pedGroup);
      pedestals.push({ group: pedGroup, crystal, ringMesh, spot, card });
    }

    // Floating Ambient Energy Particles
    buildAmbientParticleMotes();

    // Create 2D Overlay for Card Inspection inside Container
    buildPalaceHUDOverlay();

    // Pointer & Resize Events
    bindPalaceEvents();

    if (palaceAnimId) cancelAnimationFrame(palaceAnimId);
    animatePalace();
  }

  function buildPalaceSanctuaryFloor() {
    // Outer cyber platform disc
    const floorGeo = new THREE.CylinderGeometry(8.5, 9.0, 0.4, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.5,
      metalness: 0.8
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    palaceScene.add(floor);

    // Inner glowing ring inlay
    const innerRingGeo = new THREE.RingGeometry(5.8, 6.6, 48);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.02;
    palaceScene.add(innerRing);

    // Center holographic seal
    const sealGeo = new THREE.RingGeometry(0.1, 2.0, 32);
    const sealMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25
    });
    const seal = new THREE.Mesh(sealGeo, sealMat);
    seal.rotation.x = -Math.PI / 2;
    seal.position.y = 0.02;
    palaceScene.add(seal);
  }

  function buildAmbientParticleMotes() {
    const particleCount = 180;
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = Math.random() * 6 + 0.2;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }

    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.6
    });

    const particles = new THREE.Points(pGeo, pMat);
    palaceScene.add(particles);
  }

  function buildPalaceHUDOverlay() {
    let overlay = document.getElementById("palace-hud-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "palace-hud-overlay";
      overlay.className = "palace-hud-overlay";
      palaceContainer.appendChild(overlay);
    }
    overlay.innerHTML = `
      <div class="palace-hud-top-bar">
        <div class="palace-hud-title-badge">
          <span>🏛️ MEMORY PALACE SANCTUARY</span>
          <span class="palace-subtag">SPATIAL FSRS-4.5 ACTIVE RECALL</span>
        </div>
        <div class="palace-hud-actions">
          <button class="btn-hud-glass" onclick="window.palaceResetView()">🦅 Overview</button>
          <button class="btn-hud-glass" onclick="window.toggleMemoryPalaceMode()">✕ Exit Palace</button>
        </div>
      </div>

      <!-- Center Holographic Card Dossier (Hidden by default) -->
      <div id="palace-card-modal" class="palace-card-modal" style="display: none;">
        <div class="palace-card-inner" id="palace-card-inner">
          
          <!-- Front Face -->
          <div class="palace-card-face palace-card-front">
            <div class="palace-card-header">
              <span class="topic-tag" id="palace-card-cat">DISTRIBUTED SYSTEMS</span>
              <span class="palace-stab-pill" id="palace-card-stab">STABILITY: 92%</span>
            </div>
            <h3 class="palace-card-title" id="palace-card-q-title">Raft Leader Election</h3>
            <p class="palace-card-prompt" id="palace-card-prompt">Question prompt...</p>
            <div class="palace-card-prompt-hint">[ Click Card or Press Space to Reveal Deep Recall Answer ]</div>
            <button class="btn-pulse-primary" style="width: 100%; justify-content: center; margin-top: 1rem;" onclick="window.palaceFlipCard()">
              🔄 Flip to Reveal Answer
            </button>
          </div>

          <!-- Back Face -->
          <div class="palace-card-face palace-card-back">
            <div class="palace-card-header">
              <span class="topic-tag">TECHNICAL EXPLANATION</span>
              <span class="palace-stab-pill pos">FSRS RECALL GRADE</span>
            </div>
            <div class="palace-card-answer-text" id="palace-card-answer">Detailed derivation...</div>
            <pre class="palace-card-code-block" id="palace-card-code"><code>// Code sample</code></pre>
            
            <div class="palace-grade-btn-row">
              <button class="btn-grade again" onclick="window.palaceGradeCard(1)">🔴 Again<br><span style="font-size:0.65rem;">+0 XP</span></button>
              <button class="btn-grade hard" onclick="window.palaceGradeCard(2)">🟠 Hard<br><span style="font-size:0.65rem;">+50 XP</span></button>
              <button class="btn-grade good" onclick="window.palaceGradeCard(3)">🟢 Good<br><span style="font-size:0.65rem;">+100 XP</span></button>
              <button class="btn-grade easy" onclick="window.palaceGradeCard(4)">💎 Easy<br><span style="font-size:0.65rem;">+150 XP</span></button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function updateCameraPosition() {
    if (!palaceCamera) return;
    const x = Math.sin(cameraAngle.yaw) * Math.cos(cameraAngle.pitch) * cameraAngle.radius;
    const y = Math.sin(cameraAngle.pitch) * cameraAngle.radius + 1.2;
    const z = Math.cos(cameraAngle.yaw) * Math.cos(cameraAngle.pitch) * cameraAngle.radius;
    palaceCamera.position.set(x, Math.max(1.8, y), z);
    palaceCamera.lookAt(currentLook.x, currentLook.y, currentLook.z);
  }

  function bindPalaceEvents() {
    const dom = palaceContainer;

    dom.addEventListener("mousedown", (e) => {
      if (e.target.closest(".palace-card-modal") || e.target.closest(".palace-hud-actions")) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      prevMouse = { x: e.clientX, y: e.clientY };

      cameraAngle.yaw -= dx * 0.006;
      cameraAngle.pitch = Math.max(0.1, Math.min(1.2, cameraAngle.pitch + dy * 0.006));
      updateCameraPosition();
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    dom.addEventListener("wheel", (e) => {
      e.preventDefault();
      cameraAngle.radius = Math.max(5.5, Math.min(22, cameraAngle.radius + e.deltaY * 0.015));
      updateCameraPosition();
    }, { passive: false });

    dom.addEventListener("click", (e) => {
      if (e.target.closest(".palace-card-modal") || e.target.closest(".palace-hud-top-bar")) return;

      const rect = palaceContainer.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, palaceCamera);
      const hits = raycaster.intersectObjects(crystalMeshes, true);

      if (hits.length > 0) {
        let obj = hits[0].object;
        while (obj && !obj.userData.card) {
          obj = obj.parent;
        }
        if (obj && obj.userData.card) {
          openCardDossier(obj.userData.cardIndex);
        }
      }
    });

    window.addEventListener("resize", onPalaceResize);
  }

  function onPalaceResize() {
    if (!palaceContainer || !palaceRenderer || !palaceCamera) return;
    const w = palaceContainer.clientWidth || 800;
    const h = palaceContainer.clientHeight || 540;
    palaceCamera.aspect = w / h;
    palaceCamera.updateProjectionMatrix();
    palaceRenderer.setSize(w, h);
  }

  function openCardDossier(index) {
    activeCardIndex = index;
    isCardFlipped = false;
    const card = PALACE_CARDS[index];

    const modal = document.getElementById("palace-card-modal");
    const inner = document.getElementById("palace-card-inner");
    const catEl = document.getElementById("palace-card-cat");
    const stabEl = document.getElementById("palace-card-stab");
    const qTitleEl = document.getElementById("palace-card-q-title");
    const promptEl = document.getElementById("palace-card-prompt");
    const ansEl = document.getElementById("palace-card-answer");
    const codeEl = document.getElementById("palace-card-code");

    if (!modal) return;

    if (inner) inner.classList.remove("flipped");
    if (catEl) catEl.textContent = card.category;
    if (stabEl) {
      stabEl.textContent = `STABILITY: ${card.stability}%`;
      stabEl.style.borderColor = card.stability >= 80 ? "#10b981" : (card.stability >= 50 ? "#f59e0b" : "#f43f5e");
      stabEl.style.color = card.stability >= 80 ? "#34d399" : (card.stability >= 50 ? "#fbbf24" : "#f87171");
    }
    if (qTitleEl) qTitleEl.textContent = card.title;
    if (promptEl) promptEl.textContent = card.question;
    if (ansEl) ansEl.textContent = card.answer;
    if (codeEl) codeEl.innerHTML = `<code>${escapeHtml(card.code)}</code>`;

    modal.style.display = "flex";

    // Smooth camera focus onto pedestal
    const targetPedestal = pedestals[index];
    if (targetPedestal) {
      const pos = targetPedestal.group.position;
      targetLook = { x: pos.x * 0.4, y: 1.8, z: pos.z * 0.4 };
      cameraAngle.radius = 9.0;
    }

    if (window.playSfxShelf) window.playSfxShelf();
  }

  function palaceFlipCard() {
    const inner = document.getElementById("palace-card-inner");
    if (inner) {
      isCardFlipped = !isCardFlipped;
      inner.classList.toggle("flipped", isCardFlipped);
      if (window.playSfxBookSlide) window.playSfxBookSlide();
    }
  }

  function palaceGradeCard(score) {
    if (activeCardIndex === null) return;
    const card = PALACE_CARDS[activeCardIndex];
    const ped = pedestals[activeCardIndex];

    let xp = 0;
    if (score === 1 || score === 'again') { card.stability = Math.max(25, card.stability - 30); xp = 0; }
    else if (score === 2 || score === 'hard') { card.stability = Math.min(75, card.stability + 12); xp = 50; }
    else if (score === 3 || score === 'good') { card.stability = Math.min(92, card.stability + 25); xp = 100; }
    else if (score === 4 || score === 'easy') { card.stability = 98; xp = 150; }

    // Save stability to localStorage
    const savedStab = JSON.parse(localStorage.getItem("studyPulsePalaceStability") || "{}");
    savedStab[card.id] = card.stability;
    localStorage.setItem("studyPulsePalaceStability", JSON.stringify(savedStab));

    // Update 3D Crystal and Ring colors
    const newCol = getStabilityColor(card.stability);
    ped.crystal.material.color.setHex(newCol);
    ped.crystal.material.emissive.setHex(newCol);
    ped.ringMesh.material.color.setHex(newCol);
    ped.spot.color.setHex(newCol);

    // Spawn 3D sparks fountain
    spawnCrystalSparks(ped.group.position, newCol);

    // Award XP
    if (xp > 0 && typeof window.addXP === "function") {
      window.addXP(xp, `Memory Palace Recall: ${card.title.substring(0, 20)}...`);
    }

    // Close modal after brief confirmation
    const modal = document.getElementById("palace-card-modal");
    if (modal) modal.style.display = "none";
    palaceResetView();

    if (window.showToast) {
      window.showToast(`✨ Recall logged! Stability: ${card.stability}% (+${xp} XP)`);
    }
  }

  function spawnCrystalSparks(pos, col) {
    for (let i = 0; i < 24; i++) {
      const spGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const spMat = new THREE.MeshBasicMaterial({ color: col });
      const m = new THREE.Mesh(spGeo, spMat);
      m.position.set(pos.x, 2.5, pos.z);
      m.userData = {
        vx: (Math.random() - 0.5) * 0.12,
        vy: Math.random() * 0.15 + 0.05,
        vz: (Math.random() - 0.5) * 0.12,
        life: 1.0
      };
      palaceScene.add(m);
      sparks.push(m);
    }
  }

  function palaceResetView() {
    targetLook = { x: 0, y: 1.2, z: 0 };
    cameraAngle.radius = 14;
    cameraAngle.pitch = 0.35;
    activeCardIndex = null;
    const modal = document.getElementById("palace-card-modal");
    if (modal) modal.style.display = "none";
  }

  function animatePalace() {
    const time = Date.now() * 0.0015;

    // Smoothly interpolate look target
    currentLook.x += (targetLook.x - currentLook.x) * 0.06;
    currentLook.y += (targetLook.y - currentLook.y) * 0.06;
    currentLook.z += (targetLook.z - currentLook.z) * 0.06;
    updateCameraPosition();

    // Slowly rotate crystals & bob gently
    pedestals.forEach((p, idx) => {
      p.crystal.rotation.y = time * 0.8 + idx;
      p.crystal.position.y = 2.45 + Math.sin(time * 2 + idx) * 0.08;
    });

    // Update sparks
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.position.x += s.userData.vx;
      s.position.y += s.userData.vy;
      s.position.z += s.userData.vz;
      s.userData.vy -= 0.004; // gravity
      s.userData.life -= 0.025;
      s.scale.multiplyScalar(0.96);

      if (s.userData.life <= 0) {
        palaceScene.remove(s);
        sparks.splice(i, 1);
      }
    }

    palaceRenderer.render(palaceScene, palaceCamera);
    palaceAnimId = requestAnimationFrame(animatePalace);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Export to window
  window.initMemoryPalace = initMemoryPalace;
  window.palaceResetView = palaceResetView;
  window.palaceFlipCard = palaceFlipCard;
  window.palaceGradeCard = palaceGradeCard;
  window.memoryPalaceResize = onPalaceResize;
  window.toggleMemoryPalaceMode = function() {
    if (typeof window.switchView === 'function') {
      window.switchView('dashboard');
    } else {
      palaceResetView();
    }
  };

})();
