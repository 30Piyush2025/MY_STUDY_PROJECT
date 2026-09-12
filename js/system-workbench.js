/**
 * StudyPulse System Design Workbench & Latency Math Engine
 * File: js/system-workbench.js
 *
 * 100% Offline Client-Side Architecture Whiteboard & Live Capacity Estimator
 * - Component Nodes (Client, API Gateway, Load Balancer, Raft, Kafka, Redis, Postgres, Vector DB, Triton)
 * - Drag-and-drop & Tap-to-place architecture layout with magnetic links
 * - 3 Pre-Loaded Flagship Architecture Blueprints
 * - Real-Time Back-of-the-Envelope Capacity Estimator (QPS, Peak QPS, Daily Ingestion, Storage, Bandwidth, RAM, Latency)
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. PRE-LOADED ARCHITECTURAL BLUEPRINTS
  // =========================================================================
  const ARCHITECTURE_BLUEPRINTS = {
    feature_store_triton: {
      name: "High-Throughput Feature Store & Real-Time Triton Inference",
      category: "Production MLOps (CampusX / Krish Naik)",
      description: "Low-latency ML inference architecture with dual-layer caching and GPU model serving.",
      nodes: [
        { id: "n1", type: "client", label: "Mobile / Web Client", icon: "📱", x: 40, y: 120 },
        { id: "n2", type: "gateway", label: "API Gateway (Kong)", icon: "🌐", x: 180, y: 120 },
        { id: "n3", type: "lb", label: "Load Balancer (HAProxy)", icon: "⚖️", x: 320, y: 120 },
        { id: "n4", type: "triton", label: "Triton Inference (GPU)", icon: "🧠", x: 500, y: 60 },
        { id: "n5", type: "redis", label: "Redis L2 Feature Cache", icon: "🚀", x: 500, y: 190 },
        { id: "n6", type: "feast", label: "Feast Feature Store (Offline)", icon: "🗄️", x: 680, y: 190 }
      ],
      connections: [
        { from: "n1", to: "n2", label: "HTTPS / TLS" },
        { from: "n2", to: "n3", label: "Internal VPC" },
        { from: "n3", to: "n4", label: "gRPC Ingest" },
        { from: "n4", to: "n5", label: "Cache Read (2ms)" },
        { from: "n5", to: "n6", label: "Batch Sync (Parquet)" }
      ],
      defaultMath: { dau: 10000000, readWriteRatio: 20, payloadKb: 2.5, retentionDays: 365, replication: 3 }
    },

    raft_consensus_kv: {
      name: "Distributed Raft Consensus & Sharded Key-Value Store",
      category: "Distributed Systems (MIT 6.824)",
      description: "Linearizable distributed storage engine with 3-node quorum and WAL replication.",
      nodes: [
        { id: "n1", type: "client", label: "Client Application", icon: "📱", x: 60, y: 130 },
        { id: "n2", type: "raft1", label: "Raft Node 1 (Leader)", icon: "⚡", x: 260, y: 40 },
        { id: "n3", type: "raft2", label: "Raft Node 2 (Follower)", icon: "⚡", x: 260, y: 140 },
        { id: "n4", type: "raft3", label: "Raft Node 3 (Follower)", icon: "⚡", x: 260, y: 240 },
        { id: "n5", type: "kafka", label: "Kafka Event Stream", icon: "📨", x: 480, y: 90 },
        { id: "n6", type: "postgres", label: "PostgreSQL Primary", icon: "🐘", x: 480, y: 210 }
      ],
      connections: [
        { from: "n1", to: "n2", label: "Client Write RPC" },
        { from: "n2", to: "n3", label: "AppendEntries (Quorum)" },
        { from: "n2", to: "n4", label: "AppendEntries (Quorum)" },
        { from: "n2", to: "n5", label: "CDC Change Events" },
        { from: "n5", to: "n6", label: "Async Ingestion" }
      ],
      defaultMath: { dau: 5000000, readWriteRatio: 4, payloadKb: 1.2, retentionDays: 730, replication: 3 }
    },

    enterprise_rag_pipeline: {
      name: "Enterprise RAG Pipeline with Semantic Cache & Vector Search",
      category: "Generative AI & LLMs",
      description: "Scalable Retrieval-Augmented Generation system with HNSW vector index and semantic deduplication.",
      nodes: [
        { id: "n1", type: "client", label: "Chat Application", icon: "💬", x: 40, y: 120 },
        { id: "n2", type: "gateway", label: "LangChain Orchestrator", icon: "🤖", x: 200, y: 120 },
        { id: "n3", type: "redis", label: "Semantic Cache (Cosine > 0.96)", icon: "🚀", x: 360, y: 40 },
        { id: "n4", type: "vector", label: "Milvus / HNSW Vector DB", icon: "🗄️", x: 360, y: 200 },
        { id: "n5", type: "triton", label: "Llama-3 8B (vLLM / Triton)", icon: "🧠", x: 550, y: 120 },
        { id: "n6", type: "postgres", label: "Audit & Evals Store", icon: "🐘", x: 700, y: 120 }
      ],
      connections: [
        { from: "n1", to: "n2", label: "Prompt Query" },
        { from: "n2", to: "n3", label: "Cache Probe" },
        { from: "n2", to: "n4", label: "Dense Embed Search" },
        { from: "n2", to: "n5", label: "Context + Prompt" },
        { from: "n5", to: "n6", label: "Log Token Telemetry" }
      ],
      defaultMath: { dau: 2000000, readWriteRatio: 50, payloadKb: 4.0, retentionDays: 180, replication: 2 }
    }
  };

  // State
  let activeBlueprintKey = "feature_store_triton";
  let activeNodes = [];
  let activeConnections = [];
  let selectedNodeId = null;

  // =========================================================================
  // 2. CAPACITY & BACK-OF-THE-ENVELOPE MATH ENGINE
  // =========================================================================
  function calculateCapacityMetrics() {
    const dauInput = document.getElementById('boe-dau-input');
    const rwRatioInput = document.getElementById('boe-rw-ratio-input');
    const payloadInput = document.getElementById('boe-payload-input');
    const retentionInput = document.getElementById('boe-retention-input');
    const replicationInput = document.getElementById('boe-replication-input');

    if (!dauInput) return;

    const dau = parseFloat(dauInput.value) || 10000000;
    const rwRatio = parseFloat(rwRatioInput.value) || 10;
    const payloadKb = parseFloat(payloadInput.value) || 2.0;
    const retentionDays = parseFloat(retentionInput.value) || 365;
    const replication = parseFloat(replicationInput.value) || 3;

    // Daily Queries: assume 10 actions per DAU on average
    const actionsPerUser = 12;
    const totalDailyActions = dau * actionsPerUser;
    
    // QPS calculations (86,400 seconds in a day)
    const avgQps = Math.round(totalDailyActions / 86400);
    const peakQps = Math.round(avgQps * 2.5); // Peak traffic factor = 2.5x

    // Read vs Write splits
    const writePercentage = 1 / (rwRatio + 1);
    const writeQps = Math.round(avgQps * writePercentage);
    const readQps = avgQps - writeQps;

    // Daily Ingestion
    const dailyWrites = totalDailyActions * writePercentage;
    const dailyIngestionGb = (dailyWrites * payloadKb) / (1024 * 1024);
    const dailyIngestionTb = dailyIngestionGb / 1024;

    // Total Storage over retention period with replication
    const totalStorageTb = dailyIngestionTb * retentionDays * replication;

    // Network Bandwidth (Egress + Ingress)
    // Megabits per second = QPS * PayloadSizeKB * 8 bits / 1024
    const bandwidthMbps = (peakQps * payloadKb * 8) / 1024;
    const bandwidthGbps = (bandwidthMbps / 1000).toFixed(2);

    // Redis RAM Sizing (80/20 Rule: 20% of 1 day's data kept in memory)
    const hotDataRamGb = ((dailyIngestionGb * 0.20) * 1.25).toFixed(1); // 25% overhead buffer

    // Estimated p99 Latency
    // Cache Hit rate ~85% @ 2ms; DB/Disk Miss ~15% @ 35ms
    const estimatedP99 = (0.85 * 2.0 + 0.15 * 35.0).toFixed(1);

    // Render Metrics
    setElementText('boe-metric-avg-qps', avgQps.toLocaleString() + ' RPS');
    setElementText('boe-metric-peak-qps', peakQps.toLocaleString() + ' RPS');
    setElementText('boe-metric-daily-storage', dailyIngestionTb < 1 ? dailyIngestionGb.toFixed(1) + ' GB/day' : dailyIngestionTb.toFixed(2) + ' TB/day');
    setElementText('boe-metric-total-storage', totalStorageTb > 1000 ? (totalStorageTb / 1000).toFixed(2) + ' PB' : totalStorageTb.toFixed(1) + ' TB');
    setElementText('boe-metric-bandwidth', bandwidthGbps + ' Gbps');
    setElementText('boe-metric-cache-ram', hotDataRamGb + ' GB');
    setElementText('boe-metric-p99-latency', estimatedP99 + ' ms');

    // Update ratio and slider indicators
    setElementText('boe-rw-ratio-val', `${rwRatio}:1`);
    setElementText('boe-dau-val', formatShortNumber(dau));
    setElementText('boe-payload-val', payloadKb + ' KB');
  }

  function formatShortNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return String(num);
  }

  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // =========================================================================
  // 3. ARCHITECTURE WHITEBOARD RENDERER (SVG + CSS)
  // =========================================================================
  function renderArchitectureBoard() {
    const board = document.getElementById('workbench-canvas-container');
    if (!board) return;

    const blueprint = ARCHITECTURE_BLUEPRINTS[activeBlueprintKey];
    if (!blueprint) return;

    activeNodes = JSON.parse(JSON.stringify(blueprint.nodes));
    activeConnections = JSON.parse(JSON.stringify(blueprint.connections));

    drawSvgCanvas();
  }

  function drawSvgCanvas() {
    const svgLayer = document.getElementById('workbench-svg-layer');
    const nodesLayer = document.getElementById('workbench-nodes-layer');
    if (!svgLayer || !nodesLayer) return;

    svgLayer.innerHTML = '';
    nodesLayer.innerHTML = '';

    // Create marker definition for directional arrow
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-orange)" />
      </marker>
      <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="var(--accent-blue)" />
      </marker>
    `;
    svgLayer.appendChild(defs);

    // Map for fast node lookup
    const nodeMap = {};
    activeNodes.forEach(node => {
      nodeMap[node.id] = node;
    });

    // Draw SVG connecting lines
    activeConnections.forEach(conn => {
      const src = nodeMap[conn.from];
      const tgt = nodeMap[conn.to];
      if (!src || !tgt) return;

      const x1 = src.x + 80;
      const y1 = src.y + 35;
      const x2 = tgt.x + 80;
      const y2 = tgt.y + 35;

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      const dx = (x2 - x1) * 0.5;
      const d = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
      
      path.setAttribute("d", d);
      path.setAttribute("class", "workbench-wire");
      path.setAttribute("marker-end", "url(#arrowhead)");
      svgLayer.appendChild(path);

      // Connection label
      if (conn.label) {
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", (x1 + x2) / 2);
        text.setAttribute("y", (y1 + y2) / 2 - 8);
        text.setAttribute("class", "workbench-wire-label");
        text.setAttribute("text-anchor", "middle");
        text.textContent = conn.label;
        svgLayer.appendChild(text);
      }
    });

    // Draw HTML Tactile Node Cards
    activeNodes.forEach(node => {
      const card = document.createElement('div');
      card.className = `workbench-node-card ${selectedNodeId === node.id ? 'selected' : ''}`;
      card.id = `wb-node-${node.id}`;
      card.style.left = `${node.x}px`;
      card.style.top = `${node.y}px`;

      card.innerHTML = `
        <div class="wb-node-icon">${node.icon}</div>
        <div class="wb-node-text">
          <div class="wb-node-title">${escapeHtml(node.label)}</div>
          <div class="wb-node-type">${escapeHtml(node.type.toUpperCase())}</div>
        </div>
      `;

      // Drag mechanics
      initNodeDrag(card, node);
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        selectNode(node.id);
      });

      nodesLayer.appendChild(card);
    });
  }

  function initNodeDrag(cardElem, nodeObj) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      startX = e.clientX || (e.touches && e.touches[0].clientX);
      startY = e.clientY || (e.touches && e.touches[0].clientY);
      initialLeft = nodeObj.x;
      initialTop = nodeObj.y;
      cardElem.classList.add('dragging');
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const dx = clientX - startX;
      const dy = clientY - startY;

      nodeObj.x = Math.max(10, initialLeft + dx);
      nodeObj.y = Math.max(10, initialTop + dy);
      cardElem.style.left = `${nodeObj.x}px`;
      cardElem.style.top = `${nodeObj.y}px`;

      updateSvgLinesOnly();
    };

    const onPointerUp = () => {
      isDragging = false;
      cardElem.classList.remove('dragging');
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    cardElem.addEventListener('pointerdown', onPointerDown);
  }

  function updateSvgLinesOnly() {
    const svgLayer = document.getElementById('workbench-svg-layer');
    if (!svgLayer) return;

    const nodeMap = {};
    activeNodes.forEach(node => { nodeMap[node.id] = node; });

    const paths = svgLayer.querySelectorAll('.workbench-wire');
    const labels = svgLayer.querySelectorAll('.workbench-wire-label');

    activeConnections.forEach((conn, idx) => {
      const src = nodeMap[conn.from];
      const tgt = nodeMap[conn.to];
      if (!src || !tgt) return;

      const x1 = src.x + 80;
      const y1 = src.y + 35;
      const x2 = tgt.x + 80;
      const y2 = tgt.y + 35;
      const dx = (x2 - x1) * 0.5;

      if (paths[idx]) {
        paths[idx].setAttribute("d", `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`);
      }
      if (labels[idx]) {
        labels[idx].setAttribute("x", (x1 + x2) / 2);
        labels[idx].setAttribute("y", (y1 + y2) / 2 - 8);
      }
    });
  }

  function selectNode(id) {
    selectedNodeId = id;
    document.querySelectorAll('.workbench-node-card').forEach(c => c.classList.remove('selected'));
    const el = document.getElementById(`wb-node-${id}`);
    if (el) el.classList.add('selected');
  }

  function loadBlueprint(key) {
    if (!ARCHITECTURE_BLUEPRINTS[key]) return;
    activeBlueprintKey = key;
    const bp = ARCHITECTURE_BLUEPRINTS[key];

    // Update description and title
    setElementText('workbench-active-title', bp.name);
    setElementText('workbench-active-desc', bp.description);

    // Apply default capacity inputs
    if (bp.defaultMath) {
      setInputValue('boe-dau-input', bp.defaultMath.dau);
      setInputValue('boe-rw-ratio-input', bp.defaultMath.readWriteRatio);
      setInputValue('boe-payload-input', bp.defaultMath.payloadKb);
      setInputValue('boe-retention-input', bp.defaultMath.retentionDays);
      setInputValue('boe-replication-input', bp.defaultMath.replication);
    }

    renderArchitectureBoard();
    calculateCapacityMetrics();
  }

  function setInputValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // =========================================================================
  // 4. WORKBENCH SUB-VIEW SWITCHER
  // =========================================================================
  function switchChaosTab(tabId) {
    const chaosSim = document.getElementById('chaos-simulator-wrapper');
    const archWorkbench = document.getElementById('chaos-workbench-wrapper');
    const tabBtnSim = document.getElementById('tab-btn-chaos-sim');
    const tabBtnArch = document.getElementById('tab-btn-chaos-arch');

    if (tabId === 'arch') {
      if (chaosSim) chaosSim.style.display = 'none';
      if (archWorkbench) archWorkbench.style.display = 'block';
      if (tabBtnSim) tabBtnSim.classList.remove('active');
      if (tabBtnArch) tabBtnArch.classList.add('active');
      renderArchitectureBoard();
      calculateCapacityMetrics();
    } else {
      if (chaosSim) chaosSim.style.display = 'block';
      if (archWorkbench) archWorkbench.style.display = 'none';
      if (tabBtnSim) tabBtnSim.classList.add('active');
      if (tabBtnArch) tabBtnArch.classList.remove('active');
    }
  }

  // Expose to window
  window.initSystemWorkbench = function() {
    const selector = document.getElementById('workbench-blueprint-select');
    if (selector) {
      selector.innerHTML = Object.entries(ARCHITECTURE_BLUEPRINTS).map(([k, bp]) => 
        `<option value="${k}">${bp.name}</option>`
      ).join('');
      selector.addEventListener('change', () => loadBlueprint(selector.value));
    }

    // Attach real-time calculation listeners
    ['boe-dau-input', 'boe-rw-ratio-input', 'boe-payload-input', 'boe-retention-input', 'boe-replication-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', calculateCapacityMetrics);
      }
    });

    loadBlueprint('feature_store_triton');
  };

  window.switchChaosTab = switchChaosTab;
  window.loadArchitectureBlueprint = loadBlueprint;
  window.calculateCapacityMetrics = calculateCapacityMetrics;

  document.addEventListener('DOMContentLoaded', () => {
    if (window.initSystemWorkbench) window.initSystemWorkbench();
  });
})();
