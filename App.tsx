import React, { useState, useEffect } from 'react';
import { LayoutDashboard, PlusCircle, History, BarChart2, Loader2, Activity } from 'lucide-react';
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
    setSelectedLog(null);
    setView('log');
  };

  const renderContent = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onLogNew={handleNewLog} onViewHistory={() => setView('history')} />;
      case 'log':
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
      {/* Desktop Layout */}
      <div className="lg:flex lg:min-h-screen">

        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:left-0 lg:bg-surface lg:border-r lg:border-gray-800">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 px-6 py-8 border-b border-gray-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">CefaLog</h1>
              <p className="text-xs text-muted">Diario Cefalee</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <SidebarButton
              active={view === 'dashboard'}
              onClick={() => setView('dashboard')}
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
            />
            <SidebarButton
              active={view === 'analytics'}
              onClick={() => setView('analytics')}
              icon={<BarChart2 size={20} />}
              label="Analisi"
            />
            <SidebarButton
              active={view === 'history'}
              onClick={() => setView('history')}
              icon={<History size={20} />}
              label="Storico"
            />
          </nav>

          {/* New Log Button */}
          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleNewLog}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              <PlusCircle size={20} />
              <span>Nuovo Attacco</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="
          w-full min-h-screen relative
          max-w-md mx-auto
          lg:max-w-none lg:ml-64 lg:mr-0
        ">
          <div className="lg:max-w-4xl lg:mx-auto lg:px-8">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on desktop and in Log/Detail views */}
      {view !== 'log' && view !== 'detail' && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 border-t border-gray-800 bg-surface/95 backdrop-blur-lg pb-safe z-40 shadow-[0_-5px_15px_rgba(0,0,0,0.3)]">
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

// Mobile Bottom Nav Button
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-16 gap-1 transition-colors ${active ? 'text-primary' : 'text-gray-500 hover:text-gray-300'}`}
  >
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// Desktop Sidebar Button
const SidebarButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all
      ${active
        ? 'bg-primary/10 text-primary border border-primary/20'
        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
      }
    `}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export default App;
