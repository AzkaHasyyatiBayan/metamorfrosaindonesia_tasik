'use client'
import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type AccessibilityCategory = 'SIGN_LANGUAGE' | 'WHEELCHAIR_ACCESS' | 'BRAILLE' | 'AUDIO_DESCRIPTION' | 'TACTILE'

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const AccessibilityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
)

const DescriptionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

const EventImageIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PreviewImage = ({ imageUrl, title }: { imageUrl?: string; title: string }) => {
  if (!imageUrl) {
    return (
      <div className="aspect-video bg-linear-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white">
        <EventImageIcon />
      </div>
    )
  }

  return (
    <div className="aspect-video relative rounded-xl overflow-hidden bg-gray-100">
      <Image
        src={imageUrl}
        alt={`Preview: ${title}`}
        fill
        className="object-cover"
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const parent = target.parentElement
          if (parent) {
            const fallback = document.createElement('div')
            fallback.className = `bg-linear-to-br from-red-500 to-red-600 flex items-center justify-center text-white w-full h-full`
            fallback.innerHTML = `<svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`
            parent.appendChild(fallback)
          }
        }}
      />
    </div>
  )
}

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

  const getCategoryIcon = (category: AccessibilityCategory) => {
    const icons = {
      'SIGN_LANGUAGE': '👐',
      'WHEELCHAIR_ACCESS': '♿',
      'BRAILLE': '🔤',
      'AUDIO_DESCRIPTION': '🎧',
      'TACTILE': '✋'
    }
    return icons[category]
  }

  if (!user || userProfile?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">Anda tidak memiliki akses ke halaman admin.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Buat Event Baru</h1>
              <p className="text-gray-600 mt-1">
                Buat event baru untuk komunitas Anda
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Judul Event *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Masukkan judul event yang menarik"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Deskripsi Event *
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                    placeholder="Jelaskan detail event, agenda, dan manfaat yang akan didapat peserta..."
                  />
                  <div className="absolute top-3 left-3 text-gray-400">
                    <DescriptionIcon />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Tanggal & Waktu *
                  </label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                    <div className="absolute top-3 left-3 text-gray-400">
                      <CalendarIcon />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Lokasi *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Tempat pelaksanaan event"
                    />
                    <div className="absolute top-3 left-3 text-gray-400">
                      <LocationIcon />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">
                  <div className="flex items-center space-x-2">
                    <AccessibilityIcon />
                    <span>Fitur Aksesibilitas</span>
                  </div>
                </label>
                <p className="text-sm text-gray-600">
                  Pilih fitur aksesibilitas yang tersedia untuk event ini
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(['SIGN_LANGUAGE', 'WHEELCHAIR_ACCESS', 'BRAILLE', 'AUDIO_DESCRIPTION', 'TACTILE'] as AccessibilityCategory[]).map((category) => (
                    <label 
                      key={category} 
                      className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        categories.includes(category)
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-lg mr-2">{getCategoryIcon(category)}</span>
                      <span className="font-medium text-gray-900">
                        {category.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Maksimal Peserta
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={maxParticipants}
                      onChange={(e) => setMaxParticipants(e.target.value)}
                      min="1"
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Kosongkan untuk tidak terbatas"
                    />
                    <div className="absolute top-3 left-3 text-gray-400">
                      <UsersIcon />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    URL Gambar
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                    <div className="absolute top-3 left-3 text-gray-400">
                      <ImageIcon />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Membuat Event...
                  </div>
                ) : (
                  'Buat Event Sekarang'
                )}
              </button>

              {message && (
                <div className={`p-4 rounded-xl text-center font-medium ${
                  message.includes('berhasil') 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Preview Event</h3>
              
              <div className="space-y-4">
                <PreviewImage imageUrl={imageUrl} title={title} />
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {title || 'Judul Event'}
                  </h4>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {description || 'Deskripsi event akan muncul di sini...'}
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  {dateTime && (
                    <div className="flex items-center text-gray-600">
                      <CalendarIcon />
                      <span className="ml-2">
                        {new Date(dateTime).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  
                  {location && (
                    <div className="flex items-center text-gray-600">
                      <LocationIcon />
                      <span className="ml-2">{location}</span>
                    </div>
                  )}

                  {maxParticipants && (
                    <div className="flex items-center text-gray-600">
                      <UsersIcon />
                      <span className="ml-2">Maks. {maxParticipants} peserta</span>
                    </div>
                  )}
                </div>

                {categories.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm mb-2">Fitur Aksesibilitas:</h5>
                    <div className="flex flex-wrap gap-1">
                      {categories.map((cat) => (
                        <span 
                          key={cat}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded-lg text-xs"
                        >
                          {cat.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}