'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'
import EventCard from './EventCard'

type Recommendation = {
  event_id: string
  title: string
  description: string
  date_time: string
  location: string
  category: string[]
  image_url?: string
  is_active: boolean
  total_score: number
}

type EventCardProps = {
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

export default function EventRecommendations() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) {
        setLoading(false)
        return
      }
      
      try {
        setError(null)
        const { data, error } = await supabase
          .from('user_event_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('total_score', { ascending: false })
          .limit(3)

        if (error) throw error
        setRecommendations(data || [])
      } catch (error) {
        console.error('Error fetching recommendations:', error)
        setError('Gagal memuat rekomendasi')
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [user])

  if (loading) {
    return (
      <section className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Event Rekomendasi untuk Anda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!user || recommendations.length === 0) {
    return null
  }

  if (error) {
    return (
      <section className="py-8 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  const formattedEvents: EventCardProps[] = recommendations.map(rec => ({
    id: rec.event_id,
    title: rec.title,
    description: rec.description,
    date_time: rec.date_time,
    location: rec.location,
    category: rec.category,
    image_url: rec.image_url,
    is_active: rec.is_active,
    max_participants: undefined
  }))

  return (
    <section className="py-8 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Event Rekomendasi untuk Anda</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formattedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </section>
  )
}