import React, { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { HeadacheLog, LOCATION_COLORS } from '../types';
import { getLogs } from '../services/storageService';
import { Clock, Zap, Pill, Calendar, Maximize2, X, MapPin, Loader2, Download, Printer } from 'lucide-react';

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

  const downloadCSV = () => {
    const headers = [
      'Inizio',
      'Fine',
      'Intensità (1-10)',
      'Qualità Dolore',
      'Zone',
      'Aura',
      'Nausea',
      'Fotofobia',
      'Fonofobia',
      'Trigger',
      'Farmaci',
      'Cibo',
      'Note'
    ];

    const escapeCsv = (str: string | undefined) => {
      if (!str) return '';
      // Escape quotes and wrap in quotes
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

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n'); // \uFEFF for BOM (Excel compatibility)
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
    <div className="pb-24 animate-fade-in space-y-6 px-4">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 -mx-4 px-4 mb-4 flex justify-between items-center border-b border-gray-800/50">
        <h2 className="text-2xl font-bold">Analisi</h2>
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
             <div className="h-full flex items-center justify-center text-muted text-xs">