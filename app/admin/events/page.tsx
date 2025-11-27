'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Image from 'next/image'

// PERBAIKAN: Update Event type dengan registrations
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
  creator_id: string
  created_at: string
  updated_at: string
  participants_count?: number
  // PERBAIKAN: Tambahkan type untuk registrations
  registrations?: Array<{ count: number }>
}

type EventFormData = {
  title: string
  description: string
  date_time: string
  location: string
  category: string[]
  max_participants: string
  image_url: string
  is_active: boolean
}

const ACCESSIBILITY_CATEGORIES = [
  'tuna_rungu',
  'tuna_wicara', 
  'tuna_netra',
  'disabilitas_fisik',
  'ramah_disabilitas',
  'umum'
]

// SVG Icon untuk placeholder gambar
const EventPlaceholderIcon = () => (
  <svg 
    className="w-12 h-12 text-gray-400" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={1.5} 
      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
    />
  </svg>
)

// PERBAIKAN: XIcon untuk error display
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [saving, setSaving] = useState(false)
  // PERBAIKAN: Tambahkan state error
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date_time: '',
    location: '',
    category: [],
    max_participants: '',
    image_url: '',
    is_active: true
  })

  useEffect(() => {
    loadEvents()
  }, [])

  // PERBAIKAN LENGKAP: Ganti fungsi loadEvents
  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // PERBAIKAN: Gunakan 'registrations' bukan 'event_participants'
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          registrations(count)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching events:', error)
        setError('Gagal memuat data events: ' + error.message)
        return
      }

      // Process data untuk include participants count
      const processedEvents = events.map(event => ({
        ...event,
        participants_count: event.registrations?.[0]?.count || 0
      })) as Event[]

      setEvents(processedEvents)
    } catch (error) {
      console.error('Error:', error)
      setError('Terjadi kesalahan saat memuat events')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      const eventData = {
        title: formData.title,
        description: formData.description,
        date_time: formData.date_time,
        location: formData.location,
        category: formData.category,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        updated_at: new Date().toISOString()
      }

      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', editingEvent.id)

        if (error) throw error
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([{
            ...eventData,
            creator_id: (await supabase.auth.getUser()).data.user?.id,
            created_at: new Date().toISOString()
          }])

        if (error) throw error
      }

      // Reset form dan reload data
      resetForm()
      loadEvents()
      
    } catch (error) {
      console.error('Error saving event:', error)
      setError('Error menyimpan event: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date_time: '',
      location: '',
      category: [],
      max_participants: '',
      image_url: '',
      is_active: true
    })
    setEditingEvent(null)
    setShowForm(false)
    setError(null)
  }

  const editEvent = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date_time: event.date_time.slice(0, 16), // Format untuk datetime-local
      location: event.location,
      category: event.category || [],
      max_participants: event.max_participants?.toString() || '',
      image_url: event.image_url || '',
      is_active: event.is_active
    })
    setEditingEvent(event)
    setShowForm(true)
    setError(null)
  }

  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('events')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error

      // Update local state
      setEvents(events.map(event => 
        event.id === eventId 
          ? { ...event, is_active: !currentStatus }
          : event
      ))
    } catch (error) {
      console.error('Error updating event status:', error)
      setError('Error mengubah status event')
    }
  }

  const deleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini?')) return

    try {
      setError(null)
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error

      // Update local state
      setEvents(events.filter(event => event.id !== eventId))
    } catch (error) {
      console.error('Error deleting event:', error)
      setError('Error menghapus event')
    }
  }

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
    }))
  }

  // Komponen untuk menampilkan gambar event
  const EventImage = ({ event }: { event: Event }) => {
    if (event.image_url) {
      return (
        <div className="h-12 w-12 shrink-0 relative">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="rounded-lg object-cover"
            sizes="48px"
          />
        </div>
      )
    }
    
    return (
      <div className="h-12 w-12 shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
        <EventPlaceholderIcon />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Event</h1>
            <p className="text-gray-600 mt-2">
              Kelola semua event - {events.length} event ditemukan
            </p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            + Buat Event Baru
          </button>
        </div>

        {/* PERBAIKAN: Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <div className="flex items-center">
              <XIcon />
              <span className="ml-2">{error}</span>
            </div>
            <button 
              onClick={loadEvents}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Buat Event Baru'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Judul Event *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal & Waktu *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.date_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, date_time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lokasi *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Aksesibilitas *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {ACCESSIBILITY_CATEGORIES.map((category) => (
                        <label key={category} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.category.includes(category)}
                            onChange={() => handleCategoryChange(category)}
                            className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {category.replace('_', ' ')}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Maksimal Peserta
                      </label>
                      <input
                        type="number"
                        value={formData.max_participants}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_participants: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Kosongkan untuk tidak terbatas"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Gambar
                      </label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">Event Aktif</span>
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {saving ? 'Menyimpan...' : editingEvent ? 'Update Event' : 'Buat Event'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Events Table dengan Laporan */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Memuat event...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <EventPlaceholderIcon />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada event</h3>
              <p className="text-gray-500 mb-4">Mulai dengan membuat event pertama Anda</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Buat Event Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peserta
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <EventImage event={event} />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.location}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {event.category.join(', ')}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          {new Date(event.date_time).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {new Date(event.date_time).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="text-center">
                          <div className="font-semibold">{event.participants_count || 0}</div>
                          <div className="text-xs text-gray-500">
                            {event.max_participants ? `/${event.max_participants}` : '∞'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            event.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {event.is_active ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => editEvent(event)}
                          className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => toggleEventStatus(event.id, event.is_active)}
                          className={`px-2 py-1 rounded ${
                            event.is_active
                              ? 'text-orange-600 hover:text-orange-900 hover:bg-orange-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                        >
                          {event.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}