import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../../components/AuthProvider';
import { RegistrationWithDetails } from '../../types/database.types';

interface RawRegistration {
  id: string;
  event_id: string;
  user_id: string;
  type: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  events: {
    title: string;
    date_time: string;
    location: string;
    max_participants: number | null;
  } | {
    title: string;
    date_time: string;
    location: string;
    max_participants: number | null;
  }[];
}

export const useUserRegistrations = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchRegistrations = useCallback(async () => {
    if (!user) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events:event_id (
            title,
            date_time,
            location,
            max_participants
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        const typedData: RegistrationWithDetails[] = (data as unknown as RawRegistration[]).map(item => ({
          ...item,
          type: item.type as 'PARTICIPANT' | 'VOLUNTEER',
          status: item.status as 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED',
          events: Array.isArray(item.events) ? item.events[0] : item.events
        }));
        setRegistrations(typedData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return { registrations, loading, error, refetch: fetchRegistrations };
};