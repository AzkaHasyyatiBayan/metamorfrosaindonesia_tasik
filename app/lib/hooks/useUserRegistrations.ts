import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../../components/AuthProvider';

export interface RegistrationWithDetails {
  id: string;
  event_id: string;
  user_id: string;
  role: 'peserta' | 'volunteer';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  volunteer_type?: string;
  full_name: string;
  email: string;
  phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  events: {
    title: string;
    date_time: string;
    location: string;
    max_participants: number | null;
  };
}

interface RawRegistration {
  id: string;
  event_id: string;
  user_id: string;
  role: 'peserta' | 'volunteer';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  volunteer_type?: string;
  full_name: string;
  email: string;
  phone?: string;
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
      
      const formattedData: RegistrationWithDetails[] = (data || []).map((item: RawRegistration) => {
        const eventData = Array.isArray(item.events) ? item.events[0] : item.events;
        
        return {
          id: item.id,
          event_id: item.event_id,
          user_id: item.user_id,
          role: item.role,
          status: item.status,
          volunteer_type: item.volunteer_type,
          full_name: item.full_name,
          email: item.email,
          phone: item.phone,
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
          events: eventData || {
            title: 'Event tidak ditemukan',
            date_time: new Date().toISOString(),
            location: 'Unknown',
            max_participants: null
          }
        };
      });

      setRegistrations(formattedData);
    } catch (err) {
      console.error('Error fetching registrations:', err);
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