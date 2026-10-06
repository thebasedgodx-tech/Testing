import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Terminal, 
  BookOpen, 
  Users, 
  Cpu, 
  Activity, 
  Database, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Server, 
  Zap,
  Bot
} from 'lucide-react';
import { PipelineSimulator } from './PipelineSimulator';
import { ArchitectureDocs } from './ArchitectureDocs';
import { ChecksDashboard } from './ChecksDashboard';
import { AgentsHub } from './AgentsHub';
import { WorkflowRun, SystemAlert, AIAgent, VideoProject } from '../types';

interface AdminPanelProps {
  currentUser: any;
  activeJobId: string | null;
  onRefreshData: () => Promise<void>;
  onToggleRole: () => Promise<void>;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  // Workflow Checks Props
  runs: WorkflowRun[];
  alerts: SystemAlert[];
  onRetryRun: (runId: string) => Promise<void>;
  onDismissAlert: (alertId: string) => void;
  onApproveForSocial: (runId: string) => void;
  // AI Agents Hub Props
  agents: AIAgent[];
  onControlAgent: (agentId: string, action: 'start' | 'pause' | 'restart' | 'update-config' | 'trigger-task', payload?: any) => Promise<void>;
  projects?: VideoProject[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  activeJobId,
  onRefreshData,
  onToggleRole,
  onOpenAuth,
  runs,
  alerts,
  onRetryRun,
  onDismissAlert,
  onApproveForSocial,
  agents,
  onControlAgent,
  projects,
}) => {
  const [adminTab, setAdminTab] = useState<'checks' | 'agents' | 'logs' | 'specs' | 'users'>('checks');
  const [adminData, setAdminData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = currentUser && currentUser.role === 'admin';
  const activeAlertsCount = alerts.filter(a => !a.dismissed).length;

  const fetchAdminData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    try {
      const storedUserId = localStorage.getItem('klipforge_user_id') || '';
      const res = await fetch('/api/admin/overview', {
        headers: { 'x-user-id': storedUserId }
      });
      const data = await res.json();
      if (data.success) {
        setAdminData(data);
      }
    } catch (err) {
      console.warn('Admin fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [isAdmin]);

  // Access Denied screen for regular users (Enforces RBAC)
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-red-950/40 border border-red-800/80 mx-auto flex items-center justify-center text-red-400 shadow-2xl shadow-red-900/20">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            <span>Afgeschermde Beheerderszone (RBAC)</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Toegang Geweigerd</h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Het <strong>Checks Dashboard</strong>, de <strong>Agents Hub</strong>, Pipeline Logs en Systeembeheer zijn uitsluitend toegankelijk voor administrators (<code className="text-red-300 bg-red-950/80 px-1 py-0.5 rounded text-xs">role: admin</code>).
          </p>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl max-w-md mx-auto space-y-4 text-left">
          <div className="text-xs text-zinc-300 space-y-1">
            <span className="font-semibold block text-white">Huidige Accountstatus:</span>
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-400">{currentUser ? currentUser.email : 'Niet ingelogd'}</span>
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold uppercase text-[10px]">
                {currentUser?.role || 'Gebruiker'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={onToggleRole}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Wissel naar Admin Rol (Test Modus)</span>
            </button>

            {!currentUser && (
              <button
                onClick={() => onOpenAuth('login')}
                className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Inloggen als Beheerder
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Admin Header with RBAC Status */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-violet-950/40 border border-zinc-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-800/80 flex items-center space-x-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Beheerderspaneel • Role-Based Access Control</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">Status: Bevoegd</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Systeembeheer, Checks &amp; AI Agents
          </h1>
          <p className="text-xs text-zinc-400 max-w-xl">
            Exclusieve beheerdersomgeving voor kwaliteitsvalidaties, autonome AI-agents, live workers en database architectuur.
          </p>
        </div>

        {/* Quick Role Toggle for Admin Testing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <button
            onClick={onToggleRole}
            className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer"
            title="Klik om te testen hoe de app eruit ziet voor normale gebruikers"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Wissel naar Normale Gebruiker</span>
          </button>
        </div>
      </div>

      {/* Admin Sub Navigation Tabs (Checks Dashboard, Agents Hub, Pipeline Logs, Platform Specs, Users) */}
      <div className="flex flex-wrap border-b border-zinc-800 gap-2 pb-2">
        
        {/* 1. Checks Dashboard Tab */}
        <button
          onClick={() => setAdminTab('checks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            adminTab === 'checks'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>Checks Dashboard</span>
          {activeAlertsCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px]">
              {activeAlertsCount}
            </span>
          )}
        </button>

        {/* 2. Agents Hub Tab */}
        <button
          onClick={() => setAdminTab('agents')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            adminTab === 'agents'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'
              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Bot className="w-4 h-4 text-violet-300" />
          <span>Agents Hub ({agents.length})</span>
        </button>

        {/* 3. Live Pipeline Logs & Workers Tab */}
        <button
          onClick={() => setAdminTab('logs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            adminTab === 'logs'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Terminal className="w-4 h-4 text-amber-300" />
          <span>Live Pipeline Logs</span>
        </button>

        {/* 4. Platform Specs & Database Tab */}
        <button
          onClick={() => setAdminTab('specs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            adminTab === 'specs'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-300" />
          <span>Platform Specs</span>
        </button>

        {/* 5. Gebruikersbeheer Tab */}
        <button
          onClick={() => setAdminTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            adminTab === 'users'
              ? 'bg-zinc-700 text-white shadow-lg'
              : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800'
          }`}
        >
          <Users className="w-4 h-4 text-zinc-300" />
          <span>Gebruikers &amp; Rollen ({adminData?.users?.length || 0})</span>
        </button>
      </div>

      {/* Sub-tab 1: Checks Dashboard with Recharts 30-Day Reliability Chart */}
      {adminTab === 'checks' && (
        <ChecksDashboard
          runs={runs}
          alerts={alerts}
          onRetryRun={onRetryRun}
          onDismissAlert={onDismissAlert}
          onApproveForSocial={onApproveForSocial}
          onNavigateToAgents={() => setAdminTab('agents')}
          projects={projects}
        />
      )}

      {/* Sub-tab 2: Agents Hub Fleet Management & Control */}
      {adminTab === 'agents' && (
        <AgentsHub
          agents={agents}
          onControlAgent={onControlAgent}
          onNavigateToChecks={() => setAdminTab('checks')}
        />
      )}

      {/* Sub-tab 3: Live Pipeline Logs & Terminal Simulator */}
      {adminTab === 'logs' && (
        <div className="space-y-4">
          <PipelineSimulator activeJobId={activeJobId} onRefreshData={onRefreshData} />
        </div>
      )}

      {/* Sub-tab 4: Platform Specs & Technical Architecture */}
      {adminTab === 'specs' && (
        <div className="space-y-4">
          <ArchitectureDocs />
        </div>
      )}

      {/* Sub-tab 5: User Management Table */}
      {adminTab === 'users' && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Geregistreerde Gebruikers &amp; Credit Saldo&apos;s</h3>
              <p className="text-xs text-zinc-400">Bekijk rollen (admin / user), verbruikte video minuten en accounttiers.</p>
            </div>
            <button
              onClick={fetchAdminData}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Vernieuwen
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-4">Gebruiker</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Credit Verbruik</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-zinc-800/60">
                {adminData?.users?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{u.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        u.role === 'admin' 
                          ? 'bg-amber-950 text-amber-300 border border-amber-800' 
                          : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-violet-300">{u.planTier}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span>{u.usedMinutes} / {u.totalMinutes} min</span>
                      <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="bg-violet-500 h-full" 
                          style={{ width: `${Math.min(100, Math.round((u.usedMinutes / u.totalMinutes) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Actief</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
