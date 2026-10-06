import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  ArrowRight,
  TrendingUp,
  RotateCcw,
  PlusCircle,
  Building2,
  Lock
} from 'lucide-react';
import { UserCredits } from '../types';

interface PricingModalProps {
  credits: UserCredits;
  onClose: () => void;
  onRefreshCredits: () => Promise<void>;
  onOpenCheckout: (item: {
    type: 'subscription' | 'topup';
    title: string;
    planTier?: 'Free' | 'Creator Pro' | 'Agency';
    packageId?: '60-min' | '120-min' | '300-min';
    billingCycle?: 'monthly' | 'yearly';
    price: number;
    description: string;
    minutes: number;
  }) => void;
  onOpenTopup: () => void;
  currentUser?: any;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  credits,
  onClose,
  onRefreshCredits,
  onOpenCheckout,
  onOpenTopup,
  currentUser,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (plan: 'Free' | 'Creator Pro' | 'Agency') => {
    if (plan === 'Free') {
      onOpenCheckout({
        type: 'subscription',
        title: 'KlipForge Starter Plan',
        planTier: 'Free',
        billingCycle: 'monthly',
        price: 0,
        description: '30 minuten per maand • 720p HD exports met watermerk',
        minutes: 30,
      });
    } else if (plan === 'Creator Pro') {
      const price = billingCycle === 'yearly' ? 276 : 29;
      onOpenCheckout({
        type: 'subscription',
        title: `KlipForge Creator Pro (${billingCycle === 'yearly' ? 'Jaarlijks' : 'Maandelijks'})`,
        planTier: 'Creator Pro',
        billingCycle,
        price,
        description: billingCycle === 'yearly' ? '€23 per maand (jaarlijks gefactureerd als €276, 20% korting)' : '€29 per maand • Geen watermerk, 1080p 60FPS',
        minutes: 120,
      });
    } else if (plan === 'Agency') {
      const price = billingCycle === 'yearly' ? 852 : 89;
      onOpenCheckout({
        type: 'subscription',
        title: `KlipForge Agency / Studio (${billingCycle === 'yearly' ? 'Jaarlijks' : 'Maandelijks'})`,
        planTier: 'Agency',
        billingCycle,
        price,
        description: billingCycle === 'yearly' ? '€71 per maand (jaarlijks gefactureerd als €852, 20% korting)' : '€89 per maand • 500 min, 4K render, API',
        minutes: 500,
      });
    }
  };

