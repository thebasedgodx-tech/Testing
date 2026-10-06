import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Cpu, 
  Layout, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Code2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'step1' | 'step2' | 'step3' | 'step4'>('step1');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const [schemaFormat, setSchemaFormat] = useState<'sql' | 'prisma' | 'erd'>('sql');

  const rawSqlSchemaCode = `-- ==============================================================================
-- KlipForge AI / OpusClip Alternative - PostgreSQL Relational Database Schema
-- Compatible with PostgreSQL 14+, Supabase, AWS RDS, Neon
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Voor fuzzy transcript full-text search

-- 2. Enumerated Types
CREATE TYPE plan_tier AS ENUM ('FREE', 'CREATOR_PRO', 'AGENCY');
CREATE TYPE video_status AS ENUM ('UPLOADING', 'QUEUED', 'TRANSCRIBING', 'ANALYZING', 'READY', 'FAILED');
CREATE TYPE clip_status AS ENUM ('GENERATED', 'EDITING', 'RENDERING', 'EXPORTED', 'FAILED');
CREATE TYPE aspect_ratio AS ENUM ('9:16', '1:1', '16:9');
CREATE TYPE credit_action AS ENUM ('DEDUCTION', 'REFUND', 'MONTHLY_RENEWAL', 'TOPUP_PURCHASE');

-- 3. USERS TABLE
-- Tracks authentication, subscription tier, and minute credits
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- NULL if using OAuth (Google/GitHub)
    full_name VARCHAR(120),
    avatar_url TEXT,
    plan_tier plan_tier NOT NULL DEFAULT 'FREE',
    
    -- Credit Balance Engine (minutes)
    total_minutes INT NOT NULL DEFAULT 60,
    used_minutes INT NOT NULL DEFAULT 0,
    billing_cycle_reset TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Enforce that users cannot consume more minutes than allocated
    CONSTRAINT check_positive_credits CHECK (total_minutes >= 0),
    CONSTRAINT check_used_credits_bounds CHECK (used_minutes <= total_minutes)
);

-- 4. VIDEOS TABLE
-- Stores original uploaded or linked media assets and raw transcripts
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    source_url TEXT,                        -- YouTube, Vimeo, Loom or raw HTTP link
    storage_key VARCHAR(500) NOT NULL,       -- S3 / Cloudflare R2 bucket object path
    thumbnail_url TEXT,
    
    duration_seconds NUMERIC(10, 2) NOT NULL,
    resolution VARCHAR(50) DEFAULT '1920x1080',
    fps INT DEFAULT 30,
    file_size_bytes BIGINT,
    language VARCHAR(10) DEFAULT 'auto',
    
    status video_status NOT NULL DEFAULT 'QUEUED',
    error_message TEXT,
    
    -- Full Whisper transcription JSON payload with word-level precision:
    -- [{"word": "OpenAI", "start": 7.02, "end": 7.64, "probability": 0.98}, ...]
    full_transcript JSONB,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CLIPS TABLE
-- Stores AI-identified viral short-form segments, hooks, and karaoke subtitles
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    hook_category VARCHAR(60) NOT NULL,     -- e.g. "Controversial", "Story", "Value Bomb"
    start_time NUMERIC(10, 3) NOT NULL,     -- Seconds in original video (e.g. 142.500)
    end_time NUMERIC(10, 3) NOT NULL,       -- Seconds in original video (e.g. 178.200)
    duration_seconds NUMERIC(10, 3) GENERATED ALWAYS AS (end_time - start_time) STORED,
    aspect_ratio aspect_ratio NOT NULL DEFAULT '9:16',
    
    -- AI Virality Scorecard (0 - 100)
    virality_score INT NOT NULL CHECK (virality_score BETWEEN 0 AND 100),
    hook_score INT NOT NULL CHECK (hook_score BETWEEN 0 AND 100),         -- First 3 seconds retention
    flow_score INT NOT NULL CHECK (flow_score BETWEEN 0 AND 100),         -- Pacing & speech cadence
    curiosity_score INT NOT NULL CHECK (curiosity_score BETWEEN 0 AND 100),-- Cognitive gap / suspense
    emotional_peak INT NOT NULL DEFAULT 80 CHECK (emotional_peak BETWEEN 0 AND 100),
    ai_rationale TEXT NOT NULL,
    recommended_hook VARCHAR(255) NOT NULL,
    suggested_hashtags TEXT[] DEFAULT '{}',
    
    -- Interactive Subtitle Data & Styling (Hormozi / MrBeast / Minimal)
    -- JSON structure: [{"word": "STOP", "start": 0.1, "end": 0.6, "highlight": true, "emoji": "🛑"}]
    subtitles_json JSONB NOT NULL,
    subtitle_style VARCHAR(50) NOT NULL DEFAULT 'hormozi',
    
    -- Auto-Reframe Camera Trajectory for 9:16 Crop
    -- JSON array of tracking coordinates: [{"t": 0.0, "x": 0.52}, {"t": 1.5, "x": 0.48}]
    reframe_keyframes JSONB,
    speaker_focus_x NUMERIC(4, 3) DEFAULT 0.500,
    
    -- Rendered Output Assets
    rendered_storage_key VARCHAR(500),      -- Path to finalized 1080x1920 MP4 on S3/R2
    status clip_status NOT NULL DEFAULT 'GENERATED',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT check_clip_valid_range CHECK (end_time > start_time)
);

-- 6. CREDIT TRANSACTIONS (Audit Log)
-- Ensures idempotent and transparent credit usage
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
    amount_minutes INT NOT NULL,            -- Positive for deduction, negative for refund/topup
    action credit_action NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);

CREATE INDEX idx_clips_video_id ON clips(video_id);
CREATE INDEX idx_clips_virality_score ON clips(virality_score DESC);
CREATE INDEX idx_clips_aspect_ratio ON clips(aspect_ratio);

-- GIN Index on JSONB transcript for lightning-fast keyword lookups
CREATE INDEX idx_videos_transcript_gin ON videos USING GIN (full_transcript jsonb_path_ops);
CREATE INDEX idx_clips_subtitles_gin ON clips USING GIN (subtitles_json jsonb_path_ops);

-- ==============================================================================
-- ATOMIC STORED PROCEDURE: CREDIT DEDUCTION
-- Guarantees race-condition-free credit deduction before processing starts
-- ==============================================================================
CREATE OR REPLACE FUNCTION deduct_user_credits(
    p_user_id UUID,
    p_video_id UUID,
    p_minutes INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_available INT;
BEGIN
    -- Row-level lock to prevent concurrent double-spending
    SELECT (total_minutes - used_minutes) INTO v_available
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_available IS NULL OR v_available < p_minutes THEN
        RETURN FALSE; -- Insufficient credits
    END IF;

    -- Update user consumed credits
    UPDATE users
    SET used_minutes = used_minutes + p_minutes,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Log transaction
    INSERT INTO credit_transactions (user_id, video_id, amount_minutes, action, description)
    VALUES (p_user_id, p_video_id, p_minutes, 'DEDUCTION', 'Video processing deduction');

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;`;

  const [pipelineCodeTab, setPipelineCodeTab] = useState<'pipeline' | 'fastapi' | 'celery' | 'subtitles'>('pipeline');

  const fastApiCode = `# app/main.py
from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
import boto3
import uuid
from app.tasks import process_video_task

app = FastAPI(title="KlipForge Video Repurposing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

s3_client = boto3.client("s3")
S3_BUCKET = "klipforge-media-storage"

class CreateVideoRequest(BaseModel):
    user_id: str
    title: str
    source_url: str | None = None
    file_name: str | None = None
    target_duration: str = "30-60" # "30-60", "<30", "60-90"
    reframe_mode: str = "smart"    # "smart", "split", "center"
    subtitle_style: str = "hormozi"

class PresignedUrlResponse(BaseModel):
    video_id: str
    storage_key: str
    upload_url: str

@app.post("/api/videos/presigned-upload", response_model=PresignedUrlResponse)
async def generate_presigned_upload(req: CreateVideoRequest):
    """
    Genereert een presigned PUT URL zodat de browser direct 
    grote video's (tot 2GB) naar S3/Cloudflare R2 streamt.
    """
    video_id = str(uuid.uuid4())
    storage_key = f"uploads/{req.user_id}/{video_id}/{req.file_name or 'source.mp4'}"
    
    upload_url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": S3_BUCKET,
            "Key": storage_key,
            "ContentType": "video/mp4",
        },
        ExpiresIn=3600, # 1 uur geldig
    )
    
    return PresignedUrlResponse(
        video_id=video_id,
        storage_key=storage_key,
        upload_url=upload_url,
    )

@app.post("/api/videos/{video_id}/start-processing")
async def start_processing(video_id: str, req: CreateVideoRequest):
    """
    Start de asynchrone Celery worker pipeline nadat het bestand is geüpload
    of wanneer een YouTube link wordt meegegeven.
    """
    # 1. Start Celery Worker job
    task = process_video_task.delay(
        video_id=video_id,
        user_id=req.user_id,
        source_url=req.source_url,
        storage_key=f"uploads/{req.user_id}/{video_id}/{req.file_name or 'source.mp4'}",
        target_duration=req.target_duration,
        subtitle_style=req.subtitle_style
    )
    
    return {"status": "QUEUED", "task_id": str(task.id), "video_id": video_id}`;

  const celeryCode = `# app/tasks.py
from celery import Celery
import os
import psycopg2
from app.pipeline.video_processor import VideoRepurposingPipeline

celery_app = Celery(
    "video_workers",
    broker=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    backend=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)

@celery_app.task(bind=True, max_retries=2)
def process_video_task(self, video_id: str, user_id: str, source_url: str, storage_key: str, target_duration: str, subtitle_style: str):
    pipeline = VideoRepurposingPipeline()
    temp_dir = f"/tmp/{video_id}"
    os.makedirs(temp_dir, exist_ok=True)
    video_path = f"{temp_dir}/source.mp4"
    audio_path = f"{temp_dir}/audio.wav"

    try:
        # Stap 1: Download van YouTube of S3
        self.update_state(state="PROGRESS", meta={"step": "DOWNLOADING", "progress": 10})
        if source_url:
            pipeline.download_youtube_or_link(source_url, video_path)
        else:
            pipeline.download_from_s3(storage_key, video_path)

        # Stap 2: Audio Demuxing (16kHz mono WAV)
        self.update_state(state="PROGRESS", meta={"step": "DEMUXING", "progress": 25})
        pipeline.extract_audio(video_path, audio_path)

        # Stap 3: Faster-Whisper Transcriptie met woord-timestamps
        self.update_state(state="PROGRESS", meta={"step": "TRANSCRIBING", "progress": 45})
        transcript_data = pipeline.transcribe_with_word_timestamps(audio_path)

        # Stap 4: LLM Hook & Virality Chunking
        self.update_state(state="PROGRESS", meta={"step": "ANALYZING_VIRALITY", "progress": 65})
        clips_proposals = pipeline.detect_viral_segments(transcript_data)

        # Stap 5: Voor elke clip -> Auto-Reframe 9:16 + Subtitle Burn + Upload
        for idx, clip in enumerate(clips_proposals):
            self.update_state(
                state="PROGRESS", 
                meta={"step": f"RENDERING_CLIP_{idx+1}", "progress": 70 + (idx * 6)}
            )
            center_x = pipeline.compute_auto_reframe_center(
                video_path, clip.start_time, clip.end_time
            )
            ass_path = pipeline.generate_karaoke_ass(
                transcript_data["words"], clip.start_time, clip.end_time, subtitle_style
            )
            output_mp4 = f"{temp_dir}/clip_{idx+1}_916.mp4"
            pipeline.render_final_short(
                video_path, clip.start_time, (clip.end_time - clip.start_time),
                center_x, ass_path, output_mp4
            )
            s3_clip_key = pipeline.upload_to_s3(output_mp4, f"clips/{user_id}/{clip.title[:30]}.mp4")
            pipeline.save_clip_to_database(video_id, clip, s3_clip_key, center_x)

        return {"status": "COMPLETED", "clips_generated": len(clips_proposals)}

    except Exception as exc:
        self.retry(exc=exc, countdown=30)`;

  const [frontendTab, setFrontendTab] = useState<'dashboard' | 'editor'>('dashboard');

  const nextJsDashboardCode = `// app/dashboard/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  Play, 
  Settings2, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Youtube 
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState<'30-60' | '<30' | '60-90'>('30-60');
  const [reframeMode, setReframeMode] = useState<'smart' | 'split' | 'center'>('smart');
  const [subtitleStyle, setSubtitleStyle] = useState<'hormozi' | 'mrbeast' | 'minimal'>('hormozi');

  const handleStartAnalysis = async () => {
    setIsUploading(true);
    try {
      // 1. Vraag presigned URL of enqueue YouTube link bij de FastAPI backend
      const res = await fetch('/api/videos/start-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_url: url,
          target_duration: duration,
          reframe_mode: reframeMode,
          subtitle_style: subtitleStyle,
        })
      });
      const data = await res.json();
      // 2. Navigeer naar de clip editor
      router.push(\`/editor/\${data.video_id}\`);
    } catch (err) {
      console.error('Upload fout:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-950 text-violet-300 border border-violet-800">
          ⚡ AI Video Repurposing Studio
        </span>
        <h1 className="text-4xl font-extrabold text-white">
          Zet lange video's om in <span className="text-violet-400">virale shorts</span>
        </h1>
        <p className="text-sm text-zinc-400">
          Plak een YouTube link of upload een MP4. Onze AI vindt automatisch de beste hooks.
        </p>
      </div>

      {/* Main Upload Box */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* YouTube / Link input */}
          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-3">
            <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-2">
              <Youtube className="w-4 h-4 text-red-500" />
              <span>Plak YouTube / Podcast URL</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-3 pr-10 py-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <p className="text-[11px] text-zinc-500">Ondersteunt YouTube, Vimeo, Loom en directe MP4 links.</p>
          </div>

          {/* Drag & Drop File */}
          <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 border-dashed hover:border-violet-500 transition-all flex flex-col items-center justify-center text-center cursor-pointer group">
            <UploadCloud className="w-10 h-10 text-violet-400 group-hover:scale-110 transition-transform mb-2" />
            <h4 className="text-sm font-semibold text-white">Sleep een MP4 of MOV hierheen</h4>
            <p className="text-xs text-zinc-500 mt-1">Tot 2GB • 1080p / 4K</p>
          </div>

        </div>

        {/* AI Settings */}
        <div className="pt-4 border-t border-zinc-800 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">Doelduur</span>
            <div className="grid grid-cols-3 gap-1">
              {(['<30', '30-60', '60-90'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={\`py-1.5 text-xs font-semibold rounded-lg \${duration === d ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}\`}
                >
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">9:16 Reframe</span>
            <div className="grid grid-cols-3 gap-1">
              {(['smart', 'split', 'center'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setReframeMode(r)}
                  className={\`py-1.5 text-xs font-semibold rounded-lg capitalize \${reframeMode === r ? 'bg-violet-600 text-white' : 'bg-zinc-800 text-zinc-400'}\`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-zinc-400">Ondertiteling</span>
            <div className="grid grid-cols-3 gap-1">
              {(['hormozi', 'mrbeast', 'minimal'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSubtitleStyle(s)}
                  className={\`py-1.5 text-xs font-semibold rounded-lg capitalize \${subtitleStyle === s ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}\`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleStartAnalysis}
            disabled={isUploading || !url}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isUploading ? 'Bezig met analyseren...' : 'Genereer Virale Clips'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}`;

  const nextJsEditorCode = `// app/editor/[id]/page.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Play, Pause, Download, Eye, Flame, Edit3, Target, TrendingUp, Sparkles, Copy, Check } from 'lucide-react';

interface Word {
  id: string;
  word: string;
  start: number;
  end: number;
  highlight?: boolean;
}

export default function ClipEditorPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [subtitleStyle, setSubtitleStyle] = useState<'hormozi' | 'mrbeast' | 'minimal'>('hormozi');
  const [showFaceBox, setShowFaceBox] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Woord-voor-woord transcriptie gesynchroniseerd met timestamps
  const [words, setWords] = useState<Word[]>([
    { id: '1', word: 'IEDEREEN', start: 0.1, end: 0.7, highlight: true },
    { id: '2', word: 'denkt', start: 0.8, end: 1.1 },
    { id: '3', word: 'dat', start: 1.2, end: 1.4 },
    { id: '4', word: 'een', start: 1.5, end: 1.6 },
    { id: '5', word: 'GPT-WRAPPER', start: 1.7, end: 2.7, highlight: true },
    { id: '6', word: 'een', start: 2.8, end: 3.1 },
    { id: '7', word: 'MILJARDENBEDRIJF', start: 3.2, end: 4.1, highlight: true },
    { id: '8', word: 'oplevert.', start: 4.2, end: 4.8 },
  ]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const jumpToWord = (startSec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startSec;
      setCurrentTime(startSec);
      if (!isPlaying) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const activeWord = words.find(w => currentTime >= w.start && currentTime <= w.end);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 1. SMART 9:16 VERTICAL PLAYER (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center">
          <div className="w-full max-w-[320px] bg-zinc-950 rounded-3xl border-4 border-zinc-800 p-2.5 relative shadow-2xl">
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <video
                ref={videoRef}
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
                loop
                playsInline
                className="w-full h-full object-cover"
                style={{ objectPosition: '52% center' }} // Dynamische MediaPipe speaker pan
              />

              {/* MediaPipe Face Tracking Bounding Box */}
              {showFaceBox && (
                <div className="absolute top-[22%] left-[35%] w-[30%] h-[24%] border-2 border-emerald-400 bg-emerald-500/10 rounded-xl pointer-events-none">
                  <span className="absolute -top-5 left-1 text-[9px] font-mono bg-emerald-500 text-black px-1 rounded font-bold">
                    Face: 98%
                  </span>
                </div>
              )}

              {/* Live Hormozi Karaoke Subtitles Overlay */}
              <div className="absolute bottom-12 inset-x-3 flex flex-wrap justify-center gap-1.5 pointer-events-none">
                {words.map(w => {
                  const isCurrent = activeWord?.id === w.id;
                  return (
                    <span
                      key={w.id}
                      className={\`font-black text-xl uppercase transition-all duration-150 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] \${
                        isCurrent 
                          ? 'text-amber-300 scale-125 bg-black/60 px-1 rounded border border-amber-400 -rotate-1'
                          : w.highlight ? 'text-emerald-300' : 'text-white'
                      }\`}
                    >
                      {w.word}
                    </span>
                  );
                })}
              </div>

              {/* Play Overlay */}
              <button
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-xl">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 2. SUBTITLE STYLER & TRANSCRIPT TIMELINE (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-violet-400" />
              <span>Transcript Editor (Klik op woord om te spoelen)</span>
            </h3>
            <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-950 rounded-xl border border-zinc-800">
              {words.map(w => (
                <span
                  key={w.id}
                  onClick={() => jumpToWord(w.start)}
                  className={\`text-xs px-2 py-1 rounded-lg cursor-pointer transition-all \${
                    currentTime >= w.start && currentTime <= w.end
                      ? 'bg-amber-400 text-black font-black scale-105'
                      : w.highlight
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                      : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                  }\`}
                >
                  {w.word}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. VIRALITY SCORECARD (3 cols) */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-zinc-400 uppercase">AI Virality Index</span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded">VIRAL GOLD</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-black text-amber-400">97</span>
            <span className="text-zinc-500 font-bold">/ 100</span>
          </div>
          <button className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-amber-500 text-white font-bold text-xs shadow-lg">
            Download 9:16 MP4 (1080p)
          </button>
        </div>

      </div>
    </div>
  );
}`;

  const prismaSchemaCode = `// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum PlanTier {
  FREE
  CREATOR_PRO
  AGENCY
}

enum VideoStatus {
  UPLOADING
  QUEUED
  TRANSCRIBING
  ANALYZING
  READY
  FAILED
}

enum ClipStatus {
  GENERATED
  EDITING
  RENDERING
  EXPORTED
}

model User {
  id              String      @id @default(uuid())
  email           String      @unique
  fullName        String?
  avatarUrl       String?
  planTier        PlanTier    @default(FREE)
  totalMinutes    Int         @default(60)   // Total allowance
  usedMinutes     Int         @default(0)    // Consumed video minutes
  stripeCustomerId String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  videos          Video[]
  apiKeys         ApiKey[]

  @@map("users")
}

model Video {
  id              String       @id @default(uuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  title           String
  sourceUrl       String?      // YouTube / Vimeo URL
  storageKey      String       // S3 / R2 bucket path for original video
  thumbnailUrl    String?
  durationSeconds Float
  resolution      String       @default("1920x1080")
  status          VideoStatus  @default(QUEUED)
  
  // Stored JSON transcript from Whisper with word-level timestamps
  fullTranscript  Json?
  
  clips           Clip[]
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([userId])
  @@map("videos")
}

model Clip {
  id              String       @id @default(uuid())
  videoId         String
  video           Video        @relation(fields: [videoId], references: [id], onDelete: Cascade)

  title           String
  hookCategory    String       // "Controversial", "Story", "Value Bomb"
  startTime       Float        // Seconds in original video
  endTime         Float        // Seconds in original video
  durationSeconds Float
  aspectRatio     String       @default("9:16") // "9:16", "1:1", "16:9"

  // AI Virality Evaluation
  viralityScore   Int          // 0 - 100
  hookScore       Int          // 0 - 100
  flowScore       Int          // 0 - 100
  curiosityScore  Int          // 0 - 100
  aiRationale     String       @db.Text
  recommendedHook String

  // Subtitle words and karaoke styling
  subtitlesJson   Json         // Array of {word, start, end, highlight, emoji}
  subtitleStyle   String       @default("hormozi") // "hormozi" | "mrbeast" | "minimal"

  // Auto-Reframe camera pan keyframes [{timestamp, center_x}]
  reframeKeyframes Json?

  // Rendered export asset
  renderedUrl     String?      // S3 path of cropped 9:16 MP4
  status          ClipStatus   @default(GENERATED)
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([videoId])
  @@map("clips")
}

model ApiKey {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  keyHash     String   @unique
  name        String
  createdAt   DateTime @default(now())

  @@map("api_keys")
}`;

  const pythonPipelineCode = `# app/pipeline/video_processor.py
import os
import json
import subprocess
from typing import List, Dict, Any
from pydantic import BaseModel, Field
from faster_whisper import WhisperModel
import cv2
import mediapipe as mp
from google import genai
from google.genai import types

class ViralityClipProposal(BaseModel):
    title: str = Field(description="Catchy title for the viral short")
    hook_category: str = Field(description="Category: Controversial, Story, Value Bomb, Mindset")
    start_time: float = Field(description="Start time in seconds")
    end_time: float = Field(description="End time in seconds")
    virality_score: int = Field(description="Score between 0 and 100 based on hook and pacing")
    hook_score: int = Field(description="0-100 score for the first 3 seconds impact")
    rationale: str = Field(description="Why this segment will retain short-form viewers")
    recommended_hook_text: str = Field(description="High-retention caption to display on video")
    hashtags: List[str]

class ViralityAnalysisResponse(BaseModel):
    clips: List[ViralityClipProposal]

class VideoRepurposingPipeline:
    def __init__(self):
        # 1. Initialize Faster-Whisper on GPU (CTranslate2 int8)
        self.whisper = WhisperModel("large-v3", device="cuda", compute_type="float16")
        
        # 2. Initialize Gemini 2.5 Flash client for chunking logic
        self.gemini = genai.Client()
        
        # 3. MediaPipe Face Detection for Auto-Reframe 9:16
        self.mp_face = mp.solutions.face_detection.FaceDetection(
            model_selection=1, min_detection_confidence=0.6
        )

    def extract_audio(self, video_path: str, output_wav: str) -> str:
        """FFmpeg extracts 16kHz mono audio stream in ~0.5s"""
        cmd = [
            "ffmpeg", "-y", "-i", video_path,
            "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
            output_wav
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return output_wav

    def transcribe_with_word_timestamps(self, audio_path: str) -> Dict[str, Any]:
        """Runs Faster-Whisper with VAD to get accurate word-level timestamps"""
        segments, info = self.whisper.transcribe(
            audio_path,
            beam_size=5,
            word_timestamps=True,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500)
        )
        
        transcript_words = []
        transcript_text = []

        for segment in segments:
            transcript_text.append(segment.text)
            for word in segment.words:
                transcript_words.append({
                    "word": word.word.strip(),
                    "start": round(word.start, 2),
                    "end": round(word.end, 2),
                    "probability": round(word.probability, 2)
                })

        return {
            "language": info.language,
            "duration": info.duration,
            "full_text": " ".join(transcript_text),
            "words": transcript_words
        }

    def detect_viral_segments(self, transcript_data: Dict[str, Any]) -> List[ViralityClipProposal]:
        """Uses LLM with structured output to pinpoint viral hooks and payoff arcs"""
        prompt = f"""
        Je bent een virale short-form video editor (TikTok, YouTube Shorts, Reels).
        Analyseer onderstaand transcript met timestamps.
        
        Selecteer de top 3 tot 5 meest virale clips van 30 tot 60 seconden.
        
        Criteria voor een virale clip:
        1. DE HOOK (Eerste 3 seconden): Moet een gedurfd statement, vraag of onthulling zijn.
        2. COHERENTIE: Moet een compleet verhaal of inzicht zijn zonder afgebroken zinnen.
        3. EMOTIONELE LADING: Wekt nieuwsgierigheid, FOMO, herkenning of humor op.
        
        TRANSCRIPT WOORDEN EN TIMESTAMPS:
        {json.dumps(transcript_data['words'][:300], ensure_ascii=False)}
        """

        response = self.gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ViralityAnalysisResponse,
                temperature=0.2
            )
        )

        result = ViralityAnalysisResponse.model_validate_json(response.text)
        return result.clips

    def compute_auto_reframe_center(self, video_path: str, start_time: float, end_time: float) -> float:
        """
        Samples frames every 0.5s to find the primary speaker's center_x 
        for smooth 9:16 vertical cropping.
        """
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        
        start_frame = int(start_time * fps)
        end_frame = int(end_time * fps)
        
        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        x_centers = []
        
        step_frames = int(fps * 0.5) # sample every 0.5s
        for f in range(start_frame, end_frame, step_frames):
            cap.set(cv2.CAP_PROP_POS_FRAMES, f)
            ret, frame = cap.read()
            if not ret:
                break
            
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = self.mp_face.process(rgb_frame)
            
            if results.detections:
                # Get the largest face bounding box
                best_face = max(results.detections, key=lambda d: d.location_data.relative_bounding_box.width)
                bbox = best_face.location_data.relative_bounding_box
                center_x = bbox.xmin + (bbox.width / 2.0)
                x_centers.append(center_x)
                
        cap.release()
        # Return average or smoothed speaker focus center (0.0 to 1.0)
        return sum(x_centers) / len(x_centers) if x_centers else 0.5

    def render_final_short(
        self, 
        video_path: str, 
        start_time: float, 
        duration: float, 
        center_x: float, 
        ass_subtitles_path: str, 
        output_path: str
    ):
        """
        FFmpeg command to crop 9:16 around speaker and burn-in ASS karaoke subtitles.
        Uses NVENC for fast GPU hardware encoding.
        """
        # Crop math: 9:16 aspect ratio = height * (9/16)
        crop_filter = f"crop=ih*(9/16):ih:max(0\\,min(iw-ih*(9/16)\\,iw*{center_x}-ih*(9/32))):0"
        
        cmd = [
            "ffmpeg", "-y",
            "-ss", str(start_time),
            "-t", str(duration),
            "-i", video_path,
            "-vf", f"{crop_filter},ass={ass_subtitles_path}",
            "-c:v", "h264_nvenc", "-preset", "p4", "-b:v", "8M",
            "-c:a", "aac", "-b:a", "192k",
            output_path
        ]
        subprocess.run(cmd, check=True)
`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-violet-950/70 via-indigo-950/50 to-zinc-900 border border-violet-800/50 rounded-2xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Productie-Rijpe Technische Blauwdruk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
          KlipForge Enterprise Pipeline: Technische Architectuur
        </h1>
        <p className="text-zinc-300 text-sm sm:text-base max-w-3xl leading-relaxed">
          Volledige productspecificatie: van microservices en Gemini AI virality scoring tot relationele PostgreSQL/Prisma datamodellering, asynchrone GPU pipelines en Next.js componenten.
        </p>
      </div>

      {/* Step Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveSection('step1')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSection === 'step1'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Stap 1: Tech Stack &amp; Architectuur</span>
        </button>

        <button
          onClick={() => setActiveSection('step2')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSection === 'step2'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Stap 2: Database Schema (Prisma / SQL)</span>
        </button>

        <button
          onClick={() => setActiveSection('step3')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSection === 'step3'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Stap 3: Backend Python/FastAPI Pipeline</span>
        </button>

        <button
          onClick={() => setActiveSection('step4')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSection === 'step4'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
              : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Layout className="w-4 h-4" />
          <span>Stap 4: Frontend UI Structuur (Next.js)</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: ARCHITECTUUR & TECH STACK */}
      {/* ======================================================== */}
      {activeSection === 'step1' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Frontend */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">1. Frontend Stack</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li><strong className="text-white">Framework:</strong> Next.js 15 (App Router) of React SPA + Vite.</li>
                <li><strong className="text-white">Styling:</strong> Tailwind CSS v4 voor responsieve dark-mode UI.</li>
                <li><strong className="text-white">Video Rendering / Preview:</strong> HTML5 Video met gesynchroniseerde Canvas overlay &amp; Web Audio API voor milliseconde-precieze karaoke karaoke highlight.</li>
                <li><strong className="text-white">State Management:</strong> Zustand (voor clip status, scrubbing en live transcript edits).</li>
              </ul>
            </div>

            {/* Backend & Queue */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">2. Backend &amp; Async Queue</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li><strong className="text-white">API Gateway:</strong> Python 3.11 + FastAPI (Pydantic v2 voor strikte validatie &amp; WebSockets voor live voortgang).</li>
                <li><strong className="text-white">Worker Orchestratie:</strong> Celery met Redis Broker (of Temporal / AWS SQS) voor lange videotaken.</li>
                <li><strong className="text-white">Compute Cluster:</strong> Docker containers op AWS ECS / GCP Cloud Run met GPU nodes (NVIDIA T4 of A10G voor snelle FFmpeg &amp; Whisper inferentie).</li>
              </ul>
            </div>

            {/* AI/ML Models */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">3. AI &amp; Computer Vision</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li><strong className="text-white">Speech-to-Text:</strong> Faster-Whisper (Large-v3 CTranslate2) met Silero VAD voor woord-niveau timestamps.</li>
                <li><strong className="text-white">Hook &amp; Virality:</strong> Gemini 2.5 Flash / GPT-4o met gestructureerde JSON output (bepaalt start/eind en virality score).</li>
                <li><strong className="text-white">9:16 Auto-Reframe:</strong> YOLOv8-Face of Google MediaPipe Face Mesh + Exponential Moving Average filter.</li>
              </ul>
            </div>

            {/* Database */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">4. Database &amp; Auth</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li><strong className="text-white">Database:</strong> PostgreSQL (via Supabase of Neon Serverless) met Prisma ORM.</li>
                <li><strong className="text-white">Credits Systeem:</strong> Atomische transacties (`UPDATE users SET used_minutes = used_minutes + :cost WHERE id = :id AND used_minutes + :cost &lt;= total_minutes`).</li>
                <li><strong className="text-white">Authenticatie:</strong> NextAuth / Clerk of Firebase Auth.</li>
              </ul>
            </div>

            {/* Storage & CDN */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">5. Opslag &amp; CDN</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li><strong className="text-white">Object Storage:</strong> Cloudflare R2 of AWS S3 (R2 heeft $0 egress kosten, cruciaal voor video delivery).</li>
                <li><strong className="text-white">Presigned URLs:</strong> Directe upload van browser naar S3/R2 om server memory overbelasting te voorkomen.</li>
                <li><strong className="text-white">Retention Policy:</strong> Lifecycle rules om originele zware bronbestanden na 14 dagen op te schonen.</li>
              </ul>
            </div>

            {/* Video Processing Engine */}
            <div className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">6. FFmpeg Processing</h3>
              <ul className="text-xs text-zinc-300 space-y-2">
                <li><strong className="text-white">Subtitles:</strong> Libass filter met Advanced SubStation Alpha (.ass) voor dynamische Hormozi effecten &amp; custom styling.</li>
                <li><strong className="text-white">GPU Encoding:</strong> `h264_nvenc` op Linux met hardware rate control (CBR/VBR).</li>
                <li><strong className="text-white">Parallel Chunks:</strong> Snijden en branden gebeurt per clip in parallelle worker jobs.</li>
              </ul>
            </div>

          </div>

          {/* High Level Flow Chart */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide uppercase">End-to-End Dataflow Diagram</h4>
            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-300 overflow-x-auto space-y-2">
              <div className="text-violet-400 font-bold">[1. Client Upload]</div>
              <p>User past YouTube URL of sleept MP4 → S3 Presigned PUT → Backend maakt Video record aan (status: QUEUED).</p>
              
              <div className="text-emerald-400 font-bold pt-2">[2. Celery Worker Pipeline]</div>
              <p>FFmpeg demuxt 16kHz mono audio → Faster-Whisper genereert transcript met woord-timestamps → Silero VAD elimineert stiltes.</p>

              <div className="text-amber-400 font-bold pt-2">[3. LLM Content Analyse]</div>
              <p>Gemini 2.5 Flash / GPT-4o parseert narratieve pieken &amp; berekent Virality Score (0-100), Hook potentieel en knipt 30-60s vensters.</p>

              <div className="text-cyan-400 font-bold pt-2">[4. Computer Vision 9:16 Reframe]</div>
              <p>MediaPipe Face Mesh volgt actieve spreker frame-per-frame → berekent vloeiende pan-coördinaten (center_x).</p>

              <div className="text-pink-400 font-bold pt-2">[5. Subtitle Rendering &amp; Export]</div>
              <p>Generator maakt .ass karaoke bestand met bounce tags → FFmpeg brandt subtitles &amp; cropt 9:16 naar R2/S3 → WebSocket push naar Next.js UI.</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: DATABASE SCHEMA */}
      {/* ======================================================== */}
      {activeSection === 'step2' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">PostgreSQL &amp; Prisma Database Schema</h3>
              <p className="text-xs text-zinc-400">
                Inclusief creditsysteem voor videominuten, woord-niveau transcripties, 9:16 tracking en cascade deletes.
              </p>
            </div>

            {/* Sub-tabs for SQL vs Prisma vs ERD */}
            <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSchemaFormat('sql')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  schemaFormat === 'sql'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                PostgreSQL (DDL)
              </button>
              <button
                onClick={() => setSchemaFormat('prisma')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  schemaFormat === 'prisma'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Prisma ORM
              </button>
              <button
                onClick={() => setSchemaFormat('erd')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  schemaFormat === 'erd'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tabel Relaties (ERD)
              </button>
            </div>
          </div>

          {/* Code or ERD view */}
          {schemaFormat === 'sql' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Direct uitvoerbaar in PostgreSQL 14+, Neon, Supabase of AWS Aurora</span>
                <button
                  onClick={() => handleCopy('sql', rawSqlSchemaCode)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'sql' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'sql' ? 'Gekopieerd!' : 'Kopieer SQL DDL'}</span>
                </button>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto shadow-xl max-h-[550px] overflow-y-auto">
                <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                  <code>{rawSqlSchemaCode}</code>
                </pre>
              </div>
            </div>
          )}

          {schemaFormat === 'prisma' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Voor gebruik in Next.js / Node.js met Prisma Client (typesafe)</span>
                <button
                  onClick={() => handleCopy('prisma', prismaSchemaCode)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'prisma' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'prisma' ? 'Gekopieerd!' : 'Kopieer Prisma Schema'}</span>
                </button>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto shadow-xl max-h-[550px] overflow-y-auto">
                <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                  <code>{prismaSchemaCode}</code>
                </pre>
              </div>
            </div>
          )}

          {schemaFormat === 'erd' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Users Table Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-mono font-bold text-sm text-violet-400">table: users</span>
                  <span className="text-[10px] bg-violet-950 text-violet-300 px-2 py-0.5 rounded">Core Entity</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>🔑 id</span>
                    <span className="text-zinc-500">UUID (PK)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>email</span>
                    <span className="text-zinc-500">VARCHAR UNIQUE</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>plan_tier</span>
                    <span className="text-amber-400">ENUM</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>total_minutes</span>
                    <span className="text-emerald-400">INT (Credits)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>used_minutes</span>
                    <span className="text-emerald-400">INT (Consumed)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>billing_reset</span>
                    <span className="text-zinc-500">TIMESTAMPTZ</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                  Beheert authenticatie en atomische credit-minuten via <code className="text-violet-300">CHECK (used &lt;= total)</code>.
                </p>
              </div>

              {/* Videos Table Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-mono font-bold text-sm text-indigo-400">table: videos</span>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded">Source Media</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>🔑 id</span>
                    <span className="text-zinc-500">UUID (PK)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>🔗 user_id</span>
                    <span className="text-violet-400">UUID (FK -&gt; users)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>source_url</span>
                    <span className="text-zinc-500">TEXT (YouTube)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>storage_key</span>
                    <span className="text-zinc-500">VARCHAR (S3/R2)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>duration_seconds</span>
                    <span className="text-amber-400">NUMERIC(10,2)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>status</span>
                    <span className="text-zinc-400">video_status</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>full_transcript</span>
                    <span className="text-cyan-400">JSONB (GIN Index)</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                  Bevat de ruwe bronaudio/video metadata en het complete Whisper transcriptie-payload met milliseconde-timestamps.
                </p>
              </div>

              {/* Clips Table Card */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 space-y-3 shadow-lg">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span className="font-mono font-bold text-sm text-emerald-400">table: clips</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">Viral Output</span>
                </div>
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>🔑 id</span>
                    <span className="text-zinc-500">UUID (PK)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>🔗 video_id</span>
                    <span className="text-indigo-400">UUID (FK -&gt; videos)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>start_time / end</span>
                    <span className="text-amber-400">NUMERIC(10,3)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300 font-bold">
                    <span>virality_score</span>
                    <span className="text-emerald-400">INT (0-100)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>hook_score</span>
                    <span className="text-violet-400">INT (0-100)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>subtitles_json</span>
                    <span className="text-cyan-400">JSONB (Karaoke)</span>
                  </div>
                  <div className="flex justify-between text-zinc-300">
                    <span>reframe_keyframes</span>
                    <span className="text-pink-400">JSONB (9:16 Pan)</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                  Bevat de gegenereerde 9:16 fragmenten, virality index, Hormozi karaoke tags en pan-coördinaten.
                </p>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: BACKEND PYTHON PIPELINE */}
      {/* ======================================================== */}
      {activeSection === 'step3' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white">Python / FastAPI Core Pipeline Code</h3>
              <p className="text-xs text-zinc-400">
                Audio demuxing, Faster-Whisper met woord-timestamps, Gemini 2.5 virality scoring en MediaPipe 9:16 tracking.
              </p>
            </div>

            {/* Sub-tabs for pipeline files */}
            <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setPipelineCodeTab('pipeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  pipelineCodeTab === 'pipeline'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                pipeline.py (AI Engine)
              </button>
              <button
                onClick={() => setPipelineCodeTab('fastapi')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  pipelineCodeTab === 'fastapi'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                main.py (FastAPI)
              </button>
              <button
                onClick={() => setPipelineCodeTab('celery')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  pipelineCodeTab === 'celery'
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                tasks.py (Celery)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>
                {pipelineCodeTab === 'pipeline' && 'Core AI video-pipeline: Whisper, Gemini virality chunking & MediaPipe 9:16 crop'}
                {pipelineCodeTab === 'fastapi' && 'FastAPI endpoints voor presigned S3 uploads en async job triggering'}
                {pipelineCodeTab === 'celery' && 'Asynchrone Celery worker voor het afhandelen van zware videotaken op de GPU'}
              </span>
              <button
                onClick={() => {
                  const code = pipelineCodeTab === 'pipeline' ? pythonPipelineCode : pipelineCodeTab === 'fastapi' ? fastApiCode : celeryCode;
                  handleCopy('active-python', code);
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === 'active-python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'active-python' ? 'Gekopieerd!' : 'Kopieer Code'}</span>
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto shadow-xl max-h-[600px] overflow-y-auto">
              <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                <code>
                  {pipelineCodeTab === 'pipeline' && pythonPipelineCode}
                  {pipelineCodeTab === 'fastapi' && fastApiCode}
                  {pipelineCodeTab === 'celery' && celeryCode}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 4: FRONTEND MVP STRUCTUUR */}
      {/* ======================================================== */}
      {activeSection === 'step4' && (
        <div className="space-y-6">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Next.js 15 (Tailwind CSS) MVP Componenten</h3>
                <p className="text-xs text-zinc-400">
                  Productie-ready React Server/Client Components voor de Upload/Dashboard en 9:16 Clip Editor pagina's.
                </p>
              </div>

              {/* Sub-tabs for Next.js files */}
              <div className="flex items-center space-x-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setFrontendTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    frontendTab === 'dashboard'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  app/dashboard/page.tsx
                </button>
                <button
                  onClick={() => setFrontendTab('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    frontendTab === 'editor'
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  app/editor/[id]/page.tsx
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>
                  {frontendTab === 'dashboard'
                    ? 'Upload & Dashboard: YouTube URL input, dropzone, preset selectors en live status polling'
                    : 'Clip Editor: 9:16 vertical player, face tracking indicator, karaoke subtitle rendering & virality scorecard'}
                </span>
                <button
                  onClick={() => {
                    const code = frontendTab === 'dashboard' ? nextJsDashboardCode : nextJsEditorCode;
                    handleCopy('nextjs', code);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  {copiedKey === 'nextjs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'nextjs' ? 'Gekopieerd!' : 'Kopieer Next.js Code'}</span>
                </button>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto shadow-xl max-h-[600px] overflow-y-auto">
                <pre className="text-xs font-mono text-zinc-300 leading-relaxed">
                  <code>{frontendTab === 'dashboard' ? nextJsDashboardCode : nextJsEditorCode}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
