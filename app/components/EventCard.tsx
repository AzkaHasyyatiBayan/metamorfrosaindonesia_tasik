'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// PERBAIKAN: Menambahkan '| null' agar sesuai dengan database Supabase
export type Event = {
  id: string
  title: string
  description: string
  date_time: string
  location: string
  category: string[]
  max_participants?: number | null // Diperbolehkan null
  image_url?: string | null        // Diperbolehkan null
  is_active: boolean
  creator_id: string
  created_at: string
  updated_at: string
}

interface EventCardProps {
  event: Event
}

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

export default function EventCard({ event }: EventCardProps) {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {event.image_url && !imageError ? (
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          {event.category.slice(0, 2).map((cat) => (
            <span 
              key={cat} 
              className="px-2 py-1 bg-white/90 backdrop-blur-sm text-red-600 text-xs font-medium rounded-full border border-red-200"
            >
              {cat.replace('_', ' ')}
            </span>
          ))}
          {event.category.length > 2 && (
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-gray-600 text-xs font-medium rounded-full border border-gray-200">
              +{event.category.length - 2}
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="p-6">
        <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
          {event.title}
        </h3>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {truncateDescription(event.description)}
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-700">
            <CalendarIcon />
            <span className="ml-2 font-medium">
              {formatDate(event.date_time)} • {formatTime(event.date_time)}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-700">
            <LocationIcon />
            <span className="ml-2 line-clamp-1">{event.location}</span>
          </div>

          {/* Logic if null/undefined is falsy works the same */}
          {event.max_participants && (
            <div className="flex items-center text-sm text-gray-700">
              <UsersIcon />
              <span className="ml-2">
                Kapasitas: {event.max_participants} orang
              </span>
            </div>
          )}
        </div>

        <Link 
          href={`/events/${event.id}`}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center group/btn"
        >
          <span>Lihat Detail</span>
          <svg className="w-4 h-4 ml-2 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}