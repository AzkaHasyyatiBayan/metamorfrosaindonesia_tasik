import { supabase } from './supabase'
import { 
  Event, 
  Registration, 
  RegistrationWithDetails, 
  AdminStats,
  TableEvent,
  RegistrationStatus
} from '../types/database.types'

interface EventMinimal {
  id: string
  title: string
  date_time: string
  location: string
  max_participants?: number | null
}

interface ProfileMinimal {
  id: string
  name: string
  email: string
}

interface RegistrationRow {
  id: string
  event_id: string
  user_id: string
  role: string
  status: string
  volunteer_type?: string | null
  full_name: string
  email: string
  phone?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

const buildMap = <T extends { id: string }>(items: T[]): Record<string, T> =>
  (items || []).reduce((acc, item) => { acc[item.id] = item; return acc }, {} as Record<string, T>)

export async function getAllEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date_time', { ascending: true })
      .range(0, 100)

    if (error) {
      console.error('Error fetching events:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const today = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date_time', today)
      .eq('is_active', true)
      .order('date_time', { ascending: true })
      .limit(20)

    if (error) {
      console.error('Error fetching upcoming events:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching upcoming events:', error)
    return []
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

export async function getRecentEvents(limit: number = 5): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching recent events:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching recent events:', error)
    return []
  }
}

export async function createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        is_active: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating event:', error)
    return null
  }
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating event:', error)
    return null
  }
}

export async function getAllRegistrations(): Promise<RegistrationWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (title, date_time, location, max_participants),
        profiles (name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      if (error.code === 'PGRST200' || (error.message && String(error.message).includes('Could not find a relationship'))) {
        console.warn('registrations relationships missing; falling back to manual joins in getAllRegistrations')

        const { data: regs, error: regsError } = await supabase
          .from('registrations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100)

        if (regsError) {
          console.error('Error fetching registrations fallback:', regsError)
          return []
        }

        const typedRegs = (regs || []) as RegistrationRow[]
        const eventIds = Array.from(new Set(typedRegs.map(r => r.event_id).filter(Boolean)))
        const userIds = Array.from(new Set(typedRegs.map(r => r.user_id).filter(Boolean)))

        const { data: eventsData } = await supabase.from('events').select('id, title, date_time, location, max_participants').in('id', eventIds)
        const { data: profilesData } = await supabase.from('profiles').select('id, name, email').in('id', userIds)

        const eventsMap: Record<string, EventMinimal | null> = buildMap((eventsData || []) as EventMinimal[])
        const profilesMap: Record<string, ProfileMinimal | null> = buildMap((profilesData || []) as ProfileMinimal[])

        const mapped = typedRegs.map(r => ({
          ...r,
          events: eventsMap[r.event_id] || null,
          profiles: profilesMap[r.user_id] || null
        })) as unknown as RegistrationWithDetails[]

        return mapped
      }

      console.error('Error fetching registrations:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching registrations:', error)
    return []
  }
}

export async function getUserRegistrations(userId: string): Promise<RegistrationWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      if (error.code === 'PGRST200' || (error.message && String(error.message).includes('Could not find a relationship'))) {
        console.warn('registrations->events relationship missing; falling back to manual join in getUserRegistrations')

        const { data: regs, error: regsError } = await supabase
          .from('registrations')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (regsError) {
          console.error('Error fetching user registrations fallback:', regsError)
          return []
        }

        const typedRegs = (regs || []) as RegistrationRow[]
        const eventIds = Array.from(new Set(typedRegs.map(r => r.event_id).filter(Boolean)))
        const { data: eventsData } = await supabase.from('events').select('*').in('id', eventIds)

        const eventsMap: Record<string, Event | null> = buildMap((eventsData || []) as Event[])

        const mapped = typedRegs.map(r => ({
          ...r,
          events: eventsMap[r.event_id] || null
        })) as unknown as RegistrationWithDetails[]

        return mapped
      }

      console.error('Error fetching user registrations:', error)
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    return data
  } catch (error) {
    console.error('Error fetching user registrations:', error)
    return []
  }
}

export async function getUserEvents(userId: string): Promise<Event[]> {
  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select('event_id')
      .eq('user_id', userId)
      .eq('status', 'approved')

    if (error) {
      console.error('Error fetching user registrations:', error)
      return []
    }

    if (!registrations || registrations.length === 0) {
      return []
    }

    const eventIds = registrations.map(registration => registration.event_id)
    
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .eq('is_active', true)
      .order('date_time', { ascending: false })

    if (eventsError) {
      console.error('Error fetching user events:', eventsError)
      return []
    }

    if (!events || events.length === 0) {
      return []
    }

    return events
  } catch (error) {
    console.error('Error fetching user events:', error)
    return []
  }
}

