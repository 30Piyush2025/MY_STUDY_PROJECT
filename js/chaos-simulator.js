/**
 * StudyPulse System Design Chaos Simulator
 * Interactive Distributed Systems Canvas & Chaos Engineering Lab
 */

(function() {
  "use strict";

  const ARCHITECTURES = {
    gateway: {
      name: "High-Throughput API Gateway & Cache Cluster",
      desc: "Distributed ingress handling 100k+ RPS with token-bucket rate limiting, Redis caching, and master-replica Postgres storage.",
      nodes: [
        { id: "client", label: "Client Ingress", type: "client", x: 80, y: 190, rps: 8400, lat: 12, cpu: 15, status: "HEALTHY", info: "Simulated global client traffic from mobile, web, and IoT endpoints." },
        { id: "waf", label: "Cloudflare WAF / CDN", type: "gateway", x: 220, y: 190, rps: 8400, lat: 8, cpu: 22, status: "HEALTHY", info: "Edge caching, DDoS mitigation, TLS termination, and geo-routing." },
        { id: "gw", label: "Nginx API Gateway", type: "gateway", x: 370, y: 190, rps: 8400, lat: 18, cpu: 42, status: "HEALTHY", info: "Token-bucket rate limiting (10k RPS cap), JWT authentication, reverse proxy routing." },
        { id: "app1", label: "App Server Alpha", type: "service", x: 530, y: 110, rps: 4200, lat: 24, cpu: 48, status: "HEALTHY", info: "Stateless microservice container handling query processing and business logic." },
        { id: "app2", label: "App Server Beta", type: "service", x: 530, y: 270, rps: 4200, lat: 26, cpu: 45, status: "HEALTHY", info: "Stateless microservice container handling mutations and user state." },
        { id: "redis", label: "Redis Cluster (L2 Cache)", type: "cache", x: 700, y: 110, rps: 7600, lat: 2, cpu: 32, status: "HEALTHY", info: "In-memory LRU key-value store achieving 91% cache hit ratio." },
        { id: "pg_master", label: "Postgres Primary (Leader)", type: "database", x: 700, y: 270, rps: 800, lat: 38, cpu: 52, status: "HEALTHY", info: "ACID relational primary accepting writes with WAL streaming replication." },
        { id: "pg_replica", label: "Postgres Read-Replica", type: "database", x: 860, y: 270, rps: 1800, lat: 22, cpu: 35, status: "HEALTHY", info: "Asynchronous read replica offloading analytical and list queries." }
      ],
      links: [
        { from: "client", to: "waf" },
        { from: "waf", to: "gw" },
        { from: "gw", to: "app1" },
        { from: "gw", to: "app2" },
        { from: "app1", to: "redis" },
        { from: "app2", to: "redis" },
        { from: "app1", to: "pg_master" },
        { from: "app2", to: "pg_master" },
        { from: "pg_master", to: "pg_replica", dashed: true }
      ]
    },
    raft: {
      name: "Raft Distributed Consensus & Leader Quorum",
      desc: "CP consensus algorithm ensuring state machine safety across 5 distributed nodes under network partition and node failures.",
      nodes: [
        { id: "raft1", label: "Node 1 [LEADER - Term 5]", type: "leader", x: 480, y: 80, rps: 5200, lat: 14, cpu: 54, status: "HEALTHY", info: "Elected Leader emitting periodic AppendEntries heartbeats (every 50ms) to maintain term authority." },
        { id: "raft2", label: "Node 2 [FOLLOWER - Term 5]", type: "follower", x: 260, y: 180, rps: 2600, lat: 18, cpu: 32, status: "HEALTHY", info: "Follower replicating committed log entries. Election timer reset upon valid heartbeat." },
        { id: "raft3", label: "Node 3 [FOLLOWER - Term 5]", type: "follower", x: 700, y: 180, rps: 2600, lat: 19, cpu: 30, status: "HEALTHY", info: "Follower in quorum. Contributes to majority commit acknowledgment." },
        { id: "raft4", label: "Node 4 [FOLLOWER - Term 5]", type: "follower", x: 330, y: 310, rps: 2600, lat: 21, cpu: 28, status: "HEALTHY", info: "Follower node with persisted WAL state and matchIndex pointer." },
        { id: "raft5", label: "Node 5 [FOLLOWER - Term 5]", type: "follower", x: 630, y: 310, rps: 2600, lat: 20, cpu: 29, status: "HEALTHY", info: "Follower node participating in quorum consensus." }
      ],
      links: [
        { from: "raft1", to: "raft2" },
        { from: "raft1", to: "raft3" },
        { from: "raft1", to: "raft4" },
        { from: "raft1", to: "raft5" },
        { from: "raft2", to: "raft4", dashed: true },
        { from: "raft3", to: "raft5", dashed: true }
      ]
    },
    kafka: {
      name: "Event-Driven Microservices with Kafka Streaming",
      desc: "High-throughput pub/sub log partition pipeline with consumer group rebalancing and stream processing.",
      nodes: [
        { id: "k_prod1", label: "Order Service Producer", type: "client", x: 100, y: 120, rps: 4500, lat: 15, cpu: 38, status: "HEALTHY", info: "Emits purchase events with idempotent producer keys." },
        { id: "k_prod2", label: "User Activity Ingress", type: "client", x: 100, y: 260, rps: 6200, lat: 12, cpu: 41, status: "HEALTHY", info: "High-volume clickstream telemetry ingestion." },
        { id: "k_b1", label: "Kafka Broker 1 (P0 Leader)", type: "gateway", x: 360, y: 110, rps: 5350, lat: 5, cpu: 44, status: "HEALTHY", info: "Leader broker for Partition 0 of orders-topic with zero-copy pagecache writes." },
        { id: "k_b2", label: "Kafka Broker 2 (P1 Leader)", type: "gateway", x: 360, y: 270, rps: 5350, lat: 6, cpu: 46, status: "HEALTHY", info: "Leader broker for Partition 1 with ISR (In-Sync-Replicas) factor = 3." },
        { id: "k_flink", label: "Apache Flink (Realtime CEP)", type: "service", x: 620, y: 110, rps: 4800, lat: 18, cpu: 65, status: "HEALTHY", info: "Stateful stream processing detecting fraud in sliding 60s windows." },
        { id: "k_notif", label: "Notification Consumer Group", type: "service", x: 620, y: 270, rps: 3200, lat: 25, cpu: 34, status: "HEALTHY", info: "Consumer group autoscaling pods to dispatch push notifications & SMS." },
        { id: "k_lake", label: "ClickHouse OLAP Storage", type: "database", x: 860, y: 190, rps: 8000, lat: 30, cpu: 55, status: "HEALTHY", info: "Columnar store powering real-time executive dashboards and user analytics." }
      ],
      links: [
        { from: "k_prod1", to: "k_b1" },
        { from: "k_prod2", to: "k_b2" },
        { from: "k_b1", to: "k_flink" },
        { from: "k_b2", to: "k_flink" },
        { from: "k_b2", to: "k_notif" },
        { from: "k_flink", to: "k_lake" },
        { from: "k_notif", to: "k_lake", dashed: true }
      ]
    }
  };

  let currentArchKey = "gateway";
  let canvas = null;
  let ctx = null;
  let animId = null;
  let nodes = [];
  let links = [];
  let packets = [];
  let selectedNode = null;
  let isDraggingNode = null;
  let dragOffset = { x: 0, y: 0 };
  let chaosState = {
    trafficSpike: false,
    latencyJitter: false,
    raftTerm: 5,
    circuitBreaker: "CLOSED",
    rpsMultiplier: 1.0
  };

  const TYPE_COLORS = {
    client: { bg: "#0284c7", border: "#38bdf8", glow: "rgba(56, 189, 248, 0.4)" },
    gateway: { bg: "#0d9488", border: "#2dd4bf", glow: "rgba(45, 212, 191, 0.4)" },
    service: { bg: "#4f46e5", border: "#818cf8", glow: "rgba(129, 140, 248, 0.4)" },
    cache: { bg: "#ea580c", border: "#fb923c", glow: "rgba(251, 146, 60, 0.4)" },
    database: { bg: "#9333ea", border: "#c084fc", glow: "rgba(192, 132, 252, 0.4)" },
    leader: { bg: "#16a34a", border: "#4ade80", glow: "rgba(74, 222, 128, 0.5)" },
    follower: { bg: "#2563eb", border: "#60a5fa", glow: "rgba(96, 165, 250, 0.4)" }
  };

  function initChaosSimulator(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.id = "chaos-sim-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "390px";
    canvas.style.display = "block";
    canvas.style.cursor = "crosshair";
    container.appendChild(canvas);

    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    loadArchitecture(currentArchKey);
    bindCanvasEvents();

    if (animId) cancelAnimationFrame(animId);
    renderLoop();

    logChaosConsole("Simulator initialized. Distributed topology online.");
  }

  function resizeCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = (rect.width || 900) * dpr;
    canvas.height = 390 * dpr;
    ctx.scale(dpr, dpr);
  }

  function loadArchitecture(archKey) {
    currentArchKey = archKey;
    const arch = ARCHITECTURES[archKey];
    if (!arch) return;

    nodes = JSON.parse(JSON.stringify(arch.nodes));
    links = JSON.parse(JSON.stringify(arch.links));
    packets = [];
    selectedNode = nodes[0];
    chaosState.trafficSpike = false;
    chaosState.latencyJitter = false;
    chaosState.circuitBreaker = "CLOSED";
    chaosState.rpsMultiplier = 1.0;

    const titleEl = document.getElementById("chaos-arch-title");
    const descEl = document.getElementById("chaos-arch-desc");
    if (titleEl) titleEl.textContent = arch.name;
    if (descEl) descEl.textContent = arch.desc;

    updateTelemetryUI(selectedNode);
    updateTopStatBar();
    logChaosConsole(`Loaded architecture: ${arch.name}`);
  }

  function spawnPacket() {
    if (links.length === 0) return;
    const link = links[Math.floor(Math.random() * links.length)];
    const fromNode = nodes.find(n => n.id === link.from);
    const toNode = nodes.find(n => n.id === link.to);
    if (!fromNode || !toNode || fromNode.status === "OFFLINE" || toNode.status === "OFFLINE") return;

    const speed = (chaosState.latencyJitter ? 0.007 : 0.02) * (chaosState.trafficSpike ? 2.2 : 1.0);
    const isError = (toNode.status === "RATE_LIMITED" || (chaosState.circuitBreaker === "OPEN" && toNode.type === "service"));

    packets.push({
      fromNode,
      toNode,
      progress: 0,
      speed,
      color: isError ? "#f43f5e" : (fromNode.type === "database" ? "#c084fc" : "#38bdf8"),
      size: chaosState.trafficSpike ? 3.5 : 2.5,
      isError
    });
  }

  function renderLoop() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = 390;

    ctx.clearRect(0, 0, w, h);

    // Subtle cyber grid
    ctx.strokeStyle = "rgba(30, 41, 59, 0.45)";
    ctx.lineWidth = 1;
    const gridSpacing = 40;
    for (let x = 0; x < w; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Links
    links.forEach(link => {
      const from = nodes.find(n => n.id === link.from);
      const to = nodes.find(n => n.id === link.to);
      if (!from || !to) return;

      const isBroken = from.status === "OFFLINE" || to.status === "OFFLINE";
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (isBroken) {
        ctx.strokeStyle = "rgba(244, 63, 94, 0.3)";
        ctx.setLineDash([4, 6]);
      } else if (link.dashed) {
        ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
        ctx.setLineDash([6, 6]);
      } else {
        ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      }
      ctx.lineWidth = isBroken ? 1 : 1.8;
      ctx.stroke();
      ctx.restore();
    });

    // Spawn packets
    const spawnRate = chaosState.trafficSpike ? 0.35 : 0.08;
    if (Math.random() < spawnRate) spawnPacket();

    // Packets
    for (let i = packets.length - 1; i >= 0; i--) {
      const p = packets[i];
      p.progress += p.speed;

      if (p.progress >= 1) {
        packets.splice(i, 1);
        continue;
      }

      const curX = p.fromNode.x + (p.toNode.x - p.fromNode.x) * p.progress;
      const curY = p.fromNode.y + (p.toNode.y - p.fromNode.y) * p.progress;

      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Nodes
    nodes.forEach(node => {
      const isSelected = selectedNode && selectedNode.id === node.id;
      const col = TYPE_COLORS[node.type] || TYPE_COLORS.service;

      let borderColor = col.border;
      let bgColor = col.bg;
      let glowColor = col.glow;

      if (node.status === "OFFLINE") {
        borderColor = "#f43f5e";
        bgColor = "#881337";
        glowColor = "rgba(244, 63, 94, 0.6)";
      } else if (node.status === "RATE_LIMITED") {
        borderColor = "#f59e0b";
        bgColor = "#78350f";
        glowColor = "rgba(245, 158, 11, 0.6)";
      } else if (node.status === "ELECTING") {
        borderColor = "#c084fc";
        bgColor = "#581c87";
        glowColor = "rgba(192, 132, 252, 0.7)";
      }

      if (isSelected) {
        ctx.save();
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#38bdf8";
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 28, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const symbol = node.status === "OFFLINE" ? "✕" : (node.type === "database" ? "DB" : (node.type === "cache" ? "⚡" : (node.type === "leader" ? "👑" : "●")));
      ctx.fillText(symbol, node.x, node.y);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = isSelected ? "#38bdf8" : "#e2e8f0";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(node.label, node.x, node.y + 32);

      ctx.fillStyle = node.status === "OFFLINE" ? "#f87171" : (node.status === "RATE_LIMITED" ? "#fbbf24" : "#4ade80");
      ctx.font = "500 9px monospace";
      ctx.fillText(node.status, node.x, node.y + 44);
      ctx.restore();
    });

    animId = requestAnimationFrame(renderLoop);
  }

  function bindCanvasEvents() {
    canvas.addEventListener("mousedown", (e) => {
      const pos = getMousePos(e);
      const clicked = findNodeAt(pos.x, pos.y);
      if (clicked) {
        selectedNode = clicked;
        isDraggingNode = clicked;
        dragOffset = { x: clicked.x - pos.x, y: clicked.y - pos.y };
        updateTelemetryUI(clicked);
      }
    });

    window.addEventListener("mousemove", (e) => {
      if (isDraggingNode) {
        const pos = getMousePos(e);
        isDraggingNode.x = pos.x + dragOffset.x;
        isDraggingNode.y = pos.y + dragOffset.y;
      }
    });

    window.addEventListener("mouseup", () => {
      isDraggingNode = null;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (!isDraggingNode) {
        const pos = getMousePos(e);
        const hovered = findNodeAt(pos.x, pos.y);
        canvas.style.cursor = hovered ? "pointer" : "crosshair";
      }
    });
  }

  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function findNodeAt(x, y) {
    return nodes.find(n => {
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= 26;
    });
  }

  function chaosInjectTrafficSpike() {
    chaosState.trafficSpike = true;
    chaosState.rpsMultiplier = 4.5;

    nodes.forEach(n => {
      if (n.type === "gateway") {
        n.status = "RATE_LIMITED";
        n.rps = 24000;
        n.cpu = 89;
      } else if (n.type === "cache") {
        n.rps = 18500;
        n.cpu = 72;
      } else if (n.status !== "OFFLINE") {
        n.rps = Math.round(n.rps * 3.5);
        n.cpu = Math.min(95, n.cpu + 35);
      }
    });

    updateTelemetryUI(selectedNode);
    updateTopStatBar();
    logChaosConsole("⚠️ [CHAOS SPIKE] 100,000 RPS surge injected! Token bucket gateway shedding 14,200 requests/sec with HTTP 429.");
    if (window.showToast) window.showToast("💥 100k RPS Surge Injected: Rate limiters engaged!");
  }

  function chaosKillLeaderNode() {
    let target = null;
    if (currentArchKey === "raft") {
      target = nodes.find(n => n.type === "leader" && n.status !== "OFFLINE");
      if (!target) target = nodes[0];
    } else if (currentArchKey === "gateway") {
      target = nodes.find(n => n.id === "pg_master");
    } else {
      target = nodes.find(n => n.id === "k_b1");
    }

    if (!target) return;
    target.status = "OFFLINE";
    target.cpu = 0;
    target.rps = 0;

    logChaosConsole(`🚨 [NODE TERMINATION] Severed ${target.label}! Heartbeats timed out.`);

    if (currentArchKey === "raft") {
      chaosState.raftTerm++;
      const candidate = nodes.find(n => n.id !== target.id && n.status !== "OFFLINE");
      if (candidate) {
        candidate.status = "ELECTING";
        logChaosConsole(`🗳️ [RAFT ELECTION] Node ${candidate.label} timed out, transitioned to CANDIDATE for Term ${chaosState.raftTerm}.`);

        setTimeout(() => {
          candidate.type = "leader";
          candidate.status = "HEALTHY";
          candidate.label = `Node ${candidate.id.replace("raft", "")} [LEADER - Term ${chaosState.raftTerm}]`;
          candidate.rps = 5800;
          candidate.cpu = 58;
          logChaosConsole(`👑 [CONSENSUS WON] Candidate received 3/5 quorum votes! Promoted to new LEADER.`);
          updateTelemetryUI(selectedNode);
          updateTopStatBar();
          if (window.showToast) window.showToast(`👑 New Raft Leader elected for Term ${chaosState.raftTerm}!`);
        }, 1200);
      }
    } else if (currentArchKey === "gateway") {
      const replica = nodes.find(n => n.id === "pg_replica");
      if (replica) {
        replica.status = "ELECTING";
        setTimeout(() => {
          replica.label = "Postgres Primary (Promoted Leader)";
          replica.status = "HEALTHY";
          replica.rps = 2200;
          logChaosConsole("🔄 [FAILOVER SUCCESS] Standby replica promoted to Primary via Patroni DCS quorum!");
          updateTelemetryUI(selectedNode);
          updateTopStatBar();
          if (window.showToast) window.showToast("🔄 Standby Replica promoted to Master!");
        }, 1100);
      }
    }

    updateTelemetryUI(selectedNode);
    updateTopStatBar();
  }

  function chaosInjectLatencyJitter() {
    chaosState.latencyJitter = true;
    chaosState.circuitBreaker = "OPEN";

    nodes.forEach(n => {
      n.lat = Math.round(n.lat * 4.8 + 180);
      if (n.type === "service") n.status = "RATE_LIMITED";
    });

    updateTelemetryUI(selectedNode);
    updateTopStatBar();
    logChaosConsole("🐢 [NETWORK DEGRADATION] Injected 250ms cross-AZ jitter. Circuit breaker tripped to OPEN state!");
    if (window.showToast) window.showToast("🐢 Latency Jitter Active: Circuit breaker TRIPPED!");
  }

  function chaosHealCluster() {
    chaosState.trafficSpike = false;
    chaosState.latencyJitter = false;
    chaosState.circuitBreaker = "CLOSED";
    chaosState.rpsMultiplier = 1.0;

    const pristine = ARCHITECTURES[currentArchKey];
    nodes = JSON.parse(JSON.stringify(pristine.nodes));
    links = JSON.parse(JSON.stringify(pristine.links));
    selectedNode = nodes[0];

    updateTelemetryUI(selectedNode);
    updateTopStatBar();
    logChaosConsole("🛡️ [HEALED] Cluster restored to 100% nominal state. All nodes green.");
    if (window.showToast) window.showToast("🛡️ Cluster fully healed & operational!");
  }

  function updateTelemetryUI(node) {
    if (!node) return;
    const nameEl = document.getElementById("chaos-node-name");
    const typeEl = document.getElementById("chaos-node-type");
    const statusEl = document.getElementById("chaos-node-status");
    const rpsEl = document.getElementById("chaos-node-rps");
    const latEl = document.getElementById("chaos-node-lat");
    const cpuEl = document.getElementById("chaos-node-cpu");
    const infoEl = document.getElementById("chaos-node-info");

    if (nameEl) nameEl.textContent = node.label;
    if (typeEl) typeEl.textContent = node.type.toUpperCase();
    if (statusEl) {
      statusEl.textContent = node.status;
      statusEl.className = "metric-delta " + (node.status === "HEALTHY" ? "pos" : "neg");
    }
    if (rpsEl) rpsEl.textContent = (node.rps || 0).toLocaleString() + " req/s";
    if (latEl) latEl.textContent = (node.lat || 0) + " ms";
    if (cpuEl) cpuEl.textContent = (node.cpu || 0) + "%";
    if (infoEl) infoEl.textContent = node.info || "Component operational in distributed cluster.";
  }

  function updateTopStatBar() {
    const totalRpsEl = document.getElementById("chaos-stat-total-rps");
    const healthEl = document.getElementById("chaos-stat-health");
    const circuitEl = document.getElementById("chaos-stat-circuit");

    const totalRps = nodes.reduce((sum, n) => sum + (n.status !== "OFFLINE" ? n.rps : 0), 0);
    const healthyCount = nodes.filter(n => n.status === "HEALTHY").length;
    const healthPct = Math.round((healthyCount / nodes.length) * 100);

    if (totalRpsEl) totalRpsEl.textContent = totalRps.toLocaleString() + " RPS";
    if (healthEl) healthEl.textContent = healthPct + "% ONLINE";
    if (circuitEl) circuitEl.textContent = chaosState.circuitBreaker;
  }

  function logChaosConsole(msg) {
    const logContainer = document.getElementById("chaos-console-logs");
    if (!logContainer) return;
    const timestamp = new Date().toTimeString().split(" ")[0];
    const line = document.createElement("div");
    line.className = "chaos-log-line";
    line.innerHTML = `<span style="color: #64748b;">[${timestamp}]</span> ${escapeHtml(msg)}`;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  window.initChaosSimulator = initChaosSimulator;
  window.loadChaosArchitecture = (key) => {
    loadArchitecture(key);
    document.querySelectorAll(".btn-arch-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.arch === key);
    });
  };
  window.chaosInjectTrafficSpike = chaosInjectTrafficSpike;
  window.chaosKillLeaderNode = chaosKillLeaderNode;
  window.chaosInjectLatencyJitter = chaosInjectLatencyJitter;
  window.chaosHealCluster = chaosHealCluster;

})();
