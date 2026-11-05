export const projectImage = (image) => `${import.meta.env.BASE_URL}${image}`;

export const PROJECTS = [
  {
    slug: "data-converter",
    title: "Data Converter",
    image: "projects_web/DataConverter.png",
    caption: "Responsive Application Design",
    tall: true,
    description:
      "A desktop utility for converting and inspecting structured data, built around a focused, file-first workflow.",
    snapshot:
      "The app keeps format detection, column mapping, and a preview workspace in one file-first flow, so data can be checked before it is converted. It is built for repetitive cleanup work that benefits from seeing each step.",
    stack: ["C#", ".NET", "Desktop UI"],
  },
  {
    slug: "trading-application-legacy",
    title: "Trading Application",
    image: "projects_web/TradingApplicationLegacy.png",
    caption: "Live Trading & API Integrations",
    tall: true,
    description:
      "A live market workstation connecting trading APIs, charts, order controls, and account state in one place.",
    snapshot:
      "The workstation brings market data, charts, order controls, and account state into one desktop view. It is a study in keeping real-time information legible without turning the screen into a wall of numbers.",
    stack: ["C#", "APIs", "Real-time data", "Blazor"],
  },
  {
    slug: "trading-optimization-legacy",
    title: "Trading Optimization Engine",
    image: "projects_web/TradingOptimizationLegacy.png",
    caption: "Scalable Compute Applications",
    tall: true,
    description:
      "A compute-focused trading tool for running and comparing optimization workloads across large parameter sets.",
    snapshot:
      "This tool runs and compares optimization workloads across large parameter sets, with progress and results visible as the job advances. The focus is making heavy compute work observable instead of a black box.",
    stack: [".NET", "Parallel compute", "Data visualization", "GPU Computing"],
  },
  {
    slug: "unreal-engine",
    title: "Unreal Engine Prototype",
    image: "projects_web/UnrealEngine.png",
    caption: "Interactive Game Design",
    tall: true,
    description:
      "An interactive Unreal Engine environment exploring level composition, lighting, and player-scale spatial design.",
    snapshot:
      "The prototype explores player scale, sightlines, and lighting through a small interactive Unreal environment. It is less about a finished level than about how a space feels to move through.",
    stack: ["Unreal Engine", "Blueprints", "Level design"],
  },
  {
    slug: "learning-website",
    title: "Learning Platform",
    image: "projects_web/LearningWebsite.png",
    caption: "Interactive Web Design",
    description:
      "A responsive learning site that packages course content into a clear, approachable browsing experience.",
    snapshot:
      "The site organizes course material into a clear browsing path, with a responsive layout that stays readable from desktop to mobile. The goal is to make educational content feel approachable rather than dense.",
    stack: ["React", "Responsive UI", "Web design", "Kestrel", ".NET"],
  },
  {
    slug: "docker-and-security",
    title: "Containerized Web & Security",
    image: "projects_web/DockerAndSecurity.png",
    caption: "Containerized Web Development",
    description:
      "A containerized full-stack setup pairing a web client with security tooling and hardened deployment practices.",
    snapshot:
      "A full-stack web setup packaged with Docker and paired with security tooling, from authentication boundaries to deployment configuration. It documents the practical work of running a small app consistently outside a local machine.",
    stack: ["Docker", "Security", "Backend"],
  },
  {
    slug: "ts",
    title: "Agentic Workflow Platform",
    image: "projects_web/TS.png",
    caption: "Automated Agentic Workflows",
    description:
      "A visual environment for building and orchestrating automated, multi-step agent workflows.",
    snapshot:
      "The workspace lets multi-step agent workflows be assembled from connected actions and inspected as they run. The aim is to make automation easier to adjust and rerun without losing track of each stage.",
    stack: ["TypeScript", "Automation", "Agents", "Blazor", ".NET", "Kestrel"],
  },
  {
    slug: "arrow-psql",
    title: "ArrowPSQL",
    image: "projects_web/ArrowPSQL.png",
    caption: "Custom Database Integrations & Dashboards",
    description:
      "A database integration layer and dashboard for exploring Arrow-backed datasets, and PostgreSQL.",
    snapshot:
      "This integration layer and dashboard makes Arrow-backed datasets queryable as well as PostgreSQL through DuckDB adapter and turns the results into readable views.",
    stack: ["PostgreSQL", "Arrow", "Dashboards", ".NET", "Python", "Kestrel"],
  },
  {
    slug: "keycloak",
    title: "Keycloak Identity Management",
    image: "projects_web/Keycloak.png",
    caption: "Identity Access Management (IAM)",
    description:
      "An identity management workspace for configuring realms, clients, roles, and access policies with Keycloak.",
    snapshot:
      "The workspace configures Keycloak realms, clients, roles, and access policies in one place. It is a practical study in identity setup, with the moving parts made visible enough to audit and repeat.",
    stack: ["Keycloak", "OAuth", "Security"],
  },
  {
    slug: "terminal",
    title: "Trading Application Server Terminal",
    image: "projects_web/Terminal.png",
    caption: "Trading Server Terminal",
    description:
      "The server-side terminal behind the Trading Application, exposing broker, account, and market-data endpoints through a documented API.",
    snapshot:
      "The terminal is a back-end proxy server for scalable compute. Trading application interfaces connect to it from any remote device, then switch between sessions easily and manageably.",
    stack: [".NET", "ASP.NET Core", "REST APIs", "Swagger", "Trading systems"],
  },
  {
    slug: "trading-application",
    title: "Trading Platform",
    image: "projects_web/TradingApplication.png",
    caption: "Trading Platform Development",
    tall: true,
    description:
      "A modern trading workstation focused on fast market reads, clean order entry, and responsive charts.",
    snapshot:
      "The platform centers on fast market reads, clear order entry, and charts that stay responsive under load. It carries lessons from earlier trading tools into a cleaner, more focused workstation.",
    stack: ["C#", "APIs", "Real-time UI", ".Blazor", ".NET", "Kestrel"],
  },
  {
    slug: "api-tester",
    title: "API Security Tester",
    image: "projects_web/APITester.png",
    caption: "API Security Testing",
    description:
      "A testing console for probing API behavior, validating authentication boundaries, and documenting security findings.",
    snapshot:
      "The console probes API behavior, checks authentication boundaries, and records findings as they are discovered. It treats security testing as a repeatable workflow rather than a one-off checklist.",
    stack: ["Security", "REST APIs", "Testing", ".NET"],
  },
  {
    slug: "audio-editor",
    title: "Audio Editor",
    image: "projects_web/AudioEditor.png",
    caption: "Multi-Track Audio Editing",
    description:
      "A desktop audio workspace for arranging clips, shaping tracks, and previewing edits in real time.",
    snapshot:
      "Clips can be arranged across tracks, levels shaped, and edits previewed in context. The workspace keeps timeline state and playback controls close at hand.",
    stack: ["C#", "Audio", "Desktop UI", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "auto-fit",
    title: "AutoFit",
    image: "projects_web/AutoFit.png",
    caption: "Automated Compression Analysis",
    description:
      "A compression analysis tool that benchmarks model and data pipelines and plots the resulting tradeoffs.",
    snapshot:
      "AutoFit benchmarks model and data pipelines, then plots the tradeoffs between compression size and quality. It is aimed at making compression decisions evidence-based instead of guesswork.",
      stack: ["Python", "Compression", "Data visualization", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "auto-fit-benchmark",
    title: "AutoFit Benchmark",
    image: "projects_web/AutoFit_Example_Poster.png",
    caption: "Data Fitting Visualizations",
    description:
      "A benchmark view from AutoFit showing fitting graphical behavior across a representative test workload.",
    snapshot:
      "This focused view compares auto-calculating of calculus formulas and equations through use of a easy to understand interface.",
    stack: ["Python", "Benchmarking", "Visualization", ".NET", "C#"],
  },
  {
    slug: "burp-suite",
    title: "Burp Suite Workflows",
    image: "projects_web/BurpSuite_Example_Poster.png",
    caption: "Security Testing Workflows",
    description:
      "A security testing workspace using Burp Suite to inspect traffic, replay requests, and validate findings.",
    snapshot:
      "The workspace uses Burp Suite to inspect traffic, replay requests, and validate findings. The focus is keeping evidence organized as a test moves from suspicion to confirmed issue.",
    stack: ["Burp Suite", "Security", "HTTP", "HTTPS"],
  },
  {
    slug: "device-cleaner",
    title: "Device Cleaner",
    image: "projects_web/DeviceCleaner.png",
    caption: "Device Cleanup & System Tools",
    description:
      "A system utility for auditing local files, identifying unnecessary data, and reclaiming disk space safely.",
    snapshot:
      "The utility audits local files, spots unnecessary data, and reclaims disk space with clear safeguards. It balances automation with enough visibility that cleanup does not feel risky.",
      stack: [".NET", "System tools", "Automation", "Blazor", "Kestrel"],
  },
  {
    slug: "font-manager",
    title: "Font Manager",
    image: "projects_web/FontManager.png",
    caption: "Font Management & Typography",
    description:
      "A font catalog and preview tool for organizing typefaces and testing them in context.",
    snapshot:
      "The catalog organizes typefaces and previews them in context, so choices can be compared without leaving the workspace. It targets the small, repetitive decisions that shape typography.",
    stack: ["C#", "Typography", "Desktop UI", "BlazorWebView", ".NET Maui"],
  },
  {
    slug: "game-editor",
    title: "Node-Based Game Editor",
    image: "projects_web/GameEditor.png",
    caption: "Node-Based Game Editor",
    description:
      "A visual editor for composing game logic as connected nodes and previewing the resulting behavior.",
    snapshot:
      "Game logic is composed from connected nodes, with a preview for checking behavior as the graph grows. The project explores how far visual scripting can go before code becomes the clearer tool.",
      stack: ["C#", "Node graphs", "Game tools", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "graphics-library",
    title: "Graphics Library",
    image: "projects_web/GraphicsLibrary.png",
    caption: "Graphics & Chart Components",
    description:
      "A reusable graphics toolkit covering chart types, icons, and small visual primitives.",
    snapshot:
      "This toolkit collects chart types, icons, and small visual primitives for building consistent interfaces. The pieces are designed to be combined rather than used in isolation.",
    stack: ["C#", "Charts", "Rendering", "C++"],
  },
  {
    slug: "graphics-library-two",
    title: "Graphics Library",
    image: "projects_web/GraphicsLibraryTwo.png",
    caption: "Data Visualization Library",
    description:
      "An extension of the graphics library focused on responsive data visualization components.",
    snapshot:
      "The extension focuses on responsive data visualization components that adapt to their container. It looks at how charts can change size without losing clarity.",
    stack: ["C#", "Data visualization", "Components", "C++"],
  },
  {
    slug: "image-editor",
    title: "Image Editor",
    image: "projects_web/ImageEditor.png",
    caption: "Image Editing Workspace",
    description:
      "An image editing environment with canvas tools, color controls, and non-destructive adjustments.",
    snapshot:
      "Canvas tools, color controls, and non-destructive adjustments live in one editing environment. The work centers on keeping a layered editing state understandable while the image changes.",
      stack: ["C#", "Image processing", "Desktop UI", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "kafka-pipeline",
    title: "Kafka Pipeline",
    image: "projects_web/KafkaPipeline.png",
    caption: "Data Pipelines",
    description:
      "A streaming data pipeline for ingesting, transforming, and inspecting events through Kafka.",
    snapshot:
      "The pipeline ingests, transforms, and inspects events as they move through Kafka. Its stages are made observable so data flow can be followed end to end.",
      stack: ["Kafka", "Streaming", "Backend", ".NET", "Kestrel"],
  },
  {
    slug: "life-pilot",
    title: "LifePilot",
    image: "projects_web/LifePilot.png",
    caption: "Personal Planning",
    description:
      "A planning platform for organizing goals, routines, and daily priorities in one calm dashboard.",
    snapshot:
      "LifePilot brings goals, routines, and daily priorities into one calm dashboard. The focus is reducing planning overhead so the system stays useful after the first week.",
      stack: ["React", "Product design", "Full stack", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "unity-3d-prototype",
    title: "Unity 3D Prototype",
    image: "projects_web/Recording_2_Poster.png",
    caption: "3D Prototypes & Renders",
    description:
      "A Unity prototype walkthrough exploring third-person movement and an early environment blockout.",
    snapshot:
      "The walkthrough explores third-person movement and an early environment blockout. It studies how movement, camera framing, and level shape affect the feel of a space.",
    stack: ["Unity", "C#", "3D"],
  },
  {
    slug: "scheduler",
    title: "Scheduler",
    image: "projects_web/Scheduler_Example_Poster.png",
    caption: "Scheduling & Workflow Automation",
    description:
      "A scheduling tool for coordinating recurring tasks and triggering automated workflows.",
    snapshot:
      "The tool coordinates recurring tasks and triggers automated workflows. It is built around making timing, dependencies, and failures visible before they become surprises.",
      stack: [".NET", "Scheduling", "Automation", "Blazor", "Kestrel"],
  },
  {
    slug: "ui-component-designer",
    title: "UI Component Designer",
    image: "projects_web/UIComponentDesigner.png",
    caption: "UI Component Designer",
    description:
      "A visual designer for composing interface components and exporting production-ready markup.",
    snapshot:
      "Components are composed visually and exported as production-ready markup. The project explores the space between free-form design tools and the structured components developers ship.",
      stack: ["React", "Design systems", "UI tools", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "unity-prototyping",
    title: "Unity Game Prototype",
    image: "projects_web/Unity.png",
    caption: "Unity Game Development",
    description:
      "A Unity prototype focused on movement, interaction, and quick iteration on game feel.",
    snapshot:
      "This sandbox focuses on movement, interaction, and fast iteration on game feel. It tests ideas before they are committed to a larger game.",
    stack: ["Unity", "C#", "Prototyping"],
  },
  {
    slug: "unreal-level-design",
    title: "Unreal Level Design",
    image: "projects_web/UnrealEngine2.png",
    caption: "Unreal Engine Level Design",
    description:
      "A level design study in Unreal Engine built around scale, sightlines, and environmental storytelling.",
    snapshot:
      "The scene is organized around scale, sightlines, and environmental storytelling. It guides attention through space rather than relying on markers or text.",
    stack: ["Unreal Engine", "Level design", "Environment art"],
  },
  {
    slug: "vector-designer",
    title: "Vector Designer",
    image: "projects_web/VectorDesigner.png",
    caption: "Vector Design Studio",
    description:
      "A vector editing studio for building and refining scalable shapes and interface assets.",
    snapshot:
      "The studio builds and refines scalable shapes and interface assets with precise geometry. Its workflow stays close to how the final asset will be used.",
      stack: ["C#", "Vector graphics", "Design tools", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "video-editor",
    title: "Video Editor",
    image: "projects_web/VideoEditor.png",
    caption: "Video Editing & Timeline Tools",
    description:
      "A video editing workspace with timeline controls, preview playback, and clip management.",
    snapshot:
      "Timeline controls, preview playback, and clip management share one workspace. The project keeps a complex edit readable at a glance while still allowing precise changes.",
      stack: ["C#", "Video", "Desktop UI", ".NET", "Blazor", "Kestrel"],
  },
  {
    slug: "web-designer",
    title: "Web Designer",
    image: "projects_web/WebDesigner.png",
    caption: "Visual Web Design",
    description:
      "A visual web design tool for assembling responsive layouts and previewing them in the browser.",
    snapshot:
      "The tool assembles responsive layouts and previews them in the browser. It is a study in closing the gap between designing a page and seeing how it behaves at different widths.",
    stack: ["React", "Web design", "UI tools", "BlazorWebView", ".NET Maui"],
  },
  {
    slug: "notebook-studio",
    title: "Notebook Studio",
    image: "projects_web/NotebookStudio.png",
    caption: "Digital Notebook & Study Workspace",
    description:
      "A local-first notebook for writing, planning, and studying with notes, drawing, tasks, and OCR in one workspace.",
    snapshot:
      "Notebook Studio keeps handwritten notes, free drawing, tasks, planning, and OCR together in a single desk-like workspace. The focus is staying out of the way while writing, with study tools available when they are needed.",
    stack: ["C#", ".NET", "Blazor", "OCR", "Desktop UI"],
  },
  {
    slug: "agent-harness",
    title: "Agent Harness",
    image: "projects_web/Harness.png",
    caption: "Local Agent Tooling",
    description:
      "A custom automation terminal harness that lets a local model inspect repositories, read files, write unit tests, and run shell commands through a bounded tool loop.",
    snapshot:
      "Several agent sessions run side by side, each with its own workspace, tool calls, and reasoning trace. The harness keeps every step visible, so long exploratory tasks can be followed, paused, or interrupted instead of running as a black box.",
    stack: ["Python", "Local models", "Agent tooling", "PowerShell"],
  },
  {
    slug: "llm-compression",
    title: "LLM Compression",
    image: "projects_web/LLMCompression.png",
    caption: "Layer-Wise Model Compression",
    description:
      "A compression pipeline that fits compact MLP and polynomial replacements to every attention and feed-forward layer of a 37B-parameter model.",
    snapshot:
      "Input heads are looped until they match hash which is correct permutation. All 64 tested layers pass at 0.0010 mean MSE and 0.9995 mean cosine for the sorted latent space of the mlp, taking a 55 GB FP16 model down to roughly 5.36 GB plus token embeddings but at a cost of reduced throughput of best case 10 tok/s. This is an active research project we are exploring to maximize throughput and minimize disk/vram resource requirements.",
    stack: ["Python", "PyTorch", "FP16", "Model compression"],
  },
  {
    slug: "modal-gpu-runs",
    title: "Modal GPU Runs",
    image: "projects_web/Modal.png",
    caption: "Cloud GPU Training & Compression",
    description:
      "Cloud GPU training runs for the AutoFit compression pipeline, scheduled across A100 and H100 instances on Modal.",
    snapshot:
      "Each run is split into per-tier functions so the same pipeline can target an A100, an A100 40GB, or an H100, with a CPU-side step that inspects the cached results. Keeping the work on managed GPUs makes long compression jobs repeatable instead of tied to one workstation.",
    stack: ["Modal", "A100 / H100", "Python", "AutoFit"],
  },
];

export const getProject = (slug) =>
  PROJECTS.find((project) => project.slug === slug);
