'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import FileUpload from '../../components/FileUpload'

const EventIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)

const GalleryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

type Gallery = {
  id: string
  title: string
  file_url: string
  file_name?: string
  created_at: string
  event_title: string
}

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }
    if (userProfile && userProfile.role !== 'admin') {
      router.push('/')
      return
    }
    fetchGalleries()
  }, [user, userProfile, router])

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
      console.error('Supabase fetch error:', JSON.stringify(error, null, 2))
      throw error
    }

    if (data) {
      setGalleries(data)
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

  if (!user || (userProfile && userProfile.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-600">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat galeri foto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Galeri Foto</h1>
            <p className="text-gray-600">
              Kelola dokumentasi foto kegiatan komunitas
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <PlusIcon />
            <span className="font-semibold">Upload Foto</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="relative h-56 bg-gray-100 group">
                <Image
                  src={gallery.file_url}
                  alt={gallery.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-red-600 font-medium flex items-center bg-red-50 px-2 py-1 rounded-md">
                    <EventIcon />
                    <span className="ml-1 truncate max-w-[150px]">{gallery.event_title}</span>
                  </p>
                  <span className="text-xs text-gray-400">
                    {new Date(gallery.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 truncate mb-4" title={gallery.title}>
                    {gallery.title}
                </h3>
                
                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => deleteGallery(gallery)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
                  >
                    <DeleteIcon />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GalleryIcon />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada foto</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-6">
              Mulai bangun galeri dengan mengunggah foto pertama Anda.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <PlusIcon />
              <span className="ml-2">Upload Sekarang</span>
            </button>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Upload Foto</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="p-6">
                <FileUpload onUploadComplete={handleUploadComplete} maxSize={5} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}