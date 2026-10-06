import React, { useState } from 'react';
import { 
  Zap, 
  Clock, 
  Sparkles, 
  RotateCcw, 
  Check, 
  ArrowRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { UserCredits } from '../types';

interface TopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: UserCredits;
  onSelectTopup: (pkg: {
    packageId: '60-min' | '120-min' | '300-min';
    title: string;
    price: number;
    minutes: number;
    description: string;
  }) => void;
  onQuickReset: () => Promise<void>;
}

export const TopupModal: React.FC<TopupModalProps> = ({
  isOpen,
  onClose,
  credits,
  onSelectTopup,
  onQuickReset,
}) => {
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  if (!isOpen) return null;

  const handleTestReset = async () => {
    setIsResetting(true);
    setResetSuccess(false);
    try {
      await onQuickReset();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    } finally {
      setIsResetting(false);
    }
  };

  const packages = [
    {
      packageId: '60-min' as const,
      title: '60 Extra Minuten',
      price: 10,
      minutes: 60,
      perMin: '€0.16/min',
      popular: false,
      badge: 'Starter Top-up',
      description: 'Ideaal voor 1 of 2 extra podcast afleveringen.',
    },
    {
      packageId: '120-min' as const,
      title: '120 Extra Minuten',
      price: 18,
      minutes: 120,
      perMin: '€0.15/min',
      popular: true,
      badge: 'Meest Gekozen • 10% Voordeel',
      description: 'Genoeg voor ~40 virale shorts en reels.',
    },
    {
      packageId: '300-min' as const,
      title: '300 Extra Minuten',
      price: 39,
      minutes: 300,
      perMin: '€0.13/min',
      popular: false,
      badge: 'Beste Waarde • 20% Voordeel',
      description: 'Voor frequente creators en wekelijkse streams.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer text-xs"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800/60 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Credit Saldo Opwaarderen</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Koop Losse Extra Minuten
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Geen abonnementswijziging nodig. Extra gekochte minuten verlopen nooit en worden direct toegevoegd aan je huidige saldo.
          </p>
        </div>

        {/* Current Balance Reminder */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-zinc-300">
              Huidig beschikbaar saldo: <strong className="text-white font-mono font-bold">{credits.totalMinutes - credits.usedMinutes} minuten</strong>
            </span>
          </div>
          <button
            onClick={handleTestReset}
            disabled={isResetting}
            className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 cursor-pointer transition-all"
            title="Herstel gratis test credits"
          >
            <RotateCcw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{resetSuccess ? 'Hersteld!' : 'Gratis Test Herstel (120m)'}</span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => (
            <div
              key={pkg.packageId}
              onClick={() => onSelectTopup(pkg)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative ${
                pkg.popular
                  ? 'bg-gradient-to-b from-violet-950/40 to-zinc-900 border-violet-500 ring-1 ring-violet-500 shadow-lg shadow-violet-600/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              {pkg.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                  Populair
                </span>
              )}

              <div className="space-y-2">
                <span className="text-xs font-bold text-zinc-300 block">{pkg.badge}</span>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-extrabold text-white">€{pkg.price}</span>
                  <span className="text-[11px] text-zinc-500 font-mono">/ eenmalig</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 font-mono flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>+{pkg.minutes} minuten</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-snug">{pkg.description}</p>
              </div>

              <button
                type="button"
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  pkg.popular
                    ? 'bg-violet-600 group-hover:bg-violet-500 text-white shadow-md'
                    : 'bg-zinc-800 group-hover:bg-zinc-700 text-zinc-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Kies voor €{pkg.price}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-900">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Veilig betalen via iDEAL, Creditcard &amp; Bancontact (Stripe / Mollie)</span>
          </div>
          <button onClick={onClose} className="hover:text-zinc-300 underline cursor-pointer">
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
};
