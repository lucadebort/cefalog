import React, { useEffect, useState } from 'react';
import { Trash2, Calendar as CalendarIcon, List, Clock, ChevronLeft, ChevronRight, Search, Filter, Loader2, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { HeadacheLog } from '../types';
import { getLogs, deleteLog } from '../services/storageService';

interface HistoryListProps {
  onSelectLog?: (log: HeadacheLog) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ onSelectLog }) => {
  const [logs, setLogs] = useState<HeadacheLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<HeadacheLog[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [minIntensity, setMinIntensity] = useState(0);
  const [filterSymptom, setFilterSymptom] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await getLogs();
    setLogs(data);
    applyFilters(data, searchTerm, minIntensity, filterSymptom);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Effect for filtering when local state changes (avoid re-fetching)
  useEffect(() => {
    if (logs.length > 0) {
      applyFilters(logs, searchTerm, minIntensity, filterSymptom);
    }
  }, [searchTerm, minIntensity, filterSymptom, logs]);

  const applyFilters = (data: HeadacheLog[], term: string, intensity: number, symptom: string | null) => {
    let result = data;

    // Text Search (Notes, Meds, Triggers)
    if (term) {
      const t = term.toLowerCase();
      result = result.filter(log => 
        log.notes?.toLowerCase().includes(t) ||
        log.medication?.toLowerCase().includes(t) ||
        log.triggers.some(tr => tr.toLowerCase().includes(t))
      );
    }

    // Intensity Filter
    if (intensity > 0) {
      result = result.filter(log => log.intensity >= intensity);
    }

    // Symptom Filter
    if (symptom) {
       result = result.filter(log => {
         if (symptom === 'aura') return log.hasAura;
         if (symptom === 'nausea') return log.hasNausea;
         if (symptom === 'light') return log.isLightSensitive;
         return true;
       });
    }

    setFilteredLogs(result);
  };

  const calculateDuration = (start: string, end?: string) => {
    if (!end) return "In corso";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  // --- Calendar Components ---

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; 
  };

  const CalendarView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    const monthName = currentDate.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });

    const getLogsForDay = (day: number) => {
      return logs.filter(log => {
        const d = new Date(log.startedAt);
        return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
      });
    };

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
      <div className="bg-surface rounded-xl border border-gray-700 p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 hover:text-white text-muted"><ChevronLeft /></button>
          <h3 className="font-bold capitalize text-white">{monthName}</h3>
          <button onClick={nextMonth} className="p-1 hover:text-white text-muted"><ChevronRight /></button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(d => (
            <div key={d} className="text-xs text-muted font-medium py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {blanks.map(i => <div key={`blank-${i}`} className="aspect-square" />)}
          {days.map(day => {
            const dayLogs = getLogsForDay(day);
            const maxIntensity = dayLogs.reduce((acc, l) => Math.max(acc, l.intensity), 0);
            const hasLog = dayLogs.length > 0;
            
            let bgClass = 'bg-surface/50 border-gray-800 text-muted hover:bg-gray-700';
            let textClass = '';
            
            if (hasLog) {
              textClass = 'font-bold text-white';
              if (maxIntensity >= 7) bgClass = 'bg-red-500/20 border-red-500/50';
              else if (maxIntensity >= 4) bgClass = 'bg-orange-500/20 border-orange-500/50';
              else bgClass = 'bg-green-500/20 border-green-500/50';
            }

            return (
              <button 
                key={day} 
                onClick={() => {
                   if (hasLog && onSelectLog) onSelectLog(dayLogs[0]); // Select first log of the day for now
                }}
                disabled={!hasLog}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center relative transition-colors ${bgClass}`}
              >
                <span className={`text-sm ${textClass}`}>{day}</span>
                {hasLog && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${maxIntensity >= 7 ? 'bg-red-500' : maxIntensity >= 4 ? 'bg-orange-500' : 'bg-green-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
     return <div className="h-full flex items-center justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    // Added pt-[calc(env(safe-area-inset-top)+2rem)] to ensure content starts BELOW the notch
    <div className="pb-20 animate-fade-in pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="flex justify-between items-center mb-4">
         <h2 className="text-2xl font-bold">Storico</h2>
         <div className="flex bg-surface rounded-lg p-1 border border-gray-700">
           <button 
             onClick={() => setViewMode('list')}
             className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-muted'}`}
           >
             <List size={20} />
           </button>
           <button 
             onClick={() => setViewMode('calendar')}
             className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-gray-700 text-white' : 'text-muted'}`}
           >
             <CalendarIcon size={20} />
           </button>
         </div>
      </div>

      {/* Search Bar Area (Only in List Mode) */}
      {viewMode === 'list' && (
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-muted w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cerca note, farmaci..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-primary outline-none"
            />
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-2 p-1 rounded-lg border ${showFilters || minIntensity > 0 || filterSymptom ? 'bg-primary text-white border-primary' : 'bg-surface border-gray-600 text-muted'}`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {showFilters && (
            <div className="bg-surface border border-gray-700 rounded-xl p-4 animate-fade-in">
              <div className="flex justify-between items-center mb-3">
                 <h4 className="text-xs uppercase text-muted font-bold">Filtri Avanzati</h4>
                 <button onClick={() => { setMinIntensity(0); setFilterSymptom(null); }} className="text-xs text-primary">Reset</button>
              </div>
              
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Intensità Minima: {minIntensity}</label>
                <input 
                  type="range" min="0" max="10" 
                  value={minIntensity} 
                  onChange={(e) => setMinIntensity(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="flex gap-2">
                {['aura', 'nausea', 'light'].map(sym => (
                  <button 
                    key={sym}
                    onClick={() => setFilterSymptom(filterSymptom === sym ? null : sym)}
                    className={`px-3 py-1.5 rounded-lg text-xs capitalize border ${
                      filterSymptom === sym 
                      ? 'bg-primary/20 border-primary text-primary' 
                      : 'border-gray-600 text-muted'
                    }`}
                  >
                    {sym === 'light' ? 'Fotofobia' : sym}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {viewMode === 'calendar' ? (
        <CalendarView />
      ) : (
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <button 
              key={log.id} 
              onClick={() => onSelectLog && onSelectLog(log)}
              className="w-full text-left bg-surface rounded-xl border border-gray-700 overflow-hidden hover:border-gray-500 transition-colors active:scale-[0.99]"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2 text-muted text-sm mb-1 capitalize">
                        <CalendarIcon className="w-3 h-3" />
                        {new Date(log.startedAt).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="text-xl font-bold text-text">
                        Intensità: <span className={
                          log.intensity >= 7 ? 'text-accent' : 
                          log.intensity >= 4 ? 'text-orange-400' : 
                          'text-green-400'
                        }>{log.intensity}</span>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                      {log.quality}
                    </span>
                    <ChevronRightIcon size={16} className="text-muted" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 my-3">
                  <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {calculateDuration(log.startedAt, log.endedAt)}
                  </div>
                  <div>
                      {log.medication ? <span className="text-indigo-400">{log.medication}</span> : 'Nessun farmaco'}
                  </div>
                </div>

                {log.triggers.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {log.triggers.map(t => (
                      <span key={t} className="text-[10px] uppercase tracking-wider bg-background border border-gray-700 px-1.5 py-0.5 rounded text-gray-500">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-black/20 px-4 py-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {log.hasAura ? '⚡ Aura ' : ''}
                  {log.isLightSensitive ? '☀️ Fotofobia ' : ''}
                  {log.hasNausea ? '🤢 Nausea' : ''}
                </span>
                <span className="text-[10px] text-primary uppercase font-bold tracking-wide">
                  Vedi Dettaglio
                </span>
              </div>
            </button>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-10 text-muted">
              {logs.length === 0 ? "Nessuno storico presente." : "Nessun risultato con questi filtri."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};