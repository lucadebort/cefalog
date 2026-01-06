import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History, BarChart2, Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { LogForm } from './components/LogForm';
import { HistoryList } from './components/HistoryList';
import { Analytics } from './components/Analytics';
import { LogDetail } from './components/LogDetail';
import { Auth } from './components/Auth';
import { ViewState, HeadacheLog } from './types';
import { supabase } from './services/supabaseClient';
import { deleteLog } from './services/storageService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('dashboard');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State for the Detail View logic
  const [selectedLog, setSelectedLog] = useState<HeadacheLog | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      console.warn("Supabase session check failed (likely missing keys):", err);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  // --- Handlers ---
  const handleSelectLog = (log: HeadacheLog) => {
    setSelectedLog(log);
    setView('detail');
  };

  const handleDeleteLog = async (id: string) => {
    await deleteLog(id);
    setView('history');
  };

  const handleStartEdit = (log: HeadacheLog) => {
    setSelectedLog(log);
    setView('log');
  };

  const handleNewLog = () => {
    setSelectedLog(null); // Ensure we are clearing any selection
    setView('log');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onLogNew={handleNewLog} onViewHistory={() => setView('history')} />;
      case 'log':
        // If selectedLog is present, we are editing, otherwise creating/updating active
        return <LogForm onClose={() => setView('history')} editTarget={selectedLog} />;
      case 'history':
        return <HistoryList onSelectLog={handleSelectLog} />;
      case 'detail':
        return selectedLog ? (
           <LogDetail 
             log={selectedLog} 
             onBack={() => setView('history')} 
             onEdit={handleStartEdit}
             onDelete={handleDeleteLog}
            /> 
        ) : <HistoryList onSelectLog={handleSelectLog} />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard onLogNew={handleNewLog} onViewHistory={() => setView('history')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text font-sans antialiased selection:bg-primary/30">
      
      {/* 
          REMOVED all global padding (px-4, pt-safe, etc.) from here.
          Individual components now handle their own padding and sticky headers
          to ensure edge-to-edge blur effects.
      */}
      <main className="max-w-md mx-auto min-h-screen relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation - Hidden in Log and Detail views */}
      {view !== 'log' && view !== 'detail' && (
        <nav className="fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-surface/95 backdrop-blur-lg pb-safe z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
          <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
            <NavButton 
              active={view === 'dashboard'} 
              onClick={() => setView('dashboard')} 
              icon={<LayoutDashboard size={24} />} 
              label="Home" 
            />
            
            {/* FAB for Quick Log */}
            <div className="relative -top-5">
              <button 
                onClick={handleNewLog}
                className="w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center transform active:scale-95 transition-transform"
              >
                <PlusCircle size={28} />
              </button>
            </div>

            <NavButton 
              active={view === 'analytics'} 
              onClick={() => setView('analytics')} 
              icon={<BarChart2 size={24} />} 
              label="Analisi" 
            />
            
            <NavButton 
              active={view === 'history'} 
              onClick={() => setView('history')} 
              icon={<History size={24} />} 
              label="Storico" 
            />
          </div>
        </nav>
      )}
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${active ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default App;