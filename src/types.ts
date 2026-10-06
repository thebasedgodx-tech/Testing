export interface SubtitleWord {
  id: string;
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  highlight?: boolean;
  emoji?: string;
}

export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: SubtitleWord[];
}

export type AspectRatio = '9:16' | '1:1' | '16:9';

export type SubtitleTheme = 'hormozi' | 'mrbeast' | 'minimal' | 'cyberpunk';

export interface ViralityMetrics {
  overallScore: number; // 0 - 100
  hookScore: number;     // 0 - 100
  flowScore: number;     // 0 - 100
  curiosityScore: number;// 0 - 100
  emotionalPeak: number; // 0 - 100
  viralityRationale: string;
  recommendedHook: string;
  suggestedHashtags: string[];
}

export interface Clip {
  id: string;
  videoId: string;
  title: string;
  hookCategory: 'Controversial' | 'Story' | 'Value Bomb' | 'Mindset' | 'Humor';
  startTime: number;
  endTime: number;
  duration: number;
  aspectRatio: AspectRatio;
  virality: ViralityMetrics;
  subtitles: SubtitleSegment[];
  speakerFocusX: number; // 0 to 1 representing horizontal camera pan center
  thumbnailUrl: string;
  videoUrl: string;
  status: 'ready' | 'processing' | 'rendering';
}

export interface VideoProject {
  id: string;
  title: string;
  sourceUrl?: string;
  fileName?: string;
  duration: number; // seconds
  thumbnailUrl: string;
  videoUrl: string;
  uploadedAt: string;
  status: 'analyzing' | 'completed' | 'queued';
  totalClipsFound: number;
  clips: Clip[];
}

export interface UserCredits {
  usedMinutes: number;
  totalMinutes: number;
  tier: 'Free' | 'Creator Pro' | 'Agency';
}

// -----------------------------------------------------------------------------
// Workflow Checks Dashboard Types
// -----------------------------------------------------------------------------
export type WorkflowStage = 'Idea' | 'Script' | 'fal.ai' | 'Edit' | 'Social Media';
export type WorkflowRunStatus = 'success' | 'running' | 'failed' | 'pending_check';

export interface QualityCheckDetail {
  id: string;
  name: string;
  stage: WorkflowStage;
  passed: boolean;
  score?: number;
  threshold?: number;
  message: string;
  timestamp: string;
}

export interface WorkflowRun {
  id: string;
  workflowName: string;
  currentStage: WorkflowStage;
  status: WorkflowRunStatus;
  startedAt: string;
  durationMs: number;
  stagesCompleted: WorkflowStage[];
  failedStage?: WorkflowStage;
  errorMessage?: string;
  checks: QualityCheckDetail[];
  socialTarget?: 'TikTok' | 'YouTube Shorts' | 'Instagram Reels';
  outputPreviewUrl?: string;
}

export interface SystemAlert {
  id: string;
  entityName: string;
  type: 'rate_limit' | 'stalled' | 'render_failed' | 'quota_warning' | 'script_syntax_error';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: string;
  retryable: boolean;
  dismissed: boolean;
}

// -----------------------------------------------------------------------------
// AI Agents Hub Types
// -----------------------------------------------------------------------------
export type AgentStatus = 'active' | 'idle' | 'paused' | 'error';

export interface AgentMetric {
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  avgProcessingTime: string;
  activeQueueCount: number;
  tokenUsage24h: string;
}

export interface AgentConfig {
  temperature: number;
  maxTokens: number;
  systemPromptPreset: string;
  autoRestartOnError: boolean;
  maxRetries: number;
  additionalParams?: Record<string, any>;
}

export interface AIAgent {
  id: string;
  name: string;
  role: string;
  model: string;
  status: AgentStatus;
  version: string;
  avatarIcon: string;
  metrics: AgentMetric;
  config: AgentConfig;
  lastActive: string;
  assignedPipelines: string[];
}

