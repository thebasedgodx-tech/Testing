import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User as UserIcon, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'register',
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'Creator Pro' | 'Free' | 'Agency'>('Creator Pro');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register' 
        ? { email, name, password, planTier: selectedPlan }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMsg(data.error || 'Er is een fout opgetreden.');
        setIsLoading(false);
        return;
      }

      if (data.user) {
        localStorage.setItem('klipforge_user_id', data.user.id);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server verbindingsfout.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPlan: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: 'password123' }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        localStorage.setItem('klipforge_user_id', data.user.id);
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Inloggen mislukt.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer text-xs"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-950/80 border border-violet-800/60 text-violet-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>KlipForge Studio Toegang</span>
          </div>
          <h2 className="text-2xl font-black text-white">
            {mode === 'register' ? 'Maak een Account Aan' : 'Welkom Terug'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'register'
              ? 'Meld je aan en ontvang direct 120 minuten videocredits voor virale shorts.'
              : 'Log in op je KlipForge account om projecten en credits te beheren.'}
          </p>
        </div>

        {/* Tabs: Inloggen vs Registreren */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'login' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Inloggen
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'register' ? 'bg-violet-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Registreren
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Volledige Naam of Channel</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bijv. Tim van Dijk"
                  className="block w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">E-mailadres</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.com"
                className="block w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Wachtwoord</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="block w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-zinc-300 block">Kies jouw Plan</label>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setSelectedPlan('Creator Pro')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPlan === 'Creator Pro'
                      ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Creator Pro</span>
                    <span className="text-[10px] bg-violet-900 text-violet-300 px-1 rounded font-bold">120m</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">14 dagen proefperiode</span>
                </div>

                <div
                  onClick={() => setSelectedPlan('Free')}
                  className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedPlan === 'Free'
                      ? 'bg-zinc-800 border-zinc-600 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Starter Free</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1 rounded font-bold">60m</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Basis functies</span>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isLoading ? 'Bezig met verwerken...' : mode === 'register' ? 'Account Aanmaken & Starten' : 'Inloggen op KlipForge'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Demo Logins */}
        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
          <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block text-center">
            Of log direct in met 1-klik testaccount:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('creator@klipforge.ai', 'Creator Pro')}
              className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 text-[11px] font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Creator Pro (120m)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('agency@klipforge.ai', 'Agency')}
              className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-zinc-800 text-[11px] font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-violet-400" />
              <span>Agency Account</span>
            </button>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center space-x-2 text-[11px] text-zinc-500 text-center">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Geen creditcard vereist om te starten • Veilig en versleuteld</span>
        </div>

      </div>
    </div>
  );
};
