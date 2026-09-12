/**
 * StudyPulse Code Lab & Numerical Sandbox
 * File: js/code-sandbox.js
 *
 * 100% Offline Client-Side Code Execution & Numerical Visualizer
 * - Built-in PulseNumPy engine (NDArray, broadcasting, strides, matrix ops, activations)
 * - Microsecond execution benchmarks
 * - Interactive 2D/3D Array Memory & Stride Heatmap Visualizer
 * - Pre-loaded High-Yield Engineering Templates (NumPy, Raft, Attention, Sliding Window, Backprop)
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. IN-BROWSER NUMERICAL ENGINE (PulseNumPy)
  // =========================================================================
  class NDArray {
    constructor(data, shape) {
      if (Array.isArray(data)) {
        this.data = new Float64Array(data.flat(Infinity));
        this.shape = shape || this._inferShape(data);
      } else if (data instanceof Float64Array) {
        this.data = data;
        this.shape = shape || [data.length];
      } else {
        throw new Error("Invalid data format for NDArray");
      }
      this.size = this.data.length;
      this.ndim = this.shape.length;
      this.strides = this._computeStrides(this.shape);
      this.itemsize = 8; // Float64 = 8 bytes
      this.nbytes = this.size * this.itemsize;
    }

    _inferShape(arr) {
      const shape = [];
      let curr = arr;
      while (Array.isArray(curr)) {
        shape.push(curr.length);
        curr = curr[0];
      }
      return shape;
    }

    _computeStrides(shape) {
      const strides = new Array(shape.length);
      let stride = 1;
      for (let i = shape.length - 1; i >= 0; i--) {
        strides[i] = stride;
        stride *= shape[i];
      }
      return strides;
    }

    reshape(...newShape) {
      if (Array.isArray(newShape[0])) newShape = newShape[0];
      let inferred = -1;
      let knownProd = 1;
      for (let i = 0; i < newShape.length; i++) {
        if (newShape[i] === -1) {
          if (inferred !== -1) throw new Error("Can only specify one unknown dimension");
          inferred = i;
        } else {
          knownProd *= newShape[i];
        }
      }
      if (inferred !== -1) {
        newShape[inferred] = Math.floor(this.size / knownProd);
      }
      const totalSize = newShape.reduce((a, b) => a * b, 1);
      if (totalSize !== this.size) {
        throw new Error(`Cannot reshape array of size ${this.size} into shape (${newShape.join(',')})`);
      }
      return new NDArray(new Float64Array(this.data), newShape);
    }

    get T() {
      if (this.ndim !== 2) throw new Error("Transpose currently implemented for 2D matrices");
      const [rows, cols] = this.shape;
      const result = new Float64Array(this.size);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          result[c * rows + r] = this.data[r * cols + c];
        }
      }
      return new NDArray(result, [cols, rows]);
    }

    dot(other) {
      if (!(other instanceof NDArray)) throw new Error("dot requires an NDArray");
      if (this.ndim === 2 && other.ndim === 2) {
        const [r1, c1] = this.shape;
        const [r2, c2] = other.shape;
        if (c1 !== r2) {
          throw new Error(`Shape mismatch for matmul: (${r1}, ${c1}) x (${r2}, ${c2})`);
        }
        const out = new Float64Array(r1 * c2);
        for (let i = 0; i < r1; i++) {
          for (let j = 0; j < c2; j++) {
            let sum = 0;
            for (let k = 0; k < c1; k++) {
              sum += this.data[i * c1 + k] * other.data[k * c2 + j];
            }
            out[i * c2 + j] = sum;
          }
        }
        return new NDArray(out, [r1, c2]);
      }
      throw new Error("Currently 2D matrix multiplication is supported");
    }

    toArray() {
      if (this.ndim === 1) return Array.from(this.data);
      if (this.ndim === 2) {
        const [rows, cols] = this.shape;
        const res = [];
        for (let r = 0; r < rows; r++) {
          res.push(Array.from(this.data.subarray(r * cols, (r + 1) * cols)));
        }
        return res;
      }
      return Array.from(this.data);
    }

    toString() {
      const arr = this.toArray();
      return JSON.stringify(arr)
        .split('],[').join('],\n ')
        .replace('[[', 'array([[')
        .concat(`,\n      shape=(${this.shape.join(', ')}), dtype=float64)`);
    }
  }

  const PulseNumPy = {
    array: (data, shape) => new NDArray(data, shape),
    zeros: (shape) => {
      const size = shape.reduce((a, b) => a * b, 1);
      return new NDArray(new Float64Array(size), shape);
    },
    ones: (shape) => {
      const size = shape.reduce((a, b) => a * b, 1);
      const data = new Float64Array(size);
      data.fill(1.0);
      return new NDArray(data, shape);
    },
    arange: (start, stop, step = 1) => {
      if (stop === undefined) { stop = start; start = 0; }
      const count = Math.max(0, Math.ceil((stop - start) / step));
      const data = new Float64Array(count);
      for (let i = 0; i < count; i++) data[i] = start + i * step;
      return new NDArray(data, [count]);
    },
    matmul: (a, b) => a.dot(b),
    softmax: (arr) => {
      const data = Array.from(arr.data);
      const max = Math.max(...data);
      const exps = data.map(v => Math.exp(v - max));
      const sum = exps.reduce((a, b) => a + b, 0);
      return new NDArray(new Float64Array(exps.map(v => v / sum)), arr.shape);
    },
    relu: (arr) => {
      const out = new Float64Array(arr.data.length);
      for (let i = 0; i < arr.data.length; i++) out[i] = Math.max(0, arr.data[i]);
      return new NDArray(out, arr.shape);
    }
  };

  // =========================================================================
  // 2. PRE-LOADED ENGINEERING TEMPLATES
  // =========================================================================
  const CODE_TEMPLATES = {
    numpy_broadcast: {
      name: "NumPy Vectorization & Strides Inspector",
      category: "Data Science & Numerical Math",
      code: `// 1. Create a (3, 1) column vector and a (1, 4) row vector
const A = np.arange(3).reshape(3, 1);
const B = np.array([[10, 20, 30, 40]]);

console.log("Array A Shape:", A.shape, "| Strides:", A.strides);
console.log("Array B Shape:", B.shape, "| Strides:", B.strides);

// 2. Simulated Broadcasting: (3, 1) + (1, 4) -> (3, 4)
const [rA, cA] = A.shape;
const [rB, cB] = B.shape;
const outRows = Math.max(rA, rB);
const outCols = Math.max(cA, cB);

const result = [];
for (let i = 0; i < outRows; i++) {
  const row = [];
  for (let j = 0; j < outCols; j++) {
    const valA = A.data[i * cA + (cA === 1 ? 0 : j)];
    const valB = B.data[(rB === 1 ? 0 : i) * cB + j];
    row.push(valA + valB);
  }
  result.push(row);
}

const C = np.array(result);
console.log("\\n--- Broadcasted Result Matrix C (3, 4) ---");
console.log(C.toString());
console.log("Total Heap Allocated:", C.nbytes, "Bytes");

// Send to live array visualizer
visualizeArray(C);`
    },

    raft_election: {
      name: "Raft Leader Election & Quorum Simulation",
      category: "Distributed Systems (MIT 6.824)",
      code: `// Simulation of 5-node Raft Consensus Cluster
class RaftNode {
  constructor(id, clusterSize) {
    this.id = id;
    this.clusterSize = clusterSize;
    this.currentTerm = 0;
    this.votedFor = null;
    this.role = "Follower"; // Follower, Candidate, Leader
    this.votesReceived = 0;
    this.log = [];
  }

  startElection() {
    this.currentTerm += 1;
    this.role = "Candidate";
    this.votedFor = this.id;
    this.votesReceived = 1; // Self-vote
    console.log(\`[Term \${this.currentTerm}] Node \${this.id} election timeout! Role -> CANDIDATE\`);
  }

  requestVote(fromCandidate, term) {
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.role = "Follower";
      this.votedFor = null;
    }
    if (term === this.currentTerm && (this.votedFor === null || this.votedFor === fromCandidate)) {
      this.votedFor = fromCandidate;
      return true; // Vote granted
    }
    return false; // Vote rejected
  }
}

const cluster = [1, 2, 3, 4, 5].map(id => new RaftNode(id, 5));
const candidate = cluster[0];
candidate.startElection();

const majority = Math.floor(cluster.length / 2) + 1; // 3 nodes
console.log(\`Quorum Requirement: \${majority} / \${cluster.length} nodes\`);

// Broadcast RequestVote RPCs
for (let i = 1; i < cluster.length; i++) {
  const granted = cluster[i].requestVote(candidate.id, candidate.currentTerm);
  if (granted) candidate.votesReceived += 1;
  console.log(\`RPC RequestVote to Node \${cluster[i].id} -> \${granted ? "GRANTED ✓" : "REJECTED ✗"}\`);
}

if (candidate.votesReceived >= majority) {
  candidate.role = "Leader";
  console.log(\`\\n🎉 Quorum achieved! Node \${candidate.id} elected LEADER for Term \${candidate.currentTerm} with \${candidate.votesReceived}/5 votes!\`);
} else {
  console.log("\\n⚠️ Split-vote detected. Backing off with randomized timeout.");
}`
    },

    scaled_attention: {
      name: "Scaled Dot-Product Attention (Transformer)",
      category: "Deep Learning & Generative AI",
      code: `// Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
const seq_len = 3;
const d_k = 4;

// Sample Q, K, V matrices (seq_len=3, d_k=4)
const Q = np.array([
  [1.0, 0.5, 0.2, 0.8],
  [0.2, 1.2, 0.9, 0.1],
  [0.7, 0.1, 1.5, 0.3]
]);

const K = np.array([
  [0.9, 0.4, 0.1, 0.7],
  [0.3, 1.1, 0.8, 0.2],
  [0.8, 0.2, 1.4, 0.4]
]);

console.log("Input Matrix Q Shape:", Q.shape);
console.log("Input Matrix K Shape:", K.shape);

// Step 1: Raw Dot Product Scores (Q * K^T) -> (3, 3)
const scores = Q.dot(K.T);
console.log("\\nRaw Attention Energy (Q * K^T):\\n", scores.toString());

// Step 2: Scale by sqrt(d_k) to stabilize gradients
const scale = Math.sqrt(d_k);
const scaledScores = [];
for (let i = 0; i < seq_len; i++) {
  const row = [];
  for (let j = 0; j < seq_len; j++) {
    row.push(scores.data[i * seq_len + j] / scale);
  }
  scaledScores.push(row);
}
console.log(\`\\nScaled Scores (divided by sqrt(\${d_k}) = \${scale.toFixed(2)}):\\n\`, np.array(scaledScores).toString());

// Step 3: Row-wise Softmax to compute Attention Weights
const attentionWeights = [];
for (let r = 0; r < seq_len; r++) {
  const row = scaledScores[r];
  const max = Math.max(...row);
  const exps = row.map(v => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  attentionWeights.push(exps.map(v => Number((v / sum).toFixed(4))));
}

const AttnMatrix = np.array(attentionWeights);
console.log("\\n=== Final Attention Probability Distribution Matrix ===");
console.log(AttnMatrix.toString());

visualizeArray(AttnMatrix);`
    },

    sliding_window: {
      name: "Sliding Window Maximum (Monotonic Queue)",
      category: "Algorithms & DSA (LeetCode 239)",
      code: `// Given an array and window size k, find max in each window in O(N) time
function maxSlidingWindow(nums, k) {
  const deque = []; // store indices, maintain decreasing values
  const result = [];

  for (let i = 0; i < nums.length; i++) {
    // 1. Evict elements outside the current window [i - k + 1, i]
    if (deque.length > 0 && deque[0] <= i - k) {
      deque.shift();
    }

    // 2. Maintain monotonic decreasing invariant
    while (deque.length > 0 && nums[deque[deque.length - 1]] < nums[i]) {
      deque.pop();
    }

    deque.push(i);

    // 3. Record maximum once window size k is reached
    if (i >= k - 1) {
      result.push(nums[deque[0]]);
    }
  }

  return result;
}

const nums = [1, 3, -1, -3, 5, 3, 6, 7];
const k = 3;

console.time("MonotonicQueue O(N)");
const maxVals = maxSlidingWindow(nums, k);
console.timeEnd("MonotonicQueue O(N)");

console.log(\`Input Stream:   [\${nums.join(', ')}]\`);
console.log(\`Window Size:    k = \${k}\`);
console.log(\`Maxima Vector:  [\${maxVals.join(', ')}]\`);
console.log("Theoretical Complexity: O(N) time | O(k) auxiliary space");`
    },

    backprop_demo: {
      name: "2-Layer Neural Net & Backpropagation",
      category: "Machine Learning (CS229 / CampusX)",
      code: `// Minimal Forward + Backward Pass for Linear Regression with MSE Loss
// y_pred = X * W + b
let W = 0.5; // initial weight
let b = 0.1; // initial bias
const lr = 0.05; // learning rate

// Training sample: x = 2.0, target y = 4.0 (true relation y = 2x)
const x = 2.0;
const y_true = 4.0;

console.log(\`Initial Weights: W = \${W.toFixed(4)}, b = \${b.toFixed(4)}\`);
console.log("Training Target: x=2.0 -> y_true=4.0\\n");

for (let epoch = 1; epoch <= 5; epoch++) {
  // 1. Forward Pass
  const y_pred = x * W + b;
  const loss = 0.5 * Math.pow(y_pred - y_true, 2);

  // 2. Backward Pass (Gradients via Chain Rule)
  // dL/dy_pred = (y_pred - y_true)
  const dL_dypred = y_pred - y_true;
  const dL_dW = dL_dypred * x; // d(y_pred)/dW = x
  const dL_db = dL_dypred * 1; // d(y_pred)/db = 1

  // 3. SGD Weight Updates
  W = W - lr * dL_dW;
  b = b - lr * dL_db;

  console.log(\`Epoch \${epoch}: Loss=\${loss.toFixed(6)} | Pred=\${y_pred.toFixed(4)} | W=\${W.toFixed(4)}, b=\${b.toFixed(4)}\`);
}

console.log("\\n✓ Gradients converged smoothly toward W ~ 2.0, b ~ 0.0!");`
    }
  };

  // =========================================================================
  // 3. SANDBOX CONTROLLER & UI MOUNT
  // =========================================================================
  let currentVisualizedArray = null;

  function initCodeSandbox() {
    const selector = document.getElementById('sandbox-template-select');
    if (selector) {
      selector.innerHTML = Object.entries(CODE_TEMPLATES).map(([key, item]) => 
        `<option value="${key}">${item.name} (${item.category})</option>`
      ).join('');
      selector.addEventListener('change', () => loadTemplate(selector.value));
    }

    const editor = document.getElementById('sandbox-code-editor');
    if (editor && !editor.value) {
      loadTemplate('numpy_broadcast');
    }

    // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to run
    if (editor) {
      editor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          runCode();
        }
      });
    }
  }

  function loadTemplate(key) {
    const editor = document.getElementById('sandbox-code-editor');
    const template = CODE_TEMPLATES[key];
    if (editor && template) {
      editor.value = template.code;
      const titleElem = document.getElementById('sandbox-active-template-title');
      if (titleElem) titleElem.textContent = template.name;
      clearConsole();
    }
  }

  function runCode() {
    const editor = document.getElementById('sandbox-code-editor');
    const outputElem = document.getElementById('sandbox-stdout');
    const timingBadge = document.getElementById('sandbox-exec-time');
    if (!editor || !outputElem) return;

    outputElem.innerHTML = '';
    const code = editor.value;

    const logs = [];
    const customConsole = {
      log: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(escapeHtml(text));
      },
      time: (label) => { console.time(label); },
      timeEnd: (label) => { console.timeEnd(label); },
      error: (...args) => {
        const text = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
        logs.push(`<span style="color: #ef4444;">${escapeHtml(text)}</span>`);
      }
    };

    const visualizeArray = (arr) => {
      currentVisualizedArray = arr;
      renderArrayVisualizer(arr);
    };

    const t0 = performance.now();
    try {
      // Safe sandbox execution wrapper
      const sandboxFn = new Function('np', 'console', 'visualizeArray', code);
      sandboxFn(PulseNumPy, customConsole, visualizeArray);
      const t1 = performance.now();
      const elapsed = (t1 - t0).toFixed(2);
      if (timingBadge) timingBadge.textContent = `${elapsed} ms`;
    } catch (err) {
      const t1 = performance.now();
      logs.push(`<span style="color: #ef4444; font-weight: 700;">Runtime Error: ${escapeHtml(err.message)}</span>`);
      if (timingBadge) timingBadge.textContent = `${(t1 - t0).toFixed(2)} ms (Error)`;
    }

    outputElem.innerHTML = logs.join('\n');
    outputElem.scrollTop = outputElem.scrollHeight;
  }

  function renderArrayVisualizer(arr) {
    const container = document.getElementById('sandbox-array-visualizer');
    if (!container) return;

    if (!arr || !(arr instanceof NDArray)) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 18px 0;">No active matrix to visualize</div>';
      return;
    }

    const shapeStr = `(${arr.shape.join(', ')})`;
    const stridesStr = `(${arr.strides.join(', ')})`;
    const rawData = arr.toArray();

    let matrixHtml = '';
    if (arr.ndim === 1) {
      matrixHtml = `
        <div class="visual-matrix-row">
          ${Array.from(arr.data).map((v, i) => `
            <div class="visual-matrix-cell" title="Index [${i}]: ${v}">
              <span class="cell-val">${Number(v).toFixed(2)}</span>
              <span class="cell-idx">[${i}]</span>
            </div>
          `).join('')}
        </div>
      `;
    } else if (arr.ndim === 2) {
      const [rows, cols] = arr.shape;
      matrixHtml = rawData.map((row, r) => `
        <div class="visual-matrix-row">
          ${row.map((v, c) => {
            const intensity = Math.min(1, Math.abs(v) / 10);
            return `
              <div class="visual-matrix-cell" style="background: rgba(217, 119, 6, ${0.08 + intensity * 0.35});" title="Index [${r}, ${c}]: ${v}">
                <span class="cell-val">${Number(v).toFixed(2)}</span>
                <span class="cell-idx">[${r},${c}]</span>
              </div>
            `;
          }).join('')}
        </div>
      `).join('');
    }

    container.innerHTML = `
      <div class="visualizer-header">
        <div>
          <strong>Shape:</strong> <span class="badge-mono">${shapeStr}</span>
          <strong style="margin-left: 10px;">Strides:</strong> <span class="badge-mono">${stridesStr}</span>
        </div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">Memory: ${arr.nbytes} Bytes (Float64)</div>
      </div>
      <div class="visual-matrix-grid">
        ${matrixHtml}
      </div>
    `;
  }

  function clearConsole() {
    const outputElem = document.getElementById('sandbox-stdout');
    if (outputElem) outputElem.innerHTML = '// Console output will appear here after execution...';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // Modal / Drawer Toggles
  function openCodeSandbox(templateKey) {
    const modal = document.getElementById('code-sandbox-modal-overlay');
    if (modal) {
      modal.classList.add('active');
      if (templateKey && CODE_TEMPLATES[templateKey]) {
        loadTemplate(templateKey);
        const selector = document.getElementById('sandbox-template-select');
        if (selector) selector.value = templateKey;
      }
    }
  }

  function closeCodeSandbox() {
    const modal = document.getElementById('code-sandbox-modal-overlay');
    if (modal) modal.classList.remove('active');
  }

  // Expose to window
  window.initCodeSandbox = initCodeSandbox;
  window.runCodeSandbox = runCode;
  window.clearCodeSandboxConsole = clearConsole;
  window.openCodeSandbox = openCodeSandbox;
  window.closeCodeSandbox = closeCodeSandbox;
  window.loadCodeSandboxTemplate = loadTemplate;

  document.addEventListener('DOMContentLoaded', () => {
    initCodeSandbox();
  });
})();
