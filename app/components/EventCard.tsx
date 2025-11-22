import Link from 'next/link'
import Image from 'next/image'

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

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-shadow">
      {event.image_url && (
        <Image 
          src={event.image_url} 
          alt={event.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-gray-900">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="flex items-center text-gray-500 mb-3">
          <span className="mr-4">📅 {new Date(event.date_time).toLocaleDateString('id-ID')}</span>
          <span>📍 {event.location}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.category?.map((cat) => (
            <span 
              key={cat} 
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {cat.replace('_', ' ')}
            </span>
          ))}
        </div>

        <Link 
          href={`/events/${event.id}`}
          className="block w-full bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Detail & Daftar
        </Link>
      </div>
    </div>
  )
}