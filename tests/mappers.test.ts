import { describe, it, expect } from 'vitest';
import { PainQuality, Location, HeadacheLog } from '../types';

// Ricreiamo i mapper per testarli (sono privati in storageService)
// In futuro si potrebbero esportare per testabilità
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
  isSmellSensitive: row.is_smell_sensitive || false,
  hasNausea: row.has_nausea,
  worsenedByMovement: row.worsened_by_movement,
  triggers: row.triggers || [],
  medication: row.medication || '',
  food: row.food || '',
  notes: row.notes || ''
});

const mapToDb = (log: HeadacheLog, userId: string) => ({
  id: log.id,
  user_id: userId,
  started_at: log.startedAt,
  ended_at: log.endedAt || null,
  intensity: log.intensity,
  quality: log.quality,
  locations: log.locations,
  has_aura: log.hasAura,
  is_light_sensitive: log.isLightSensitive,
  is_sound_sensitive: log.isSoundSensitive,
  is_smell_sensitive: log.isSmellSensitive,
  has_nausea: log.hasNausea,
  worsened_by_movement: log.worsenedByMovement,
  triggers: log.triggers,
  medication: log.medication,
  food: log.food,
  notes: log.notes
});

describe('Database Mappers', () => {
  describe('mapFromDb', () => {
    it('should correctly map snake_case DB columns to camelCase', () => {
      const dbRow = {
        id: 'test-id-123',
        started_at: '2024-01-15T10:00:00Z',
        ended_at: '2024-01-15T12:00:00Z',
        intensity: 7,
        quality: PainQuality.PULSING,
        locations: [Location.FOREHEAD, Location.LEFT_TEMPLE],
        has_aura: true,
        is_light_sensitive: true,
        is_sound_sensitive: false,
        is_smell_sensitive: true,
        has_nausea: true,
        worsened_by_movement: true,
        triggers: ['Stress', 'Mancanza di sonno'],
        medication: 'Ibuprofene 400mg',
        food: 'Caffè',
        notes: 'Mal di testa forte'
      };

      const result = mapFromDb(dbRow);

      expect(result.id).toBe('test-id-123');
      expect(result.startedAt).toBe('2024-01-15T10:00:00Z');
      expect(result.endedAt).toBe('2024-01-15T12:00:00Z');
      expect(result.intensity).toBe(7);
      expect(result.quality).toBe(PainQuality.PULSING);
      expect(result.locations).toEqual([Location.FOREHEAD, Location.LEFT_TEMPLE]);
      expect(result.hasAura).toBe(true);
      expect(result.isLightSensitive).toBe(true);
      expect(result.isSoundSensitive).toBe(false);
      expect(result.isSmellSensitive).toBe(true);
      expect(result.hasNausea).toBe(true);
      expect(result.worsenedByMovement).toBe(true);
      expect(result.triggers).toEqual(['Stress', 'Mancanza di sonno']);
      expect(result.medication).toBe('Ibuprofene 400mg');
      expect(result.food).toBe('Caffè');
      expect(result.notes).toBe('Mal di testa forte');
    });

    it('should handle null/undefined values with defaults', () => {
      const dbRow = {
        id: 'test-id',
        started_at: '2024-01-15T10:00:00Z',
        ended_at: null,
        intensity: 5,
        quality: PainQuality.DULL,
        locations: null,
        has_aura: false,
        is_light_sensitive: false,
        is_sound_sensitive: false,
        is_smell_sensitive: null, // legacy record
        has_nausea: false,
        worsened_by_movement: false,
        triggers: null,
        medication: null,
        food: null,
        notes: null
      };

      const result = mapFromDb(dbRow);

      expect(result.locations).toEqual([]);
      expect(result.isSmellSensitive).toBe(false);
      expect(result.triggers).toEqual([]);
      expect(result.medication).toBe('');
      expect(result.food).toBe('');
      expect(result.notes).toBe('');
    });
  });

  describe('mapToDb', () => {
    it('should correctly map camelCase to snake_case DB columns', () => {
      const log: HeadacheLog = {
        id: 'test-id-456',
        startedAt: '2024-01-15T14:00:00Z',
        endedAt: '2024-01-15T16:00:00Z',
        intensity: 8,
        quality: PainQuality.STABBING,
        locations: [Location.BEHIND_EYES],
        hasAura: false,
        isLightSensitive: true,
        isSoundSensitive: true,
        isSmellSensitive: false,
        hasNausea: false,
        worsenedByMovement: false,
        triggers: ['Schermi/Luci'],
        medication: 'Paracetamolo',
        food: '',
        notes: ''
      };

      const result = mapToDb(log, 'user-123');

      expect(result.id).toBe('test-id-456');
      expect(result.user_id).toBe('user-123');
      expect(result.started_at).toBe('2024-01-15T14:00:00Z');
      expect(result.ended_at).toBe('2024-01-15T16:00:00Z');
      expect(result.intensity).toBe(8);
      expect(result.quality).toBe(PainQuality.STABBING);
      expect(result.has_aura).toBe(false);
      expect(result.is_light_sensitive).toBe(true);
      expect(result.is_sound_sensitive).toBe(true);
      expect(result.is_smell_sensitive).toBe(false);
    });

    it('should convert undefined endedAt to null for DB', () => {
      const log: HeadacheLog = {
        id: 'test-id',
        startedAt: '2024-01-15T14:00:00Z',
        endedAt: undefined,
        intensity: 5,
        quality: PainQuality.DULL,
        locations: [],
        hasAura: false,
        isLightSensitive: false,
        isSoundSensitive: false,
        isSmellSensitive: false,
        hasNausea: false,
        worsenedByMovement: false,
        triggers: [],
        medication: '',
        food: '',
        notes: ''
      };

      const result = mapToDb(log, 'user-123');

      expect(result.ended_at).toBeNull();
    });
  });
});
