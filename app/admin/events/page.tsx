'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// Definisi Tipe Data Event
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
  registrations?: Array<{ count: number }>
}

// Definisi Tipe Error untuk menangani catch block dengan aman
interface AppError {
  message: string
  code?: string
  details?: string
}

// Komponen Icon Placeholder jika tidak ada gambar
const EventPlaceholderIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

// Komponen Icon X untuk Error Box
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function AdminEventsPage() {
  // State Management
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user, isAdmin } = useAuth()
  const router = useRouter()

  // Effect untuk load events saat user admin terdeteksi
  useEffect(() => {
    if (user && isAdmin) {
      loadEvents()
    }
  }, [user, isAdmin])

  // Fungsi Memuat Data Events dari Supabase
  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Ambil data events urut berdasarkan waktu dibuat terbaru
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false })

      if (eventsError) {
        throw eventsError
      }

      // Hitung jumlah peserta untuk setiap event
      const eventsWithParticipants = await Promise.all(
        (eventsData || []).map(async (event) => {
          try {
            const { count, error } = await supabase
              .from('registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id)

            if (error) {
              console.warn('Error counting participants for event', event.id, error)
              return { ...event, participants_count: 0 }
            }

            return { ...event, participants_count: count || 0 }
          } catch (e) {
            console.warn('Exception counting participants for event', event.id, e)
            return { ...event, participants_count: 0 }
          }
        })
      )

      setEvents(eventsWithParticipants as Event[])
    } catch (rawError: unknown) {
      // PERBAIKAN: Menggunakan type assertion yang aman
      const err = rawError as AppError
      console.error('Error in loadEvents:', err)
      setError(err.message || 'Terjadi kesalahan saat memuat events')
    } finally {
      setLoading(false)
    }
  }

  // Fungsi Mengisi Form Saat Tombol Edit Diklik
  const editEvent = (event: Event) => {
    router.push(`/admin/events/create?id=${event.id}`)
  }

  // Fungsi Mengubah Status Aktif/Non-aktif
  const toggleEventStatus = async (eventId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error
      await loadEvents()
    } catch (err) {
      console.error('Error toggle status:', err)
      alert('Gagal mengubah status event')
    }
  }

  // Fungsi Menghapus Event
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus event ini? Data peserta terkait juga akan terhapus.')) return

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

      if (error) throw error
      await loadEvents()
    } catch (err) {
      console.error('Error deleting event:', err)
      alert('Gagal menghapus event')
    }
  }

  // Tampilan Akses Ditolak (Jika bukan Admin)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-md mx-4 border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Halaman ini dilindungi dan hanya dapat diakses oleh Administrator sistem.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-red-200"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  // Tampilan Utama Halaman Admin Events
  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Event</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Manajemen acara dan kegiatan — <span className="font-semibold text-gray-900">{events.length}</span> event ditemukan
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/events/create')}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-red-200 group"
            >
              <span className="mr-2 text-xl leading-none font-light group-hover:scale-110 transition-transform">+</span> 
              Buat Event Baru
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Message Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex justify-between items-center shadow-sm animate-fade-in">
            <div className="flex items-center">
              <div className="bg-red-100 p-2 rounded-lg mr-3">
                <XIcon />
              </div>
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700 transition-colors p-2 hover:bg-red-100 rounded-lg">
              <XIcon />
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-red-100 rounded-full opacity-50"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-400 font-medium animate-pulse">Sedang memuat data event...</p>
          </div>
        ) : events.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <EventPlaceholderIcon />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Belum ada event</h3>
            <p className="text-gray-500 mb-6 text-center max-w-sm">
              Mulai dengan membuat event pertama Anda untuk menarik partisipasi komunitas.
            </p>
            <button
              onClick={() => router.push('/admin/events/create')}
              className="text-red-600 font-medium hover:text-red-700 bg-red-50 hover:bg-red-100 px-6 py-2 rounded-lg transition-colors"
            >
              Buat Event Sekarang
            </button>
          </div>
        ) : (
          /* Event Grid */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-red-100 transition-all duration-300 flex flex-col overflow-hidden">
                
                {/* Event Image Card */}
                <div className="relative h-52 w-full bg-gray-100 overflow-hidden">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <EventPlaceholderIcon />
                    </div>
                  )}
                  
                  {/* Status Overlay Badge */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide shadow-sm backdrop-blur-md border ${
                      event.is_active 
                        ? 'bg-white/90 text-green-700 border-green-200' 
                        : 'bg-white/90 text-gray-500 border-gray-200'
                    }`}>
                      {event.is_active ? 'ACTIVE' : 'NON-ACTIVE'}
                    </span>
                  </div>
                </div>
                
                {/* Event Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-red-600 transition-colors" title={event.title}>
                      {event.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="truncate">
                        {new Date(event.date_time).toLocaleDateString('id-ID', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <svg className="w-4 h-4 mr-2 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                  
                  {/* Footer Actions */}
                  <div className="mt-auto pt-5 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-red-600"></span>
                      <span className="text-xs font-semibold text-gray-600">
                        {event.participants_count} <span className="font-normal text-gray-400">Peserta</span>
                      </span>
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleEventStatus(event.id, event.is_active)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          event.is_active 
                            ? 'text-gray-400 hover:bg-yellow-50 hover:text-yellow-600' 
                            : 'text-gray-400 hover:bg-green-50 hover:text-green-600'
                        }`}
                        title={event.is_active ? "Sembunyikan Event" : "Publikasikan Event"}
                      >
                        {event.is_active ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                      
                      <div className="w-px h-6 bg-gray-200 my-auto mx-1"></div>

                      <button
                        onClick={() => editEvent(event)}
                        className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        title="Edit Detail"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        title="Hapus Event"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}