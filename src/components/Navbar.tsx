import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  Zap, 
  Layers, 
  CreditCard,
  User as UserIcon,
  LogOut,
  ChevronDown,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { UserCredits } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'editor' | 'admin' | 'pipeline' | 'architecture';
  setActiveTab: (tab: 'dashboard' | 'editor' | 'admin' | 'pipeline' | 'architecture') => void;
  credits: UserCredits;
  onNewProject: () => void;
  onOpenPricing: () => void;
  currentUser: any;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onToggleRole?: () => void;
  alertsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  credits,
  onNewProject,
  onOpenPricing,
  currentUser,
  onOpenAuth,
  onLogout,
  onToggleRole,
  alertsCount = 0,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const percentage = Math.round((credits.usedMinutes / credits.totalMinutes) * 100);
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 p-0.5 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Scissors className="w-5 h-5 text-violet-400 transform -rotate-45" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                KlipForge<span className="text-violet-400">.ai</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-800/60">
                Studio Pro
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">AI Short-Form Repurposing Studio</p>
          </div>
        </div>

        {/* Customer SaaS Navigation Tabs (Cleaned: Only customer tabs for standard users) */}
        <nav className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Studio</span>
          </button>

          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Clip Editor</span>
            <span className="sm:hidden">Editor</span>
          </button>

          {/* Admin Tab: ONLY visible when user has admin role (RBAC) - Hosts Checks Dashboard, Agents Hub & Systeembeheer */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/40 border border-amber-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Console</span>
              {alertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>
          )}
        </nav>

        {/* Right Section: Credits, Pricing & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          
          {/* Credit balance (clickable to open pricing) */}
          <div 
            onClick={onOpenPricing}
            className="hidden sm:flex flex-col items-end bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800/80 px-3 py-1 rounded-xl cursor-pointer transition-colors group"
          >
            <div className="flex items-center space-x-1.5 text-xs text-zinc-300 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>{credits.totalMinutes - credits.usedMinutes}m over</span>
              <span className="text-[10px] px-1 bg-violet-900/60 text-violet-300 rounded font-bold uppercase">{credits.tier || 'PRO'}</span>
            </div>
            <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-500 to-amber-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(5, 100 - percentage)}%` }}
              />
            </div>
          </div>

          <button
            onClick={onOpenPricing}
            className="hidden md:flex items-center space-x-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Prijzen</span>
          </button>

          {/* User Auth Section */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 sm:px-3 sm:py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all cursor-pointer text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-semibold text-white truncate max-w-[100px]">{currentUser.name || 'Account'}</div>
                  <div className="text-[10px] text-zinc-400 truncate max-w-[100px]">{currentUser.role === 'admin' ? '🛡️ Admin' : (currentUser.planTier || 'Creator Pro')}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-zinc-950 border border-zinc-800 rounded-2xl p-2 shadow-2xl z-50 space-y-1 animate-fade-in">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white block truncate">{currentUser.name || 'Gebruiker'}</span>
                    <span className="text-[11px] text-zinc-400 block truncate">{currentUser.email}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-[10px] bg-violet-950 text-violet-300 border border-violet-800 px-1.5 py-0.5 rounded font-bold">
                        {currentUser.planTier || 'Creator Pro'}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                        isAdmin ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {currentUser.role || 'user'}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => { setActiveTab('admin'); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:text-amber-200 hover:bg-amber-950/30 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Admin Beheerderspaneel</span>
                    </button>
                  )}

                  {onToggleRole && (
                    <button
                      onClick={() => { onToggleRole(); setUserMenuOpen(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                      title="Wissel tussen Admin en Normale Gebruiker"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                      <span>Wissel Rol ({isAdmin ? 'naar Gebruiker' : 'naar Admin'})</span>
                    </button>
                  )}

                  <button
                    onClick={() => { onOpenPricing(); setUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                    <span>Plan Upgraden / Credits</span>
                  </button>

                  <button
                    onClick={() => { onLogout(); setUserMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-xl flex items-center space-x-2 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Uitloggen</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => onOpenAuth('login')}
                className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Inloggen
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Gratis Starten
              </button>
            </div>
          )}

          {/* New Project CTA */}
          <button
            onClick={onNewProject}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-violet-600/20 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nieuwe Video</span>
            <span className="sm:hidden">Nieuw</span>
          </button>
        </div>

      </div>
    </header>
  );
};
