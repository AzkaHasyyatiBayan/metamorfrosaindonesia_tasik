import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { Event } from '../../types/supabase';

interface EventFilters {
  category?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  location?: string;
}

export const useEvents = (filters?: EventFilters) => {
  const [events, setEvents] = useState<Event[]>([]);
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

      if (filters?.category?.length) {
        query = query.overlaps('category', filters.category);
      }

      if (filters?.dateRange?.start) {
        query = query.gte('date_time', filters.dateRange.start);
      }

      if (filters?.dateRange?.end) {
        query = query.lte('date_time', filters.dateRange.end);
      }

      if (filters?.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { events, loading, error, refetch: fetchEvents };
};
