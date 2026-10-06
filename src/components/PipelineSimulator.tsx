import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  FileCode,
  Zap,
  Radio
} from 'lucide-react';

interface PipelineStep {
  id: string;
  name: string;
  subtext: string;
  command: string;
  durationMs: number;
  outputPreview: string;
  details: string[];
}

interface PipelineSimulatorProps {
  activeJobId?: string | null;
  onRefreshData?: () => Promise<void>;
}

export const PipelineSimulator: React.FC<PipelineSimulatorProps> = ({
  activeJobId,
  onRefreshData,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<{ time: string; text: string; type: string }[]>([]);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [serverJobStatus, setServerJobStatus] = useState<string | null>(null);

  const steps: PipelineStep[] = [
    {
      id: 'step-1',
      name: '1. Ingestion & Audio Demuxing (FFmpeg)',
      subtext: 'Extraheer 16kHz mono audio stream zonder video re-encode',
      command: 'ffmpeg -i input.mp4 -vn -acodec pcm_s16le -ar 16000 -ac 1 /tmp/audio.wav -y',
      durationMs: 900,
      outputPreview: '[FFmpeg] Stream #0:1 -> #0:0 (pcm_s16le 16000Hz 1ch 256kbps) [Time: 0.84s]',
      details: [
        'Geen videodecoder latency door -vn (video null)',
        'Resampled naar 16kHz mono: perfect voor Whisper acoustic model',
        'Direct streaming naar memory buffer om disk I/O te minimaliseren'
      ]
    },
    {
      id: 'step-2',
      name: '2. Whisper Speech-to-Text (Faster-Whisper / Gemini 3.8)',
      subtext: 'Genereer woord-niveau timestamps met VAD (Voice Activity Detection)',
      command: 'whisper_model.transcribe(audio, beam_size=5, word_timestamps=True, vad_filter=True)',
      durationMs: 1400,
      outputPreview: 'VAD: 42 spraaksegmenten gevonden. 1.842 woorden getranscribeerd met milliseconde precisie.',
      details: [
        'Silero VAD knipt pauzes > 600ms automatisch weg',
        'CTranslate2 int8 kwantisatie levert 4x hogere inferentie-snelheid op NVIDIA T4/A10G',
        'Output: JSON met exact word.start, word.end en confidence scores'
      ]
    },
    {
      id: 'step-3',
      name: '3. LLM Virality & Hook Chunking (Gemini 3.8 Flash)',
      subtext: 'Analyseer transcriptie op narratieve arc, emotie & retentie',
      command: 'gemini.generate_content(prompt=VIRALITY_CHUNKER_PROMPT, response_schema=ViralityAnalysis)',
      durationMs: 1200,
      outputPreview: '4 virale clips gedetecteerd! Top clip: "Waarom 99% van AI startups faalt" (Virality Score: 97/100).',
      details: [
        'Zoekt naar: 0-3s contrasterende hooks ("De meesten hebben het mis...")',
        'Controleert of een segment een complete coherente gedachte vormt (geen afgebroken zinnen)',
        'Berekent Virality Index (Hook + Curiosity Gap + Pacing)'
      ]
    },
    {
      id: 'step-4',
      name: '4. Computer Vision Auto-Reframe (MediaPipe Face Mesh)',
      subtext: 'Volg de actieve spreker dynamisch voor een naadloze 9:16 uitsnede',
      command: 'track_speaker_faces(clip_frames, target_aspect=9/16, smoothing_window=15)',
      durationMs: 1100,
      outputPreview: 'Spreker gedetecteerd op x: 0.52. Smooth horizontal pan berekend zonder jitter.',
      details: [
        'Gezichts- en mondbewegingsdetectie identificeert wie er praat',
        'Exponential Moving Average (EMA) filter voorkomt schokkerige camerabewegingen',
        'Genereert dynamische FFmpeg crop coördinaten per seconde'
      ]
    },
    {
      id: 'step-5',
      name: '5. Dynamic Subtitles & Final Render (FFmpeg + libass)',
      subtext: 'Brand geanimeerde karaoke ondertitels en exporteer 1080x1920 MP4',
      command: 'ffmpeg -i clip.mp4 -vf "crop=w:h:x:y,ass=karaoke_hormozi.ass" -c:v h264_nvenc -b:v 8M out.mp4',
      durationMs: 1300,
      outputPreview: 'Render compleet: 1080x1920 @ 60fps. H.264 NVENC hardware encoded in 1.1s.',
      details: [
        'ASS subtitle generator voegt \\k karaoke highlighting en emoji rendering toe',
        'GPU-geaccelereerde hardware encode (NVENC / QuickSync) op 4x realtime snelheid',
        'Direct streaming upload naar AWS S3 / Google Cloud Storage'
      ]
    }
  ];

  // Poll real server job logs if activeJobId is set
  useEffect(() => {
    if (!activeJobId) return;

    let isMounted = true;
    const poll = async () => {
      try {
        const res = await fetch(`/api/pipeline/job/${activeJobId}`);
        const data = await res.json();
        if (data.success && data.job && isMounted) {
          setLogs(data.job.logs || []);
          setServerJobStatus(data.job.status);
          if (data.job.status === 'processing') {
            const stepIdx = Math.min(4, Math.floor((data.job.progress || 0) / 20));
            setCurrentStepIndex(stepIdx);
          } else if (data.job.status === 'completed') {
            setCurrentStepIndex(5);
            if (onRefreshData) onRefreshData();
          }
        }
      } catch (err) {
        console.warn('Poll error in logs view:', err);
      }
    };

    poll();
    const interval = setInterval(poll, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeJobId]);

  const runSimulation = () => {
    setIsRunning(true);
    setCurrentStepIndex(0);
    setLogs([{ time: new Date().toLocaleTimeString('nl-NL'), text: 'Initialiseer KlipForge Video Processing Pipeline worker...', type: 'info' }]);
    setTotalElapsedTime(0);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStepIndex(-1);
    setLogs([]);
    setTotalElapsedTime(0);
    setServerJobStatus(null);
  };

  useEffect(() => {
    if (activeJobId) return; // If watching real server job, let polling handle it
    if (!isRunning || currentStepIndex < 0) return;

    if (currentStepIndex >= steps.length) {
      setIsRunning(false);
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString('nl-NL'), text: `✅ Pipeline succesvol afgerond! 4 clips klaar voor publicatie.`, type: 'success' }
      ]);
      return;
    }

    const currentStep = steps[currentStepIndex];
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString('nl-NL'), text: `EXECUTING: ${currentStep.name}`, type: 'warn' },
      { time: new Date().toLocaleTimeString('nl-NL'), text: `$ ${currentStep.command}`, type: 'cmd' },
      { time: new Date().toLocaleTimeString('nl-NL'), text: `> ${currentStep.outputPreview}`, type: 'info' }
    ]);

    const timer = setTimeout(() => {
      setTotalElapsedTime(prev => prev + currentStep.durationMs);
      setCurrentStepIndex(prev => prev + 1);
    }, currentStep.durationMs);

    return () => clearTimeout(timer);
  }, [isRunning, currentStepIndex, activeJobId]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>{activeJobId ? 'Live Server Pipeline Logs' : 'Backend Pipeline Runner'}</span>
            </span>
            <span className="text-xs text-zinc-400">Node.js Express / Gemini AI / FFmpeg Engine</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            Real-Time Video Pipeline Console
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl mt-1">
            {activeJobId 
              ? `Actieve backend taak: ${activeJobId} (${serverJobStatus || 'bezig'})`
              : 'Bekijk stap-voor-stap hoe de asynchrone pipeline een lange video verwerkt tot kant-en-klare virale shorts.'}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={resetSimulation}
            disabled={isRunning || currentStepIndex === -1}
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            onClick={runSimulation}
            disabled={isRunning || Boolean(activeJobId)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isRunning ? 'Pipeline Actief...' : 'Start Pipeline Test'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Pipeline Step Cards on Left, Real-Time Terminal Logs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Step Cards List (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          {steps.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div
                key={step.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-zinc-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : isCompleted
                    ? 'bg-zinc-900/60 border-zinc-700/80 opacity-90'
                    : 'bg-zinc-950/40 border-zinc-800/60 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 font-mono text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-500 text-zinc-950'
                          : isCurrent
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                        <span>{step.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded animate-pulse">
                            Processing...
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">{step.subtext}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-500 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>~{(step.durationMs / 1000).toFixed(1)}s</span>
                  </span>
                </div>

                {/* Command & Details */}
                <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                  <div className="bg-black/60 p-2 rounded-lg font-mono text-[11px] text-zinc-300 overflow-x-auto">
                    <span className="text-emerald-400">$</span> {step.command}
                  </div>

                  <ul className="space-y-1">
                    {step.details.map((detail, dIdx) => (
                      <li key={dIdx} className="text-[11px] text-zinc-400 flex items-center space-x-1.5">
                        <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time Terminal Log (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 flex flex-col flex-1 shadow-2xl overflow-hidden min-h-[460px]">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono font-bold text-zinc-300">Backend Server Pipeline stdout</span>
              </div>
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-xs py-3 space-y-1 text-zinc-300 leading-relaxed max-h-[360px]">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 space-y-2 py-12">
                  <Cpu className="w-8 h-8 text-zinc-700 animate-pulse" />
                  <p>Worker wachtrij gereed.</p>
                  <p className="text-[11px]">Upload een video of klik op &apos;Start Pipeline Test&apos; om live logs te bekijken.</p>
                </div>
              ) : (
                logs.map((log, index) => {
                  const isCmd = log.type === 'cmd' || log.text.startsWith('$');
                  const isSuccess = log.type === 'success' || log.text.includes('✅') || log.text.includes('geslaagd');
                  const isWarn = log.type === 'warn' || log.text.includes('EXECUTING');

                  return (
                    <div
                      key={index}
                      className={`py-0.5 ${
                        isSuccess
                          ? 'text-emerald-300 font-bold bg-emerald-950/40 px-1 rounded'
                          : isWarn
                          ? 'text-amber-300 font-semibold'
                          : isCmd
                          ? 'text-violet-300'
                          : 'text-zinc-400'
                      }`}
                    >
                      <span className="text-zinc-600 mr-1.5">[{log.time}]</span>
                      <span>{log.text}</span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Performance Stats Bar */}
            <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-zinc-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-zinc-500 block">AI Model</span>
                <span className="font-mono font-bold text-white">Gemini 3.8 Flash</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-zinc-500 block">Server Status</span>
                <span className="font-mono font-bold text-emerald-400">ONLINE (Port 3000)</span>
              </div>
              <div className="bg-zinc-900/80 p-2 rounded-lg">
                <span className="text-[10px] text-zinc-500 block">Encoding Engine</span>
                <span className="font-mono font-bold text-violet-400">1080p 60FPS</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
