'use client'

import { useState, useMemo } from 'react'
import EventCard, { Event } from '../components/EventCard'
import EventFilter from '../components/EventFilter'
import NoEventsHero from '../components/NoEventsHero'

type FilterState = {
  category: string[]
  dateRange: {
    start: string
    end: string
  }
  location: string
  accessibility: string
}

interface ClientEventsWrapperProps {
  initialEvents: Event[]
  categories: string[]
}

export default function ClientEventsWrapper({ initialEvents, categories }: ClientEventsWrapperProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: [],
    dateRange: {
      start: '',
      end: ''
    },
    location: '',
    accessibility: ''
  })

  const filteredEvents = useMemo(() => {
    let filtered = [...initialEvents]

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

    return filtered
  }, [initialEvents, filters])

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  return (
    <>
      <div className="mb-12">
        <EventFilter
          categories={categories}
          filters={filters}
          onFilterChange={handleFilterChange}
          totalEvents={initialEvents.length}
          filteredCount={filteredEvents.length}
        />
      </div>

      {filteredEvents.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm">
              Menampilkan <span className="font-semibold text-red-600">{filteredEvents.length}</span> dari{' '}
              <span className="font-semibold">{initialEvents.length}</span> event
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
          hasEvents={initialEvents.length > 0}
          searchQuery={filters.location}
          selectedCategories={filters.category}
        />
      )}
    </>
  )
}