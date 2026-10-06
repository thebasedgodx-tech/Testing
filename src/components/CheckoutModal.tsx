import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Zap,
  Building2,
  Smartphone,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => Promise<void>;
  item: {
    type: 'subscription' | 'topup';
    title: string;
    planTier?: 'Free' | 'Creator Pro' | 'Agency';
    packageId?: '60-min' | '120-min' | '300-min';
    billingCycle?: 'monthly' | 'yearly';
    price: number;
    description: string;
    minutes: number;
  };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
  item,
}) => {
  const [provider, setProvider] = useState<'Stripe' | 'Mollie'>('Stripe');
  const [paymentMethod, setPaymentMethod] = useState<'iDEAL' | 'Creditcard' | 'Apple Pay' | 'Bancontact'>('iDEAL');
  const [selectedBank, setSelectedBank] = useState('ING');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardName, setCardName] = useState('T. van Dijk');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const storedUserId = localStorage.getItem('klipforge_user_id') || '';
      const endpoint = item.type === 'subscription' 
        ? '/api/billing/create-checkout-session' 
        : '/api/billing/topup-credits';

      const payload = item.type === 'subscription' 
        ? {
            planTier: item.planTier,
            billingCycle: item.billingCycle,
            paymentMethod,
            provider,
          }
        : {
            packageId: item.packageId,
            paymentMethod,
            provider,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': storedUserId,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Betaling kon niet worden voltooid.');
      }

      // Simulate payment gateway authorization delay
      await new Promise(r => setTimeout(r, 900));

      setIsSuccess(true);
      await onPaymentSuccess();

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Betaling mislukt. Probeer het opnieuw.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        
        {/* Close Button */}
        {!isProcessing && !isSuccess && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer text-xs"
          >
            ✕
          </button>
        )}

        {/* Success View */}
        {isSuccess ? (
          <div className="py-12 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Betaling Geslaagd!</h3>
              <p className="text-xs text-zinc-400">
                Je transactie via <strong className="text-white">{provider} ({paymentMethod})</strong> is goedgekeurd.
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold font-mono">
                +{item.minutes} minuten direct bijgeschreven!
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header & Provider badge */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Veilig Afrekenen</h3>
                  <p className="text-[11px] text-zinc-400">Geauthenticeerde betaalsessie</p>
                </div>
              </div>

              {/* Provider selector */}
              <div className="flex items-center space-x-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setProvider('Stripe')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    provider === 'Stripe' ? 'bg-violet-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Stripe
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('Mollie')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    provider === 'Mollie' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Mollie
                </button>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block text-sm">{item.title}</span>
                  <span className="text-zinc-400 text-xs">{item.description}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-white">€{item.price}</span>
                  <span className="text-[10px] text-zinc-500 block">incl. 21% BTW</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>Inbegrepen credits:</span>
                <span className="font-mono font-bold text-emerald-400 flex items-center space-x-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{item.minutes} minuten verwerkingstijd</span>
                </span>
              </div>
            </div>

            {/* Error banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-zinc-300 block">Kies Betaalmethode</label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('iDEAL')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'iDEAL'
                      ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-bold">iDEAL</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Creditcard')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'Creditcard'
                      ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Creditcard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Apple Pay')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'Apple Pay'
                      ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-zinc-200" />
                  <span className="text-xs font-bold">Apple Pay</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Bancontact')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                    paymentMethod === 'Bancontact'
                      ? 'bg-violet-950/40 border-violet-500 ring-1 ring-violet-500 text-white'
                      : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-blue-500 text-[9px] font-black text-white flex items-center justify-center">B</span>
                  <span className="text-xs font-bold">Bancontact</span>
                </button>
              </div>

              {/* Dynamic Sub-form based on method */}
              {paymentMethod === 'iDEAL' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] font-medium text-zinc-400">Selecteer jouw bank:</label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    <option value="ING">ING Bank</option>
                    <option value="Rabobank">Rabobank</option>
                    <option value="ABN AMRO">ABN AMRO</option>
                    <option value="Bunq">Bunq</option>
                    <option value="SNS Bank">SNS Bank</option>
                    <option value="ASN Bank">ASN Bank</option>
                  </select>
                </div>
              )}

              {paymentMethod === 'Creditcard' && (
                <div className="space-y-2.5 pt-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-400">Kaartnummer</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">Vervaldatum</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-zinc-400">CVC Code</label>
                      <input
                        type="text"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Apple Pay' && (
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-zinc-400" />
                  <span>Klaar om direct af te rekenen met Touch ID / Face ID.</span>
                </div>
              )}

              {paymentMethod === 'Bancontact' && (
                <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs text-zinc-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Beveiligde Bancontact / Payconiq autorisatie.</span>
                </div>
              )}
            </div>

            {/* Submit Payment CTA */}
            <form onSubmit={handlePay} className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-amber-500 hover:from-violet-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-violet-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {isProcessing 
                    ? `Verifiëren bij ${paymentMethod}...` 
                    : item.price === 0 
                      ? 'Start Gratis Pakket' 
                      : `Betaal €${item.price} via ${provider}`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Footer Trust Guarantee */}
            <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL Versleuteld</span>
              </div>
              <span>Direct opzegbaar • Factuur per e-mail</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
