/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UploadDashboard } from './components/UploadDashboard';
import { ClipEditor } from './components/ClipEditor';
import { AdminPanel } from './components/AdminPanel';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { CheckoutModal } from './components/CheckoutModal';
import { TopupModal } from './components/TopupModal';
import { SAMPLE_VIDEOS, INITIAL_USER_CREDITS } from './data/mockData';
import { INITIAL_WORKFLOW_RUNS, INITIAL_SYSTEM_ALERTS, INITIAL_AI_AGENTS } from './data/workflowChecksData';
import { VideoProject, Clip, UserCredits, WorkflowRun, SystemAlert, AIAgent } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor' | 'admin' | 'pipeline' | 'architecture'>('dashboard');
  const [credits, setCredits] = useState<UserCredits>(INITIAL_USER_CREDITS);
  const [projects, setProjects] = useState<VideoProject[]>(SAMPLE_VIDEOS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('vid-michelin');
  const [selectedClipId, setSelectedClipId] = useState<string>('clip-michelin-1');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutItem, setCheckoutItem] = useState<any>(null);
  const [isTopupOpen, setIsTopupOpen] = useState(false);

  // Workflow Checks & AI Agents State (Only accessible within Admin Panel)
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>(INITIAL_WORKFLOW_RUNS);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>(INITIAL_SYSTEM_ALERTS);
  const [aiAgents, setAiAgents] = useState<AIAgent[]>(INITIAL_AI_AGENTS);

  // Fetch real user, projects, checks and agents from backend API
  const refreshBackendData = async () => {
    try {
      const storedUserId = localStorage.getItem('klipforge_user_id') || '';
      const userRes = await fetch('/api/auth/me', {
        headers: { 'x-user-id': storedUserId }
      });
      const userData = await userRes.json();
      if (userData.success && userData.user) {
        setCurrentUser(userData.user);
        setCredits({
          usedMinutes: userData.user.usedMinutes,
          totalMinutes: userData.user.totalMinutes,
          tier: userData.user.planTier,
        });
      }

      // Fetch video projects
      const videosRes = await fetch('/api/videos');
      const videosData = await videosRes.json();
      if (videosData.success && Array.isArray(videosData.videos) && videosData.videos.length > 0) {
        setProjects(videosData.videos);
      }

      // Fetch checks & agents for admin suite
      const checksRes = await fetch('/api/checks');
      const checksData = await checksRes.json();
      if (checksData.success) {
        if (checksData.runs) setWorkflowRuns(checksData.runs);
        if (checksData.alerts) setSystemAlerts(checksData.alerts);
      }

      const agentsRes = await fetch('/api/agents');
      const agentsData = await agentsRes.json();
      if (agentsData.success && agentsData.agents) {
        setAiAgents(agentsData.agents);
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register' = 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user);
    refreshBackendData();
  };

  const handleLogout = () => {
    localStorage.removeItem('klipforge_user_id');
    setCurrentUser(null);
    refreshBackendData();
  };

  const handleToggleRole = async () => {
    try {
      const storedUserId = localStorage.getItem('klipforge_user_id') || '';
      const res = await fetch('/api/auth/toggle-admin-role', {
        method: 'POST',
        headers: { 'x-user-id': storedUserId }
      });
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        await refreshBackendData();
      }
    } catch (err) {
      console.warn('Role toggle error:', err);
    }
  };

  const handleOpenCheckout = (item: any) => {
    setCheckoutItem(item);
    setIsCheckoutOpen(true);
  };

  const handleOpenTopup = () => {
    setIsTopupOpen(true);
  };

  const handleSelectTopup = (pkg: any) => {
    setIsTopupOpen(false);
    setCheckoutItem({
      type: 'topup',
      title: pkg.title,
      packageId: pkg.packageId,
      price: pkg.price,
      description: pkg.description,
      minutes: pkg.minutes,
    });
    setIsCheckoutOpen(true);
  };

  const handleQuickReset = async () => {
    try {
      const res = await fetch('/api/auth/reset-credits', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await refreshBackendData();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const currentClip = currentProject?.clips.find(c => c.id === selectedClipId) || currentProject?.clips[0];

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    const proj = projects.find(p => p.id === projectId);
    if (proj && proj.clips.length > 0) {
      setSelectedClipId(proj.clips[0].id);
    }
  };

  const handleOpenClipStudio = (clipId: string) => {
    setSelectedClipId(clipId);
    setActiveTab('editor');
  };

  const handleSelectClip = (clip: Clip) => {
    setSelectedClipId(clip.id);
  };

  const handleNewProject = () => {
    setActiveTab('dashboard');
  };

  const handleViewPipelineLogs = (jobId?: string) => {
    if (jobId) {
      setActiveJobId(jobId);
    }
    setActiveTab('admin');
  };

  // Workflow Checks Actions
  const handleRetryRun = async (runId: string) => {
    try {
      const res = await fetch('/api/checks/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      });
      const data = await res.json();
      if (data.success && data.run) {
        setWorkflowRuns(prev => prev.map(r => r.id === runId ? data.run : r));
      }
    } catch {
      setWorkflowRuns(prev => prev.map(r => {
        if (r.id === runId) {
          return {
            ...r,
            status: 'success',
            failedStage: undefined,
            errorMessage: undefined,
            stagesCompleted: ['Idea', 'Script', 'fal.ai', 'Edit', 'Social Media'],
            checks: r.checks.map(c => ({ ...c, passed: true, score: 95 }))
          };
        }
        return r;
      }));
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    setSystemAlerts(prev => prev.map(a => a.id === alertId ? { ...a, dismissed: true } : a));
    try {
      await fetch('/api/checks/dismiss-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
    } catch (err) {
      console.warn(err);
    }
  };

  const handleApproveForSocial = async (runId: string) => {
    try {
      const res = await fetch('/api/checks/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runId }),
      });
      const data = await res.json();
      if (data.success && data.run) {
        setWorkflowRuns(prev => prev.map(r => r.id === runId ? data.run : r));
      }
    } catch {
      setWorkflowRuns(prev => prev.map(r => r.id === runId ? { ...r, status: 'success' } : r));
    }
  };

  // AI Agents Hub Control Action
  const handleControlAgent = async (agentId: string, action: 'start' | 'pause' | 'restart' | 'update-config' | 'trigger-task', payload?: any) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload }),
      });
      const data = await res.json();
      if (data.success && data.agent) {
        setAiAgents(prev => prev.map(a => a.id === agentId ? data.agent : a));
      }
    } catch {
      setAiAgents(prev => prev.map(a => {
        if (a.id === agentId) {
          if (action === 'start') return { ...a, status: 'active', lastActive: 'Zojuist gestart' };
          if (action === 'pause') return { ...a, status: 'paused', lastActive: 'Gepauzeerd door beheerder' };
          if (action === 'restart') return { ...a, status: 'active', lastActive: 'Zojuist herstart' };
          if (action === 'update-config' && payload) return { ...a, config: { ...a.config, ...payload } };
          if (action === 'trigger-task') return { ...a, metrics: { ...a.metrics, completedTasks: a.metrics.completedTasks + 1 }, lastActive: 'Zojuist test run voltooid' };
        }
        return a;
      }));
    }
  };

  const isAdmin = currentUser && currentUser.role === 'admin';
  const activeAlertsCount = systemAlerts.filter(a => !a.dismissed).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Top Navbar (Clean: Only Studio, Clip Editor, and Admin Console for admins) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        credits={credits}
        onNewProject={handleNewProject}
        onOpenPricing={() => setIsPricingOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        onToggleRole={handleToggleRole}
        alertsCount={activeAlertsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <UploadDashboard
            projects={projects}
            onSelectProject={handleSelectProject}
            onOpenClipStudio={handleOpenClipStudio}
            onViewPipelineLogs={handleViewPipelineLogs}
            onRefreshData={refreshBackendData}
            isAdmin={isAdmin}
          />
        )}

        {activeTab === 'editor' && currentClip && (
          <ClipEditor
            clip={currentClip}
            allClips={currentProject?.clips || []}
            onSelectClip={handleSelectClip}
            currentUser={currentUser}
          />
        )}

        {/* Protected Admin Panel: Houses Checks Dashboard, Agents Hub, Pipeline Logs, Specs & User Management */}
        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            activeJobId={activeJobId}
            onRefreshData={refreshBackendData}
            onToggleRole={handleToggleRole}
            onOpenAuth={handleOpenAuth}
            runs={workflowRuns}
            alerts={systemAlerts}
            onRetryRun={handleRetryRun}
            onDismissAlert={handleDismissAlert}
            onApproveForSocial={handleApproveForSocial}
            agents={aiAgents}
            onControlAgent={handleControlAgent}
            projects={projects}
          />
        )}
      </main>

      {/* Pricing & Credits Modal */}
      {isPricingOpen && (
        <PricingModal
          credits={credits}
          onClose={() => setIsPricingOpen(false)}
          onRefreshCredits={refreshBackendData}
          onOpenCheckout={handleOpenCheckout}
          onOpenTopup={handleOpenTopup}
          currentUser={currentUser}
        />
      )}

      {/* Registration & Login Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Top-up Minutes Modal */}
      <TopupModal
        isOpen={isTopupOpen}
        onClose={() => setIsTopupOpen(false)}
        credits={credits}
        onSelectTopup={handleSelectTopup}
        onQuickReset={handleQuickReset}
      />

      {/* Stripe / Mollie Checkout Modal */}
      {isCheckoutOpen && checkoutItem && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setCheckoutItem(null);
          }}
          onPaymentSuccess={refreshBackendData}
          item={checkoutItem}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            KlipForge Studio Pro • AI Content Pipeline (Idea → Script → fal.ai → Edit → Social Media)
          </p>
          <div className="flex flex-wrap items-center justify-center space-x-3 text-zinc-400">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Studio
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Prijzen &amp; Credits
            </button>
            {isAdmin && (
              <>
                <span>•</span>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer font-bold flex items-center space-x-1"
                >
                  <span>Admin Console (Checks &amp; Agents)</span>
                  {activeAlertsCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
