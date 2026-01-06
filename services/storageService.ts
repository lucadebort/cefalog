import { HeadacheLog, PainQuality } from '../types';
import { supabase } from './supabaseClient';

// Helper to map DB columns (snake_case) to App types (camelCase)
const mapFromDb = (row: any): HeadacheLog => ({
  id: row.id,
  startedAt: row.started_at,
  endedAt: row.ended_at,
  intensity: row.intensity,
  quality: row.quality as PainQuality,
  locations: row.locations || [],
  hasAura: row.has_aura,
  isLightSensitive: row.is_light_sensitive,
  isSoundSensitive: row.is_sound_sensitive,
  hasNausea: row.has_nausea,
  worsenedByMovement: row.worsened_by_movement,
  triggers: row.triggers || [],
  medication: row.medication || '',
  notes: row.notes || ''
});

// Helper to map App types to DB columns
const mapToDb = (log: HeadacheLog, userId: string) => ({
  id: log.id,
  user_id: userId,
  started_at: log.startedAt,
  ended_at: log.endedAt || null, // Supabase likes NULL for empty dates
  intensity: log.intensity,
  quality: log.quality,
  locations: log.locations,
  has_aura: log.hasAura,
  is_light_sensitive: log.isLightSensitive,
  is_sound_sensitive: log.isSoundSensitive,
  has_nausea: log.hasNausea,
  worsened_by_movement: log.worsenedByMovement,
  triggers: log.triggers,
  medication: log.medication,
  notes: log.notes
});

export const saveLog = async (log: HeadacheLog): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not logged in');

  const { error } = await supabase
    .from('headache_logs')
    .insert(mapToDb(log, user.id));

  if (error) console.error('Error saving log:', error);
};

export const updateLog = async (log: HeadacheLog): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not logged in');

  const { error } = await supabase
    .from('headache_logs')
    .update(mapToDb(log, user.id))
    .eq('id', log.id);

  if (error) console.error('Error updating log:', error);
};

export const deleteLog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('headache_logs')
    .delete()
    .eq('id', id);

  if (error) console.error('Error deleting log:', error);
};

export const getLogs = async (): Promise<HeadacheLog[]> => {
  const { data, error } = await supabase
    .from('headache_logs')
    .select('*')
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
  return data.map(mapFromDb);
};

export const getActiveHeadache = async (): Promise<HeadacheLog | undefined> => {
  const { data, error } = await supabase
    .from('headache_logs')
    .select('*')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return undefined;
  return mapFromDb(data[0]);
};
