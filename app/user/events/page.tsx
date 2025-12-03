'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import EventCard, { Event } from '../../components/EventCard'
import EventFilter, { FilterState } from '../../components/EventFilter'

export default function UserEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<FilterState>({
    category: [],
    dateRange: {
      start: '',
      end: ''
    },
    location: '',
    accessibility: '' 
  })

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        return
      }
      setEvents(data as Event[])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    let filtered = [...events]

    if (filters.accessibility) {
      filtered = filtered.filter(event =>
        event.category && event.category.includes(filters.accessibility)
      )
    }

    if (filters.dateRange.start) {
      filtered = filtered.filter(event =>
        new Date(event.date_time) >= new Date(filters.dateRange.start)
      )
    }

    if (filters.dateRange.end) {
      filtered = filtered.filter(event =>
        new Date(event.date_time) <= new Date(filters.dateRange.end)
      )
    }

    if (filters.location) {
      filtered = filtered.filter(event =>
        event.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    return filtered
  }, [events, filters])

  const allCategories = useMemo(() => {
    return Array.from(new Set(events.flatMap(event => event.category || [])))
  }, [events])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return (
    <div className="min-h-screen bg-gray-100/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight relative z-10">
            Event <span className="text-red-600">Kami</span>
          </h1>
          <div className="w-24 h-1.5 bg-red-600 rounded-full mx-auto mb-6 relative z-10"></div>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed relative z-10">
            Temukan event seru dan bermanfaat untuk pengembangan diri dan komunitas bahasa isyarat
          </p>
        </div>

        <div className="mb-12">
          <EventFilter 
            filters={filters}
            onFilterChange={handleFilterChange}
            totalEvents={events.length}
            filteredCount={filteredEvents.length}
            categories={allCategories}
          />
        </div>

        {loading ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Memuat event...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] p-8 shadow-xl border border-gray-100">
            <div className="text-gray-300 mx-auto mb-4">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada event ditemukan</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {events.length > 0 
                ? 'Coba ubah filter pencarian Anda untuk menemukan event yang Anda cari.' 
                : 'Belum ada event yang tersedia saat ini. Silakan kembali lagi nanti.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}