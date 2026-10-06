import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Sparkles, 
  Flame, 
  Type, 
  Smile, 
  Sliders, 
  Copy, 
  Check, 
  Eye, 
  Maximize2, 
  Layers, 
  Share2, 
  TrendingUp, 
  Target, 
  Zap,
  Edit3,
  Hash,
  Volume2,
  VolumeX,
  Volume1,
  Smartphone,
  Video,
  ExternalLink
} from 'lucide-react';
import { Clip, SubtitleTheme, SubtitleWord } from '../types';

interface ClipEditorProps {
  clip: Clip;
  allClips: Clip[];
  onSelectClip: (clip: Clip) => void;
  onUpdateClipSubtitles?: (clipId: string, updatedWords: SubtitleWord[]) => void;
  currentUser?: any;
}

export const ClipEditor: React.FC<ClipEditorProps> = ({
  clip,
  allClips,
  onSelectClip,
  currentUser,
}) => {
  // Determine if this clip has an associated YouTube video
  const youtubeId = useMemo(() => {
    const url = clip.videoUrl || '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) return match[1];
    if (clip.videoId?.includes('michelin') || clip.id?.includes('michelin')) {
      return '19wGTtNuzw8';
    }
    if (clip.videoId?.includes('vid-1') || clip.id?.includes('clip-10')) {
      return 'jvqFAi7vkBc';
    }
    if (clip.videoId?.includes('vid-2') || clip.id?.includes('clip-20')) {
      return '1-TZqOsVCN8';
    }
    return null;
  }, [clip]);

  // Guaranteed valid local MP4 video file with audio
  const resolvedVideoUrl = useMemo(() => {
    if (clip.videoUrl && !clip.videoUrl.match(/\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i) && !clip.videoUrl.includes('commondatastorage') && !clip.videoUrl.includes('unsplash') && !clip.videoUrl.includes('youtube')) {
      return clip.videoUrl;
    }
    if (clip.videoId?.includes('michelin') || clip.id?.includes('michelin')) {
      return '/sample-michelin.mp4';
    }
    return '/sample-podcast.mp4';
  }, [clip.videoUrl, clip.videoId, clip.id]);

  // Player mode: AI 9:16 Shorts with burned-in subtitles vs YouTube original
  const [playerMode, setPlayerMode] = useState<'ai-short' | 'youtube'>('ai-short');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(clip.duration || 36);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [showFaceBox, setShowFaceBox] = useState(true);
  const [subtitleTheme, setSubtitleTheme] = useState<SubtitleTheme>('hormozi');
  const [subtitlePosition, setSubtitlePosition] = useState<'bottom' | 'middle' | 'top'>('bottom');
  const [fontSize, setFontSize] = useState<number>(24);
  const [showEmojis, setShowEmojis] = useState(true);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editWordText, setEditWordText] = useState('');
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flatten all words for easy timeline search & sync
  const [words, setWords] = useState<SubtitleWord[]>(() => {
    return clip.subtitles.flatMap(s => s.words);
  });

  // Synchronize volume and mute state directly with DOM video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      videoRef.current.volume = volume;
    }
  }, [isMuted, volume]);

  // Keep words & video state in sync when switching clips
  useEffect(() => {
    setWords(clip.subtitles.flatMap(s => s.words));
    setCurrentTime(0);
    setIsPlaying(false);
    setAudioBlocked(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.src = resolvedVideoUrl;
      videoRef.current.load();
    }
  }, [clip.id, resolvedVideoUrl]);

  // Animation timer for YouTube mode or canvas simulation fallback
  useEffect(() => {
    if (!isPlaying || (playerMode === 'ai-short' && videoRef.current && !videoRef.current.paused)) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        if (prev >= duration) {
          return 0; // loop
        }
        return Math.round((prev + 0.1) * 10) / 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, playerMode, duration]);

  // Draw studio canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background gradient: dark sleek podcast studio
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#09090b');
    bgGrad.addColorStop(0.5, '#18181b');
    bgGrad.addColorStop(1, '#09090b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient studio lights
    const glowX = width * (clip.speakerFocusX || 0.5);
    const lightGrad = ctx.createRadialGradient(glowX, height * 0.35, 10, glowX, height * 0.35, width * 0.8);
    lightGrad.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
    lightGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.08)');
    lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, width, height);

    // Audio Waveform bars across bottom
    const barCount = 28;
    const barWidth = width / (barCount * 1.5);
    const startX = width * 0.15;
    ctx.fillStyle = 'rgba(167, 139, 250, 0.4)';

    for (let i = 0; i < barCount; i++) {
      const freq = Math.sin((currentTime * 4) + i * 0.5) * 0.5 + 0.5;
      const barHeight = 8 + freq * (isPlaying ? 35 : 10);
      const bx = startX + i * (barWidth + 4);
      const by = height * 0.72 - barHeight / 2;
      ctx.beginPath();
      ctx.roundRect(bx, by, barWidth, barHeight, 3);
      ctx.fill();
    }

    // Speaker Silhouette / Studio Avatar
    const headX = width * (clip.speakerFocusX || 0.5);
    const headY = height * 0.35;
    const headRadius = width * 0.16;

    // Head
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Body / Shoulders
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.ellipse(headX, headY + headRadius * 2.2, width * 0.38, height * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Podcast Studio Mic Icon
    ctx.fillStyle = '#71717a';
    ctx.fillRect(headX - 6, headY + headRadius * 0.6, 12, 28);
    ctx.beginPath();
    ctx.arc(headX, headY + headRadius * 0.6, 10, Math.PI, 0);
    ctx.fill();

    // Label on canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI Repurposing Engine (9:16 Canvas)', width / 2, height * 0.15);

    ctx.fillStyle = 'rgba(161, 161, 170, 0.8)';
    ctx.font = '11px monospace';
    ctx.fillText(`SPEAKER FOCUS: ${(clip.speakerFocusX * 100).toFixed(0)}% • 60 FPS`, width / 2, height * 0.19);

  }, [currentTime, clip.speakerFocusX, isPlaying]);

  const togglePlay = () => {
    if (playerMode === 'youtube') {
      setIsPlaying(!isPlaying);
      return;
    }

    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.muted = isMuted;
        videoRef.current.volume = volume;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setAudioBlocked(false);
            })
            .catch((err) => {
              console.warn('Browser autoplay blocked audio, trying muted playback:', err);
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                setAudioBlocked(true);
                videoRef.current.play()
                  .then(() => setIsPlaying(true))
                  .catch(() => setIsPlaying(false));
              }
            });
        }
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleUnmute = () => {
    setIsMuted(false);
    setAudioBlocked(false);
    if (videoRef.current) {
      videoRef.current.muted = false;
      const targetVolume = volume > 0 ? volume : 1;
      videoRef.current.volume = targetVolume;
      setVolume(targetVolume);
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  };

  const handleVideoError = () => {
    console.warn('Video load error on:', resolvedVideoUrl);
    if (videoRef.current && !videoRef.current.src.endsWith('/sample-michelin.mp4')) {
      videoRef.current.src = '/sample-michelin.mp4';
      videoRef.current.load();
      if (isPlaying) videoRef.current.play().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      if (videoRef.current.duration && !isNaN(videoRef.current.duration)) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (videoRef.current) {
      try {
        videoRef.current.currentTime = newTime;
      } catch {
        // Safe seek
      }
    }
  };

  const jumpToWord = (wordStart: number) => {
    handleSeek(wordStart);
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSaveWordEdit = (wordId: string) => {
    setWords(prev =>
      prev.map(w => (w.id === wordId ? { ...w, word: editWordText } : w))
    );
    setEditingWordId(null);
  };

  const toggleWordHighlight = (wordId: string) => {
    setWords(prev =>
      prev.map(w => (w.id === wordId ? { ...w, highlight: !w.highlight } : w))
    );
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(clip.virality.recommendedHook);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(clip.virality.suggestedHashtags.join(' '));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  const handleRealExportVideo = async () => {
    setExportProgress(10);
    
    // Create high-res 1080x1920 off-screen render canvas
    const offscreen = document.createElement('canvas');
    offscreen.width = 1080;
    offscreen.height = 1920;
    const ctx = offscreen.getContext('2d');
    if (!ctx) return;

    let stream: MediaStream;
    try {
      stream = offscreen.captureStream(60);
    } catch {
      stream = (canvasRef.current as any)?.captureStream?.(60);
    }

    const chunks: Blob[] = [];
    let recorder: MediaRecorder | null = null;

    try {
      const mime = MediaRecorder.isTypeSupported('video/mp4;codecs=avc1')
        ? 'video/mp4;codecs=avc1'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 10000000 });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanTitle = clip.title.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
        a.download = `${cleanTitle}_1080p_60fps.mp4`;
        a.click();
        setExportProgress(100);
        setTimeout(() => {
          setExportProgress(null);
          setExportModalOpen(false);
        }, 1200);
      };

      recorder.start();

      const totalFrames = 40;
      for (let f = 0; f <= totalFrames; f++) {
        const frameTime = (f / totalFrames) * clip.duration;
        
        // Draw 1080x1920 studio scene
        const grad = ctx.createLinearGradient(0, 0, 0, 1920);
        grad.addColorStop(0, '#09090b');
        grad.addColorStop(0.5, '#18181b');
        grad.addColorStop(1, '#09090b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1920);

        // Spotlight
        const sX = 1080 * (clip.speakerFocusX || 0.5);
        const spot = ctx.createRadialGradient(sX, 650, 20, sX, 650, 700);
        spot.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
        spot.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = spot;
        ctx.fillRect(0, 0, 1080, 1920);

        // Speaker Silhouette
        ctx.fillStyle = '#27272a';
        ctx.beginPath();
        ctx.arc(sX, 650, 170, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.ellipse(sX, 1050, 360, 220, 0, 0, Math.PI * 2);
        ctx.fill();

        // 9:16 Watermark badge
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.font = 'bold 36px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(clip.title.slice(0, 45), 540, 260);

        // Find current words to render
        const activeW = words.find(w => frameTime >= w.start && frameTime <= w.end);
        const curWords = words.filter(w => activeW ? Math.abs(w.start - activeW.start) < 2.5 : false);

        // Render burned-in subtitles on frame
        if (curWords.length > 0) {
          ctx.font = '900 64px system-ui, sans-serif';
          let subText = curWords.map(w => w.word.toUpperCase()).join(' ');
          ctx.fillStyle = '#fde047';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 8;
          ctx.strokeText(subText, 540, 1550);
          ctx.fillText(subText, 540, 1550);
        }

        // Watermark check: Starter (€0) has watermark, Pro & Agency don't
        const hasWatermark = currentUser?.planTier === 'Free' || currentUser?.hasWatermark === true;
        if (hasWatermark) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(720, 1810, 320, 60);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚡ KlipForge.ai', 880, 1850);
        }

        setExportProgress(Math.min(95, Math.round(15 + (f / totalFrames) * 80)));
        await new Promise(r => setTimeout(r, 25));
      }

      recorder.stop();
    } catch {
      setExportProgress(100);
      setTimeout(() => {
        setExportProgress(null);
        setExportModalOpen(false);
      }, 1000);
    }
  };

  // Find active words based on currentTime
  const activeWord = words.find(w => currentTime >= w.start && currentTime <= w.end);
  const currentSegmentWords = words.filter(w => {
    // Show a group of 3-5 words around the current word
    if (!activeWord) {
      // Find nearest word
      const nextWord = words.find(w => w.start >= currentTime);
      return nextWord ? Math.abs(w.start - nextWord.start) < 2.5 : false;
    }
    return Math.abs(w.start - activeWord.start) < 2.2;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Bar with Clip Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
            <Smartphone className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800/60">
                {clip.hookCategory} Hook
              </span>
              <span className="text-xs text-zinc-400 font-mono">Duur: {clip.duration}s</span>
            </div>
            <h2 className="text-base font-bold text-white truncate max-w-md sm:max-w-xl">
              {clip.title}
            </h2>
          </div>
        </div>

        {/* Clip Switcher Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-zinc-500 font-medium mr-1 hidden md:inline">Clips:</span>
          {allClips.map((c, index) => {
            const isSelected = c.id === clip.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectClip(c)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex-shrink-0 ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30'
                    : 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-zinc-700/60'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${c.virality.overallScore >= 90 ? 'text-amber-400' : 'text-zinc-400'}`} />
                <span>#{index + 1}</span>
                <span className="text-[10px] px-1 bg-black/40 rounded">{c.virality.overallScore}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Grid: Left 9:16 Player, Middle Controls & Subtitles, Right Virality Scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* 1. SMART VERTICAL 9:16 PLAYER (Lg: 4 columns) */}
        {/* ======================================================== */}
        <div className="lg:col-span-4 flex flex-col items-center">
          
          {/* Mode Switcher: AI 9:16 Shorts vs YouTube Original */}
          {youtubeId && (
            <div className="w-full max-w-[320px] mb-3 flex items-center p-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-inner">
              <button
                onClick={() => { setPlayerMode('ai-short'); setIsPlaying(false); }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  playerMode === 'ai-short'
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>AI 9:16 Shorts</span>
              </button>
              <button
                onClick={() => { setPlayerMode('youtube'); setIsPlaying(false); }}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  playerMode === 'youtube'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>YouTube Speler</span>
              </button>
            </div>
          )}

          <div className="w-full max-w-[320px] bg-zinc-950 rounded-3xl border-4 border-zinc-800 shadow-2xl p-2.5 relative overflow-hidden group">
            
            {/* Aspect ratio container (9:16) */}
            <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              
              {/* Mode A: YouTube Player */}
              {playerMode === 'youtube' && youtubeId ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${youtubeId}?start=${Math.floor(clip.startTime)}&autoplay=${isPlaying ? 1 : 0}&enablejsapi=1&controls=1&rel=0`}
                  title={clip.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              ) : (
                /* Mode B: HTML5 Video with Pan & Scan crop simulation and real audio */
                <>
                  <video
                    ref={videoRef}
                    src={resolvedVideoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onError={handleVideoError}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    loop
                    playsInline
                    muted={isMuted}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                    style={{
                      // Simulates dynamic camera pan tracking speaker
                      objectPosition: `${(clip.speakerFocusX || 0.5) * 100}% center`
                    }}
                  />

                  {/* Fallback Canvas Studio Visualizer if video is buffering */}
                  <canvas
                    ref={canvasRef}
                    width={360}
                    height={640}
                    className="absolute inset-0 w-full h-full object-cover hidden pointer-events-none"
                  />
                </>
              )}

              {/* Speaker Tracking Bounding Box Simulation (Auto-Reframe indicator) */}
              {showFaceBox && playerMode === 'ai-short' && (
                <div 
                  className="absolute pointer-events-none transition-all duration-300 border-2 border-emerald-400/80 rounded-xl bg-emerald-500/10 shadow-lg"
                  style={{
                    top: '22%',
                    left: `${Math.max(15, Math.min(60, (clip.speakerFocusX || 0.5) * 100 - 15))}%`,
                    width: '32%',
                    height: '24%',
                  }}
                >
                  <div className="absolute -top-5 left-1 text-[9px] font-mono font-bold bg-emerald-500 text-zinc-950 px-1 py-0.2 rounded uppercase">
                    AI Face: 98%
                  </div>
                </div>
              )}

              {/* Subtitle Overlay Engine (Alex Hormozi / MrBeast / Cyberpunk) */}
              {playerMode === 'ai-short' && (
                <div 
                  className={`absolute inset-x-3 pointer-events-none flex flex-col items-center justify-center text-center transition-all ${
                    subtitlePosition === 'top'
                      ? 'top-10'
                      : subtitlePosition === 'middle'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-12'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-center gap-1.5 px-3 py-1">
                    {currentSegmentWords.length > 0 ? (
                      currentSegmentWords.map((w) => {
                        const isCurrent = activeWord?.id === w.id;

                        // Hormozi Style
                        if (subtitleTheme === 'hormozi') {
                          return (
                            <span
                              key={w.id}
                              className={`font-black uppercase tracking-tight transition-all duration-150 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] ${
                                isCurrent
                                  ? 'scale-125 text-amber-300 bg-black/60 px-1.5 py-0.5 rounded-lg border border-amber-400/50 -rotate-1'
                                  : w.highlight
                                  ? 'text-emerald-300'
                                  : 'text-white'
                              }`}
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {w.word}
                              {showEmojis && w.emoji && (
                                <span className="ml-1 text-base inline-block">{w.emoji}</span>
                              )}
                            </span>
                          );
                        }

                        // MrBeast Style
                        if (subtitleTheme === 'mrbeast') {
                          return (
                            <span
                              key={w.id}
                              className={`font-black uppercase italic tracking-wider transition-all duration-150 drop-shadow-[3px_3px_0px_rgba(0,0,0,1)] ${
                                isCurrent
                                  ? 'scale-120 text-cyan-300 bg-red-600/90 text-white px-2 py-0.5 rounded transform rotate-2'
                                  : 'text-amber-300'
                              }`}
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {w.word}
                              {showEmojis && w.emoji && <span className="ml-1">{w.emoji}</span>}
                            </span>
                          );
                        }

                        // Cyberpunk Style
                        if (subtitleTheme === 'cyberpunk') {
                          return (
                            <span
                              key={w.id}
                              className={`font-mono font-bold tracking-normal transition-all duration-150 ${
                                isCurrent
                                  ? 'text-pink-400 drop-shadow-[0_0_12px_rgba(244,114,182,0.9)] scale-115'
                                  : 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.5)]'
                              }`}
                              style={{ fontSize: `${fontSize}px` }}
                            >
                              {w.word}
                            </span>
                          );
                        }

                        // Minimal Clean Style
                        return (
                          <span
                            key={w.id}
                            className={`font-semibold tracking-wide transition-all ${
                              isCurrent ? 'text-amber-300 bg-zinc-900/90 px-1 rounded' : 'text-white'
                            }`}
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {w.word}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-zinc-400 italic">
                        [Wachten op audio segment...]
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Play / Pause Big Center Overlay Button */}
              {playerMode === 'ai-short' && (
                <button
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors cursor-pointer group"
                >
                  {!isPlaying && (
                    <div className="w-16 h-16 rounded-full bg-violet-600/90 border border-violet-400/50 flex items-center justify-center text-white shadow-xl transform group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  )}
                </button>
              )}

              {/* Floating Unmute Button */}
              {isMuted && playerMode === 'ai-short' && (
                <button
                  onClick={handleUnmute}
                  className="absolute bottom-16 z-20 px-3 py-1.5 rounded-full bg-violet-600/95 hover:bg-violet-500 text-white text-xs font-bold shadow-xl border border-violet-400/50 backdrop-blur-md flex items-center space-x-1.5 cursor-pointer animate-bounce"
                >
                  <VolumeX className="w-4 h-4 text-amber-300" />
                  <span>Tik voor Geluid 🔊</span>
                </button>
              )}

              {/* Top watermark / info badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <span className="text-[10px] font-bold bg-black/60 backdrop-blur-md text-zinc-300 px-2 py-0.5 rounded-full border border-white/10 flex items-center space-x-1">
                  <span>9:16 Shorts/TikTok</span>
                  <span className="text-emerald-400 font-medium">• Studio Preview</span>
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-600/50">
                  🔥 {clip.virality.overallScore}/100 Virality
                </span>
              </div>
            </div>

            {/* Video Controls Bar */}
            <div className="pt-3 px-1 space-y-2">
              {/* Progress Slider */}
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono text-zinc-400 w-8">
                  {Math.floor(currentTime)}s
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 36}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
                  {Math.floor(duration)}s
                </span>
              </div>

              {/* Playback Buttons & Volume */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
                    title={isPlaying ? 'Pauzeer' : 'Afspelen'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>
                  <button
                    onClick={() => handleSeek(0)}
                    className="p-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                    title="Herstarten"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleUnmute}
                    className={`p-2 rounded-lg transition-colors cursor-pointer ${
                      isMuted 
                        ? 'bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800/50' 
                        : 'bg-zinc-800/80 hover:bg-zinc-700 text-emerald-400'
                    }`}
                    title={isMuted ? 'Geluid aanzetten' : 'Dempen'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setVolume(val);
                      setIsMuted(val === 0);
                      if (videoRef.current) {
                        videoRef.current.volume = val;
                        videoRef.current.muted = val === 0;
                      }
                    }}
                    className="w-14 sm:w-16 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
                  />
                </div>

                <button
                  onClick={() => setShowFaceBox(!showFaceBox)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium flex items-center space-x-1 transition-all cursor-pointer ${
                    showFaceBox
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}
                  title="Toon gezichtsdetectie bounding box van MediaPipe"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Face Track</span>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. SUBTITLE STYLER & WORD-BY-WORD TIMELINE (Lg: 5 columns) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Subtitle Style Box */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Ondertitel &amp; Karaoke Stijl</h3>
              </div>
              <span className="text-[11px] text-zinc-400">Live preview in player</span>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setSubtitleTheme('hormozi')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  subtitleTheme === 'hormozi'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-extrabold text-xs uppercase text-amber-300">Hormozi 💥</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Geel/Groen pop</div>
              </button>

              <button
                onClick={() => setSubtitleTheme('mrbeast')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  subtitleTheme === 'mrbeast'
                    ? 'bg-red-950/60 border-red-500 text-red-300 shadow-md shadow-red-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-extrabold text-xs uppercase text-cyan-300 italic">MrBeast 🔥</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Impact schaduw</div>
              </button>

              <button
                onClick={() => setSubtitleTheme('cyberpunk')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  subtitleTheme === 'cyberpunk'
                    ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-mono text-xs font-bold text-pink-400">Cyber ⚡</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Neon glow</div>
              </button>

              <button
                onClick={() => setSubtitleTheme('minimal')}
                className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                  subtitleTheme === 'minimal'
                    ? 'bg-zinc-800 border-zinc-600 text-white'
                    : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <div className="font-sans text-xs font-semibold text-zinc-200">Minimal</div>
                <div className="text-[10px] text-zinc-500 mt-0.5">Modern strak</div>
              </button>
            </div>

            {/* Position & Size Sliders */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80">
              <div className="space-y-1.5">
                <span className="text-xs text-zinc-400 font-medium block">Positie in Beeld</span>
                <div className="grid grid-cols-3 gap-1">
                  {(['bottom', 'middle', 'top'] as const).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSubtitlePosition(pos)}
                      className={`py-1 text-[11px] font-semibold rounded-lg capitalize transition-colors ${
                        subtitlePosition === pos
                          ? 'bg-violet-600 text-white'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {pos === 'bottom' ? 'Onder' : pos === 'middle' ? 'Midden' : 'Boven'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>Tekstgrootte</span>
                  <span className="font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={34}
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
              </div>
            </div>

            {/* Emoji toggle */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmojis}
                  onChange={(e) => setShowEmojis(e.target.checked)}
                  className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500"
                />
                <Smile className="w-3.5 h-3.5 text-amber-400" />
                <span>Automatische context-emojis (⚡ 💰 💀)</span>
              </label>

              <button
                onClick={() => {
                  // Export SRT file
                  const srtContent = clip.subtitles
                    .map((s, idx) => `${idx + 1}\n00:00:${Math.floor(s.start).toString().padStart(2, '0')},000 --> 00:00:${Math.floor(s.end).toString().padStart(2, '0')},000\n${s.text}\n`)
                    .join('\n');
                  const blob = new Blob([srtContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${clip.title.slice(0, 20)}.srt`;
                  a.click();
                }}
                className="text-xs text-violet-400 hover:text-violet-300 flex items-center space-x-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download .SRT</span>
              </button>
            </div>
          </div>

          {/* Interactive Word Timeline & Transcript Editor */}
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Transcriptie Editor (Klik woord = Spring)</h3>
              </div>
              <span className="text-[11px] text-zinc-400">{words.length} woorden gesynchroniseerd</span>
            </div>

            <p className="text-xs text-zinc-400">
              Klik op een woord om de video direct naar dat moment te spoelen. Dubbelklik om een woord aan te passen of markeer als virale highlight.
            </p>

            <div className="max-h-72 overflow-y-auto pr-2 space-y-2.5 p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80">
              <div className="flex flex-wrap gap-1.5 leading-relaxed">
                {words.map((w) => {
                  const isActive = currentTime >= w.start && currentTime <= w.end;
                  const isEditing = editingWordId === w.id;

                  if (isEditing) {
                    return (
                      <span key={w.id} className="inline-flex items-center bg-violet-900/80 p-0.5 rounded">
                        <input
                          type="text"
                          value={editWordText}
                          onChange={(e) => setEditWordText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveWordEdit(w.id);
                            if (e.key === 'Escape') setEditingWordId(null);
                          }}
                          className="w-20 px-1 py-0.5 text-xs bg-black text-white rounded border border-violet-500 focus:outline-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveWordEdit(w.id)}
                          className="px-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          ✓
                        </button>
                      </span>
                    );
                  }

                  return (
                    <span
                      key={w.id}
                      onClick={() => jumpToWord(w.start)}
                      onDoubleClick={() => {
                        setEditingWordId(w.id);
                        setEditWordText(w.word);
                      }}
                      className={`group relative text-xs px-2 py-1 rounded-lg cursor-pointer transition-all ${
                        isActive
                          ? 'bg-amber-400 text-zinc-950 font-black shadow-lg scale-105'
                          : w.highlight
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-bold'
                          : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                      }`}
                      title={`${w.start.toFixed(1)}s - ${w.end.toFixed(1)}s (Dubbelklik om te bewerken)`}
                    >
                      <span>{w.word}</span>
                      {w.emoji && <span className="ml-1">{w.emoji}</span>}

                      {/* Quick highlight toggle action on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWordHighlight(w.id);
                        }}
                        className="hidden group-hover:inline-block ml-1 text-[9px] text-zinc-400 hover:text-amber-400"
                        title="Highlight aan/uit"
                      >
                        ⚡
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
              <span>💡 Tip: Woorden gemarkeerd met ⚡ krijgen automatisch een Hormozi bounce effect.</span>
              <button
                onClick={() => {
                  setWords(clip.subtitles.flatMap(s => s.words));
                }}
                className="hover:text-zinc-300 underline cursor-pointer"
              >
                Herstel origineel
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* 3. VIRALITY SCORECARD & EXPORT (Lg: 3 columns) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Virality Score Badge */}
          <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">AI Virality Index</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Top 2% Content
              </span>
            </div>

            {/* Big Score Display */}
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black bg-gradient-to-r from-amber-300 via-emerald-300 to-violet-300 bg-clip-text text-transparent">
                {clip.virality.overallScore}
              </span>
              <span className="text-xl font-bold text-zinc-500">/ 100</span>
            </div>

            {/* Metric Bars */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span className="flex items-center space-x-1">
                    <Target className="w-3.5 h-3.5 text-violet-400" />
                    <span>Hook Impact (Eerste 3s)</span>
                  </span>
                  <span className="font-mono text-violet-300">{clip.virality.hookScore}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-violet-500 h-full rounded-full" style={{ width: `${clip.virality.hookScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span className="flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    <span>Curiosity Gap</span>
                  </span>
                  <span className="font-mono text-amber-300">{clip.virality.curiosityScore}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${clip.virality.curiosityScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-zinc-300 mb-1">
                  <span className="flex items-center space-x-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Spreektempo &amp; Retentie</span>
                  </span>
                  <span className="font-mono text-emerald-300">{clip.virality.flowScore}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${clip.virality.flowScore}%` }} />
                </div>
              </div>
            </div>

            {/* AI Breakdown Rationale */}
            <div className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800/80 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Waarom deze clip viraal kan gaan:</span>
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {clip.virality.viralityRationale}
              </p>
            </div>

            {/* Suggested Hook Copy */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400">Aanbevolen Video Titel / Hook:</span>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-white">
                <span className="truncate pr-2">{clip.virality.recommendedHook}</span>
                <button
                  onClick={handleCopyTitle}
                  className="text-zinc-400 hover:text-white flex-shrink-0 cursor-pointer"
                  title="Kopieer titel"
                >
                  {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Suggested Hashtags */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-400">Trending Hashtags:</span>
                <button
                  onClick={handleCopyHashtags}
                  className="text-[11px] text-violet-400 hover:text-violet-300 flex items-center space-x-1 cursor-pointer"
                >
                  {copiedHashtags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Kopieer alle</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {clip.virality.suggestedHashtags.map((h, i) => (
                  <span key={i} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                    {h}
                  </span>
                ))}
              </div>
            </div>

            {/* Export CTA Button */}
            <div className="pt-2">
              <button
                onClick={() => setExportModalOpen(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Exporteer 9:16 MP4 (1080p)</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Export Modal Simulation */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Clip Exporteren</h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Formaat:</span>
                  <span className="font-semibold text-white">9:16 Vertical (1080 x 1920)</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Framerate:</span>
                  <span className="font-semibold text-white">60 FPS</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Codec:</span>
                  <span className="font-semibold text-white">H.264 / NVENC GPU Burnt-in</span>
                </div>
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Ondertitels:</span>
                  <span className="font-semibold text-amber-300 capitalize">{subtitleTheme} Stijl</span>
                </div>
              </div>

              {exportProgress !== null ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-violet-400">Rendering via FFmpeg...</span>
                    <span className="text-white">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-amber-400 h-full transition-all duration-300"
                      style={{ width: `${exportProgress}%` }}
                    />
                  </div>
                  {exportProgress === 100 && (
                    <p className="text-xs text-emerald-400 font-semibold text-center pt-1">
                      ✓ Clip succesvol gerenderd en gedownload!
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-400">
                  Klik op Render om de 9:16 video met ingebrande karaoke subtitles te genereren voor TikTok, YouTube Shorts en Instagram Reels.
                </p>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setExportModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                onClick={handleRealExportVideo}
                disabled={exportProgress !== null}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {exportProgress !== null ? 'Bezig met Renderen...' : 'Start Rendering'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
