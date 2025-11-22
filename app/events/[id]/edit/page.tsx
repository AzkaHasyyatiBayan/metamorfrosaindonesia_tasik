'use client'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { useRouter, useParams } from 'next/navigation'

type AccessibilityCategory = 'SIGN_LANGUAGE' | 'WHEELCHAIR_ACCESS' | 'BRAILLE' | 'AUDIO_DESCRIPTION' | 'TACTILE'

type Event = {
  id: string
  title: string
  description: string
  date_time: string
  location: string
  category: AccessibilityCategory[]
  max_participants?: number
  image_url?: string
  is_active: boolean
}

export default function EditEvent() {
  const [event, setEvent] = useState<Event | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState<AccessibilityCategory[]>([])
  const [maxParticipants, setMaxParticipants] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const fetchEvent = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error

      setEvent(data)
      setTitle(data.title)
      setDescription(data.description)
      setDateTime(new Date(data.date_time).toISOString().slice(0, 16))
      setLocation(data.location)
      setCategories(data.category || [])
      setMaxParticipants(data.max_participants?.toString() || '')
      setImageUrl(data.image_url || '')
      setIsActive(data.is_active)
    } catch (error) {
      console.error('Error fetching event:', error)
      setMessage('Event tidak ditemukan')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  useEffect(() => {
    if (!user || userProfile?.role !== 'ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchEvent()
  }, [user, userProfile, router, fetchEvent])

  const toggleCategory = (category: AccessibilityCategory) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || userProfile?.role !== 'ADMIN') {
      setMessage('Unauthorized access')
      return
    }

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('events')
        .update({
          title,
          description,
          date_time: dateTime,
          location,
          category: categories,
          max_participants: maxParticipants ? parseInt(maxParticipants) : null,
          image_url: imageUrl || null,
          is_active: isActive
        })
        .eq('id', eventId)

      if (error) throw error

      setMessage('Event berhasil diperbarui!')
      setTimeout(() => {
        router.push('/admin/events')
      }, 2000)
      
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Unauthorized access</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Event tidak ditemukan</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Edit Event</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Judul Event *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deskripsi *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal & Waktu *
              </label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lokasi *
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori Aksesibilitas
            </label>
            <div className="space-y-2">
              {(['SIGN_LANGUAGE', 'WHEELCHAIR_ACCESS', 'BRAILLE', 'AUDIO_DESCRIPTION', 'TACTILE'] as AccessibilityCategory[]).map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="mr-2"
                  />
                  <span>{category.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maksimal Peserta
            </label>
            <input
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Gambar
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              <span>Event Aktif</span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/events')}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-md hover:bg-gray-600 transition-colors font-medium"
            >
              Batal
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-center ${
              message.includes('berhasil') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}