'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FileUpload from '../../components/FileUpload'

const ImageIcon = () => (
  <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const EventTagIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3v5m8-5v5m-1-1h2a2 2 0 012 2v4a2 2 0 01-2 2h-2m-4 0h-2a2 2 0 01-2-2v-4a2 2 0 012-2h2m2 4h.01M17 16l-2-2" />
  </svg>
)

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const UploadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

type Gallery = {
  id: string
  file_url: string
  file_name?: string
  title?: string
  created_at: string
  event_title: string
}

interface MediaRow {
  id: string
  event_id: string
  file_url: string
  file_name?: string
  title?: string
  created_at: string
}

interface EventForGallery {
  id: string
  title: string
}

function mapFallbackGallery(media: MediaRow, eventsMap: Record<string, EventForGallery>): Gallery {
  const event = eventsMap[media.event_id]
  return {
    ...media,
    event_title: event?.title || 'Umum'
  }
}

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { user, userProfile, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (userProfile && !isAdmin) {
      router.push('/')
      return
    }
    fetchGalleries()
  }, [user, userProfile, router, isAdmin])

  const fetchGalleries = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('media')
        .select(`
          *,
          events (
            title
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        if (error.code === 'PGRST200' || (error.message && String(error.message).includes('Could not find a relationship'))) {
          console.warn('media->events relationship missing; falling back to manual join for galleries')

          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('*')
            .order('created_at', { ascending: false })

          if (mediaError) throw mediaError

          const eventIds = Array.from(new Set((mediaData || []).map((m: MediaRow) => m.event_id).filter(Boolean)))

          let eventsMap: Record<string, EventForGallery> = {}
          if (eventIds.length > 0) {
            const { data: eventsData, error: eventsError } = await supabase
              .from('events')
              .select('id, title')
              .in('id', eventIds)

            if (eventsError) throw eventsError

            eventsMap = (eventsData as EventForGallery[] || []).reduce((acc: Record<string, EventForGallery>, ev: EventForGallery) => {
              acc[ev.id] = ev
              return acc
            }, {})
          }

          const mapped = (mediaData as MediaRow[] || []).map(m => mapFallbackGallery(m, eventsMap))

          setGalleries(mapped)
          return
        }

        console.error('Supabase fetch error:', JSON.stringify(error, null, 2))
        throw error
      }

      if (data) {
        const formattedData = data.map((item) => {
          const joinedItem = item as MediaRow & { events: { title: string } | null };
          return {
            ...joinedItem,
            event_title: joinedItem.events?.title || 'Umum'
          }
        })
        setGalleries(formattedData)
      }
    } catch (error) {
      console.error('Error in fetchGalleries flow:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteGallery = async (gallery: Gallery) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return

    try {
      if (gallery.file_url) {
        const url = new URL(gallery.file_url)
        const pathParts = url.pathname.split('/galleries/')
        if (pathParts.length > 1) {
          const storagePath = decodeURIComponent(pathParts[1])
          const { error: storageError } = await supabase.storage
            .from('galleries')
            .remove([storagePath])
          
          if (storageError) console.error('Error removing from storage:', storageError)
        }
      }

      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', gallery.id)

      if (error) throw error

      setGalleries(galleries.filter(g => g.id !== gallery.id))
    } catch (error) {
      console.error('Error deleting gallery:', error)
      alert('Gagal menghapus data')
    }
  }

  const handleUploadComplete = () => {
    fetchGalleries()
    setIsModalOpen(false)
  }

  if (!user || (userProfile && !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-10 max-w-md mx-4 border border-gray-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
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

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Galeri Foto</h1>
              <p className="text-gray-500 mt-1 text-sm">
                Kelola dokumentasi foto kegiatan komunitas — <span className="font-semibold text-gray-900">{galleries.length}</span> item
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-red-200 group gap-2"
            >
              <PlusIcon />
              Upload Foto
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-red-100 rounded-full opacity-50"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-gray-400 font-medium animate-pulse">Memuat galeri...</p>
          </div>
        ) : galleries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="p-6 bg-gray-50 rounded-full mb-4">
              <ImageIcon />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum ada foto</h3>
            <p className="text-gray-500 mb-8 text-center max-w-sm leading-relaxed">
              Mulai bangun galeri dengan mengunggah foto dokumentasi kegiatan pertama Anda.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center text-red-600 font-medium hover:text-red-700 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-xl transition-colors gap-2"
            >
              <PlusIcon />
              Upload Sekarang
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleries.map((gallery) => (
              <div key={gallery.id} className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-red-100 transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1">
                
                <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={gallery.file_url}
                    alt={gallery.title || gallery.file_name || 'Gallery image'}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => deleteGallery(gallery)}
                      className="bg-white/90 hover:bg-red-600 hover:text-white text-red-600 p-2 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                      title="Hapus Foto"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <div className="flex items-center text-blue-600 bg-blue-50 px-2 py-1 rounded-md max-w-[65%]">
                      <EventTagIcon />
                      <span className="ml-1 truncate font-medium">{gallery.event_title}</span>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <ClockIcon />
                      <span className="ml-1">
                        {new Date(gallery.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 mb-1" title={gallery.title || gallery.file_name || ''}>
                    {gallery.title || gallery.file_name || 'Untitled'}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                  <UploadIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Upload Foto</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <XIcon />
              </button>
            </div>
            
            <div className="p-6">
              <FileUpload onUploadComplete={handleUploadComplete} maxSize={5} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}