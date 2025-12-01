import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Event } from '../../types/database.types';

interface EventFilters {
  dateRange?: {
    start?: string;
    end?: string;
  };
  location?: string;
  capacity?: string;
  accessibility?: string;
}

const accessibilityMapping: Record<string, string> = {
  sign_language: 'SIGN_LANGUAGE',
  wheelchair: 'WHEELCHAIR_ACCESS',
  subtitles: 'SUBTITLES',
  audio_description: 'AUDIO_DESCRIPTION'
};

export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      let query = supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .order('date_time', { ascending: true });

      if (filters?.dateRange?.start) {
        query = query.gte('date_time', filters.dateRange.start);
      }

      if (filters?.dateRange?.end) {
        query = query.lte('date_time', filters.dateRange.end);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      if (filters?.accessibility && accessibilityMapping[filters.accessibility]) {
        query = query.contains('category', [accessibilityMapping[filters.accessibility]]);
      }

      const { data, error } = await query;

      if (error) throw error;

      let filtered = data || [];

      if (filters?.capacity) {
        if (filters.capacity === 'available') {
          filtered = filtered.filter(event => 
            event.max_participants === null || 
            event.max_participants > 0
          );
        } else if (filters.capacity === 'full') {
          filtered = filtered.filter(event => 
            event.max_participants !== null && 
            event.max_participants <= 0
          );
        }
      }

      setEvents(data || []);
      setFilteredEvents(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, filteredEvents, loading, error, refetch: fetchEvents };
};