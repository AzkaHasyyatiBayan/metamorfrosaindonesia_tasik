// app/components/EventRecommendations.tsx
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'
import EventCard, { Event } from './EventCard'

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

const RecommendationIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

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
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-8">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <RecommendationIcon />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Rekomendasi untuk Anda</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse border border-gray-200">
                <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded-xl"></div>
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
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-800">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  const formattedEvents: Event[] = recommendations.map(rec => ({
    id: rec.event_id,
    title: rec.title,
    description: rec.description,
    date_time: rec.date_time,
    location: rec.location,
    category: rec.category,
    image_url: rec.image_url,
    is_active: rec.is_active,
    max_participants: undefined,
    creator_id: '',
    created_at: '',
    updated_at: ''
  }))

  return (
    <section className="py-12 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-red-50 px-4 py-2 rounded-full border border-red-200 mb-4">
            <RecommendationIcon />
            <span className="ml-2 text-red-700 font-semibold">Rekomendasi Personal</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Event Rekomendasi untuk Anda
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Berdasarkan minat dan aktivitas Anda, berikut event yang mungkin Anda sukai
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {formattedEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {/* Recommendation Badge */}
              <div className="absolute -top-3 -right-3 z-10">
                <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  #{index + 1}
                </div>
              </div>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}