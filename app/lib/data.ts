import { supabase } from './supabase'
import { 
  Event, 
  Registration, 
  RegistrationWithDetails, 
  AdminStats,
  TableEvent,
  RegistrationStatus
} from '../types/database.types'

// EVENTS
export async function getAllEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date_time', { ascending: true })

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

// REGISTRATIONS
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

    if (error) {
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
      .eq('status', 'CONFIRMED')

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

// ANALYTICS
export async function getAdminStats(): Promise<AdminStats> {
  try {
    const [
      eventsCount,
      upcomingEventsCount,
      registrationsCount,
      pendingRegistrationsCount,
      volunteerCount,
      eventsWithCapacity,
      confirmedRegistrationsCount
    ] = await Promise.all([
      // Total events aktif
      supabase.from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Upcoming events aktif
      supabase.from('events')
        .select('*', { count: 'exact', head: true })
        .gte('date_time', new Date().toISOString())
        .eq('is_active', true),
      
      // Total semua registrations
      supabase.from('registrations')
        .select('*', { count: 'exact', head: true }),
      
      // Pending registrations
      supabase.from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING'),
      
      // Volunteer count
      supabase.from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('registration_type', 'VOLUNTEER')
        .eq('status', 'CONFIRMED'),
      
      // Events dengan kapasitas untuk menghitung participation rate
      supabase.from('events')
        .select('max_participants')
        .eq('is_active', true)
        .not('max_participants', 'is', null),
      
      // Confirmed registrations untuk participation rate
      supabase.from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CONFIRMED')
    ])

    const totalEvents = eventsCount.count || 0
    const totalRegistrations = registrationsCount.count || 0
    const confirmedRegistrations = confirmedRegistrationsCount.count || 0
    
    // Hitung REAL participation rate berdasarkan kapasitas sebenarnya
    let totalCapacity = 0
    if (eventsWithCapacity.data && eventsWithCapacity.data.length > 0) {
      totalCapacity = eventsWithCapacity.data.reduce((sum, event) => sum + (event.max_participants || 0), 0)
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

// RECOMMENDATIONS
export async function getRecommendedEvents(userId: string): Promise<Event[]> {
  try {
    const [upcomingEvents, userRegistrations] = await Promise.all([
      getUpcomingEvents(),
      getUserRegistrations(userId)
    ])

    if (!upcomingEvents || upcomingEvents.length === 0) {
      return []
    }

    const registeredEventIds = new Set(
      userRegistrations.map(registration => registration.event_id)
    )
    
    const recommended = upcomingEvents
      .filter(event => !registeredEventIds.has(event.id))
      .slice(0, 3)

    return recommended
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return []
  }
}

// Format events for AdminTable - REAL DATA (NO DUMMY)
export async function formatEventsForTable(events: Event[]): Promise<TableEvent[]> {
  try {
    // Ambil jumlah registrasi CONFIRMED untuk setiap event
    const eventsWithRegistrations = await Promise.all(
      events.map(async (event) => {
        const { count } = await supabase
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id)
          .eq('status', 'CONFIRMED')

        return {
          id: event.id,
          title: event.title,
          date: event.date_time,
          location: event.location,
          registrations: count || 0
        }
      })
    )

    return eventsWithRegistrations
  } catch (error) {
    console.error('Error formatting events for table:', error)
    // Fallback ke data dasar
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: event.date_time,
      location: event.location,
      registrations: 0
    }))
  }
}

// Get event registration count
export async function getEventRegistrationCount(eventId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'CONFIRMED')

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

// Check if user is registered for event
export async function isUserRegistered(eventId: string, userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking registration:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking registration:', error)
    return false
  }
}