  const isCurrentPlan = (planName: string) => {
    const userPlan = currentUser?.planTier || credits.tier || 'Creator Pro';
    return userPlan.toLowerCase() === planName.toLowerCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer text-xs"
        >
          ✕
        </button>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold text-violet-400 bg-violet-950/80 border border-violet-800/60 px-3 py-1 rounded-full uppercase tracking-wider">
            KlipForge Plannen &amp; Prijzen
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Eenvoudige tarieven voor <span className="text-violet-400">creators &amp; teams</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Kies het plan dat bij je past of koop losse extra minuten. Veilig afrekenen via Stripe en Mollie (iDEAL, Bancontact, Creditcard).
          </p>
        </div>

        {/* Current Account Credit Status Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs sm:text-sm font-bold text-white">Huidig Beschikbaar Saldo:</span>
                <span className="text-xs sm:text-sm font-mono font-extrabold text-amber-400">
                  {credits.totalMinutes - credits.usedMinutes} van {credits.totalMinutes} minuten over
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Actief abonnement: <strong className="text-zinc-200">{currentUser?.planTier || credits.tier || 'Creator Pro'}</strong>
                {currentUser?.hasWatermark ? ' (Watermerk actief)' : ' (Zonder watermerk)'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5 w-full sm:w-auto">
            <button
              onClick={onOpenTopup}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-extrabold text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/20 w-full sm:w-auto justify-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Waardeer Saldo Op (Extra Credits)</span>
            </button>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center items-center space-x-3 pt-1">
          <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white font-bold' : 'text-zinc-400'}`}>
            Maandelijks factureren
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className={`w-14 h-7 rounded-full p-1 flex items-center transition-colors cursor-pointer ${
              billingCycle === 'yearly' ? 'bg-violet-600' : 'bg-zinc-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${billingCycle === 'yearly' ? 'text-white font-bold' : 'text-zinc-400'} flex items-center space-x-1.5`}>
            <span>Jaarlijks factureren</span>
            <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-extrabold shadow-sm animate-pulse">
              20% Korting
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Starter */}
          <div className={`bg-zinc-900/60 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${
            isCurrentPlan('Free') ? 'border-zinc-500 ring-1 ring-zinc-500' : 'border-zinc-800'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Starter</span>
                {isCurrentPlan('Free') && (
                  <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold">Huidig Plan</span>
                )}
              </div>
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-extrabold text-white">€0</span>
                <span className="text-xs text-zinc-500">/ maand</span>
              </div>
              <p className="text-xs text-zinc-400">Voor individuen die gratis AI-video repurposing willen uitproberen.</p>
              
              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>30 minuten</strong> verwerkingstijd / maand</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>720p HD exports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Standaard ondertitels</span>
                </li>
                <li className="flex items-center space-x-2 text-zinc-400">
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-400 text-[10px] flex items-center justify-center font-bold flex-shrink-0">!</span>
                  <span>Verplicht KlipForge watermerk</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('Free')}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              {isCurrentPlan('Free') ? 'Huidig Actief' : 'Kies Starter'}
            </button>
          </div>

          {/* 2. Creator Pro */}
          <div className="bg-zinc-900 border-2 border-violet-500 rounded-2xl p-5 space-y-4 flex flex-col justify-between relative shadow-xl shadow-violet-500/10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-amber-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md">
              Meest Gekozen • Geen Watermerk
            </span>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Creator Pro</span>
                {isCurrentPlan('Creator Pro') && (
                  <span className="text-[10px] bg-violet-950 text-violet-300 border border-violet-800 px-1.5 py-0.5 rounded font-bold">Actief Plan</span>
                )}
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-extrabold text-white">
                  {billingCycle === 'monthly' ? '€29' : '€23'}
                </span>
                <span className="text-xs text-zinc-400">/ maand</span>
                {billingCycle === 'yearly' && (
                  <span className="text-[10px] text-zinc-500 block ml-1">(€276/jaar)</span>
                )}
              </div>
              
              <p className="text-xs text-zinc-400">Voor actieve podcasters, streamers en content creators.</p>
              
              <ul className="space-y-2.5 text-xs text-zinc-200 pt-2 border-t border-zinc-800">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>120 minuten</strong> verwerkingstijd / maand</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>1080p 60FPS</strong> zonder watermerk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Snelle GPU-prioriteit wachtrij</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Geavanceerde stijlen (Hormozi, MrBeast, Minimal)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>MediaPipe gezichtsherkenning &amp; 9:16 tracking</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('Creator Pro')}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-extrabold transition-all shadow-md shadow-violet-600/30 flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Activeer Creator Pro ({billingCycle === 'monthly' ? '€29' : '€23/m'})</span>
            </button>
          </div>

          {/* 3. Agency / Studio */}
          <div className={`bg-zinc-900/60 border rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all ${
            isCurrentPlan('Agency') ? 'border-amber-500 ring-1 ring-amber-500' : 'border-zinc-800'
          }`}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Agency / Studio</span>
                {isCurrentPlan('Agency') && (
                  <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded font-bold">Actief Plan</span>
                )}
              </div>

              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-extrabold text-white">
                  {billingCycle === 'monthly' ? '€89' : '€71'}
                </span>
                <span className="text-xs text-zinc-400">/ maand</span>
                {billingCycle === 'yearly' && (
                  <span className="text-[10px] text-zinc-500 block ml-1">(€852/jaar)</span>
                )}
              </div>

              <p className="text-xs text-zinc-400">Voor marketingbureaus, video editors en multi-channel teams.</p>
              
              <ul className="space-y-2.5 text-xs text-zinc-300 pt-2 border-t border-zinc-800">
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>500 minuten</strong> verwerkingstijd / maand</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span><strong>4K Ultra</strong> videorendering</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Aangepaste fonts &amp; brand kits</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Volledige REST API &amp; Webhooks toegang</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Dedicated priority cluster support</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan('Agency')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1.5 shadow-md shadow-amber-600/20"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Upgrade naar Agency ({billingCycle === 'monthly' ? '€89' : '€71/m'})</span>
            </button>
          </div>

        </div>

        {/* Security & Payment Provider Guarantee */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-900 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Beveiligde afhandeling via <strong>Stripe &amp; Mollie</strong> • iDEAL, Creditcard, Apple Pay &amp; Bancontact</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white underline cursor-pointer"
          >
            Sluiten
          </button>
        </div>

      </div>
    </div>
  );
};
