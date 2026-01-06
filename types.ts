export enum PainQuality {
  PULSING = 'Pulsante/Martellante',
  PRESSING = 'Costrittivo/Casco',
  STABBING = 'Trafittivo/Pugnalata',
  EXPLOSIVE = 'Esplosivo',
  DULL = 'Sordo/Continuo',
  OTHER = 'Altro'
}

export enum Location {
  FOREHEAD = 'Fronte',
  LEFT_TEMPLE = 'Tempia SX',
  RIGHT_TEMPLE = 'Tempia DX',
  BEHIND_EYES = 'Dietro gli occhi',
  TOP_HEAD = 'Sommità',
  BACK_HEAD = 'Nuca/Occipitale',
  NECK = 'Collo'
}

// Mapping colors to locations for the UI
export const LOCATION_COLORS: Record<Location, string> = {
  [Location.FOREHEAD]: '#6366f1', // Indigo
  [Location.LEFT_TEMPLE]: '#a855f7', // Purple
  [Location.RIGHT_TEMPLE]: '#d946ef', // Fuchsia
  [Location.BEHIND_EYES]: '#f59e0b', // Amber
  [Location.TOP_HEAD]: '#06b6d4', // Cyan
  [Location.BACK_HEAD]: '#f43f5e', // Rose
  [Location.NECK]: '#10b981', // Emerald
};

export interface HeadacheLog {
  id: string;
  startedAt: string; // ISO String
  endedAt?: string; // ISO String
  intensity: number; // 1-10
  quality: PainQuality;
  locations: Location[];
  
  // Symptoms
  hasAura: boolean;
  isLightSensitive: boolean; // Photophobia
  isSoundSensitive: boolean; // Phonophobia
  hasNausea: boolean;
  worsenedByMovement: boolean;

  // Triggers & Meds
  triggers: string[];
  medication: string;
  notes: string;
}

export const COMMON_TRIGGERS = [
  'Stress',
  'Mancanza di sonno',
  'Disidratazione',
  'Schermi/Luci',
  'Meteo',
  'Alcol',
  'Digiuno',
  'Caffeina',
  'Odori forti',
  'Cervicale'
];

export type ViewState = 'dashboard' | 'log' | 'history' | 'analytics';
