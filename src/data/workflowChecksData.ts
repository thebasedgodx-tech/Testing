import { WorkflowRun, SystemAlert, AIAgent } from '../types';

export const INITIAL_WORKFLOW_RUNS: WorkflowRun[] = [
  {
    id: 'run-101',
    workflowName: "Viral Hook: 'Waarom 99% Faalt met Content AI'",
    currentStage: 'Social Media',
    status: 'success',
    startedAt: '12 min geleden',
    durationMs: 42300,
    stagesCompleted: ['Idea', 'Script', 'fal.ai', 'Edit', 'Social Media'],
    socialTarget: 'TikTok',
    outputPreviewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    checks: [
      {
        id: 'chk-1',
        name: 'Hook Stop-Ratio Predictie',
        stage: 'Script',
        passed: true,
        score: 96,
        threshold: 80,
        message: 'Directe contrast-opening ("99% doet dit fout...") genereert 96/100 virality stop-ratio.',
        timestamp: '12 min geleden'
      },
      {
        id: 'chk-2',
        name: 'fal.ai Kling 1080x1920 Synthese',
        stage: 'fal.ai',
        passed: true,
        score: 98,
        threshold: 90,
        message: 'Kling v1.6 Pro render voltooid in 14.1s zonder framedrops (30 fps, 1080p).',
        timestamp: '9 min geleden'
      },
      {
        id: 'chk-3',
        name: 'Audio RMS Loudness Normalisatie',
        stage: 'Edit',
        passed: true,
        score: 99,
        threshold: 95,
        message: 'Loudness genormaliseerd naar -14.1 LUFS (TikTok & Shorts standaard).',
        timestamp: '5 min geleden'
      },
      {
        id: 'chk-4',
        name: '9:16 Safe Zones & Caption Placement',
        stage: 'Edit',
        passed: true,
        score: 97,
        threshold: 85,
        message: 'Ondertitels vallen binnen veilige marge; geen overlap met like/comment UI.',
        timestamp: '3 min geleden'
      },
      {
        id: 'chk-5',
        name: 'Social Media API Schema Validatie',
        stage: 'Social Media',
        passed: true,
        score: 100,
        threshold: 100,
        message: 'Hashtags (#viral #ai #shorts) en privacy-settings gevalideerd voor publicatie.',
        timestamp: 'Zojuist'
      }
    ]
  },
  {
    id: 'run-102',
    workflowName: "AI Avatar Breakdown: 'Jess Explains Crypto Staking'",
    currentStage: 'fal.ai',
    status: 'failed',
    startedAt: '24 min geleden',
    durationMs: 18400,
    stagesCompleted: ['Idea', 'Script'],
    failedStage: 'fal.ai',
    errorMessage: 'fal.ai API 429 Too Many Requests: Concurrency limiet bereikt voor model kling-v1.6-pro. Wachtrij geblokkeerd.',
    socialTarget: 'Instagram Reels',
    outputPreviewUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    checks: [
      {
        id: 'chk-21',
        name: 'Ideatie & Doelgroep Fit',
        stage: 'Idea',
        passed: true,
        score: 88,
        threshold: 75,
        message: 'Doelgroep-analyse matcht finance creators segment.',
        timestamp: '24 min geleden'
      },
      {
        id: 'chk-22',
        name: 'Social Script Structuur & Pacing',
        stage: 'Script',
        passed: true,
        score: 92,
        threshold: 80,
        message: 'Scriptlengte: 142 woorden (48 sec). Pacing ideaal voor short-form.',
        timestamp: '21 min geleden'
      },
      {
        id: 'chk-23',
        name: 'fal.ai Generative Video Dispatch',
        stage: 'fal.ai',
        passed: false,
        score: 0,
        threshold: 90,
        message: 'HTTP 429 van fal.ai cluster. Herstart agent of verhoog concurrency tier.',
        timestamp: '18 min geleden'
      }
    ]
  },
  {
    id: 'run-103',
    workflowName: "Podcast Snippet: 'Het Geheim van MrBeast Pacing'",
    currentStage: 'Edit',
    status: 'running',
    startedAt: '3 min geleden',
    durationMs: 8200,
    stagesCompleted: ['Idea', 'Script', 'fal.ai'],
    socialTarget: 'YouTube Shorts',
    outputPreviewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    checks: [
      {
        id: 'chk-31',
        name: 'Hook Selectie & Emotie Score',
        stage: 'Idea',
        passed: true,
        score: 94,
        threshold: 80,
        message: 'High energy intro geselecteerd op basis van audio pitch analyse.',
        timestamp: '3 min geleden'
      },
      {
        id: 'chk-32',
        name: 'Dynamic Script Rewriting',
        stage: 'Script',
        passed: true,
        score: 91,
        threshold: 80,
        message: 'Tekst ingekort met behoud van cruciale punchline.',
        timestamp: '2 min geleden'
      },
      {
        id: 'chk-33',
        name: 'fal.ai Visual Overlay B-Roll',
        stage: 'fal.ai',
        passed: true,
        score: 95,
        threshold: 90,
        message: 'B-roll clip gegenereerd via Flux Pro in 8.2s.',
        timestamp: '1 min geleden'
      },
      {
        id: 'chk-34',
        name: 'MediaPipe Face Tracking & 9:16 Centering',
        stage: 'Edit',
        passed: true,
        score: 89,
        threshold: 80,
        message: 'Bezig met 9:16 crop rendering (stap 4 van 5)...',
        timestamp: 'Zojuist'
      }
    ]
  },
  {
    id: 'run-104',
    workflowName: "E-Commerce UGC Ad: 'Smart Wireless Lavalier Mic'",
    currentStage: 'Social Media',
    status: 'pending_check',
    startedAt: '35 min geleden',
    durationMs: 36500,
    stagesCompleted: ['Idea', 'Script', 'fal.ai', 'Edit'],
    socialTarget: 'TikTok',
    outputPreviewUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
    checks: [
      {
        id: 'chk-41',
        name: 'UGC Script Conversie Hook',
        stage: 'Script',
        passed: true,
        score: 95,
        threshold: 80,
        message: 'Probleem-Oplossing template gebruikt ("Mijn audio klonk verschrikkelijk totdat...").',
        timestamp: '34 min geleden'
      },
      {
        id: 'chk-42',
        name: 'fal.ai Product Visuals Enhancer',
        stage: 'fal.ai',
        passed: true,
        score: 93,
        threshold: 90,
        message: 'Scherpe product shots gerenderd met 60 FPS upscaling.',
        timestamp: '30 min geleden'
      },
      {
        id: 'chk-43',
        name: 'Hormozi Stijl Karaoke Ondertitels',
        stage: 'Edit',
        passed: true,
        score: 98,
        threshold: 85,
        message: 'Gele highlights en microfoon emojis synchroon op milliseconde precisie.',
        timestamp: '25 min geleden'
      },
      {
        id: 'chk-44',
        name: 'TikTok Commercial Music Rights Check',
        stage: 'Social Media',
        passed: true,
        score: 100,
        threshold: 100,
        message: 'Muziektrack ID: Commercial Audio Library #8210 (Rechtenvrij). Wacht op handmatige review.',
        timestamp: '20 min geleden'
      }
    ]
  }
];

