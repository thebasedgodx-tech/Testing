import React, { useState } from 'react';
import { 
  Bot, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Sparkles, 
  Sliders, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Flame, 
  Film, 
  Mic, 
  Scissors, 
  Share2, 
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Save,
  Check
} from 'lucide-react';
import { AIAgent, AgentStatus } from '../types';

interface AgentsHubProps {
  agents: AIAgent[];
  onControlAgent: (agentId: string, action: 'start' | 'pause' | 'restart' | 'update-config' | 'trigger-task', payload?: any) => Promise<void>;
  onNavigateToChecks: () => void;
}

const AGENT_ICONS: Record<string, any> = {
  'Sparkles': Sparkles,
  'Video': Film,
  'Scissors': Scissors,
  'Mic': Mic,
  'Share2': Share2
};

export const AgentsHub: React.FC<AgentsHubProps> = ({
  agents,
  onControlAgent,
  onNavigateToChecks,
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(agents[0]?.id || '');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [editTemperature, setEditTemperature] = useState<number>(0.7);
  const [editMaxTokens, setEditMaxTokens] = useState<number>(1024);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testRunOutput, setTestRunOutput] = useState<string | null>(null);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // Sync edit state when selecting an agent
  React.useEffect(() => {
    if (selectedAgent) {
      setEditPrompt(selectedAgent.config.systemPromptPreset);
      setEditTemperature(selectedAgent.config.temperature);
      setEditMaxTokens(selectedAgent.config.maxTokens);
      setTestRunOutput(null);
    }
  }, [selectedAgentId]);

  const handleAction = async (agentId: string, action: 'start' | 'pause' | 'restart') => {
    setIsActionLoading(`${agentId}-${action}`);
    try {
      await onControlAgent(agentId, action);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedAgent) return;
    setIsActionLoading('save-config');
    try {
      await onControlAgent(selectedAgent.id, 'update-config', {
        systemPromptPreset: editPrompt,
        temperature: editTemperature,
        maxTokens: editMaxTokens,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleTriggerTestRun = async () => {
    if (!selectedAgent) return;
    setIsTestRunning(true);
    setTestRunOutput(null);

    try {
      await onControlAgent(selectedAgent.id, 'trigger-task');
      // Simulate live inference response from agent
      await new Promise(r => setTimeout(r, 1200));

      if (selectedAgent.id === 'agent-jess') {
        setTestRunOutput(`[Jess • Gemini 3.8 Flash Response]:\n\n🎯 Generated Hook: "De meeste creators besteden 4 uur aan editing terwijl AI het in 15 seconden doet. Hier is het bewijs:"\n⏱️ Duration: 42s\n🔥 Virality Stop-Ratio Predictie: 97.4/100 (Controversial Opening)\n🏷️ Hashtags: #klipforge #viralshorts #creators #aivideo`);
      } else if (selectedAgent.id === 'agent-fal') {
        setTestRunOutput(`[fal.ai Kling v1.6 Pro Worker]:\n\n🎬 Prompt: "Hyperrealistic 4K neon studio b-roll, high shutter speed, cinematic depth of field"\n⚡ Status: Render completed in 12.8s (30 FPS, 1080x1920 MP4)\n📦 Output CDN: https://fal.media/files/kling-v1-render-9018.mp4`);
      } else if (selectedAgent.id === 'agent-cutter') {
        setTestRunOutput(`[KlipForge Auto-Cutter • MediaPipe 0.10.x]:\n\n👁️ Speaker Coordinates: X=0.52 Y=0.38\n📐 Safe Zone Margin: 12% vertical padding (TikTok UI compliant)\n✂️ Reframe Status: Single-speaker centered crop rendered successfully.`);
      } else {
        setTestRunOutput(`[${selectedAgent.name}]:\n\n✅ Test taak succesvol uitgevoerd met latency 0.8s. Geen runtime fouten gerapporteerd.`);
      }
    } finally {
      setIsTestRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-violet-950/40 border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300 bg-violet-950/80 px-2.5 py-0.5 rounded-full border border-violet-800/80 flex items-center space-x-1.5 shadow-sm">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>Centraal AI Agent Management &amp; Orchestratie</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">5 Actieve Entiteiten</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Agents Hub
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Beheer en stuur alle autonome entiteiten aan: scriptwriting (Jess), generative video (fal.ai), gezichtsherkenning (Auto-Cutter) en audio mastering (Nova).
          </p>
        </div>

        <button
          onClick={onNavigateToChecks}
          className="px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer shadow-md"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bekijk Checks Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Global Fleet Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Actieve Entiteiten</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">{agents.filter(a => a.status === 'active').length}</span>
            <span className="text-xs text-emerald-400 font-medium font-mono">van {agents.length} online</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-1 flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>AI agents draaien autonoom</span>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Voltooide Taken (24u)</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-violet-400">
              {agents.reduce((acc, a) => acc + a.metrics.completedTasks, 0)}
            </span>
            <span className="text-xs text-zinc-500">taken</span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono pt-1">
            Gem. vloot succes: <strong className="text-emerald-400">99.1%</strong>
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Huidige Wachtrij (Queue)</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-300">
              {agents.reduce((acc, a) => acc + a.metrics.activeQueueCount, 0)}
            </span>
            <span className="text-xs text-zinc-500">taken in transit</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-1">
            fal.ai Kling &amp; Jess verwerken taken
          </div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">Model Orchestratie</span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white font-mono">Gemini &amp; fal.ai</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-1">
            Whisper v3 &amp; MediaPipe GPU
          </div>
        </div>

      </div>

      {/* Main Agent Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: All AI Agents Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Bot className="w-4 h-4 text-violet-400" />
              <span>Geregistreerde AI Entiteiten ({agents.length})</span>
            </h3>
            <span className="text-[11px] text-zinc-500">Klik voor configuratie</span>
          </div>

          <div className="space-y-3">
            {agents.map(agent => {
              const isSelected = agent.id === selectedAgent.id;
              const IconComp = AGENT_ICONS[agent.avatarIcon] || Bot;

              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    isSelected
                      ? 'bg-zinc-900 border-violet-500 ring-1 ring-violet-500 shadow-xl'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600/30 to-indigo-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 flex-shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs sm:text-sm font-bold text-white">{agent.name}</h4>
                          <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider ${
                            agent.status === 'active'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : agent.status === 'idle'
                              ? 'bg-zinc-800 text-zinc-300'
                              : agent.status === 'paused'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-red-950 text-red-300 border border-red-800'
                          }`}>
                            {agent.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1">{agent.role}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono block">
                        {agent.model.split('/')[1] || agent.model}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono mt-1 block">
                        {agent.version}
                      </span>
                    </div>
                  </div>

                  {/* Performance quick stats row */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-[11px]">
                    <div className="bg-zinc-950/40 p-1.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono">Taken</span>
                      <strong className="text-white font-mono">{agent.metrics.completedTasks}</strong>
                    </div>

                    <div className="bg-zinc-950/40 p-1.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono">Gem. Tijd</span>
                      <strong className="text-emerald-400 font-mono">{agent.metrics.avgProcessingTime}</strong>
                    </div>

                    <div className="bg-zinc-950/40 p-1.5 rounded-lg text-center">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono">Succes</span>
                      <strong className="text-violet-400 font-mono">{agent.metrics.successRate}%</strong>
                    </div>
                  </div>

                  {/* Action Buttons for this agent */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] text-zinc-500 font-mono truncate max-w-[180px]">
                      {agent.lastActive}
                    </span>

                    <div className="flex items-center space-x-1.5" onClick={e => e.stopPropagation()}>
                      {agent.status === 'active' ? (
                        <button
                          onClick={() => handleAction(agent.id, 'pause')}
                          disabled={isActionLoading === `${agent.id}-pause`}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                          title="Pauzeer Agent"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAction(agent.id, 'start')}
                          disabled={isActionLoading === `${agent.id}-start`}
                          className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors cursor-pointer"
                          title="Start Agent"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(agent.id, 'restart')}
                        disabled={isActionLoading === `${agent.id}-restart`}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Herstart Agent Proces"
                      >
                        <RotateCcw className={`w-3.5 h-3.5 ${isActionLoading === `${agent.id}-restart` ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Directe Besturing, Prompt Tuning & Test Runner (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            
            {/* Header of selected agent */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded border border-violet-800">
                    {selectedAgent.name} ({selectedAgent.version})
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">Model: {selectedAgent.model}</span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{selectedAgent.role}</h3>
                <p className="text-xs text-zinc-400">
                  Directe besturing, prompt parameters bijsturen en on-demand test inferentie.
                </p>
              </div>

              {/* Status Controls */}
              <div className="flex items-center space-x-2">
                {selectedAgent.status === 'active' ? (
                  <button
                    onClick={() => handleAction(selectedAgent.id, 'pause')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pauzeren</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction(selectedAgent.id, 'start')}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Activeren</span>
                  </button>
                )}

                <button
                  onClick={() => handleAction(selectedAgent.id, 'restart')}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center space-x-1.5 transition-all border border-zinc-700 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                  <span>Herstarten</span>
                </button>
              </div>
            </div>

            {/* Performance & Taken Deep Dive (Prompt vereiste 2: Inzicht in voltooide taken, verwerkingstijd & wachtrij) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Voltooid Totaal</span>
                <span className="text-lg font-black text-white font-mono">{selectedAgent.metrics.completedTasks}</span>
                <span className="text-[10px] text-emerald-400 block">{selectedAgent.metrics.successRate}% succes</span>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Gem. Responstijd</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{selectedAgent.metrics.avgProcessingTime}</span>
                <span className="text-[10px] text-zinc-400 block">per chunk</span>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Actieve Wachtrij</span>
                <span className="text-lg font-black text-amber-300 font-mono">{selectedAgent.metrics.activeQueueCount}</span>
                <span className="text-[10px] text-zinc-400 block">in behandeling</span>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">24u AI Verbruik</span>
                <span className="text-lg font-black text-violet-300 font-mono text-xs">{selectedAgent.metrics.tokenUsage24h}</span>
                <span className="text-[10px] text-zinc-400 block">Gemini API (geen user-credits)</span>
              </div>
            </div>

            {/* Live Prompt & Parameter Besturing (Prompt vereiste 2: Prompts/parameters bijsturen) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-violet-400" />
                  <span>Systeem Prompt &amp; Runtime Parameters</span>
                </span>
                <span className="text-zinc-500 font-mono text-[11px]">Auto-retry: {selectedAgent.config.maxRetries}x</span>
              </div>

              {/* System Prompt Preset Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300">
                  System Directive / Preset Prompt:
                </label>
                <textarea
                  value={editPrompt}
                  onChange={e => setEditPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-950 border border-zinc-700/80 rounded-2xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono leading-relaxed"
                  placeholder="Voer systeeminstructie in voor deze agent..."
                />
              </div>

              {/* Sliders: Temperature & Max Tokens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">Creativiteit (Temperature):</span>
                    <span className="text-amber-400 font-mono font-bold">{editTemperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={1.0}
                    step={0.05}
                    value={editTemperature}
                    onChange={e => setEditTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 block">Lager = deterministischer, Hoger = creatievere hooks</span>
                </div>

                <div className="space-y-1.5 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300 font-semibold">Max Output Tokens:</span>
                    <span className="text-violet-400 font-mono font-bold">{editMaxTokens}</span>
                  </div>
                  <input
                    type="range"
                    min={256}
                    max={2048}
                    step={128}
                    value={editMaxTokens}
                    onChange={e => setEditMaxTokens(parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <span className="text-[10px] text-zinc-500 block">Beheert contextgrootte en tokenconsumptie</span>
                </div>
              </div>

              {/* Save changes button */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-2 text-xs text-zinc-400">
                  {saveSuccess && (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1 animate-fade-in">
                      <Check className="w-3.5 h-3.5" />
                      <span>Parameters live geüpdatet!</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleTriggerTestRun}
                    disabled={isTestRunning}
                    className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-all border border-zinc-700 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Play className={`w-3.5 h-3.5 text-amber-400 ${isTestRunning ? 'animate-spin' : ''}`} />
                    <span>{isTestRunning ? 'Test Uitvoeren...' : 'Test Run Simulatie'}</span>
                  </button>

                  <button
                    onClick={handleSaveConfig}
                    disabled={isActionLoading === 'save-config'}
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Parameters Opslaan</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Test Run Output Console */}
            {testRunOutput && (
              <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800 space-y-2 animate-scale-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center space-x-1.5 font-mono text-[11px]">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Live Inferentie Resultaat</span>
                  </span>
                  <button 
                    onClick={() => setTestRunOutput(null)} 
                    className="text-zinc-500 hover:text-zinc-300 text-[10px] cursor-pointer"
                  >
                    Wissen
                  </button>
                </div>
                <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 leading-relaxed overflow-x-auto">
                  {testRunOutput}
                </pre>
              </div>
            )}

            {/* Assigned Pipelines List */}
            <div className="pt-2 border-t border-zinc-800 space-y-2">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Toegewezen Geautomatiseerde Pijplijnen:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedAgent.assignedPipelines.map(pipeline => (
                  <span 
                    key={pipeline} 
                    className="px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{pipeline}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
