import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { HeadacheLog, LOCATION_COLORS } from '../types';
import { getLogs } from '../services/storageService';
import { Clock, Zap, Calendar, Maximize2, X, MapPin, Loader2, Download, Printer } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [logs, setLogs] = useState<HeadacheLog[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Custom Date Range State
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    getLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  // SCROLL LOCKING for fullscreen modal
  useEffect(() => {
    if (isFullScreen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.touchAction = 'none';
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
    const end = new Date(dateRange.end).getTime() + (1000 * 60 * 60 * 24);
    return logs.filter(l => {
      const t = new Date(l.startedAt).getTime();
      return t >= start && t < end;
    });
  };

  const processTrendData = (sourceLogs: HeadacheLog[]) => {
    const dates = [];
    const curr = new Date(dateRange.start);
    const last = new Date(dateRange.end);

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

  const analysisLogs = isFullScreen ? getFilteredLogs() : logs;

  // Last 30 days trend
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

  const fullTrendData = processTrendData(logs);

  // Localization Analysis
  const locCounts: Record<string, number> = {};
  analysisLogs.forEach(log => {
    log.locations.forEach(loc => {
      locCounts[loc] = (locCounts[loc] || 0) + 1;
    });
  });
  const locData = Object.entries(locCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value, color: LOCATION_COLORS[name as any] || '#94a3b8' }));

  // Time Distribution
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

  // Triggers
  const triggerCounts: Record<string, number> = {};
  analysisLogs.forEach(log => {
    log.triggers.forEach(t => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });
  const sortedTriggers = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);


  // --- HELPERS ---
  const printReport = () => window.print();

  const downloadCSV = () => {
    const headers = [
      'Inizio', 'Fine', 'Intensità (1-10)', 'Qualità Dolore', 'Zone',
      'Aura', 'Nausea', 'Fotofobia', 'Fonofobia', 'Trigger', 'Farmaci', 'Cibo', 'Note'
    ];

    const escapeCsv = (str: string | undefined) => {
      if (!str) return '';
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows = logs.map(log => {
      return [
        new Date(log.startedAt).toLocaleString('it-IT'),
        log.endedAt ? new Date(log.endedAt).toLocaleString('it-IT') : 'In corso',
        log.intensity,
        log.quality || '',
        escapeCsv(log.locations.join(', ')),
        log.hasAura ? 'Si' : 'No',
        log.hasNausea ? 'Si' : 'No',
        log.isLightSensitive ? 'Si' : 'No',
        log.isSoundSensitive ? 'Si' : 'No',
        escapeCsv(log.triggers.join(', ')),
        escapeCsv(log.medication),
        escapeCsv(log.food),
        escapeCsv(log.notes)
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cefalog_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="pb-24 lg:pb-8 animate-fade-in space-y-6 px-4 lg:px-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] lg:pt-8 pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 mb-4 flex justify-between items-center border-b border-gray-800/50 lg:border-0">
        <h2 className="text-2xl lg:text-3xl font-bold">Analisi</h2>
        <div className="flex gap-2">
            <button
                onClick={printReport}
                className="p-2 text-muted hover:text-white border border-gray-700 rounded-lg transition-colors"
                title="Stampa PDF"
            >
                <Printer size={18} />
            </button>
            <button
                onClick={downloadCSV}
                className="flex items-center gap-2 text-xs bg-surface hover:bg-gray-700 text-primary font-medium border border-primary/30 px-3 py-2 rounded-lg transition-colors"
            >
                <Download size={14} />
                <span>CSV</span>
            </button>
        </div>
      </div>

      {/* Main Trend Chart - Full Width */}
      <div className="bg-surface p-4 lg:p-6 rounded-xl border border-gray-700 relative">
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
        <div className="h-40 lg:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={smallTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden lg:block" />
              <XAxis dataKey="date" stroke="#64748b" tick={{fontSize: 10}} tickLine={false} axisLine={false} interval={4} />
              <YAxis hide domain={[0, 10]} className="lg:block" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 500, marginBottom: '4px' }}
                itemStyle={{ color: '#f43f5e' }}
                labelFormatter={(label, payload) => payload[0]?.payload.fullDate || label}
                formatter={(value: number) => [`Intensità: ${value}`, '']}
              />
              <Line type="monotone" dataKey="intensity" stroke="#f43f5e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Desktop: 2 column grid for smaller charts */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">
        {/* Localization Chart */}
        <div className="bg-surface p-4 lg:p-6 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
             <MapPin size={16}/> Zone Colpite
          </h3>
          <div className="h-48 lg:h-56 w-full">
            {locData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={locData} margin={{ left: 0, right: 30, top: 0, bottom: 0 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" width={90} tick={{fontSize: 11, fill: '#94a3b8'}} tickLine={false} axisLine={false} />
                      <Tooltip
                                        cursor={{fill: 'transparent'}}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f1f5f9', fontWeight: 500 }}
                                        itemStyle={{ color: '#94a3b8' }}
                                        formatter={(value: number, name: string) => [`${value} episodi`, name]}
                                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                          {locData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Bar>
                  </BarChart>
                </ResponsiveContainer>
            ) : (
               <div className="h-full flex items-center justify-center text-muted text-xs">
                  Nessun dato sulla posizione.
               </div>
            )}
          </div>
        </div>

        {/* Time Distribution */}
        <div className="bg-surface p-4 lg:p-6 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
              <Clock size={16}/> Orari Più Frequenti
          </h3>
          <div className="h-48 lg:h-56 w-full flex items-center justify-center">
               {activeTimeDist.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={activeTimeDist}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {activeTimeDist.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#6366f1', '#f43f5e', '#a855f7', '#06b6d4'][index % 4]} />
                              ))}
                          </Pie>
                          <Tooltip
                                              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                                              labelStyle={{ color: '#f1f5f9', fontWeight: 500 }}
                                              itemStyle={{ color: '#94a3b8' }}
                                              formatter={(value: number, name: string) => [`${value} episodi`, name]}
                                          />
                      </PieChart>
                  </ResponsiveContainer>
               ) : (
                  <div className="text-muted text-xs">Dati insufficienti.</div>
               )}
          </div>
          <div className="flex justify-center gap-4 mt-2">
              {activeTimeDist.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1 text-[10px] text-gray-400">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: ['#6366f1', '#f43f5e', '#a855f7', '#06b6d4'][index % 4]}} />
                      {entry.name}
                  </div>
              ))}
          </div>
        </div>
      </div>

      {/* Top Triggers - Full Width */}
      <div className="bg-surface p-4 lg:p-6 rounded-xl border border-gray-700">
        <h3 className="text-sm font-medium text-muted mb-4 uppercase tracking-wider flex items-center gap-2">
            <Zap size={16}/> Fattori Scatenanti Comuni
        </h3>
        <div className="space-y-3 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:gap-y-3 lg:space-y-0">
            {sortedTriggers.length > 0 ? (
                sortedTriggers.map(([name, count], i) => (
                    <div key={name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">{i+1}. {name}</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 lg:w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-accent rounded-full"
                                    style={{ width: `${(count / logs.length) * 100}%` }}
                                />
                            </div>
                            <span className="text-xs text-muted w-6 text-right">{count}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-4 text-muted text-xs lg:col-span-2">Nessun trigger registrato.</div>
            )}
        </div>
      </div>

      {/* Full Screen Modal */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[60] bg-background flex flex-col animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center p-4 lg:p-6 border-b border-gray-800 bg-surface">
                <h2 className="font-bold text-lg lg:text-xl">Analisi Dettagliata</h2>
                <button onClick={() => setIsFullScreen(false)} className="p-2 bg-gray-700 rounded-full hover:bg-gray-600">
                    <X size={20} />
                </button>
            </div>

            <div className="p-4 lg:p-6 border-b border-gray-800 flex gap-4 overflow-x-auto">
                 <div className="flex-1 min-w-[120px] lg:max-w-xs">
                    <label className="text-xs text-muted block mb-1">Da</label>
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                    />
                 </div>
                 <div className="flex-1 min-w-[120px] lg:max-w-xs">
                    <label className="text-xs text-muted block mb-1">A</label>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-sm"
                    />
                 </div>
            </div>

            <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
                 <div className="h-[400px] lg:h-[500px] w-full min-w-[600px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={fullTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="fullDate" stroke="#64748b" tick={{fontSize: 10}} />
                        <YAxis domain={[0, 10]} stroke="#64748b" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                            labelStyle={{ color: '#f1f5f9', fontWeight: 500, marginBottom: '4px' }}
                            itemStyle={{ color: '#f43f5e' }}
                            formatter={(value: number) => [`Intensità: ${value}`, '']}
                        />
                        <Line type="monotone" dataKey="intensity" stroke="#f43f5e" strokeWidth={3} dot={{r: 4}} />
                        </LineChart>
                    </ResponsiveContainer>
                 </div>
            </div>
        </div>
      )}
    </div>
  );
};
