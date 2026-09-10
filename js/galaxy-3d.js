/**
 * StudyPulse 3D Knowledge Galaxy Engine
 * Interactive Obsidian-Style 3D Constellation & Prerequisite Graph
 */

(function() {
  'use strict';

  const GALAXY_NODES = [
    // Branch 1: Mathematical Foundations
    { id: "math-linalg", label: "Linear Algebra & Eigenvalues", bookIdx: 7, x: -3.2, y: 1.8, z: -1.2, color: 0xa855f7, track: "MATH", tier: 1, xp: 300, desc: "Vector spaces, span, eigenvalues, eigenvectors & PCA" },
    { id: "math-calc", label: "Vector Calculus & Gradients", bookIdx: 7, x: -2.5, y: 2.6, z: -0.4, color: 0xa855f7, track: "MATH", tier: 1, xp: 350, prereqs: ["math-linalg"], desc: "Jacobian, Hessian matrices, multivariable chain rule" },
    { id: "math-stats", label: "Probability & Inferential Stats", bookIdx: 8, x: -3.8, y: 0.8, z: 0.8, color: 0xc084fc, track: "MATH", tier: 1, xp: 300, desc: "CLT, hypothesis testing, p-values, distributions" },

    // Branch 2: Python & Data Engineering
    { id: "py-core", label: "CPython & Memory Internals", bookIdx: 1, x: -1.5, y: -0.5, z: 2.2, color: 0x10b981, track: "PYTHON", tier: 1, xp: 250, desc: "Reference counting, cyclic GC, dict hash table mechanics" },
    { id: "py-oop", label: "Advanced Python & Metaclasses", bookIdx: 2, x: -0.8, y: -1.4, z: 2.6, color: 0x10b981, track: "PYTHON", tier: 2, xp: 300, prereqs: ["py-core"], desc: "MRO C3 linearization, dunder methods, decorators" },
    { id: "numpy-simd", label: "NumPy Vectorization & SIMD", bookIdx: 3, x: -1.8, y: 0.6, z: 1.5, color: 0x34d399, track: "NUMERICAL", tier: 2, xp: 280, prereqs: ["py-core", "math-linalg"], desc: "Strides, buffer protocol, broadcasting mechanics" },
    { id: "pandas-etl", label: "Pandas Wrangling & MultiIndex", bookIdx: 4, x: -1.2, y: -0.2, z: 3.2, color: 0x34d399, track: "DATA", tier: 2, xp: 320, prereqs: ["numpy-simd"], desc: "Split-apply-combine, index alignment, ETL workflows" },
    { id: "sql-window", label: "SQL Relational & Window Analytics", bookIdx: 6, x: -0.2, y: -2.2, z: 1.8, color: 0xfacc15, track: "DATABASE", tier: 2, xp: 350, desc: "OVER (PARTITION BY), CTEs, B-Tree index optimization" },

    // Branch 3: Algorithms & DSA
    { id: "dsa-arrays", label: "Sliding Window & Two Pointers", bookIdx: 0, x: -0.5, y: 1.5, z: 3.0, color: 0xf43f5e, track: "ALGORITHMS", tier: 2, xp: 350, prereqs: ["py-core"], desc: "Monotonic queues, sliding window max, fast-slow pointers" },
    { id: "dsa-trees", label: "Binary Search Trees & Heaps", bookIdx: 0, x: 0.6, y: 2.2, z: 3.4, color: 0xf43f5e, track: "ALGORITHMS", tier: 3, xp: 400, prereqs: ["dsa-arrays"], desc: "AVL balancing, heapify, priority queues" },
    { id: "dsa-graphs", label: "Graph Algorithms & BFS/DFS", bookIdx: 0, x: 1.5, y: 2.8, z: 3.8, color: 0xfb7185, track: "ALGORITHMS", tier: 4, xp: 450, prereqs: ["dsa-trees"], desc: "Dijkstra, topological sort, union-find disjoint sets" },

    // Branch 4: Machine Learning Core
    { id: "ml-reg", label: "Supervised Regression & Regularization", bookIdx: 9, x: -1.2, y: 2.4, z: -1.8, color: 0x0ea5e9, track: "MACHINE LEARNING", tier: 3, xp: 400, prereqs: ["math-calc", "numpy-simd"], desc: "OLS derivation, Ridge (L2), Lasso (L1 feature selection)" },
    { id: "ml-trees", label: "Decision Trees & Random Forests", bookIdx: 9, x: -0.4, y: 3.0, z: -2.2, color: 0x0ea5e9, track: "MACHINE LEARNING", tier: 3, xp: 420, prereqs: ["ml-reg"], desc: "Gini impurity, information gain, bagging, OOB error" },
    { id: "ml-boosting", label: "Gradient Boosting & XGBoost Math", bookIdx: 10, x: 0.5, y: 3.5, z: -2.6, color: 0x38bdf8, track: "ADVANCED ML", tier: 4, xp: 500, prereqs: ["ml-trees"], desc: "Pseudo residuals, Taylor series approximation, similarity score" },

    // Branch 5: Deep Learning & Neural Architectures
    { id: "dl-mlp", label: "Multi-Layer Perceptrons & Backpropagation", bookIdx: 12, x: 0.8, y: 1.6, z: -1.0, color: 0x6366f1, track: "DEEP LEARNING", tier: 3, xp: 450, prereqs: ["math-calc", "ml-reg"], desc: "Computational graphs, activation functions, Adam optimizer" },
    { id: "dl-cnn", label: "Convolutional Networks & Kernels", bookIdx: 12, x: 1.8, y: 2.2, z: -1.2, color: 0x6366f1, track: "DEEP LEARNING", tier: 4, xp: 480, prereqs: ["dl-mlp"], desc: "Feature map extraction, pooling, receptive fields" },

    // Branch 6: Generative AI & Foundation Models
    { id: "genai-trans", label: "Transformer & Scaled Dot-Product", bookIdx: 13, x: 2.4, y: 0.8, z: -0.4, color: 0xf97316, track: "FOUNDATION MODELS", tier: 4, xp: 550, prereqs: ["dl-mlp"], desc: "Q, K, V projection matrices, softmax scaling, FlashAttention" },
    { id: "genai-lang", label: "LangChain & LCEL Orchestration", bookIdx: 13, x: 3.2, y: 0.2, z: 0.5, color: 0xf97316, track: "FOUNDATION MODELS", tier: 4, xp: 500, prereqs: ["genai-trans"], desc: "Runnables, PromptTemplates, agentic memory loops" },
    { id: "genai-rag", label: "Enterprise RAG & Hybrid Retrieval", bookIdx: 14, x: 3.6, y: -0.8, z: 1.2, color: 0xfb923c, track: "AI SYSTEMS", tier: 5, xp: 600, prereqs: ["genai-lang"], desc: "Dense embeddings + BM25 reciprocal rank fusion, vector stores" },
    { id: "genai-peft", label: "LoRA & QLoRA Parameter Adaptation", bookIdx: 13, x: 2.8, y: 1.4, z: 0.8, color: 0xfb923c, track: "FOUNDATION MODELS", tier: 5, xp: 600, prereqs: ["genai-trans"], desc: "Low-rank weight updates (W + BA), 4-bit quantization" },

    // Branch 7: MLOps & Production Engineering
    { id: "mlops-docker", label: "Docker Isolation & Runtime Containers", bookIdx: 15, x: 1.2, y: -1.8, z: -1.5, color: 0x06b6d4, track: "MLOPS", tier: 3, xp: 400, prereqs: ["py-core"], desc: "Multi-stage builds, rootless execution, image optimization" },
    { id: "mlops-dvc", label: "DVC Data Versioning & Pipelines", bookIdx: 15, x: 2.0, y: -2.4, z: -1.8, color: 0x06b6d4, track: "MLOPS", tier: 4, xp: 450, prereqs: ["mlops-docker"], desc: "dvc.yaml DAG execution, remote S3 storage tracking" },
    { id: "mlops-cicd", label: "CI/CD Actions & Automated Deployments", bookIdx: 15, x: 2.8, y: -3.0, z: -2.2, color: 0x22d3ee, track: "MLOPS", tier: 5, xp: 550, prereqs: ["mlops-dvc"], desc: "GitHub Actions, automated pytest, model registry deployment" },

    // Branch 8: Distributed Systems & Big Data
    { id: "sys-raft", label: "Raft Consensus & Leader Election", bookIdx: 16, x: 0.2, y: -1.2, z: -3.2, color: 0x38bdf8, track: "DISTRIBUTED SYSTEMS", tier: 4, xp: 500, desc: "Heartbeat intervals, randomized timeouts, term dominance" },
    { id: "sys-vector", label: "Vector Clocks & Causal Ordering", bookIdx: 16, x: 1.0, y: -1.8, z: -3.8, color: 0x38bdf8, track: "DISTRIBUTED SYSTEMS", tier: 4, xp: 480, prereqs: ["sys-raft"], desc: "Lamport timestamps, partial ordering, concurrency invariants" },
    { id: "sys-bft", label: "Byzantine Fault Tolerance (PBFT)", bookIdx: 16, x: 1.8, y: -2.4, z: -4.2, color: 0x60a5fa, track: "SECURITY & CONSENSUS", tier: 5, xp: 600, prereqs: ["sys-raft"], desc: "Pre-prepare, prepare, commit phases, 3f+1 tolerance" },
    { id: "data-spark", label: "Apache Spark & PySpark Distributed RDDs", bookIdx: 17, x: 2.2, y: -3.2, z: 0.2, color: 0x0284c7, track: "BIG DATA", tier: 4, xp: 500, prereqs: ["py-core", "sql-window"], desc: "Lazy transformations, Catalyst optimizer, DAG scheduler" },
    { id: "data-kafka", label: "Apache Kafka Streaming & Consumer Groups", bookIdx: 17, x: 3.0, y: -3.8, z: 0.6, color: 0x0369a1, track: "BIG DATA", tier: 5, xp: 600, prereqs: ["data-spark"], desc: "Partitioning, offset commits, zero-copy log transmission" }
  ];

  let galaxyScene, galaxyCamera, galaxyRenderer;
  let galaxyContainer = null;
  let galaxyAnimId = null;
  let nodeMeshes = [];
  let linkLines = [];
  let isGalaxyInit = false;
  let isGalaxyDragging = false;
  let prevPos = { x: 0, y: 0 };
  let galaxyOrbit = { yaw: 0, pitch: 0 };
  let hoveredGalaxyNode = null;
  let galaxyTooltipElem = null;

  const galaxyRaycaster = new THREE.Raycaster();
  const galaxyMouse = new THREE.Vector2();

  function init3DKnowledgeGalaxy(containerId) {
    galaxyContainer = document.getElementById(containerId);
    if (!galaxyContainer) return;

    // Reset container if re-initializing
    galaxyContainer.innerHTML = '';
    nodeMeshes = [];
    linkLines = [];

    const width = galaxyContainer.clientWidth || 600;
    const height = galaxyContainer.clientHeight || 260;

    galaxyScene = new THREE.Scene();
    galaxyScene.background = new THREE.Color(0x0a0f1d);

    galaxyCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    galaxyCamera.position.set(0, 0, 9.5);
    galaxyCamera.lookAt(0, 0, 0);

    galaxyRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    galaxyRenderer.setSize(width, height);
    galaxyRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    galaxyContainer.appendChild(galaxyRenderer.domElement);

    // Subtle Ambient & Star Light
    const amb = new THREE.AmbientLight(0xffffff, 0.85);
    galaxyScene.add(amb);

    const pt = new THREE.PointLight(0x38bdf8, 1.2, 20);
    pt.position.set(0, 0, 5);
    galaxyScene.add(pt);

    // Background Celestial Stars Field
    const starCount = 280;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 22;
      starPositions[i + 1] = (Math.random() - 0.5) * 16;
      starPositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.05,
      transparent: true,
      opacity: 0.5
    });
    const starField = new THREE.Points(starGeo, starMat);
    galaxyScene.add(starField);

    // Root Pivot Group for 3D Orbiting
    const galaxyPivot = new THREE.Group();
    galaxyScene.add(galaxyPivot);

    // Create Map for quick ID lookup
    const nodeMap = {};

    // Build Node Meshes
    GALAXY_NODES.forEach(n => {
      const sphereGeo = new THREE.SphereGeometry(0.18 + (n.tier * 0.03), 20, 20);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: n.color,
        emissive: n.color,
        emissiveIntensity: 0.45,
        roughness: 0.3,
        metalness: 0.2
      });

      const nodeMesh = new THREE.Mesh(sphereGeo, sphereMat);
      nodeMesh.position.set(n.x, n.y, n.z);
      nodeMesh.userData = n;
      galaxyPivot.add(nodeMesh);
      nodeMeshes.push(nodeMesh);
      nodeMap[n.id] = nodeMesh;

      // Outer Glowing Ring / Halo
      const ringGeo = new THREE.RingGeometry(0.26 + (n.tier * 0.03), 0.30 + (n.tier * 0.03), 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: n.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const halo = new THREE.Mesh(ringGeo, ringMat);
      nodeMesh.add(halo);
    });

    // Build Directed Laser Prerequisite Links
    GALAXY_NODES.forEach(n => {
      if (n.prereqs && n.prereqs.length > 0) {
        n.prereqs.forEach(prereqId => {
          const targetNode = nodeMap[prereqId];
          const sourceNode = nodeMap[n.id];
          if (targetNode && sourceNode) {
            const lineGeo = new THREE.BufferGeometry().setFromPoints([
              targetNode.position,
              sourceNode.position
            ]);
            const lineMat = new THREE.LineBasicMaterial({
              color: 0x38bdf8,
              transparent: true,
              opacity: 0.35,
              linewidth: 1.5
            });
            const line = new THREE.Line(lineGeo, lineMat);
            line.userData = { from: prereqId, to: n.id };
            galaxyPivot.add(line);
            linkLines.push(line);
          }
        });
      }
    });

    // Tooltip Element
    galaxyTooltipElem = document.createElement('div');
    galaxyTooltipElem.className = 'bookshelf-tooltip-chip';
    galaxyTooltipElem.style.display = 'none';
    galaxyTooltipElem.style.pointerEvents = 'none';
    galaxyContainer.appendChild(galaxyTooltipElem);

    // Event Listeners for Interaction & 3D Orbit
    galaxyContainer.addEventListener('pointerdown', e => {
      isGalaxyDragging = true;
      prevPos = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      isGalaxyDragging = false;
      if (galaxyContainer) galaxyContainer.style.cursor = 'default';
    });

    galaxyContainer.addEventListener('pointermove', onGalaxyPointerMove);
    galaxyContainer.addEventListener('click', onGalaxyClick);

    window.addEventListener('resize', onGalaxyResize);

    // Animation Loop
    function loop() {
      galaxyAnimId = requestAnimationFrame(loop);

      if (!isGalaxyDragging) {
        // Slow majestic galactic rotation
        galaxyPivot.rotation.y += 0.0018;
        galaxyPivot.rotation.x += 0.0006;
      }

      starField.rotation.y += 0.0004;

      galaxyRenderer.render(galaxyScene, galaxyCamera);
    }
    loop();
    isGalaxyInit = true;

    function onGalaxyPointerMove(e) {
      if (!galaxyContainer) return;
      const rect = galaxyContainer.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const my = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isGalaxyDragging) {
        const dx = e.clientX - prevPos.x;
        const dy = e.clientY - prevPos.y;
        galaxyPivot.rotation.y += dx * 0.005;
        galaxyPivot.rotation.x += dy * 0.005;
        prevPos = { x: e.clientX, y: e.clientY };
        galaxyContainer.style.cursor = 'grabbing';
        if (galaxyTooltipElem) galaxyTooltipElem.style.display = 'none';
        return;
      }

      galaxyMouse.set(mx, my);
      galaxyRaycaster.setFromCamera(galaxyMouse, galaxyCamera);
      const hits = galaxyRaycaster.intersectObjects(nodeMeshes, false);

      if (hits.length > 0) {
        const hit = hits[0].object;
        if (hoveredGalaxyNode !== hit) {
          if (hoveredGalaxyNode) {
            hoveredGalaxyNode.material.emissiveIntensity = 0.45;
            hoveredGalaxyNode.scale.set(1, 1, 1);
          }
          hoveredGalaxyNode = hit;
          hoveredGalaxyNode.material.emissiveIntensity = 1.0;
          hoveredGalaxyNode.scale.set(1.35, 1.35, 1.35);
          galaxyContainer.style.cursor = 'pointer';

          const d = hoveredGalaxyNode.userData;
          galaxyTooltipElem.innerHTML = `🌌 <strong>${d.label}</strong> [Tier ${d.tier}] • +${d.xp} XP<br><span style="opacity:0.8; font-size:0.68rem;">${d.desc} (Click to inspect)</span>`;
          galaxyTooltipElem.style.display = 'block';
        }
        galaxyTooltipElem.style.left = `${e.clientX - rect.left + 12}px`;
        galaxyTooltipElem.style.top = `${e.clientY - rect.top - 36}px`;
      } else {
        if (hoveredGalaxyNode) {
          hoveredGalaxyNode.material.emissiveIntensity = 0.45;
          hoveredGalaxyNode.scale.set(1, 1, 1);
        }
        hoveredGalaxyNode = null;
        galaxyContainer.style.cursor = 'grab';
        if (galaxyTooltipElem) galaxyTooltipElem.style.display = 'none';
      }
    }

    function onGalaxyClick(e) {
      if (hoveredGalaxyNode) {
        const d = hoveredGalaxyNode.userData;
        if (typeof window.switchAppTab === 'function') {
          window.switchAppTab('bookshelf');
          setTimeout(() => {
            if (typeof window.bookshelf3DOpenBook === 'function') {
              window.bookshelf3DOpenBook(d.bookIdx);
            }
          }, 150);
        }
      }
    }

    function onGalaxyResize() {
      if (!galaxyContainer || !galaxyRenderer || !galaxyCamera) return;
      const w = galaxyContainer.clientWidth || 600;
      const h = galaxyContainer.clientHeight || 260;
      galaxyCamera.aspect = w / h;
      galaxyCamera.updateProjectionMatrix();
      galaxyRenderer.setSize(w, h);
    }
  }

  window.init3DKnowledgeGalaxy = init3DKnowledgeGalaxy;
})();
