import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { HeadacheLog, LOCATION_COLORS } from '../types';
import { getLogs } from '../services/storageService';
import { Clock, Zap, Pill, Calendar, Maximize2, X, MapPin, Loader2 } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [logs, setLogs] = useState<HeadacheLog[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Custom Date Range State
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10), // Default 30 days ago
    end: new Date().toISOString().slice(0, 10) // Today
  });

  useEffect(() => {
    getLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  // SCROLL LOCKING: Force body to fixed to prevent iOS rubber-banding under modal
  useEffect(() => {
    if (isFullScreen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none'; // Nuclear option for scroll
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.touchAction = '';
    };
  }, [isFullScreen]);

  // --- DATA PROCESSING HELPERS ---

  const getFilteredLogs = () => {
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime() + (1000 * 60 * 60 * 24); // Include end day
    return logs.filter(l => {
      const t = new Date(l.startedAt).getTime();
      return t >= start && t < end;
    });
  };

  const processTrendData = (sourceLogs: HeadacheLog[]) => {
    // Generate array of dates between start and end
    const dates = [];
    const curr = new Date(dateRange.start);
    const last = new Date(dateRange.end);
    
    // Safety break for loop
    let safety = 0;
    while(curr <= last && safety < 365) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
        safety++;
    }

    return dates.map(date => {
      const dayStr = date.toISOString().slice(0, 10);
      const dayLogs = sourceLogs.filter(l => l.startedAt.startsWith(dayStr));
      
      let intensity = 0;
      if (dayLogs.length > 0) {
        intensity = dayLogs.reduce((acc, l) => acc + l.intensity, 0) / dayLogs.length;
      }

      return {
        date: date.getDate().toString(),
        fullDate: date.toLocaleDateString('it-IT'),
        intensity: parseFloat(intensity.toFixed(1))
      };
    });
  };

  if (loading) {
     return <div className="h-full flex items-center justify-center pt-20"><Loader2 className="animate-spin text-primary" /></div>;
  }

  // --- DERIVED DATA ---
  
  // 1. Trend Data (Default 30 days for small view, custom for fullscreen)
  const analysisLogs = isFullScreen ? getFilteredLogs() : logs;
  
  // Re-calc trend for small view specifically (Last 30 days fixed)
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d;
  });
  const smallTrendData = last30Days.map(date => {
     const dayStr = date.toISOString().slice(0, 10);
     const dayLogs = logs.filter(l => l.startedAt.startsWith(dayStr));
     let intensity = 0;
     if (dayLogs.length > 0) intensity = dayLogs.reduce((acc, l) => acc + l.intensity, 0) / dayLogs.length;
     return { date: date.getDate().toString(), fullDate: date.toLocaleDateString('it-IT'), intensity: parseFloat(intensity.toFixed(1)) };
  });

  // Full Screen Trend Data
  const fullTrendData = processTrendData(logs);

  // 2. Localization Analysis
  const locCounts: Record<string, number> = {};
  analysisLogs.forEach(log => {
    log.locations.forEach(loc => {
      locCounts[loc] = (locCounts[loc] || 0) + 1;
    });
  });
  const locData = Object.entries(locCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: LOCATION_COLORS[name as any] || '#94a3b8' }));

  // 3. Time Distribution
  const timeDistribution = [
    { name: 'Mattina', value: 0 },
    { name: 'Pomeriggio', value: 0 },
    { name: 'Sera', value: 0 },
    { name: 'Notte', value: 0 },
  ];
  analysisLogs.forEach(log => {
    const hour = new Date(log.startedAt).getHours();
    if (hour >= 6 && hour < 12) timeDistribution[0].value++;
    else if (hour >= 12 && hour < 18) timeDistribution[1].value++;
    else if (hour >= 18) timeDistribution[2].value++;
    else timeDistribution[3].value++;
  });
  const activeTimeDist = timeDistribution.filter(d => d.value > 0);

  // 4. Triggers
  const triggerCounts: Record<string, number> = {};
  analysisLogs.forEach(log => {
    log.triggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);


  // --- HELPERS ---
  const printReport = () => window.print();

  return (
    <div className="pb-24 animate-fade-in space-y-6 px-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 -mx-4 px-4 mb-4 flex justify-between items-center border-b border-gray-800/50">
        <h2 className="text-2xl font-bold">Analisi</h2>
        <button onClick={printReport} className="text-xs text-primary font-medium border border-primary px-3 py-1 rounded-full">
          Esporta Report
        </button>
      </div>

      {/* --- INTENSITY TREND (SMALL) --- */}
      <div className="bg-surface p-4 rounded-xl border border-gray-700 relative">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-muted uppercase tracking-wider flex items-center gap-2">
            <Calendar size={16}/> Andamento 30 Giorni
            </h3>
            <button 
                onClick={() => setIsFullScreen(true)}
                className="p-1.5 bg-gray-700 hover:bg-primary text-white rounded-lg transition-colors"
            >
                <Maximize2 size={16} />
            </button>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={smallTrendData}>
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={4} />
              <YAxis hide domain={[0, 10]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                itemStyle={{ color: '#f43f5e' }}
                labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
              />
              <Line type="monotone" dataKey="intensity" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- LOCALIZATION CHART --- */}
      <div className="bg-surface p-4 rounded-xl border border-gray-700">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
           <MapPin size={16}/> Zone Colpite
        </h3>
        <div className="h-48 w-full">
          {locData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={locData} margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 11, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {locData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-muted text-xs">Nessun dato locale</div>
          )}
        </div>
      </div>

       {/* --- TIME OF DAY DISTRIBUTION --- */}
       <div className="bg-surface p-4 rounded-xl border border-gray-700">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
           <Clock size={16}/> Orari Critici
        </h3>
        <div className="h-40 w-full flex">
           <div className="w-1/2 h-full">
             {activeTimeDist.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={activeTimeDist} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                      {activeTimeDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#f59e0b', '#10b981'][index % 4]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted">Dati mancanti</div>
             )}
           </div>
           <div className="w-1/2 flex flex-col justify-center gap-2 text-xs">
              {activeTimeDist.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#6366f1', '#f43f5e', '#f59e0b', '#10b981'][index % 4]}} />
                   <span className="text-gray-300">{entry.name}</span>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* --- TOP TRIGGERS --- */}
      <div className="bg-surface p-4 rounded-xl border border-gray-700">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
           <Zap size={16}/> Cause Principali
        </h3>
        <div className="space-y-3">
          {sortedTriggers.length > 0 ? (
            sortedTriggers.map(([trigger, count]) => (
              <div key={trigger} className="flex items-center justify-between">
                <span className="text-text text-sm">{trigger}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(count / logs.length) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted w-4 text-right">{count}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted text-sm py-4">Nessun fattore registrato</div>
          )}
        </div>
      </div>

      {/* --- FULL SCREEN MODAL --- */}
      {isFullScreen && (
        <div 
          className="fixed inset-0 z-[100] bg-background flex flex-col pt-safe pl-safe pr-safe pb-safe"
          style={{ overscrollBehavior: 'none' }}
        >
          {/* Header Controls - Explicit Top Padding to cover Notch Area fully */}
          <div className="flex-none pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 px-4 border-b border-gray-800 flex justify-between items-center bg-background/95 backdrop-blur-md">
            <h2 className="font-bold text-lg">Analisi Periodo</h2>
            <button 
              onClick={() => setIsFullScreen(false)}
              className="p-2 bg-surface hover:bg-gray-700 rounded-full text-white transition-colors"
            >
                <X size={20} />
            </button>
          </div>

          {/* Date Range Picker */}
          <div className="flex-none grid grid-cols-2 gap-4 p-4 border-b border-gray-800 bg-surface/30">
             <div>
                <label className="text-[10px] uppercase text-muted font-bold block mb-1">Dal</label>
                <input 
                  type="date" 
                  value={dateRange.start}
                  onChange={e => setDateRange({...dateRange, start: e.target.value})}
                  className="w-full bg-surface border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                />
             </div>
             <div>
                <label className="text-[10px] uppercase text-muted font-bold block mb-1">Al</label>
                <input 
                  type="date" 
                  value={dateRange.end}
                  onChange={e => setDateRange({...dateRange, end: e.target.value})}
                  className="w-full bg-surface border border-gray-600 rounded-lg p-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
                />
             </div>
          </div>

          {/* Chart Content Container - Fill Remaining Space */}
          <div className="flex-1 min-h-0 relative p-4 bg-background">
              {fullTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={fullTrendData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                      <YAxis stroke="#64748b" tick={{fontSize: 12}} tickLine={false} axisLine={false} domain={[0, 10]} />
                      <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9', fontSize: '14px' }}
                          itemStyle={{ color: '#f43f5e' }}
                          labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                      />
                      <Line 
                          type="monotone" 
                          dataKey="intensity" 
                          stroke="#f43f5e" 
                          strokeWidth={3} 
                          dot={{r: 4, fill:'#f43f5e'}} 
                          activeDot={{r: 8}} 
                      />
                      </LineChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="flex items-center justify-center h-full text-muted">
                      Nessun dato nel periodo selezionato
                  </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};