export async function createRegistration(registrationData: Omit<Registration, 'id' | 'created_at' | 'updated_at'>): Promise<Registration | null> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([registrationData])
      .select()
      .single()

    if (error) {
      console.error('Error creating registration:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating registration:', error)
    return null
  }
}

export async function updateRegistrationStatus(id: string, status: RegistrationStatus): Promise<Registration | null> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating registration:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating registration:', error)
    return null
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeCount = async (builder: any): Promise<{ count: number; data: unknown[] }> => {
      try {
        const res = await builder
        if (res.error) {
          console.warn('Count query failed:', res.error)
          return { count: 0, data: [] }
        }
        return { count: res.count || 0, data: res.data || [] }
      } catch (e) {
        console.warn('Count query exception:', e)
        return { count: 0, data: [] }
      }
    }

    const [
      eventsCount,
      upcomingEventsCount,
      registrationsCount,
      pendingRegistrationsCount,
      volunteerCount,
      eventsWithCapacity,
      confirmedRegistrationsCount
    ] = await Promise.all([
      safeCount(supabase.from('events').select('*', { count: 'exact', head: true }).eq('is_active', true)),
      safeCount(supabase.from('events').select('*', { count: 'exact', head: true }).gte('date_time', new Date().toISOString()).eq('is_active', true)),
      safeCount(supabase.from('registrations').select('*', { count: 'exact', head: true })),
      safeCount(supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'pending')),
      safeCount(supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('role', 'volunteer').eq('status', 'approved')),
      (async (): Promise<{ data: Array<{ max_participants: number | null }> }> => {
        try {
          const r = await supabase.from('events').select('max_participants').eq('is_active', true).not('max_participants', 'is', null)
          if (r.error) return { data: [] }
          return { data: (r.data || []) as Array<{ max_participants: number | null }> }
        } catch { return { data: [] } }
      })(),
      safeCount(supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'approved'))
    ])

    const totalEvents = eventsCount.count || 0
    const totalRegistrations = registrationsCount.count || 0
    const confirmedRegistrations = confirmedRegistrationsCount.count || 0
    
    let totalCapacity = 0
    if (eventsWithCapacity.data && eventsWithCapacity.data.length > 0) {
      totalCapacity = (eventsWithCapacity.data as Array<{ max_participants: number | null }>).reduce((sum, event) => sum + (event.max_participants || 0), 0)
    }
    
    const participationRate = totalCapacity > 0 
      ? Math.round((confirmedRegistrations / totalCapacity) * 100) 
      : totalEvents > 0 ? Math.round((confirmedRegistrations / (totalEvents * 20)) * 100) : 0

    return {
      totalEvents,
      upcomingEvents: upcomingEventsCount.count || 0,
      totalRegistrations,
      pendingRegistrations: pendingRegistrationsCount.count || 0,
      participationRate: `${Math.min(participationRate, 100)}%`,
      volunteerCount: volunteerCount.count || 0
    }
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalEvents: 0,
      upcomingEvents: 0,
      totalRegistrations: 0,
      pendingRegistrations: 0,
      participationRate: '0%',
      volunteerCount: 0
    }
  }
}

export async function getRecommendedEvents(userId: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_recommendations_for_user', { target_user_id: userId })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

export async function formatEventsForTable(events: Event[]): Promise<TableEvent[]> {
  try {
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        try {
          const { count, error } = await supabase
            .from('registrations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'approved')

          if (error) {
            console.warn('Error fetching registrations count for event:', event.id, error)
            return { id: event.id, title: event.title, date: event.date_time, location: event.location, registrations: 0 }
          }

          return {
            id: event.id,
            title: event.title,
            date: event.date_time,
            location: event.location,
            registrations: count || 0
          }
        } catch {
          console.warn('Exception fetching registrations count for event:', event.id)
          return { id: event.id, title: event.title, date: event.date_time, location: event.location, registrations: 0 }
        }
      })
    )

    return eventsWithRegistrations
  } catch (error) {
    console.error('Error formatting events for table:', error)
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date_time,
      location: event.location,
      registrations: 0
    }))
  }
}

export async function getEventRegistrationCount(eventId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'approved')

    if (error) {
      console.error('Error fetching registration count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching registration count:', error)
    return 0
  }
}

export async function isUserRegistered(eventId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { 
      console.error('Error checking registration:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking registration:', error)
    return false
  }
}