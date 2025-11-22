// app/events/page.tsx
import { supabase } from '../lib/supabase'
import Navigation from '../components/Navigation'
import EventCard from '../components/EventCard'

type Event = {
  id: string
  title: string
  description: string
  date_time: string
  location: string
  category: string[]
  max_participants?: number
  image_url?: string
  is_active: boolean
}

async function getEvents(): Promise<Event[]> {
  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_active', true)
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }
  return events as Event[]
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Semua Event</h1>
          <div className="text-sm text-gray-600">
            {events.length} event ditemukan
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        
        {events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Tidak ada event yang tersedia.</p>
            <p className="text-gray-400">Coba lagi nanti atau hubungi admin.</p>
          </div>
        )}
      </div>
    </div>
  )
} 