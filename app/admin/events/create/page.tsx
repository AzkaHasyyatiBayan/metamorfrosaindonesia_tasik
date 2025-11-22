'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { useRouter } from 'next/navigation'

type AccessibilityCategory = 'SIGN_LANGUAGE' | 'WHEELCHAIR_ACCESS' | 'BRAILLE' | 'AUDIO_DESCRIPTION' | 'TACTILE'

export default function CreateEvent() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dateTime, setDateTime] = useState('')
  const [location, setLocation] = useState('')
  const [categories, setCategories] = useState<AccessibilityCategory[]>([])
  const [maxParticipants, setMaxParticipants] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  const toggleCategory = (category: AccessibilityCategory) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const validateForm = () => {
    if (!title.trim()) {
      setMessage('Judul event harus diisi')
      return false
    }
    if (!description.trim()) {
      setMessage('Deskripsi event harus diisi')
      return false
    }
    if (!dateTime) {
      setMessage('Tanggal dan waktu harus diisi')
      return false
    }
    if (!location.trim()) {
      setMessage('Lokasi event harus diisi')
      return false
    }
    if (new Date(dateTime) <= new Date()) {
      setMessage('Tanggal event harus di masa depan')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || userProfile?.role !== 'ADMIN') {
      setMessage('Unauthorized access')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('events')
        .insert([
          {
            title: title.trim(),
            description: description.trim(),
            date_time: dateTime,
            location: location.trim(),
            category: categories,
            max_participants: maxParticipants ? parseInt(maxParticipants) : null,
            image_url: imageUrl || null,
            creator_id: user.id
          }
        ])

      if (error) throw error

      setMessage('Event berhasil dibuat!')
      setTimeout(() => {
        router.push('/admin/events')
      }, 2000)
      
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Buat Event Baru</h1>
        
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
              placeholder="Masukkan judul event"
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
              placeholder="Deskripsi lengkap event"
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
                min={new Date().toISOString().slice(0, 16)}
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
                placeholder="Tempat event"
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
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Kosongkan untuk tidak terbatas"
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
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
          >
            {loading ? 'Membuat Event...' : 'Buat Event'}
          </button>

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