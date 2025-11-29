import EventCard, { Event } from './EventCard'

interface EventListProps {
  events: Event[]
  title?: string
  description?: string
  emptyMessage?: string
}

const EmptyCalendarIcon = () => (
  <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export default function EventList({ 
  events, 
  title, 
  description,
  emptyMessage = "Tidak ada event yang ditemukan" 
}: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-300 mx-auto mb-4 flex justify-center">
          <EmptyCalendarIcon />
        </div>
        <p className="text-gray-500 text-lg mb-2">{emptyMessage}</p>
        <p className="text-gray-400 text-sm">Event akan segera tersedia</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {(title || description) && (
        <div className="text-center">
          {title && (
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{description}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  )
}