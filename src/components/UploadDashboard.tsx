import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  Play, 
  Sliders, 
  CheckCircle2, 
  Film, 
  Clock, 
  ArrowRight,
  Info,
  Youtube,
  Settings2,
  AlertCircle,
  FileVideo
} from 'lucide-react';
import { VideoProject } from '../types';

interface UploadDashboardProps {
  projects: VideoProject[];
  onSelectProject: (projectId: string) => void;
  onOpenClipStudio: (clipId: string) => void;
  onViewPipelineLogs: (jobId?: string) => void;
  onRefreshData: () => Promise<void>;
  isAdmin?: boolean;
}

export const UploadDashboard: React.FC<UploadDashboardProps> = ({
  projects,
  onSelectProject,
  onOpenClipStudio,
  onViewPipelineLogs,
  onRefreshData,
  isAdmin = false
}) => {
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=19wGTtNuzw8');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDurationPreset, setSelectedDurationPreset] = useState<'30-60' | '<30' | '60-90'>('30-60');
  const [reframeMode, setReframeMode] = useState<'smart' | 'split' | 'center'>('smart');
  const [subtitleStyle, setSubtitleStyle] = useState<'hormozi' | 'mrbeast' | 'minimal'>('hormozi');
  const [autoEmojis, setAutoEmojis] = useState(true);
  const [cutSilences, setCutSilences] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [videoMetadata, setVideoMetadata] = useState<{ title: string; author: string; thumbnail: string } | null>(null);
  const [showEmbedPlayer, setShowEmbedPlayer] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const parsedVideo = useMemo(() => {
    if (!urlInput.trim()) return null;
    const url = urlInput.trim();

    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      const id = ytMatch[1];
      return {
        type: 'youtube' as const,
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }

    if (url.includes('mock_hormozi')) {
      const id = '1-TZqOsVCN8';
      return {
        type: 'youtube' as const,
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }

    if (url.startsWith('http')) {
      return {
        type: 'direct' as const,
        id: 'web-video',
        embedUrl: null,
        thumbnailUrl: 'https://images.unsplash.com/photo-1516245834210-c4c142787335?auto=format&fit=crop&w=800&q=80',
      };
    }

    return null;
  }, [urlInput]);

  useEffect(() => {
    if (!urlInput.trim()) {
      setVideoMetadata(null);
      return;
    }

    if (urlInput.includes('19wGTtNuzw8')) {
      setVideoMetadata({
        title: 'De week van de Michelinsterren ⭐️ | L1',
        author: 'L1',
        thumbnail: 'https://i.ytimg.com/vi/19wGTtNuzw8/hqdefault.jpg'
      });
      return;
    }
    if (urlInput.includes('jvqFAi7vkBc')) {
      setVideoMetadata({
        title: 'Sam Altman & Lex Fridman: The Truth About AGI Timeline',
        author: 'Lex Fridman',
        thumbnail: 'https://i.ytimg.com/vi/jvqFAi7vkBc/hqdefault.jpg'
      });
      return;
    }
    if (urlInput.includes('mock_hormozi') || urlInput.includes('1-TZqOsVCN8')) {
      setVideoMetadata({
        title: '$100M Leads Masterclass: How to Get Customers - Alex Hormozi',
        author: 'Alex Hormozi',
        thumbnail: 'https://i.ytimg.com/vi/1-TZqOsVCN8/hqdefault.jpg'
      });
      return;
    }

    const match = urlInput.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|(?:embed|v|shorts)\/))([a-zA-Z0-9_-]{11})/);
    if (match && match[1]) {
      const ytId = match[1];
      setVideoMetadata({
        title: 'YouTube Video Laden...',
        author: 'YouTube',
        thumbnail: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
      });

      fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${ytId}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.title) {
            setVideoMetadata({
              title: data.title,
              author: data.author_name || 'YouTube Maker',
              thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
            });
          }
        })
        .catch(err => {
          console.warn('Live oEmbed preview error:', err);
        });
    }
  }, [urlInput]);

  const pollJobStatus = async (jobId: string, videoId: string) => {
    try {
      const res = await fetch(`/api/pipeline/job/${jobId}`);
      const data = await res.json();
      if (data.success && data.job) {
        setProgressPercent(data.job.progress || 10);
        setProcessingStep(data.job.currentStep || 'Video wordt verwerkt...');

        if (data.job.status === 'completed') {
          setIsProcessing(false);
          await onRefreshData();
          onSelectProject(videoId);
          // Auto open studio with first clip
          setTimeout(async () => {
            const freshRes = await fetch(`/api/videos/${videoId}`);
            const freshData = await freshRes.json();
            if (freshData.success && freshData.video?.clips?.length > 0) {
              onOpenClipStudio(freshData.video.clips[0].id);
            }
          }, 400);
          return;
        }

        if (data.job.status === 'failed') {
          setIsProcessing(false);
          setErrorMessage('Er is een fout opgetreden in de pipeline. Bekijk de logs voor details.');
          return;
        }
      }
      setTimeout(() => pollJobStatus(jobId, videoId), 800);
    } catch (err) {
      console.warn('Poll error:', err);
      setTimeout(() => pollJobStatus(jobId, videoId), 1500);
    }
  };

  const handleStartProcessing = async () => {
    setErrorMessage(null);

    // Case 1: Uploading local file
    if (selectedFile) {
      setIsProcessing(true);
      setProcessingStep('Videobestand uploaden naar backend server...');
      setProgressPercent(10);

      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('targetDuration', selectedDurationPreset);
      formData.append('reframeMode', reframeMode);
      formData.append('subtitleStyle', subtitleStyle);
      formData.append('autoEmojis', String(autoEmojis));
      formData.append('cutSilences', String(cutSilences));

      try {
        const res = await fetch('/api/videos/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!data.success) {
          setIsProcessing(false);
          setErrorMessage(data.error || 'Upload mislukt');
          return;
        }

        setActiveJobId(data.jobId);
        pollJobStatus(data.jobId, data.videoId);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Verbindingsfout met server');
      }
      return;
    }

    // Case 2: Importing via URL
    if (urlInput.trim()) {
      setIsProcessing(true);
      setProcessingStep('URL valideren en audio stream initialiseren...');
      setProgressPercent(10);

      try {
        const res = await fetch('/api/videos/import-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: urlInput.trim(),
            targetDuration: selectedDurationPreset,
            reframeMode,
            subtitleStyle,
            autoEmojis,
            cutSilences,
          }),
        });

        const data = await res.json();
        if (!data.success) {
          setIsProcessing(false);
          setErrorMessage(data.error || 'Import mislukt');
          return;
        }

        setActiveJobId(data.jobId);
        pollJobStatus(data.jobId, data.videoId);
      } catch (err: any) {
        setIsProcessing(false);
        setErrorMessage(err.message || 'Verbindingsfout met server');
      }
      return;
    }

    setErrorMessage('Plak eerst een geldige YouTube/video-URL of kies een MP4-bestand.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUrlInput('');
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUrlInput('');
      setErrorMessage(null);
    }
  };

  const handleLoadSample = (sampleUrl: string, title: string) => {
    setUrlInput(sampleUrl);
    setSelectedFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
        className="hidden"
      />

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-900/40 border border-violet-700/50 text-violet-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>KlipForge Studio • Automatische 9:16 Shorts Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Zet 1 lange video om in <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">10 virale shorts</span> met AI
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Upload een MP4/MOV of plak een YouTube link. KlipForge vindt automatisch de hooks, herkadert naar 9:16 en genereert geanimeerde karaoke ondertitels.
        </p>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Main Upload Box */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        {isProcessing ? (
          <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-white text-sm">
                {progressPercent}%
              </div>
            </div>
            <div className="space-y-2 max-w-md">
              <h3 className="text-xl font-bold text-white">AI Video Pipeline Is Actief</h3>
              <p className="text-sm text-violet-400 font-mono animate-pulse">{processingStep}</p>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-violet-500 via-indigo-500 to-amber-400 h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-zinc-500 pt-2">
                De backend verwerkt je video met FFmpeg, Gemini 3.8 Flash virality chunking en MediaPipe 9:16 reframe.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => onViewPipelineLogs(activeJobId || undefined)}
                className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Beheerder: Bekijk real-time logs in het Admin Panel →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Input methods tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Option A: Paste YouTube / Web Link */}
              <div className="space-y-3 bg-zinc-950/60 p-5 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center space-x-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    <span>Plak YouTube / Vimeo / Podcast Link</span>
                  </label>
                  <span className="text-[11px] text-zinc-500">Max 3 uur</span>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LinkIcon className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (e.target.value) setSelectedFile(null);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="block w-full pl-10 pr-24 py-3 bg-zinc-900 border border-zinc-700/80 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  />
                  {urlInput && (
                    <button
                      onClick={() => setUrlInput('')}
                      className="absolute inset-y-0 right-2 px-2 text-xs text-zinc-400 hover:text-zinc-200"
                    >
                      Wissen
                    </button>
                  )}
                </div>

                {/* 1-Click Samples */}
                <div className="pt-2">
                  <span className="text-[11px] text-zinc-400 font-medium block mb-2">Snelle test met populaire podcast links:</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleLoadSample('https://www.youtube.com/watch?v=19wGTtNuzw8', 'De week van de Michelinsterren ⭐️ | L1')}
                      className="text-xs bg-amber-950/80 hover:bg-amber-900 text-amber-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-amber-800/80 transition-colors flex items-center space-x-1.5 cursor-pointer font-bold shadow-sm"
                    >
                      <span>⭐️ De week van de Michelinsterren (L1)</span>
                    </button>
                    <button
                      onClick={() => handleLoadSample('https://www.youtube.com/watch?v=jvqFAi7vkBc', 'Sam Altman x Lex Fridman: AGI')}
                      className="text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-700/50 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>🔥 Sam Altman: AGI &amp; AI Startups</span>
                    </button>
                    <button
                      onClick={() => handleLoadSample('https://www.youtube.com/watch?v=mock_hormozi', 'Alex Hormozi $100M Leads')}
                      className="text-xs bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-700/50 transition-colors flex items-center space-x-1.5 cursor-pointer"
                    >
                      <span>💡 Alex Hormozi: $100M Masterclass</span>
                    </button>
                  </div>
                </div>

                {/* Live Video Preview when link is filled */}
                {parsedVideo && (
                  <div className="pt-2 animate-fade-in space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-violet-500/60 shadow-xl space-y-3">
                      
                      {/* Top status bar */}
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-violet-300 flex items-center space-x-1.5 uppercase tracking-wider">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Video Gevonden &amp; Klaar</span>
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setShowEmbedPlayer(!showEmbedPlayer)}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                          >
                            {showEmbedPlayer ? 'Toon Thumbnail' : 'Toon Speler'}
                          </button>
                          <span className="text-[10px] bg-red-950/80 text-red-300 border border-red-800/80 px-1.5 py-0.5 rounded font-mono font-bold">
                            YouTube
                          </span>
                        </div>
                      </div>

                      {/* Interactive Video Player or Thumbnail */}
                      <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner group">
                        {showEmbedPlayer && parsedVideo.embedUrl ? (
                          <iframe
                            src={parsedVideo.embedUrl}
                            title={videoMetadata?.title || 'YouTube Video Preview'}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div 
                            className="w-full h-full relative cursor-pointer" 
                            onClick={() => setShowEmbedPlayer(true)}
                          >
                            <img
                              src={videoMetadata?.thumbnail || parsedVideo.thumbnailUrl}
                              alt="Video Preview"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play className="w-6 h-6 fill-current translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Video Title & Channel Meta */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {videoMetadata?.title || 'De week van de Michelinsterren ⭐️ | L1'}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-zinc-400">
                          <span className="flex items-center space-x-1">
                            <span className="text-zinc-500">Kanaal:</span>
                            <strong className="text-zinc-300">{videoMetadata?.author || 'L1'}</strong>
                          </span>
                          <span className="text-emerald-400 font-mono font-bold flex items-center space-x-1">
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            <span>Virale Clips Detecteerbaar</span>
                          </span>
                        </div>
                      </div>

                      {/* 1-Click Action Button */}
                      <button
                        type="button"
                        onClick={handleStartProcessing}
                        disabled={isProcessing}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-md shadow-violet-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Genereer Virale Shorts van Deze Video</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                    </div>
                  </div>
                )}
              </div>

              {/* Option B: Drag & Drop File Upload */}
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`bg-zinc-950/60 p-5 rounded-xl border transition-all flex flex-col items-center justify-center text-center cursor-pointer group ${
                  selectedFile 
                    ? 'border-emerald-500 bg-emerald-950/20' 
                    : 'border-zinc-800/80 border-dashed hover:border-violet-500/50'
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-violet-950/50 border border-violet-800/50 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform mb-3">
                  {selectedFile ? <FileVideo className="w-6 h-6 text-emerald-400" /> : <UploadCloud className="w-6 h-6" />}
                </div>

                {selectedFile ? (
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-emerald-300">{selectedFile.name}</h4>
                    <p className="text-xs text-zinc-400">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Klaar voor echte server upload
                    </p>
                    <span className="text-[10px] text-violet-400 underline block pt-1">Klik om ander bestand te kiezen</span>
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-white">Sleep een MP4 of MOV bestand hierheen</h4>
                    <p className="text-xs text-zinc-400 mt-1">Echte upload naar server • MP4, MOV, MKV, WebM</p>
                    <div className="mt-3 flex items-center space-x-2">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">1080p / 4K</span>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">60 FPS</span>
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* AI Customization Controls */}
            <div className="border-t border-zinc-800/80 pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings2 className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">AI Pipeline Instellingen</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Target Duration */}
                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">Doel Clip Duur</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setSelectedDurationPreset('<30')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedDurationPreset === '<30'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      &lt;30s (TikTok)
                    </button>
                    <button
                      onClick={() => setSelectedDurationPreset('30-60')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedDurationPreset === '30-60'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      30-60s ⭐
                    </button>
                    <button
                      onClick={() => setSelectedDurationPreset('60-90')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        selectedDurationPreset === '60-90'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      60-90s (Reel)
                    </button>
                  </div>
                </div>

                {/* 2. Auto-Reframe Mode */}
                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">9:16 Auto-Reframe</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setReframeMode('smart')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        reframeMode === 'smart'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      AI Volgen
                    </button>
                    <button
                      onClick={() => setReframeMode('split')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        reframeMode === 'split'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Split-Screen
                    </button>
                    <button
                      onClick={() => setReframeMode('center')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        reframeMode === 'center'
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Midden
                    </button>
                  </div>
                </div>

                {/* 3. Subtitle Style */}
                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">Ondertitelingsstijl</span>
                  <div className="grid grid-cols-3 gap-1">
                    <button
                      onClick={() => setSubtitleStyle('hormozi')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        subtitleStyle === 'hormozi'
                          ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Hormozi 💥
                    </button>
                    <button
                      onClick={() => setSubtitleStyle('mrbeast')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        subtitleStyle === 'mrbeast'
                          ? 'bg-cyan-500 text-zinc-950 font-bold shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      MrBeast 🔥
                    </button>
                    <button
                      onClick={() => setSubtitleStyle('minimal')}
                      className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                        subtitleStyle === 'minimal'
                          ? 'bg-zinc-200 text-zinc-900 font-bold shadow-sm'
                          : 'bg-zinc-800/60 text-zinc-400 hover:text-white'
                      }`}
                    >
                      Minimal
                    </button>
                  </div>
                </div>

                {/* 4. AI Enhancements */}
                <div className="bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/60 space-y-2">
                  <span className="text-xs font-semibold text-zinc-300 block">AI Optimalisaties</span>
                  <div className="space-y-1.5">
                    <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoEmojis}
                        onChange={(e) => setAutoEmojis(e.target.checked)}
                        className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500"
                      />
                      <span>Auto-emojis toevoegen</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cutSilences}
                        onChange={(e) => setCutSilences(e.target.checked)}
                        className="rounded border-zinc-700 text-violet-600 focus:ring-violet-500"
                      />
                      <span>Stiltes &amp; &apos;uhm&apos; wegknippen</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>

            {/* Launch CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-zinc-800/80">
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <Info className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span>
                  Kosten: <strong className="text-white">~14-15 minuten credits</strong>. Gemini 3.8 Flash AI pipeline.
                </span>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto">
                {isAdmin && (
                  <button
                    onClick={() => onViewPipelineLogs(activeJobId || undefined)}
                    className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all border border-zinc-700 flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto"
                  >
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span>Beheerder: Live Pipeline Logs</span>
                  </button>
                )}

                <button
                  onClick={handleStartProcessing}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white text-xs font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center space-x-2 cursor-pointer w-full sm:w-auto group"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>Genereer Virale Clips Nu</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Existing Projects / Processed Library */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Film className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-bold text-white">Database Projecten</h2>
          </div>
          <span className="text-xs text-zinc-400">{projects.length} projecten opgeslagen</span>
        </div>

        {projects.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-8 text-center space-y-2">
            <p className="text-sm text-zinc-400">Nog geen video&apos;s verwerkt.</p>
            <p className="text-xs text-zinc-500">Upload een MP4 of plak een YouTube link hierboven om te beginnen!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 transition-all hover:shadow-xl group space-y-4"
              >
                <div className="flex gap-4">
                  <div className="relative w-36 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-mono text-zinc-200 bg-black/60 px-1.5 py-0.5 rounded">
                        {Math.floor(proj.duration / 60)}:{(proj.duration % 60).toString().padStart(2, '0')} min
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Klaar • {proj.clips.length} virale clips</span>
                        </span>
                        <span className="text-[11px] text-zinc-500">{proj.uploadedAt}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-violet-300 transition-colors">
                        {proj.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <button
                        onClick={() => {
                          onSelectProject(proj.id);
                          if (proj.clips.length > 0) {
                            onOpenClipStudio(proj.clips[0].id);
                          }
                        }}
                        className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Open in Clip Studio</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Clip previews pill strip */}
                {proj.clips.length > 0 && (
                  <div className="border-t border-zinc-800/80 pt-3 space-y-2">
                    <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Gegenereerde Virale Shorts:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {proj.clips.slice(0, 2).map((clip) => (
                        <div
                          key={clip.id}
                          onClick={() => {
                            onSelectProject(proj.id);
                            onOpenClipStudio(clip.id);
                          }}
                          className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/70 hover:border-violet-500/50 hover:bg-zinc-800/50 cursor-pointer transition-all"
                        >
                          <div className="flex items-center space-x-2.5 truncate">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-extrabold text-emerald-400">{clip.virality.overallScore}</span>
                            </div>
                            <span className="text-xs text-zinc-300 truncate font-medium">{clip.title}</span>
                          </div>
                          <span className="text-[10px] text-zinc-500 ml-2 font-mono flex-shrink-0">{clip.duration}s</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
