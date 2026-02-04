import React, { useEffect, useState } from 'react';
import { Plus, Activity, Calendar, Zap, Loader2, LogOut, Share, X, TrendingUp, Clock } from 'lucide-react';
import { HeadacheLog } from '../types';
import { getLogs, getActiveHeadache } from '../services/storageService';
import { Button } from './ui/Button';
import { supabase } from '../services/supabaseClient';

interface DashboardProps {
  onLogNew: () => void;
  onViewHistory: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogNew, onViewHistory }) => {
  const [logs, setLogs] = useState<HeadacheLog[]>([]);
  const [activeLog, setActiveLog] = useState<HeadacheLog | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [showInstallHint, setShowInstallHint] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedLogs, active] = await Promise.all([
        getLogs(),
        getActiveHeadache()
      ]);
      setLogs(fetchedLogs);
      setActiveLog(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Check if iOS and not in standalone mode (mobile only)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    const isDesktop = window.matchMedia('(min-width: 1024px)').matches;

    if (isIOS && !isStandalone && !isDesktop) {
      setShowInstallHint(true);
    }
  }, []);

  const lastLog = logs[0];
  const totalAttacks = logs.length;

  // Calculate average intensity
  const avgIntensity = totalAttacks > 0
    ? (logs.reduce((acc, curr) => acc + curr.intensity, 0) / totalAttacks).toFixed(1)
    : '0';

  // Calculate days since last attack
  const daysSince = lastLog
    ? Math.floor((new Date().getTime() - new Date(lastLog.startedAt).getTime()) / (1000 * 3600 * 24))
    : '-';

  // Calculate this month's attacks
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const monthlyAttacks = logs.filter(log => {
    const d = new Date(log.startedAt);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  }).length;

  // Calculate average duration
  const logsWithDuration = logs.filter(l => l.endedAt);
  const avgDuration = logsWithDuration.length > 0
    ? (logsWithDuration.reduce((acc, l) => {
        return acc + (new Date(l.endedAt!).getTime() - new Date(l.startedAt).getTime());
      }, 0) / logsWithDuration.length / (1000 * 60 * 60)).toFixed(1)
    : '-';

  if (loading) {
     return <div className="h-full flex items-center justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in px-4 lg:px-0">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] lg:pt-8 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 mb-4 flex justify-between items-center border-b border-gray-800/50 lg:border-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text">Il tuo Diario</h1>
          <p className="text-muted text-sm lg:text-base">Spero tu stia bene oggi.</p>
        </div>
        {/* Logout button - visible only on mobile (desktop has it in sidebar area) */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="lg:hidden h-10 w-10 rounded-full bg-surface border border-gray-700 flex items-center justify-center text-muted hover:text-white transition-colors"
          title="Esci"
        >
          <LogOut size={16} />
        </button>
      </header>

      <div className="space-y-6 lg:space-y-8">
        {/* iOS Install Hint Banner - Mobile only */}
        {showInstallHint && (
            <div className="lg:hidden bg-surface/80 backdrop-blur border border-primary/30 p-4 rounded-xl relative animate-in fade-in slide-in-from-top-4">
            <button
                onClick={() => setShowInstallHint(false)}
                className="absolute top-2 right-2 text-muted hover:text-white p-1"
            >
                <X size={16} />
            </button>
            <div className="flex gap-3">
                <div className="bg-primary/20 p-2 rounded-lg h-fit text-primary">
                <Share size={20} />
                </div>
                <div>
                <h3 className="font-bold text-sm text-white mb-1">Installa l'App</h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                    Per un'esperienza migliore, tocca il tasto <strong>Condividi</strong> qui sotto in Safari e seleziona <strong>"Aggiungi alla schermata Home"</strong>.
                </p>
                </div>
            </div>
            </div>
        )}

        {/* Desktop: Two column layout for action card + stats */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Main Action Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 lg:p-8 border border-indigo-500/30 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 lg:w-48 lg:h-48 bg-primary/20 rounded-full blur-2xl"></div>

              <h2 className="text-lg lg:text-xl font-semibold text-white mb-2 relative z-10">
              {activeLog ? 'Attacco in corso' : 'Come va la testa?'}
              </h2>

              <p className="text-indigo-200 text-sm lg:text-base mb-6 relative z-10">
              {activeLog
                  ? `Iniziato alle ${new Date(activeLog.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}. Tocca per aggiornare o terminare.`
                  : 'Registra subito un attacco per tracciare durata e sintomi con precisione.'
              }
              </p>

              <Button
              variant={activeLog ? "danger" : "primary"}
              fullWidth
              size="lg"
              onClick={onLogNew}
              className="relative z-10"
              >
              {activeLog ? (
                  <span className="flex items-center gap-2"><Activity className="w-5 h-5" /> Aggiorna / Fine</span>
              ) : (
                  <span className="flex items-center gap-2"><Plus className="w-5 h-5" /> Registra Attacco</span>
              )}
              </Button>
          </div>

          {/* Quick Stats Grid - 2x2 on mobile, 2x2 on desktop (inside the grid) */}
          <div className="grid grid-cols-2 gap-4 mt-6 lg:mt-0">
              <StatCard
                icon={<Zap className="w-4 h-4" />}
                label="Dolore Medio"
                value={avgIntensity}
                suffix="/10"
              />
              <StatCard
                icon={<Calendar className="w-4 h-4" />}
                label="Giorni Liberi"
                value={daysSince}
              />
              <StatCard
                icon={<TrendingUp className="w-4 h-4" />}
                label="Questo Mese"
                value={monthlyAttacks}
                suffix=" attacchi"
              />
              <StatCard
                icon={<Clock className="w-4 h-4" />}
                label="Durata Media"
                value={avgDuration}
                suffix="h"
              />
          </div>
        </div>

        {/* Recent History Preview */}
        <div className="space-y-3 lg:space-y-4">
            <div className="flex justify-between items-center">
            <h3 className="text-lg lg:text-xl font-semibold text-text">Storico Recente</h3>
            <button onClick={onViewHistory} className="text-primary text-sm font-medium hover:underline">Vedi tutto</button>
            </div>

            {logs.length === 0 ? (
            <div className="text-center py-8 lg:py-12 text-muted bg-surface/50 rounded-xl border border-dashed border-gray-700">
                Nessun dato ancora.
            </div>
            ) : (
            <div className="space-y-3 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4 lg:space-y-0">
              {logs.slice(0, 6).map(log => (
                <div key={log.id} className="bg-surface rounded-xl p-4 border border-gray-800 flex justify-between items-center hover:border-gray-600 transition-colors cursor-pointer" onClick={onViewHistory}>
                <div>
                    <p className="font-medium text-text capitalize">
                    {new Date(log.startedAt).toLocaleDateString('it-IT', { weekday: 'short', month: 'short', day: 'numeric'})}
                    </p>
                    <p className="text-xs text-muted">
                    {new Date(log.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {log.endedAt ? ` • ${((new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime()) / (1000 * 60 * 60)).toFixed(1)} ore` : ' • In corso'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    log.intensity >= 7 ? 'bg-red-500/20 text-red-400' :
                    log.intensity >= 4 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-green-500/20 text-green-400'
                    }`}>
                    {log.intensity}/10
                    </div>
                </div>
                </div>
              ))}
            </div>
            )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-gray-700 rounded-xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-2">Vuoi uscire?</h3>
            <p className="text-muted text-sm mb-6">Dovrai effettuare nuovamente il login per accedere al tuo diario.</p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShowLogoutConfirm(false)}
              >
                Annulla
              </Button>
              <Button
                variant="danger"
                fullWidth
                onClick={() => supabase.auth.signOut()}
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
}> = ({ icon, label, value, suffix }) => (
  <div className="bg-surface rounded-xl p-4 lg:p-5 border border-gray-800 hover:border-gray-700 transition-colors">
    <div className="flex items-center gap-2 text-muted mb-2">
      {icon}
      <span className="text-xs uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl lg:text-3xl font-bold text-text">
      {value}
      {suffix && <span className="text-sm lg:text-base text-muted font-normal">{suffix}</span>}
    </p>
  </div>
);
