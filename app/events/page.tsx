import { getAllEvents } from '../lib/data'
import ClientEventsWrapper from './ClientEventsWrapper'

// Revalidate events data every 1 hour for better performance
// This caches the page and only re-fetches every 3600 seconds
export const revalidate = 3600

export default async function EventsPage() {
  const events = await getAllEvents()

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

        <ClientEventsWrapper 
          initialEvents={events} 
          categories={allCategories} 
        />
      </div>
    </div>
  )
}