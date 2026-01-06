import React, { useEffect, useState } from 'react';
import { Plus, Activity, Calendar, Zap, Loader2, LogOut, Share, X } from 'lucide-react';
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

    // Check if iOS and not in standalone mode
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isIOS && !isStandalone) {
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

  if (loading) {
     return <div className="h-full flex items-center justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="pb-24 animate-fade-in px-4">
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 -mx-4 px-4 mb-4 flex justify-between items-center border-b border-gray-800/50">
        <div>
          <h1 className="text-2xl font-bold text-text">Ciao, Fratello</h1>
          <p className="text-muted text-sm">Spero tu stia bene oggi.</p>
        </div>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="h-10 w-10 rounded-full bg-surface border border-gray-700 flex items-center justify-center text-muted hover:text-white transition-colors"
          title="Esci"
        >
          <LogOut size={16} />
        </button>
      </header>
      
      <div className="space-y-6">
        {/* iOS Install Hint Banner */}
        {showInstallHint && (
            <div className="bg-surface/80 backdrop-blur border border-primary/30 p-4 rounded-xl relative animate-in fade-in slide-in-from-top-4">
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

        {/* Main Action Card */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 border border-indigo-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            
            <h2 className="text-lg font-semibold text-white mb-2 relative z-10">
            {activeLog ? 'Attacco in corso' : 'Come va la testa?'}
            </h2>
            
            <p className="text-indigo-200 text-sm mb-6 relative z-10">
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 text-muted mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Dolore Medio</span>
            </div>
            <p className="text-2xl font-bold text-text">{avgIntensity}<span className="text-sm text-muted font-normal">/10</span></p>
            </div>

            <div className="bg-surface rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-2 text-muted mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">Giorni Liberi</span>
            </div>
            <p className="text-2xl font-bold text-text">{daysSince}</p>
            </div>
        </div>

        {/* Recent History Preview */}
        <div className="space-y-3">
            <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text">Storico Recente</h3>
            <button onClick={onViewHistory} className="text-primary text-sm font-medium">Vedi tutto</button>
            </div>

            {logs.length === 0 ? (
            <div className="text-center py-8 text-muted bg-surface/50 rounded-xl border border-dashed border-gray-700">
                Nessun dato ancora.
            </div>
            ) : (
            logs.slice(0, 3).map(log => (
                <div key={log.id} className="bg-surface rounded-xl p-4 border border-gray-800 flex justify-between items-center">
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
            ))
            )}
        </div>
      </div>
    </div>
  );
};