export const INITIAL_SYSTEM_ALERTS: SystemAlert[] = [
  {
    id: 'alt-1',
    entityName: 'Jess (Social Scriptwriter)',
    type: 'quota_warning',
    severity: 'warning',
    message: 'Gemini 3.8 Flash token quota heeft 88% van de uurlijkse drempel bereikt (176.000 tokens verbruikt). Overweeg batching.',
    timestamp: '3 min geleden',
    retryable: false,
    dismissed: false
  },
  {
    id: 'alt-2',
    entityName: 'fal.ai Kling Render Engine',
    type: 'rate_limit',
    severity: 'critical',
    message: 'fal.ai Kling v1.6 Pro render worker ontving HTTP 429 (Concurrency limiet 5 bereikt). 1 taak automatisch gepauzeerd in wachtrij.',
    timestamp: '7 min geleden',
    retryable: true,
    dismissed: false
  },
  {
    id: 'alt-3',
    entityName: 'KlipForge Auto-Cutter',
    type: 'stalled',
    severity: 'info',
    message: 'MediaPipe face-tracking detecteerde 2 sprekers tegelijkertijd. Dynamische split-screen fallback succesvol geactiveerd.',
    timestamp: '19 min geleden',
    retryable: false,
    dismissed: false
  }
];

export const INITIAL_AI_AGENTS: AIAgent[] = [
  {
    id: 'agent-jess',
    name: 'Jess',
    role: 'Lead Social Scriptwriter & Viral Hook Specialist',
    model: 'Gemini 3.8 Flash',
    status: 'active',
    version: 'v2.4.1',
    avatarIcon: 'Sparkles',
    metrics: {
      completedTasks: 412,
      failedTasks: 3,
      successRate: 99.3,
      avgProcessingTime: '1.4s',
      activeQueueCount: 1,
      tokenUsage24h: '384k tokens'
    },
    config: {
      temperature: 0.75,
      maxTokens: 1200,
      systemPromptPreset: 'Virality First (Hormozi Pattern Interrupt & Direct Contrast Opening)',
      autoRestartOnError: true,
      maxRetries: 3,
      additionalParams: {
        hookStrategy: 'Controversial & Question-Based',
        targetLanguage: 'Nederlands (NL) & Vlaams'
      }
    },
    lastActive: 'Zojuist (Taak #412 verwerkt)',
    assignedPipelines: ['Idea -> Script Generation', 'Hook A/B Variant Tester', 'Viral Hashtag Generator']
  },
  {
    id: 'agent-fal',
    name: 'fal.ai Kling & Flux Renderer',
    role: 'Generative Video & Realistic B-Roll Synthesizer',
    model: 'fal-ai/kling-v1.6-pro',
    status: 'active',
    version: 'v1.6.0',
    avatarIcon: 'Video',
    metrics: {
      completedTasks: 198,
      failedTasks: 7,
      successRate: 96.6,
      avgProcessingTime: '13.8s',
      activeQueueCount: 2,
      tokenUsage24h: '12.4 GPU-minuten'
    },
    config: {
      temperature: 0.6,
      maxTokens: 2048,
      systemPromptPreset: 'Hyperrealistic 1080x1920 Cinematic Shorts B-Roll & Visual Transitions',
      autoRestartOnError: true,
      maxRetries: 2,
      additionalParams: {
        fps: 30,
        guidanceScale: 7.5,
        motionBucket: 127
      }
    },
    lastActive: '4 min geleden (Taak #198 verwerkt)',
    assignedPipelines: ['Script -> fal.ai Visual B-Roll', 'AI Avatar LipSync Generator']
  },
  {
    id: 'agent-cutter',
    name: 'KlipForge Auto-Cutter',
    role: 'MediaPipe Face Tracker & 9:16 Dynamic Reframer',
    model: 'MediaPipe Vision 0.10.x & OpenCV GPU',
    status: 'active',
    version: 'v3.1.2',
    avatarIcon: 'Scissors',
    metrics: {
      completedTasks: 589,
      failedTasks: 1,
      successRate: 99.8,
      avgProcessingTime: '0.7s',
      activeQueueCount: 0,
      tokenUsage24h: '22.1k frames'
    },
    config: {
      temperature: 0.2,
      maxTokens: 512,
      systemPromptPreset: 'Exponential Moving Average (EMA) Speaker Tracker & Center-Crop Fallback',
      autoRestartOnError: true,
      maxRetries: 5,
      additionalParams: {
        emaFactor: 0.65,
        safeZoneMargin: '12%',
        splitThreshold: 0.4
      }
    },
    lastActive: '1 min geleden (Taak #589 verwerkt)',
    assignedPipelines: ['Raw Video Ingestion', 'Auto 9:16 Reframe', 'Split-Screen Multi-Speaker Detection']
  },
  {
    id: 'agent-nova',
    name: 'Nova Voice & Audio Master',
    role: 'Whisper-Large Audio Demuxer & Karaoke Styler',
    model: 'Whisper v3 Turbo & FFmpeg Audio Filter',
    status: 'idle',
    version: 'v2.0.0',
    avatarIcon: 'Mic',
    metrics: {
      completedTasks: 456,
      failedTasks: 2,
      successRate: 99.6,
      avgProcessingTime: '2.1s',
      activeQueueCount: 0,
      tokenUsage24h: '18.2 audio-uur'
    },
    config: {
      temperature: 0.0,
      maxTokens: 2048,
      systemPromptPreset: 'Exact Word Timings with Auto Emoji Injector & -14 LUFS Normalization',
      autoRestartOnError: true,
      maxRetries: 3,
      additionalParams: {
        lufsTarget: -14.0,
        noiseReductionDb: 18
      }
    },
    lastActive: '14 min geleden (Taak #456 verwerkt)',
    assignedPipelines: ['Audio Loudness Normalizer', 'Speech-to-Text Transcription', 'Karaoke Highlight Styler']
  },
  {
    id: 'agent-scout',
    name: 'ViralScout Publisher',
    role: 'Automated Social Media Dispatcher & Safe-Zone Validator',
    model: 'KlipForge Social Dispatch Engine v2.1',
    status: 'paused',
    version: 'v1.8.4',
    avatarIcon: 'Share2',
    metrics: {
      completedTasks: 167,
      failedTasks: 0,
      successRate: 100.0,
      avgProcessingTime: '0.4s',
      activeQueueCount: 0,
      tokenUsage24h: '167 posts'
    },
    config: {
      temperature: 0.1,
      maxTokens: 512,
      systemPromptPreset: 'TikTok, Shorts & Reels Safe-Zone Compliance & Metadata Validation',
      autoRestartOnError: false,
      maxRetries: 2,
      additionalParams: {
        autoPostEnabled: false,
        delayBetweenPostsMin: 45
      }
    },
    lastActive: '32 min geleden (Gepauzeerd door beheerder)',
    assignedPipelines: ['Validation Gate', 'Social API Dispatcher (TikTok/YT/IG)']
  }
];
