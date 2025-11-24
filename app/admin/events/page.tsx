'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../components/AuthProvider'

type EventWithRegistrations = {
  id: string
  title: string
  date_time: string
  location: string
  is_active: boolean
  registrations: { count: number }[]
  category: string[]
  max_participants: number | null
}

type StatusFilter = 'all' | 'active' | 'inactive'

// SVG Icons
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

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const AccessibilityIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
)

export default function AdminEvents() {
  const [events, setEvents] = useState<EventWithRegistrations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (userProfile && userProfile.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchEvents()
  }, [user, userProfile, router])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations(count)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEventActive = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: !currentStatus })
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.map(event => 
        event.id === eventId ? { ...event, is_active: !currentStatus } : event
      ))
    } catch (error) {
      console.error('Error updating event:', error)
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      setEvents(events.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  // Filter events based on search and status
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && event.is_active) ||
                         (statusFilter === 'inactive' && !event.is_active)
    
    return matchesSearch && matchesStatus
  })

  const getCategoryColor = (category: string) => {
    const colors = {
      'SIGN_LANGUAGE': 'bg-blue-100 text-blue-800',
      'WHEELCHAIR_ACCESS': 'bg-green-100 text-green-800',
      'BRAILLE': 'bg-purple-100 text-purple-800',
      'AUDIO_DESCRIPTION': 'bg-orange-100 text-orange-800',
      'TACTILE': 'bg-indigo-100 text-indigo-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as StatusFilter)
  }

  if (!user || (userProfile && userProfile.role !== 'ADMIN')) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat event...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Kelola Event</h1>
              <p className="text-gray-600 mt-1">
                Kelola semua event dan pendaftaran peserta
              </p>
            </div>
            <Link 
              href="/admin/events/create"
              className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <PlusIcon />
              <span className="ml-2">Buat Event Baru</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cari Event
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan judul atau lokasi..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-red-600 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        event.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {event.is_active ? '🟢 Aktif' : '🔴 Nonaktif'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {event.registrations[0]?.count || 0} pendaftar
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-gray-600">
                    <CalendarIcon />
                    <span className="ml-2 text-sm">
                      {new Date(event.date_time).toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <LocationIcon />
                    <span className="ml-2 text-sm line-clamp-1">{event.location}</span>
                  </div>
                  {event.max_participants && (
                    <div className="flex items-center text-gray-600">
                      <UsersIcon />
                      <span className="ml-2 text-sm">
                        Maks. {event.max_participants} peserta
                      </span>
                    </div>
                  )}
                </div>

                {/* Accessibility Categories */}
                {event.category && event.category.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-gray-700 mb-2">
                      <AccessibilityIcon />
                      <span className="ml-1 text-sm font-medium">Aksesibilitas</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {event.category.slice(0, 3).map((cat) => (
                        <span 
                          key={cat}
                          className={`px-2 py-1 rounded-lg text-xs ${getCategoryColor(cat)}`}
                        >
                          {cat.replace('_', ' ')}
                        </span>
                      ))}
                      {event.category.length > 3 && (
                        <span className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-600">
                          +{event.category.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleEventActive(event.id, event.is_active)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                        event.is_active
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                    >
                      {event.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <Link 
                      href={`/admin/events/${event.id}/edit`}
                      className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                    >
                      <EditIcon />
                      <span className="ml-1">Edit</span>
                    </Link>
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    <DeleteIcon />
                    <span className="ml-1">Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarIcon />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {events.length === 0 ? 'Belum ada event' : 'Event tidak ditemukan'}
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {events.length === 0 
                ? 'Mulai dengan membuat event pertama Anda untuk komunitas'
                : 'Coba ubah kata kunci pencarian atau filter status'
              }
            </p>
            {events.length === 0 && (
              <Link 
                href="/admin/events/create"
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                <PlusIcon />
                <span className="ml-2">Buat Event Pertama</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}