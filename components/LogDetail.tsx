import React from 'react';
import { ArrowLeft, Calendar, Clock, Edit2, Trash2, MapPin, Activity, Zap, Pill, AlertCircle, Utensils, FileText } from 'lucide-react';
import { HeadacheLog, LOCATION_COLORS } from '../types';
import { Button } from './ui/Button';

interface LogDetailProps {
  log: HeadacheLog;
  onBack: () => void;
  onEdit: (log: HeadacheLog) => void;
  onDelete: (id: string) => void;
}

export const LogDetail: React.FC<LogDetailProps> = ({ log, onBack, onEdit, onDelete }) => {
  
  const calculateDuration = (start: string, end?: string) => {
    if (!end) return "In corso";
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const getIntensityColor = (val: number) => {
    if (val < 4) return 'text-green-400 bg-green-400/10 border-green-400/20';
    if (val < 7) return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  const activeSymptoms = [
    log.hasAura && 'Aura',
    log.isLightSensitive && 'Fotofobia',
    log.isSoundSensitive && 'Fonofobia',
    log.isSmellSensitive && 'Osmofobia',
    log.hasNausea && 'Nausea',
    log.worsenedByMovement && 'Peggiora muovendosi'
  ].filter(Boolean) as string[];

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare definitivamente questo attacco?')) {
      onDelete(log.id);
    }
  };

  return (
    <div className="pb-24 animate-fade-in px-4">
      {/* Header with EXPLICIT calc() safe area padding + 1.5rem (24px) for visual spacing */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-50 py-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] border-b border-gray-800 flex justify-between items-center mb-6 -mx-4 px-4">
        <button onClick={onBack} className="p-2 -ml-2 text-muted hover:text-white">
          <ArrowLeft />
        </button>
        <h2 className="font-bold text-lg">Dettaglio Attacco</h2>
        <button 
          onClick={() => onEdit(log)}
          className="p-2 text-primary hover:bg-primary/10 rounded-full"
        >
          <Edit2 size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {/* Date & Main Info */}
        <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-gray-700 text-muted text-sm">
                <Calendar size={14} />
                {new Date(log.startedAt).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            
            <div className={`mt-4 p-6 rounded-full w-32 h-32 flex flex-col items-center justify-center border-4 mx-auto ${getIntensityColor(log.intensity)}`}>
                 <span className="text-3xl font-bold">{log.intensity}</span>
                 <span className="text-xs uppercase opacity-80">Intensità</span>
            </div>
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-surface p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 text-muted text-xs uppercase mb-1">
                    <Clock size={14} /> Inizio
                </div>
                <div className="text-lg font-semibold">
                    {new Date(log.startedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
             </div>
             <div className="bg-surface p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 text-muted text-xs uppercase mb-1">
                    <Activity size={14} /> Durata
                </div>
                <div className="text-lg font-semibold">
                    {calculateDuration(log.startedAt, log.endedAt)}
                </div>
             </div>
        </div>

        {/* Locations */}
        {log.locations.length > 0 && (
            <div className="bg-surface p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 text-primary text-sm font-bold mb-3 uppercase">
                    <MapPin size={16} /> Zone Colpite
                </div>
                <div className="flex flex-wrap gap-2">
                    {log.locations.map(loc => (
                        <span 
                            key={loc} 
                            style={{ color: LOCATION_COLORS[loc], borderColor: `${LOCATION_COLORS[loc]}40`, backgroundColor: `${LOCATION_COLORS[loc]}10` }}
                            className="px-3 py-1 rounded-lg border text-sm font-medium"
                        >
                            {loc}
                        </span>
                    ))}
                </div>
            </div>
        )}

        {/* Symptoms & Triggers */}
        <div className="bg-surface p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-2 text-primary text-sm font-bold mb-3 uppercase">
                <Zap size={16} /> Sintomi & Cause
            </div>
            
            <div className="space-y-4">
                {activeSymptoms.length > 0 && (
                    <div>
                        <span className="text-xs text-muted block mb-2">Sintomi:</span>
                        <div className="flex flex-wrap gap-2">
                            {activeSymptoms.map(sym => (
                                <span key={sym} className="px-2 py-1 bg-background border border-gray-600 rounded text-sm text-gray-300">
                                    {sym}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                {log.triggers.length > 0 && (
                    <div>
                        <span className="text-xs text-muted block mb-2">Fattori Scatenanti:</span>
                        <div className="flex flex-wrap gap-2">
                            {log.triggers.map(t => (
                                <span key={t} className="px-2 py-1 bg-accent/10 border border-accent/30 rounded text-sm text-accent">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {activeSymptoms.length === 0 && log.triggers.length === 0 && (
                    <p className="text-sm text-muted italic">Nessun sintomo o fattore registrato.</p>
                )}
            </div>
        </div>

        {/* Treatment (Meds & Food) */}
        <div className="bg-surface p-4 rounded-xl border border-gray-700">
            <div className="flex items-center gap-2 text-primary text-sm font-bold mb-3 uppercase">
                <Pill size={16} /> Trattamento
            </div>
            
            <div className="space-y-4">
                 <div>
                    <span className="text-xs text-muted block mb-1">Farmaci Assunti:</span>
                    <p className="text-white text-sm">
                        {log.medication || <span className="text-muted italic">Nessun farmaco</span>}
                    </p>
                 </div>

                 {log.food && (
                    <div className="pt-3 border-t border-gray-700">
                        <span className="text-xs text-muted block mb-1 flex items-center gap-1"><Utensils size={10}/> Cibo Assunto:</span>
                        <p className="text-white text-sm">
                            {log.food}
                        </p>
                    </div>
                 )}
            </div>
        </div>

        {/* Notes */}
        {log.notes && (
            <div className="bg-surface p-4 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 text-primary text-sm font-bold mb-3 uppercase">
                    <FileText size={16} /> Note
                </div>
                <p className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {log.notes}
                </p>
            </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4">
            <Button 
                variant="ghost" 
                fullWidth 
                onClick={handleDelete}
                className="text-red-500 hover:bg-red-500/10 hover:text-red-400"
            >
                <Trash2 size={18} className="mr-2" />
                Elimina Attacco
            </Button>
        </div>
      </div>
    </div>
  );
};