import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Button } from './ui/Button';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { PrivacyPolicy } from './PrivacyPolicy';

export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validazione password
    if (password.length < 8) {
      setError('La password deve contenere almeno 8 caratteri');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        // Verifica consenso privacy
        if (!privacyConsent) {
          setError('Devi accettare la Privacy Policy per registrarti');
          setLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccess(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmail = () => {
    window.location.href = 'mailto:';
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background pt-[calc(env(safe-area-inset-top)+1rem)] pb-safe">
        <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-gray-800 shadow-2xl text-center animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <Mail className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Controlla la tua posta</h2>
          <p className="text-muted mb-8 leading-relaxed">
            Ti abbiamo inviato un'email di conferma a <strong className="text-white block mt-1">{email}</strong>
            <span className="block mt-2 text-sm">Clicca sul link contenuto nel messaggio per attivare il tuo account e iniziare a usare il diario.</span>
          </p>
          
          <div className="space-y-3">
            <Button fullWidth size="lg" onClick={handleOpenEmail}>
              Apri App Email
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setSuccess(false)}>
              Torna al Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background pt-[calc(env(safe-area-inset-top)+1rem)] pb-safe">
      <div className="w-full max-w-md bg-surface p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="text-center mb-8">
          {/* Liquid Glass Icon - Full Bleed Rounded Square with Clip Path to fix corner artifacts */}
          <div className="w-24 h-24 mx-auto mb-4 relative">
             <svg viewBox="0 0 512 512" className="w-full h-full drop-shadow-2xl">
                <defs>
                    <linearGradient id="liquid-auth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#6366f1', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#a855f7', stopOpacity:1}} />
                    </linearGradient>
                    <linearGradient id="glass-auth" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'white', stopOpacity:0.35}} />
                    <stop offset="100%" style={{stopColor:'white', stopOpacity:0}} />
                    </linearGradient>
                    <filter id="shadow-auth">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.25"/>
                    </filter>
                    <clipPath id="auth-clip">
                        <rect width="512" height="512" rx="128" />
                    </clipPath>
                </defs>
                
                {/* Background and Glass Effect Clipped to Rounded Shape */}
                <g clipPath="url(#auth-clip)">
                    <rect width="512" height="512" fill="url(#liquid-auth)" />
                    <path d="M0 0 L512 0 L512 240 Q 256 420 0 240 Z" fill="url(#glass-auth)" opacity="0.6"/>
                </g>

                {/* Pulse Path */}
                <path d="M96 256 L176 256 L216 116 L296 396 L336 256 L416 256" 
                      stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" fill="none" 
                      filter="url(#shadow-auth)"/>
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">CefaLog</h1>
          <p className="text-muted text-sm">Diario per il monitoraggio delle cefalee.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="nome@esempio.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-muted font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-primary outline-none"
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <p className="text-xs text-muted mt-1">Minimo 8 caratteri</p>
          </div>

          {/* Privacy consent checkbox - solo per signup */}
          {mode === 'signup' && (
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="privacy-consent"
                checked={privacyConsent}
                onChange={(e) => setPrivacyConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-600 bg-background text-primary focus:ring-primary focus:ring-offset-0"
              />
              <label htmlFor="privacy-consent" className="text-sm text-muted">
                Ho letto e accetto la{' '}
                <button
                  type="button"
                  onClick={() => setShowPrivacyPolicy(true)}
                  className="text-primary hover:text-indigo-400 underline"
                >
                  Privacy Policy
                </button>
                {' '}e acconsento al trattamento dei miei dati sanitari.
              </label>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <Button fullWidth size="lg" disabled={loading} className="mt-2">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (mode === 'signin' ? 'Accedi al Diario' : 'Crea Account')}
          </Button>
        </form>

        {/* Bottom Switcher */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-muted text-sm">
                {mode === 'signin' ? "Non hai ancora un account?" : "Hai già un account?"}
                <button
                    onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setPrivacyConsent(false); }}
                    className="ml-2 text-primary font-bold hover:text-indigo-400 transition-colors focus:outline-none"
                >
                    {mode === 'signin' ? "Registrati" : "Accedi"}
                </button>
            </p>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyPolicy && (
        <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />
      )}
    </div>
  );
};