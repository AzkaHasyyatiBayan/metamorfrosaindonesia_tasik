'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import EventCard from '../../components/EventCard'
import EventFilter from '../../components/EventFilter'
import NoEventsHero from '../../components/NoEventsHero'

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
  creator_id: string
  created_at: string
  updated_at: string
}

type FilterState = {
  category: string[]
  dateRange: {
    start: string
    end: string
  }
  location: string
  accessibility: string
}

export default function UserEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
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

  useEffect(() => {
    loadEvents()
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...events]

    if (filters.category.length > 0) {
      filtered = filtered.filter(event =>
        event.category.some(cat => filters.category.includes(cat))
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

    if (filters.accessibility) {
      filtered = filtered.filter(event =>
        event.category.includes(filters.accessibility)
      )
    }

    setFilteredEvents(filtered)
  }, [events, filters])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_active', true)
        .gte('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })

      if (error) {
        console.error('Error fetching events:', error)
        return
      }
      setEvents(events as Event[])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const allCategories = Array.from(
    new Set(events.flatMap(event => event.category))
  )

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Event Kami
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Temukan event seru dan bermanfaat untuk pengembangan diri dan komunitas bahasa isyarat
          </p>
        </div>

        <div className="mb-12">
          <EventFilter
            categories={allCategories}
            filters={filters}
            onFilterChange={handleFilterChange}
            totalEvents={events.length}
            filteredCount={filteredEvents.length}
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Memuat event...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
                Menampilkan <span className="font-semibold text-red-600">{filteredEvents.length}</span> dari{' '}
                <span className="font-semibold">{events.length}</span> event
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <NoEventsHero 
            hasEvents={events.length > 0}
            searchQuery={filters.location}
            selectedCategories={filters.category}
          />
        )}
      </div>
    </div>
  )
}