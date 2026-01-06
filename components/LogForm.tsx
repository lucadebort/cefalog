import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, AlertCircle, Clock, MapPin, Pill, Zap, Check, Activity, Loader2 } from 'lucide-react';
import { HeadacheLog, PainQuality, Location, COMMON_TRIGGERS, LOCATION_COLORS } from '../types';
import { Button } from './ui/Button';
import { saveLog, updateLog, getActiveHeadache } from '../services/storageService';

interface LogFormProps {
  onClose: () => void;
  editTarget?: HeadacheLog | null; // Optional: If passed, we are editing this specific log
}

export const LogForm: React.FC<LogFormProps> = ({ onClose, editTarget }) => {
  const [formData, setFormData] = useState<Partial<HeadacheLog>>({
    intensity: 5,
    quality: PainQuality.PULSING,
    locations: [],
    hasAura: false,
    isLightSensitive: false,
    isSoundSensitive: false,
    hasNausea: false,
    worsenedByMovement: false,
    triggers: [],
    medication: '',
    notes: '',
    startedAt: new Date().toISOString().slice(0, 16),
    endedAt: ''
  });

  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initForm = async () => {
        if (editTarget) {
            // Case 1: Explicit edit request from History/Detail
            setIsEditingExisting(true);
            setFormData({
                ...editTarget,
                startedAt: new Date(editTarget.startedAt).toISOString().slice(0, 16),
                endedAt: editTarget.endedAt ? new Date(editTarget.endedAt).toISOString().slice(0, 16) : ''
            });
        } else {
            // Case 2: New log (or auto-resume active headache)
            const active = await getActiveHeadache();
            if (active) {
                setIsEditingExisting(true);
                setFormData({
                    ...active,
                    startedAt: new Date(active.startedAt).toISOString().slice(0, 16),
                    endedAt: active.endedAt ? new Date(active.endedAt).toISOString().slice(0, 16) : ''
                });
            }
        }
    };
    initForm();
  }, [editTarget]);

  const toggleLocation = (loc: Location) => {
    const current = formData.locations || [];
    if (current.includes(loc)) {
      setFormData({ ...formData, locations: current.filter(l => l !== loc) });
    } else {
      setFormData({ ...formData, locations: [...current, loc] });
    }
  };

  const toggleTrigger = (trigger: string) => {
    const current = formData.triggers || [];
    if (current.includes(trigger)) {
      setFormData({ ...formData, triggers: current.filter(t => t !== trigger) });
    } else {
      setFormData({ ...formData, triggers: [...current, trigger] });
    }
  };

  const handleSubmit = async (endAttack: boolean) => {
    setLoading(true);
    // If "End Attack" button is clicked, set endedAt to now if not already set manually
    let finalEnd = formData.endedAt;
    if (endAttack && !finalEnd) {
      finalEnd = new Date().toISOString();
    } else if (finalEnd) {
      finalEnd = new Date(finalEnd).toISOString();
    } else {
      finalEnd = undefined; // Ensure it stays undefined if empty string
    }

    const finalData: HeadacheLog = {
      id: formData.id || crypto.randomUUID(),
      startedAt: new Date(formData.startedAt || Date.now()).toISOString(),
      endedAt: finalEnd,
      intensity: formData.intensity || 0,
      quality: formData.quality || PainQuality.OTHER,
      locations: formData.locations || [],
      hasAura: formData.hasAura || false,
      isLightSensitive: formData.isLightSensitive || false,
      isSoundSensitive: formData.isSoundSensitive || false,
      hasNausea: formData.hasNausea || false,
      worsenedByMovement: formData.worsenedByMovement || false,
      triggers: formData.triggers || [],
      medication: formData.medication || '',
      notes: formData.notes || ''
    };

    try {
      if (isEditingExisting && formData.id) {
        await updateLog(finalData);
      } else {
        await saveLog(finalData);
      }
      onClose();
    } catch (e) {
      alert("Errore nel salvataggio. Riprova.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (val: number) => {
    if (val < 4) return 'text-green-400';
    if (val < 7) return 'text-orange-400';
    return 'text-rose-500';
  };

  // SVG Head Map Component
  const HeadMap = () => {
    const isSelected = (loc: Location) => formData.locations?.includes(loc);
    const getColor = (loc: Location) => isSelected(loc) ? LOCATION_COLORS[loc] : '#475569';
    const getFill = (loc: Location) => isSelected(loc) ? LOCATION_COLORS[loc] : 'transparent';
    
    // Helper for interactive paths
    const ZonePath = ({ loc, d }: { loc: Location, d: string }) => (
      <path
        d={d}
        fill={getFill(loc)}
        stroke={getColor(loc)}
        strokeWidth="1.5"
        className="cursor-pointer transition-all duration-200 hover:opacity-80"
        onClick={() => toggleLocation(loc)}
      />
    );

    return (
      <div className="flex justify-center gap-6 py-2">
        {/* Front View */}
        <div className="relative w-28 h-36">
           <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
             {/* Base Outline */}
             <path d="M20,30 Q10,60 20,90 Q30,115 50,115 Q70,115 80,90 Q90,60 80,30 Q70,0 50,0 Q30,0 20,30" fill="#1e293b" stroke="#334155" strokeWidth="1" />
             
             <ZonePath loc={Location.TOP_HEAD} d="M30,10 Q50,-5 70,10 L70,20 Q50,25 30,20 Z" />
             <ZonePath loc={Location.FOREHEAD} d="M22,30 Q50,25 78,30 L76,45 Q50,48 24,45 Z" />
             <ZonePath loc={Location.LEFT_TEMPLE} d="M18,35 Q10,45 18,55 L25,50 L25,40 Z" />
             <ZonePath loc={Location.RIGHT_TEMPLE} d="M82,35 Q90,45 82,55 L75,50 L75,40 Z" />
             <ZonePath loc={Location.BEHIND_EYES} d="M25,52 Q50,55 75,52 L73,65 Q50,70 27,65 Z" />
           </svg>
           <p className="text-center text-[10px] text-muted mt-1">Fronte</p>
        </div>

        {/* Back View */}
        <div className="relative w-28 h-36">
           <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-lg">
             {/* Base Outline */}
             <path d="M20,30 Q10,60 20,90 Q30,115 50,115 Q70,115 80,90 Q90,60 80,30 Q70,0 50,0 Q30,0 20,30" fill="#1e293b" stroke="#334155" strokeWidth="1" />
             
             <ZonePath loc={Location.TOP_HEAD} d="M30,10 Q50,-5 70,10 L70,30 Q50,35 30,30 Z" />
             <ZonePath loc={Location.BACK_HEAD} d="M22,40 Q50,35 78,40 L76,70 Q50,80 24,70 Z" />
             <ZonePath loc={Location.NECK} d="M30,85 Q50,80 70,85 L75,110 Q50,115 25,110 Z" />
           </svg>
           <p className="text-center text-[10px] text-muted mt-1">Retro</p>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-24 animate-fade-in px-4">
      {/* Header with EXPLICIT calc() safe area padding + 1.5rem (24px) for visual spacing */}
      <div className="sticky top-0 bg-background/95 backdrop-blur z-50 py-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] border-b border-gray-800 flex justify-between items-center mb-6 -mx-4 px-4">
        <button onClick={onClose} className="p-2 -ml-2 text-muted hover:text-white">
          <ArrowLeft />
        </button>
        <h2 className="font-bold text-lg">
           <span className="mt-1 block">{isEditingExisting ? 'Modifica Diario' : 'Nuovo Diario'}</span>
        </h2>
        <div className="w-8" />
      </div>

      <div className="space-y-8">
        {/* Section: Timing - Stacked Layout */}
        <section>
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <Clock className="w-5 h-5" />
            <h3>Orario</h3>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs text-muted uppercase mb-1">Inizio</label>
              <input 
                type="datetime-local" 
                value={formData.startedAt}
                onChange={e => setFormData({...formData, startedAt: e.target.value})}
                className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-muted uppercase mb-1">Fine (Opzionale)</label>
              <input 
                type="datetime-local" 
                value={formData.endedAt || ''}
                onChange={e => setFormData({...formData, endedAt: e.target.value})}
                className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none text-sm"
              />
            </div>
          </div>
        </section>

        {/* Section: Intensity */}
        <section>
          <div className="flex justify-between items-end mb-3">
            <div className="flex items-center gap-2 text-primary font-medium">
              <AlertCircle className="w-5 h-5" />
              <h3>Intensità Dolore</h3>
            </div>
            <span className={`text-2xl font-bold ${getIntensityColor(formData.intensity || 0)}`}>
              {formData.intensity}
              <span className="text-sm text-muted font-normal">/10</span>
            </span>
          </div>
          
          <div className="bg-surface p-6 rounded-xl border border-gray-700">
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="1"
              value={formData.intensity}
              onChange={(e) => setFormData({...formData, intensity: parseInt(e.target.value)})}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <div className="flex justify-between mt-2 text-xs text-muted">
              <span>Lieve</span>
              <span>Moderato</span>
              <span>Severo</span>
            </div>
          </div>
        </section>

        {/* Section: Location */}
        <section>
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <MapPin className="w-5 h-5" />
            <h3>Dove Fa Male?</h3>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-gray-700">
            <HeadMap />
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <label className="block text-xs text-muted uppercase mb-3 text-center">Seleziona zone (colorate sulla mappa)</label>
              <div className="flex flex-wrap gap-2 justify-center">
                {Object.values(Location).map(loc => {
                  const isActive = formData.locations?.includes(loc);
                  const color = LOCATION_COLORS[loc];
                  return (
                    <button
                      key={loc}
                      onClick={() => toggleLocation(loc)}
                      style={{
                        borderColor: isActive ? color : 'transparent',
                        backgroundColor: isActive ? `${color}20` : '#0f172a',
                        color: isActive ? color : '#94a3b8'
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 border-gray-700`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Quality */}
        <section>
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <Activity className="w-5 h-5" />
            <h3>Tipo di Dolore</h3>
          </div>
          <div className="bg-surface p-4 rounded-xl border border-gray-700">
             <select 
                value={formData.quality}
                onChange={e => setFormData({...formData, quality: e.target.value as PainQuality})}
                className="w-full bg-background border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-primary outline-none"
              >
                {Object.values(PainQuality).map(q => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
          </div>
        </section>

        {/* Section: Symptoms - Fixed Layout */}
        <section>
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <Zap className="w-5 h-5" />
            <h3>Sintomi Associati</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
             {[
               { key: 'hasAura', label: 'Aura (Visiva)' },
               { key: 'isLightSensitive', label: 'Fotofobia (Luce)' },
               { key: 'isSoundSensitive', label: 'Fonofobia (Suoni)' },
               { key: 'hasNausea', label: 'Nausea/Vomito' },
               { key: 'worsenedByMovement', label: 'Peggiora muovendosi' },
             ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setFormData(prev => ({ ...prev, [item.key]: !prev[item.key as keyof HeadacheLog] }))}
                  className={`p-3 rounded-xl border text-sm text-left transition-all flex justify-between items-center ${
                    formData[item.key as keyof HeadacheLog] 
                      ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                      : 'bg-surface border-gray-700 text-muted hover:border-gray-600'
                  }`}
                >
                  {item.label}
                  {formData[item.key as keyof HeadacheLog] && <Check className="w-4 h-4" />}
                </button>
             ))}
          </div>
        </section>

        {/* Section: Triggers */}
        <section>
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <AlertCircle className="w-5 h-5" />
            <h3>Possibili Cause</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMMON_TRIGGERS.map(t => (
              <button
                key={t}
                onClick={() => toggleTrigger(t)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  formData.triggers?.includes(t)
                    ? 'bg-accent/10 border-accent text-accent'
                    : 'bg-surface border-gray-700 text-muted'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </section>

        {/* Section: Meds & Notes */}
        <section>
          <div className="flex items-center gap-2 text-primary font-medium mb-3">
            <Pill className="w-5 h-5" />
            <h3>Farmaci & Note</h3>
          </div>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Es. Ibuprofene 400mg"
              value={formData.medication}
              onChange={e => setFormData({...formData, medication: e.target.value})}
              className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none placeholder-gray-500"
            />
            <textarea 
              rows={3}
              placeholder="Note aggiuntive..."
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full bg-surface border border-gray-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-primary outline-none placeholder-gray-500"
            />
          </div>
        </section>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 pt-4">
          <Button onClick={() => handleSubmit(false)} disabled={loading} variant="secondary" fullWidth size="lg">
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5 mr-2" /> Salva (Continua dopo)</>}
          </Button>
          
          <Button onClick={() => handleSubmit(true)} disabled={loading} variant="primary" fullWidth size="lg">
             {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Check className="w-5 h-5 mr-2" /> Termina Attacco & Salva</>}
          </Button>
        </div>
      </div>
    </div>
  );
};