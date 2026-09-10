/**
 * StudyPulse 3D Bookshelf Engine
 * High-Reliability Interactive Three.js WebGL Bookshelf with 18 Curriculum Volumes
 */

(function() {
  'use strict';

  // 18 Book Definitions
  const BOOK_DATA = [
    {
      id: "book-dsa",
      num: "01",
      code: "VOL. 01 / DSA",
      topic: "Data Structures & LeetCode",
      shortTitle: "DSA & LeetCode",
      track: "ALGORITHMS & CODING",
      color: 0x8b261d,
      hexColor: "#8b261d",
      subtitle: "Core data structures, algorithm mechanics, and interview problem solving.",
      curriculum: "Krish Naik DSA Bootcamp · 36 Masterclasses · 45 Hours",
      status: "CORE FOUNDATION",
      concepts: [
        "Arrays, Strings, Two-Pointer technique & Sliding Window algorithms",
        "Linked Lists (Singly, Doubly, Circular), Floyd's Cycle Detection",
        "Stacks, Queues, Monotonic stacks, and expression evaluation",
        "Trees, Binary Search Trees, Heaps, and Priority Queue scheduling"
      ],
      formula: "Binary Search: O(log n) · QuickSort Avg: O(n log n) · Tree Traversal: O(n)",
      progress: "10 Core Modules · 45h Content",
      notes: "Extensive problem-solving on LeetCode Medium/Hard interview patterns."
    },
    {
      id: "book-py",
      num: "02",
      code: "VOL. 02 / PYTHON",
      topic: "Python & Memory Architecture",
      shortTitle: "Python Core",
      track: "SYSTEMS & LANGUAGES",
      color: 0x2b4c3f,
      hexColor: "#2b4c3f",
      subtitle: "Language internals, bytecode execution, and memory reference models.",
      curriculum: "CampusX DSMP Week 1-2 · 11 Lectures · 18 Hours",
      status: "COMPLETED",
      concepts: [
        "CPython memory allocator, reference counting & cyclic GC",
        "Data structures: List, Tuple, Set, Dictionary implementations",
        "Hashing internals: dict hash table collision resolution",
        "Variable scopes, LEGB rule, and mutability semantics"
      ],
      formula: "List Append Amortized: O(1) · Dict Lookup Avg: O(1)",
      progress: "100% Mastered · Production Proven",
      notes: "Daily driver language for all backend, agentic, and ML pipelines."
    },
    {
      id: "book-adv-py",
      num: "03",
      code: "VOL. 03 / ADV-PY",
      topic: "Advanced Python & OOP",
      shortTitle: "Advanced Python",
      track: "OBJECT ARCHITECTURE",
      color: 0x5c3a21,
      hexColor: "#5c3a21",
      subtitle: "Metaprogramming, dunder methods, decorators, and design patterns.",
      curriculum: "CampusX DSMP Week 3-4 · 14 Lectures · 20.8 Hours",
      status: "COMPLETED",
      concepts: [
        "Object-Oriented Programming: Class hierarchies, Dunder/Magic methods",
        "Method Resolution Order (MRO), C3 Linearization algorithm",
        "Decorators, closures, functools.wraps, and generator pipelines",
        "File I/O, Serialization (pickle, json), and Exception architectures"
      ],
      formula: "Polymorphism + Composition over Inheritance",
      progress: "100% Mastered · Banking Application Built",
      notes: "Architecture foundation for clean modular AI frameworks."
    },
    {
      id: "book-numpy",
      num: "04",
      code: "VOL. 04 / NUMPY",
      topic: "NumPy & Scientific Computing",
      shortTitle: "NumPy Engine",
      track: "NUMERICAL COMPUTATION",
      color: 0x36454f,
      hexColor: "#36454f",
      subtitle: "N-dimensional arrays, vectorization mechanics, and SIMD operations.",
      curriculum: "CampusX DSMP Week 5 · 4 Lectures · 7.5 Hours",
      status: "COMPLETED",
      concepts: [
        "NumPy ndarray memory layout: strides, buffer protocol, C vs Fortran order",
        "Universal functions (ufuncs), broadcasting rules & vectorization",
        "Matrix operations, slicing, fancy indexing, and boolean masking",
        "Memory-efficient operations avoiding unnecessary array copying"
      ],
      formula: "Broadcasting: Dimensions compatible when equal or one is 1",
      progress: "100% Mastered · Vectorized Pipelines",
      notes: "High-performance vector operations underlying all ML libraries."
    },
    {
      id: "book-pandas",
      num: "05",
      code: "VOL. 05 / PANDAS",
      topic: "Pandas & Data Wrangling",
      shortTitle: "Pandas Wrangling",
      track: "DATA ENGINEERING",
      color: 0x7c3f58,
      hexColor: "#7c3f58",
      subtitle: "High-performance data manipulation, multi-indexing, and ETL workflows.",
      curriculum: "CampusX DSMP Week 6-8 · 15 Lectures · 17.4 Hours",
      status: "COMPLETED",
      concepts: [
        "Series & DataFrame data structures, index alignment mechanics",
        "MultiIndex Series & DataFrames, unstack, stack, and melt",
        "GroupBy split-apply-combine lifecycle and custom aggregations",
        "Merging, Joining, Concatenating, and Vectorized string operations"
      ],
      formula: "DataFrame: Split -> Apply -> Combine Architecture",
      progress: "100% Mastered · Complex Datasets Cleaned",
      notes: "Core tool for data preparation in SIH 2026 and Capstone."
    },
    {
      id: "book-viz",
      num: "06",
      code: "VOL. 06 / VIZ-EDA",
      topic: "Data Visualization & EDA",
      shortTitle: "Viz & EDA",
      track: "ANALYTICAL INTELLIGENCE",
      color: 0x196f3d,
      hexColor: "#196f3d",
      subtitle: "Exploratory data analysis, statistical plotting, and interactive visual storytelling.",
      curriculum: "CampusX DSMP Week 9-12 · 20 Lectures · 22.8 Hours",
      status: "COMPLETED",
      concepts: [
        "Matplotlib custom figure geometry, subplots, and 3D projections",
        "Seaborn categorical, distribution, and relational visualizations",
        "Interactive analytics dashboards with Plotly Express",
        "End-to-end EDA: Univariate, Bivariate, Multivariate & Outlier removal"
      ],
      formula: "IQR Rule: [Q1 - 1.5*IQR, Q3 + 1.5*IQR] · Z-score > 3",
      progress: "100% Mastered · EDA Portfolios Built",
      notes: "Delivered analytical insights for national-level hackathons."
    },
    {
      id: "book-sql",
      num: "07",
      code: "VOL. 07 / SQL",
      topic: "SQL & Relational Intelligence",
      shortTitle: "SQL Mastery",
      track: "DATABASE SYSTEMS",
      color: 0x7d6608,
      hexColor: "#7d6608",
      subtitle: "Complex relational queries, analytical window functions, and query optimization.",
      curriculum: "CampusX DSMP Week 13-16 · 16 Lectures · 23.0 Hours",
      status: "COMPLETED",
      concepts: [
        "Relational algebra, normalization (1NF through BCNF), foreign keys",
        "Window functions: ROW_NUMBER(), RANK(), DENSE_RANK(), LEAD(), LAG()",
        "Common Table Expressions (CTEs), recursive queries, and subqueries",
        "B-Tree index architecture, EXPLAIN ANALYZE, and execution plans"
      ],
      formula: "Window Syntax: OVER (PARTITION BY col ORDER BY col ROWS BETWEEN)",
      progress: "100% Mastered · High-Query Fluency",
      notes: "PostgreSQL & MySQL production database integration."
    },
    {
      id: "book-linalg",
      num: "08",
      code: "VOL. 08 / LINALG",
      topic: "Linear Algebra & Vector Calculus",
      shortTitle: "Linear Algebra",
      track: "MATHEMATICAL FOUNDATIONS",
      color: 0x5b2c6f,
      hexColor: "#5b2c6f",
      subtitle: "Matrix decompositions, vector spaces, eigenvalues, and gradient optimization.",
      curriculum: "CampusX Week 22 + Krish Naik Math · 36 Lectures · 43.3 Hours",
      status: "COMPLETED",
      concepts: [
        "Vector spaces, linear independence, span, basis, and dimensions",
        "Matrix transformations, determinants, rank, and inverse derivations",
        "Eigenvalues, Eigenvectors, and Principal Component Analysis (PCA)",
        "Partial derivatives, gradients, Jacobian, and Hessian matrices"
      ],
      formula: "Eigen equation: A*v = lambda*v · Gradient: grad(f) = [df/dx1, df/dx2...]",
      progress: "Mathematical Foundations Verified",
      notes: "Rigorous mathematical intuition backing all machine learning models."
    },
    {
      id: "book-stats",
      num: "09",
      code: "VOL. 09 / STATS",
      topic: "Probability & Inferential Stats",
      shortTitle: "Probability & Stats",
      track: "STATISTICAL RIGOR",
      color: 0x935116,
      hexColor: "#935116",
      subtitle: "Probability distributions, Central Limit Theorem, and hypothesis testing.",
      curriculum: "CampusX DSMP Week 17-21 · 17 Lectures · 30.0 Hours",
      status: "COMPLETED",
      concepts: [
        "Probability distributions: Normal, Gaussian, Binomial, Poisson, Exponential",
        "Central Limit Theorem (CLT), law of large numbers, standard error",
        "Hypothesis testing: Null vs Alternative, Type I & II errors, p-values",
        "Statistical tests: Z-test, One/Two-sample t-test, Paired t-test, ANOVA, Chi-Square"
      ],
      formula: "Z = (X_bar - mu) / (sigma / sqrt(n)) · p < alpha (Reject H0)",
      progress: "100% Mastered · Statistical Validation",
      notes: "Essential for A/B testing and model evaluation significance."
    },
    {
      id: "book-ml",
      num: "10",
      code: "VOL. 10 / ML-CORE",
      topic: "Machine Learning Core Algorithms",
      shortTitle: "Machine Learning",
      track: "PREDICTIVE ALGORITHMS",
      color: 0x2c3e50,
      hexColor: "#2c3e50",
      subtitle: "Mathematical derivation and implementation of supervised & unsupervised algorithms.",
      curriculum: "CampusX DSMP Week 23-35 · 80 Lectures · 118.3 Hours",
      status: "COMPLETED",
      concepts: [
        "Linear Regression (OLS, Normal Equation, Gradient Descent variants)",
        "Regularization: Ridge (L2), Lasso (L1 - feature selection), ElasticNet",
        "Logistic Regression, Softmax, ROC-AUC curves, Confusion Matrices",
        "Decision Trees (ID3, C4.5, CART, Gini Impurity, Information Gain)",
        "Support Vector Machines (Max-margin hyperplanes, Kernel trick)",
        "Ensemble methods: Bagging, Random Forests, Out-of-Bag error"
      ],
      formula: "Loss: J(w) = 1/2m * sum(h(x) - y)^2 + lambda * sum(w_j^2)",
      progress: "80 Lectures Mastered · Full Derivations",
      notes: "Complete theoretical derivations from scratch in Python."
    },
    {
      id: "book-boosting",
      num: "11",
      code: "VOL. 11 / BOOSTING",
      topic: "Gradient Boosting & XGBoost",
      shortTitle: "Boosting & XGBoost",
      track: "ADVANCED ML",
      color: 0x8a6240,
      hexColor: "#8a6240",
      subtitle: "Mathematical formulation of Gradient Boosting, Pseudo Residuals, and XGBoost.",
      curriculum: "CampusX DSMP Week 36 + XGBoost · 9 Lectures · 13.5 Hours",
      status: "COMPLETED",
      concepts: [
        "Boosting philosophy: Sequential weak learners minimizing residual loss",
        "Gradient Boosting math: Taylor Series approximation, Pseudo Residuals",
        "Step-by-step mathematical formulation for Regression & Classification",
        "XGBoost architecture: Similarity Score, Gain, pruning & regularization"
      ],
      formula: "Similarity Score = (sum g_i)^2 / (sum h_i + lambda) · Gain = Left + Right - Root",
      progress: "Mathematical Derivations Mastered",
      notes: "Industry gold standard for tabular competitive data science."
    },
    {
      id: "book-capstone",
      num: "12",
      code: "VOL. 12 / CAPSTONE",
      topic: "End-to-End Industry Capstone",
      shortTitle: "Real Estate Capstone",
      track: "PRODUCTION SYSTEMS",
      color: 0x1f618d,
      hexColor: "#1f618d",
      subtitle: "Full-cycle real estate property intelligence, recommender system & cloud deployment.",
      curriculum: "CampusX DSMP Capstone · 13 Masterclass Sessions · 17.2 Hours",
      status: "COMPLETED",
      concepts: [
        "Data scraping, ingestion, and multi-tier cleaning of property datasets",
        "Advanced feature engineering: luxury scores, areaWithType transformations",
        "Feature selection: SHAP Explainable AI, LASSO, Recursive Elimination",
        "Content-based Recommender System using facility embeddings & location tags",
        "Streamlit interactive user interface & AWS EC2 production deployment"
      ],
      formula: "Cosine Similarity: S_C(A, B) = (A . B) / (||A|| * ||B||)",
      progress: "13 Sessions Deployed on AWS",
      notes: "Comprehensive end-to-end production application in portfolio."
    },
    {
      id: "book-dl",
      num: "13",
      code: "VOL. 13 / DEEP-LRN",
      topic: "Deep Learning & Neural Networks",
      shortTitle: "Deep Learning",
      track: "NEURAL ARCHITECTURES",
      color: 0x4a5d4e,
      hexColor: "#4a5d4e",
      subtitle: "Multi-layer perceptrons, backpropagation dynamics, and representation learning.",
      curriculum: "Krish Naik DL Roadmap · 24 Sessions · 35 Hours",
      status: "ACTIVE STUDY",
      concepts: [
        "Biological vs Artificial Neurons, Perceptron Learning Rule",
        "Multi-Layer Perceptrons (MLPs), Forward propagation & Computational Graphs",
        "Backpropagation derivation using Multivariable Chain Rule",
        "Vanishing/Exploding gradients, Activation functions (ReLU, GELU, Swish)",
        "Optimizers: SGD, Momentum, AdaGrad, RMSProp, Adam algorithm math"
      ],
      formula: "Weight Update: w_new = w_old - alpha * (dL / dw) + beta * v_prev",
      progress: "TensorFlow & Keras Models Deployed",
      notes: "Powers the Health Report clinical risk prediction model."
    },
    {
      id: "book-genai",
      num: "14",
      code: "VOL. 14 / GEN-AI",
      topic: "Generative AI & LangChain",
      shortTitle: "Generative AI",
      track: "FOUNDATION MODELS",
      color: 0x6e2c00,
      hexColor: "#6e2c00",
      subtitle: "Large Language Models, LCEL expression language, prompt engineering & fine-tuning.",
      curriculum: "Krish Naik GenAI Course · 56 Sections · 70 Hours",
      status: "ACTIVE SPECIALIZATION",
      concepts: [
        "Transformer architecture: Self-attention, multi-head attention, positional encoding",
        "LangChain framework: LCEL, PromptTemplates, Runnables, OutputParsers",
        "HuggingFace model hub, pipeline integration, and local execution with Ollama",
        "Parameter-Efficient Fine-Tuning (PEFT): LoRA and QLoRA quantization"
      ],
      formula: "Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V",
      progress: "70h Comprehensive Roadmap Enrolled",
      notes: "Core specialization for building autonomous reasoning agents."
    },
    {
      id: "book-rag",
      num: "15",
      code: "VOL. 15 / RAG-VEC",
      topic: "RAG & Vector Databases",
      shortTitle: "RAG Pipelines",
      track: "ENTERPRISE INTELLIGENCE",
      color: 0x1a5276,
      hexColor: "#1a5276",
      subtitle: "Semantic search, document splitting strategies, vector indexes & hybrid retrieval.",
      curriculum: "GenAI Course Specialized Track · 18 Lectures · 24 Hours",
      status: "PRODUCTION PROVEN",
      concepts: [
        "Document ingestion: PDF, Word, Markdown loaders, recursive chunking",
        "Embedding models: Sentence-BERT, OpenAI text-embedding-3, BAAI/bge",
        "Vector stores: ChromaDB, FAISS, Pinecone, Qdrant, Milvus",
        "Advanced retrieval: Contextual compression, Multi-Query, Parent Document, Hybrid search"
      ],
      formula: "Hybrid Score = alpha * DenseScore + (1 - alpha) * BM25Score",
      progress: "Production RAG Agents Built",
      notes: "Implemented in YouTube Notes Agent and Clinical Health Report System."
    },
    {
      id: "book-mlops",
      num: "16",
      code: "VOL. 16 / MLOPS",
      topic: "MLOps & CI/CD Pipelines",
      shortTitle: "MLOps Systems",
      track: "PRODUCTION PLATFORMS",
      color: 0x1e3f66,
      hexColor: "#1e3f66",
      subtitle: "Experiment tracking, data versioning, containerization, and automated deployments.",
      curriculum: "Krish Naik MLOps Bootcamp · 24 Sections · 51 Hours",
      status: "10+ PROJECTS ENROLLED",
      concepts: [
        "MLflow: Experiment tracking, metric logging, model artifacts, Model Registry",
        "Data Version Control (DVC): dvc.yaml pipelines, remote storage with S3/DagsHub",
        "Docker: Multi-stage builds, container isolation, minimal runtime images",
        "Apache Airflow & Astronomer: Automated ETL pipelines, DAG scheduling",
        "CI/CD with GitHub Actions: Flake8 linting, Pytest testing, automated ECR push",
        "AWS SageMaker: Scalable model training, real-time prediction endpoints"
      ],
      formula: "Reproducibility: Git (Code) + DVC (Data) + MLflow (Params) + Docker (Runtime)",
      progress: "51 Hours · 10+ End-to-End Projects",
      notes: "Ensures AI models graduate from notebook prototypes into production."
    },
    {
      id: "book-security",
      num: "17",
      code: "VOL. 17 / SEC-AI",
      topic: "AI Security & Guardrails",
      shortTitle: "AI Security",
      track: "AI SAFETY & GOVERNANCE",
      color: 0x641e16,
      hexColor: "#641e16",
      subtitle: "Guardrails AI, NVIDIA NeMo, LLM gateways, observability, and adversarial defense.",
      curriculum: "Krish Naik AI Security Bootcamp · 31 Sections · 75 Hours",
      status: "ADVANCED SPECIALIZATION",
      concepts: [
        "LangGraph multi-agent systems with human-in-the-loop approval middleware",
        "Model Context Protocol (MCP): Client/server architecture, tool execution",
        "NVIDIA NeMo Guardrails: Colang, input/output validation, topical rails, PII masking",
        "LLM Gateways: Portkey & TensorZero (routing, fallback, rate limiting, semantic caching)",
        "AI Red Teaming with PyRIT: Automated jailbreak probing and defense",
        "DeepEval & LangSmith: Hallucination evaluation, faithfulness testing, tracing"
      ],
      formula: "Defense-in-Depth: Input Rails -> LLM Gateway -> Model -> Output Rails -> Audit Log",
      progress: "75 Hours · State-of-the-Art Curriculum",
      notes: "Frontier engineering ensuring enterprise AI agents remain robust and compliant."
    },
    {
      id: "book-bigdata",
      num: "18",
      code: "VOL. 18 / BIG-DATA",
      topic: "Big Data Engineering (Spark/Cloud)",
      shortTitle: "Big Data Cloud",
      track: "DISTRIBUTED COMPUTING",
      color: 0x212f3d,
      hexColor: "#212f3d",
      subtitle: "Distributed storage, PySpark, streaming with Kafka, and GCP/Azure cloud pipelines.",
      curriculum: "Krish Naik Big Data Bootcamp · 10 Modules · 50 Hours",
      status: "CLOUD DATA TRACK",
      concepts: [
        "Big Data Foundations: Volume, Velocity, Variety, Veracity, Value (The 5 V's)",
        "Hadoop Ecosystem: HDFS architecture, NameNode/DataNode, MapReduce model",
        "Apache Spark & PySpark: RDDs, DataFrames, Catalyst Optimizer, cluster computing",
        "Real-time streaming: Apache Kafka topics, consumer groups, Apache Flink",
        "Cloud architectures on GCP (BigQuery, Dataflow) and Azure (Synapse, Data Factory)"
      ],
      formula: "Lambda Architecture: Speed Layer (Streaming) + Batch Layer (HDFS/Lakehouse)",
      progress: "50 Hours · Scalable Telemetry Pipelines",
      notes: "Distributed computing backbone for processing petabyte-scale data."
    }
  ];

  // State
  let scene, camera, renderer;
  let bookshelfGroup;
  let interactiveBooks = [];
  let activeBook = null;
  let activeBookGroup = null;
  let isBusy = false;
  let animFrameId = null;
  let container = null;
  let hoveredBook = null;
  let dossierOverlayElem = null;
  let tooltipChipElem = null;

  // Camera views
  const cameraEntrancePos = new THREE.Vector3(0, 2.5, 5.8);
  const cameraEntranceLook = new THREE.Vector3(0, 2.4, 0);
  const currentCamPos = cameraEntrancePos.clone();
  const currentCamLook = cameraEntranceLook.clone();

  // Pointer & Dragging
  let pointerStart = null;
  let isDragging = false;
  let orbitEuler = { pitch: 0, yaw: 0 };
  const raycaster = new THREE.Raycaster();
  const pointerCoords = new THREE.Vector2();

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tween(duration, onUpdate) {
    return new Promise(resolve => {
      const start = performance.now();
      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(1, elapsed / duration);
        onUpdate(progress);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  function makeCanvasTexture(width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, width, height);
    const texture = new THREE.CanvasTexture(canvas);
    if (THREE.sRGBEncoding) texture.encoding = THREE.sRGBEncoding;
    return texture;
  }

  function createBox(w, h, d, material, x, y, z, parent) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    if (parent) parent.add(mesh);
    return mesh;
  }

  function initBookshelf3D(containerId) {
    container = document.getElementById(containerId);
    if (!container) return;

    // Avoid double initialization
    if (container.dataset.initialized === 'true') {
      onResize();
      return;
    }
    container.dataset.initialized = 'true';

    container.innerHTML = '';
    interactiveBooks = [];
    activeBook = null;
    activeBookGroup = null;
    isBusy = false;
    hoveredBook = null;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 720;
    if (width === 0) width = 1200;
    if (height === 0) height = 720;

    // WebGL Scene & Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e17);

    camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.copy(cameraEntrancePos);
    camera.lookAt(cameraEntranceLook);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    // Warm Library Lighting
    const ambLight = new THREE.AmbientLight(0xfff3e0, 0.85);
    scene.add(ambLight);

    const dirLight = new THREE.DirectionalLight(0xffecd0, 1.3);
    dirLight.position.set(2.5, 6, 4.5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0x7090ff, 0.5, 12);
    fillLight.position.set(-3.5, 3, 2);
    scene.add(fillLight);

    const warmLight = new THREE.PointLight(0xffaa44, 0.9, 8);
    warmLight.position.set(0, 3.2, 2.5);
    scene.add(warmLight);

    // Bookshelf Structure
    bookshelfGroup = new THREE.Group();
    bookshelfGroup.position.set(0, 0, 0);
    scene.add(bookshelfGroup);

    // Materials
    const matBookshelfWood = new THREE.MeshStandardMaterial({
      color: 0x241812,
      roughness: 0.75,
      metalness: 0.05
    });
    const matBookshelfDark = new THREE.MeshStandardMaterial({
      color: 0x120d0a,
      roughness: 0.88
    });
    const matBrassGold = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.35,
      metalness: 0.85
    });
    const matPaperWhite = new THREE.MeshStandardMaterial({
      color: 0xf5f0e4,
      roughness: 0.92
    });

    // Bookshelf Outer frame
    createBox(0.12, 4.6, 0.92, matBookshelfWood, -1.84, 2.3, 0, bookshelfGroup);
    createBox(0.12, 4.6, 0.92, matBookshelfWood, 1.84, 2.3, 0, bookshelfGroup);
    createBox(3.96, 0.16, 0.98, matBookshelfWood, 0, 4.62, 0, bookshelfGroup);
    createBox(3.84, 0.06, 0.95, matBrassGold, 0, 4.54, 0.01, bookshelfGroup);
    createBox(3.96, 0.24, 0.98, matBookshelfWood, 0, 0.12, 0, bookshelfGroup);
    createBox(3.68, 4.4, 0.06, matBookshelfDark, 0, 2.32, -0.44, bookshelfGroup);

    // Shelves
    const shelfYPositions = [0.35, 1.35, 2.40, 3.45];
    for (const sy of shelfYPositions) {
      createBox(3.68, 0.08, 0.88, matBookshelfWood, 0, sy, 0, bookshelfGroup);
      createBox(3.68, 0.022, 0.025, matBrassGold, 0, sy + 0.03, 0.44, bookshelfGroup);
    }

    // Top Library Plaque
    const plaqueTex = makeCanvasTexture(512, 128, (ctx, cw, ch) => {
      ctx.fillStyle = '#1a140d';
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, cw - 12, ch - 12);
      ctx.fillStyle = '#f7e7b4';
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('STUDYPULSE CURRICULUM ARCHIVE', cw / 2, 48);
      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#c5a059';
      ctx.fillText('18 VOLUMES • CLICK ANY BOOK TO INSPECT', cw / 2, 85);
    });
    const plaqueMat = new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.4, metalness: 0.3 });
    createBox(2.8, 0.44, 0.04, plaqueMat, 0, 4.22, 0.46, bookshelfGroup);

    // Decorative Shelf 0 (Archive Boxes)
    for (const bx of [-1.05, 0, 1.05]) {
      const boxMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.8 });
      createBox(0.72, 0.48, 0.65, boxMat, bx, 0.63, 0.05, bookshelfGroup);
      createBox(0.24, 0.08, 0.01, matPaperWhite, bx, 0.68, 0.38, bookshelfGroup);
    }

    // Decorative Shelf 1 (Folios & Binders)
    const folioColors = [0x54231b, 0x1f3c30, 0x4a3425];
    for (let f = 0; f < 3; f++) {
      createBox(0.85 - f * 0.04, 0.13, 0.72 - f * 0.03, new THREE.MeshStandardMaterial({ color: folioColors[f], roughness: 0.6 }), -1.1, 1.455 + f * 0.135, 0.02 * (f - 1), bookshelfGroup);
    }
    for (let b = 0; b < 4; b++) {
      const bindMat = new THREE.MeshStandardMaterial({ color: [0x23313d, 0x4d3229, 0x273b2d, 0x42382e][b], roughness: 0.5 });
      createBox(0.18, 0.92, 0.68, bindMat, -0.25 + b * 0.22, 1.85, 0, bookshelfGroup);
      createBox(0.04, 0.18, 0.01, matBrassGold, -0.25 + b * 0.22, 1.85, 0.345, bookshelfGroup);
    }

    // Shelf 2 (Eye-Level): 18 Interactive Curriculum Books
    const shelfSurfaceY = 2.44;
    let currentBookX = -1.62;

    for (let bIdx = 0; bIdx < BOOK_DATA.length; bIdx++) {
      const bData = BOOK_DATA[bIdx];
      const bW = 0.135 + ((Math.sin(bIdx * 3.7 + 1) * 0.5 + 0.5) * 0.04);
      const bH = 0.82 + ((Math.sin(bIdx * 4.9 + 2) * 0.5 + 0.5) * 0.11);
      const bD = 0.66 + ((Math.cos(bIdx * 2.8 + 1) * 0.5 + 0.5) * 0.06);
      const bZ = (Math.sin(bIdx * 5.3) * 0.02);

      let rotZ = 0;
      if (bIdx === 4) rotZ = -0.035;
      if (bIdx === 11) rotZ = 0.032;

      const bookGroup = new THREE.Group();
      const posX = currentBookX + bW / 2;
      const posY = shelfSurfaceY + bH / 2;
      bookGroup.position.set(posX, posY, bZ);
      bookGroup.rotation.z = rotZ;
      bookshelfGroup.add(bookGroup);

      // Spine Texture with gold embossing
      const spineTex = makeCanvasTexture(256, 1024, (ctx, cw, ch) => {
        ctx.fillStyle = bData.hexColor || '#4a2c20';
        ctx.fillRect(0, 0, cw, ch);

        // Leather grain
        for (let n = 0; n < 240; n++) {
          ctx.fillStyle = 'rgba(0,0,0,0.08)';
          ctx.fillRect(Math.random() * cw, Math.random() * ch, 2, 2);
        }

        // Gold border
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 6;
        ctx.strokeRect(14, 24, cw - 28, ch - 48);

        // Gold decorative bands
        ctx.fillStyle = '#e5c158';
        ctx.fillRect(20, 100, cw - 40, 7);
        ctx.fillRect(20, 114, cw - 40, 3);
        ctx.fillRect(20, ch - 120, cw - 40, 3);
        ctx.fillRect(20, ch - 106, cw - 40, 7);

        // Volume text
        ctx.fillStyle = '#f5e396';
        ctx.textAlign = 'center';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(bData.num ? `VOL. ${bData.num}` : `V.${bIdx + 1}`, cw / 2, 75);

        // Title text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        const words = (bData.shortTitle || bData.topic || '').toUpperCase().split(' ');
        let ty = ch / 2 - (words.length * 22);
        for (const w of words) {
          ctx.fillText(w, cw / 2, ty);
          ty += 44;
        }

        // Diamond emblem
        ctx.fillStyle = '#e5c158';
        ctx.beginPath();
        ctx.arc(cw / 2, ch - 170, 7, 0, Math.PI * 2);
        ctx.fill();
      });

      const matLeather = new THREE.MeshStandardMaterial({
        color: bData.color || 0x4a2c20,
        roughness: 0.55,
        metalness: 0.1
      });
      const matSpine = new THREE.MeshStandardMaterial({
        map: spineTex,
        roughness: 0.5,
        metalness: 0.15
      });

      const bookMaterials = [
        matPaperWhite, // +X
        matLeather,    // -X
        matPaperWhite, // +Y
        matPaperWhite, // -Y
        matSpine,      // +Z (spine facing camera)
        matPaperWhite  // -Z
      ];

      const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(bW, bH, bD), bookMaterials);
      bookMesh.castShadow = true;
      bookMesh.receiveShadow = true;
      bookGroup.add(bookMesh);

      bookMesh.userData = {
        kind: 'book',
        bookIndex: bIdx,
        topic: bData.topic,
        bookConfig: bData,
        group: bookGroup,
        initialPos: bookGroup.position.clone(),
        initialRot: bookGroup.rotation.clone(),
        matSpine: matSpine
      };

      interactiveBooks.push(bookMesh);
      currentBookX += bW + 0.016;
    }

    // Shelf 2 Bookends
    createBox(0.06, 0.48, 0.52, matBrassGold, -1.67, shelfSurfaceY + 0.24, 0, bookshelfGroup);
    createBox(0.06, 0.48, 0.52, matBrassGold, currentBookX + 0.02, shelfSurfaceY + 0.24, 0, bookshelfGroup);

    // Decorative Shelf 3
    for (let e = 0; e < 5; e++) {
      createBox(0.16, 0.78, 0.62, new THREE.MeshStandardMaterial({ color: 0x1b2d3d, roughness: 0.55 }), -1.2 + e * 0.18, 3.88, 0, bookshelfGroup);
    }
    const clockMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.12, 32), matBrassGold);
    clockMesh.position.set(0.95, 3.75, 0.15);
    clockMesh.rotation.x = Math.PI / 2;
    bookshelfGroup.add(clockMesh);

    // Atmospheric Dust Particles
    const pCount = 90;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 6;
      pPos[i + 1] = Math.random() * 5;
      pPos[i + 2] = (Math.random() - 0.5) * 4 + 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xffe6b0,
      size: 0.04,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Setup Interactive Dossier Overlay Element
    setupDossierOverlay();

    // Event Listeners on Container
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    window.addEventListener('resize', onResize);

    // Render loop
    function animate() {
      animFrameId = requestAnimationFrame(animate);

      // Float dust
      const positions = pGeo.attributes.position.array;
      for (let i = 1; i < pCount * 3; i += 3) {
        positions[i] -= 0.003;
        if (positions[i] < 0) positions[i] = 5;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }
    animate();
  }

  function setupDossierOverlay() {
    if (dossierOverlayElem) return;

    dossierOverlayElem = document.createElement('div');
    dossierOverlayElem.id = 'bookshelf-dossier-overlay';
    dossierOverlayElem.className = 'bookshelf-dossier-overlay';
    dossierOverlayElem.style.display = 'none';
    container.appendChild(dossierOverlayElem);

    tooltipChipElem = document.createElement('div');
    tooltipChipElem.id = 'bookshelf-tooltip-chip';
    tooltipChipElem.className = 'bookshelf-tooltip-chip';
    tooltipChipElem.style.display = 'none';
    container.appendChild(tooltipChipElem);
  }

  function getIntersectedBook(event) {
    if (!container || !camera) return null;
    const rect = container.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const py = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    pointerCoords.set(px, py);
    raycaster.setFromCamera(pointerCoords, camera);

    scene.updateMatrixWorld(true);
    camera.updateMatrixWorld(true);

    const hits = raycaster.intersectObjects(interactiveBooks, true);
    if (hits.length > 0) {
      let cur = hits[0].object;
      while (cur && cur.userData.kind !== 'book' && cur.parent) {
        cur = cur.parent;
      }
      if (cur && cur.userData.kind === 'book') {
        return cur;
      }
    }
    return null;
  }

  function onPointerDown(event) {
    if (activeBook) return;
    pointerStart = { x: event.clientX, y: event.clientY };
    isDragging = false;
  }

  function onPointerMove(event) {
    if (!container) return;

    // Handle dragging orbit
    if (pointerStart && !activeBook) {
      const dist = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      if (dist > 6) {
        isDragging = true;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        orbitEuler.yaw = Math.max(-0.35, Math.min(0.35, orbitEuler.yaw + dx * 0.0015));
        orbitEuler.pitch = Math.max(-0.2, Math.min(0.2, orbitEuler.pitch + dy * 0.0015));

        camera.position.x = currentCamPos.x + Math.sin(orbitEuler.yaw) * 2.2;
        camera.position.y = currentCamPos.y + orbitEuler.pitch * 1.5;
        camera.lookAt(currentCamLook);

        pointerStart = { x: event.clientX, y: event.clientY };
        if (tooltipChipElem) tooltipChipElem.style.display = 'none';
        return;
      }
    }

    if (isBusy || activeBook) return;

    // Raycast hover
    const hitBook = getIntersectedBook(event);
    if (hitBook) {
      if (hoveredBook !== hitBook) {
        if (hoveredBook && hoveredBook.userData.matSpine) {
          hoveredBook.userData.matSpine.emissive.setHex(0x000000);
        }
        hoveredBook = hitBook;
        if (hoveredBook.userData.matSpine) {
          hoveredBook.userData.matSpine.emissive.setHex(0x382818);
        }
        container.style.cursor = 'pointer';

        if (tooltipChipElem) {
          const b = hoveredBook.userData.bookConfig;
          tooltipChipElem.innerHTML = `📖 <strong>${b.code}</strong>: ${b.topic} <span style="opacity:0.7;">(Click to Open)</span>`;
          tooltipChipElem.style.display = 'block';
        }
      }
      if (tooltipChipElem) {
        const rect = container.getBoundingClientRect();
        tooltipChipElem.style.left = `${event.clientX - rect.left + 15}px`;
        tooltipChipElem.style.top = `${event.clientY - rect.top - 30}px`;
      }
    } else {
      if (hoveredBook && hoveredBook.userData.matSpine) {
        hoveredBook.userData.matSpine.emissive.setHex(0x000000);
      }
      hoveredBook = null;
      container.style.cursor = isDragging ? 'grabbing' : 'default';
      if (tooltipChipElem) tooltipChipElem.style.display = 'none';
    }
  }

  function onPointerUp(event) {
    if (pointerStart && !isBusy) {
      const dist = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
      if (dist < 8) {
        // Legitimate Click
        const hitBook = getIntersectedBook(event);
        if (hitBook) {
          openBook(hitBook.userData.bookIndex);
        }
      }
    }
    pointerStart = null;
    isDragging = false;
    if (container) container.style.cursor = 'default';
  }

  async function openBook(bookIndex) {
    if (isBusy || bookIndex < 0 || bookIndex >= interactiveBooks.length) return;
    if (activeBook && activeBook.bookIndex === bookIndex) return;
    if (activeBook) {
      await closeBook();
    }
    isBusy = true;

    if (tooltipChipElem) tooltipChipElem.style.display = 'none';

    const bookMesh = interactiveBooks[bookIndex];
    activeBook = bookMesh.userData;
    activeBookGroup = activeBook.group;

    const bData = activeBook.bookConfig;

    // Show Dossier Content in Overlay
    renderDossierOverlay(bData);

    const worldBookPos = new THREE.Vector3();
    activeBookGroup.getWorldPosition(worldBookPos);

    // Book pulled outward along Z
    const origPos = activeBook.initialPos.clone();
    const pulledPos = origPos.clone();
    pulledPos.z += 0.55;

    const origRotX = activeBook.initialRot.x;
    const pulledRotX = origRotX - 0.07;
    const origRotY = activeBook.initialRot.y;
    const pulledRotY = origRotY + 0.09;

    // Camera framed so book is on the left-center and dossier is visible on the right
    const isMobile = window.innerWidth < 800;
    const camLook = isMobile 
      ? new THREE.Vector3(worldBookPos.x, worldBookPos.y, 0.55)
      : new THREE.Vector3(worldBookPos.x + 0.45, worldBookPos.y, 0.55);

    const camPos = isMobile
      ? new THREE.Vector3(worldBookPos.x, worldBookPos.y + 0.1, 3.8)
      : new THREE.Vector3(worldBookPos.x + 0.45, worldBookPos.y + 0.12, 3.2);

    const startCamPos = camera.position.clone();
    const startCamLook = currentCamLook.clone();
    const startFov = camera.fov;

    await Promise.all([
      // Smooth Camera swoop
      tween(950, t => {
        const e = easeInOutCubic(t);
        camera.position.lerpVectors(startCamPos, camPos, e);
        currentCamLook.lerpVectors(startCamLook, camLook, e);
        camera.fov = THREE.MathUtils.lerp(startFov, 31, e);
        camera.updateProjectionMatrix();
        camera.lookAt(currentCamLook);
      }),
      // Book physical pull & tilt
      tween(800, t => {
        const e = easeInOutCubic(t);
        activeBookGroup.position.lerpVectors(origPos, pulledPos, e);
        activeBookGroup.rotation.x = THREE.MathUtils.lerp(origRotX, pulledRotX, e);
        activeBookGroup.rotation.y = THREE.MathUtils.lerp(origRotY, pulledRotY, e);
      })
    ]);

    currentCamPos.copy(camera.position);

    if (typeof window.playPaperFlutterSound === 'function') {
      window.playPaperFlutterSound();
    }

    // Reveal Dossier overlay with smooth entrance
    if (dossierOverlayElem) {
      dossierOverlayElem.style.display = 'block';
      setTimeout(() => {
        dossierOverlayElem.classList.add('active');
      }, 10);
    }

    isBusy = false;
  }

  async function closeBook() {
    if (isBusy || !activeBook) return;
    isBusy = true;

    if (typeof window.playShelfThudSound === 'function') {
      window.playShelfThudSound();
    }

    if (dossierOverlayElem) {
      dossierOverlayElem.classList.remove('active');
      setTimeout(() => {
        dossierOverlayElem.style.display = 'none';
      }, 250);
    }

    const curPos = activeBookGroup.position.clone();
    const origPos = activeBook.initialPos.clone();
    const curRotX = activeBookGroup.rotation.x;
    const origRotX = activeBook.initialRot.x;
    const curRotY = activeBookGroup.rotation.y;
    const origRotY = activeBook.initialRot.y;

    const startCamPos = camera.position.clone();
    const startCamLook = currentCamLook.clone();
    const startFov = camera.fov;

    await Promise.all([
      tween(900, t => {
        const e = easeInOutCubic(t);
        camera.position.lerpVectors(startCamPos, cameraEntrancePos, e);
        currentCamLook.lerpVectors(startCamLook, cameraEntranceLook, e);
        camera.fov = THREE.MathUtils.lerp(startFov, 40, e);
        camera.updateProjectionMatrix();
        camera.lookAt(currentCamLook);
      }),
      tween(750, t => {
        const e = easeInOutCubic(t);
        activeBookGroup.position.lerpVectors(curPos, origPos, e);
        activeBookGroup.rotation.x = THREE.MathUtils.lerp(curRotX, origRotX, e);
        activeBookGroup.rotation.y = THREE.MathUtils.lerp(curRotY, origRotY, e);
      })
    ]);

    currentCamPos.copy(cameraEntrancePos);
    currentCamLook.copy(cameraEntranceLook);
    orbitEuler = { pitch: 0, yaw: 0 };
    activeBook = null;
    activeBookGroup = null;
    isBusy = false;
  }

  function renderDossierOverlay(b) {
    if (!dossierOverlayElem) return;
    const conceptsList = b.concepts.map(c => `<li><span class="bullet">▸</span> ${c}</li>`).join('');

    dossierOverlayElem.innerHTML = `
      <div class="dossier-inner" style="border-top: 3px solid ${b.hexColor};">
        <div class="dossier-header" style="border-left: 4px solid ${b.hexColor};">
          <div class="dossier-tag-row">
            <span class="dossier-code">${b.code}</span>
            <span class="dossier-status">${b.status}</span>
          </div>
          <h3 class="dossier-title">${b.topic}</h3>
          <div class="dossier-track">${b.track}</div>
        </div>

        <div class="dossier-body">
          <p class="dossier-subtitle">${b.subtitle}</p>
          <div class="dossier-curriculum-badge">
            <span class="icon">🏛️</span> <span>${b.curriculum}</span>
          </div>

          <div class="dossier-section-title">CORE CAPABILITIES & SYLLABUS:</div>
          <ul class="dossier-concepts">
            ${conceptsList}
          </ul>

          <div class="dossier-formula-box">
            <div class="formula-label">GOVERNING PRINCIPLE / INVARIANT:</div>
            <code>${b.formula}</code>
          </div>

          <div class="dossier-meta-row">
            <span class="lbl">VERIFIED PROGRESS:</span> <span class="val">${b.progress}</span>
          </div>
        </div>

        <div class="dossier-actions">
          <button class="btn-dossier primary" onclick="window.launchStudySession('${b.topic}')">
            ⚡ Start Focus Session
          </button>
          <button class="btn-dossier secondary" onclick="window.viewTopicInChecklist('${b.shortTitle}')">
            📋 Topic Checklist
          </button>
          <button class="btn-dossier close-btn" onclick="window.bookshelf3DClose()">
            ✕ Return Book
          </button>
        </div>
      </div>
    `;
  }

  function onResize() {
    if (!container || !renderer || !camera) return;
    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 720;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }

  // Global API
  window.initBookshelf3D = initBookshelf3D;
  window.bookshelf3DOpenBook = openBook;
  window.bookshelf3DClose = closeBook;
  window.bookshelfData = BOOK_DATA;

})();
