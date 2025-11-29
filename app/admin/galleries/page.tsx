'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const VideoIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const SignLanguageIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
  </svg>
)

const SubtitleIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

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

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

type Gallery = {
  id: string
  title: string
  description?: string
  image_url?: string
  video_url?: string
  caption?: string
  has_sign_language: boolean
  has_subtitles: boolean
  created_at: string
  event_title: string
  file_type?: 'image' | 'video'
  file_name?: string
}

export default function AdminGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [loading, setLoading] = useState(true)
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
      const { data, error } = await supabase
        .from('media')
        .select(`
          *,
          events(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedGalleries = (data || []).map(item => ({
        id: item.id,
        title: item.title || 'Untitled',
        description: item.description,
        image_url: item.file_url,
        video_url: item.file_type === 'video' ? item.file_url : undefined,
        caption: item.caption,
        has_sign_language: item.has_sign_language || false,
        has_subtitles: item.has_subtitles || false,
        created_at: item.created_at,
        event_title: item.events?.title || 'Event Tidak Diketahui',
        file_type: item.file_type,
        file_name: item.file_name
      }))

      setGalleries(formattedGalleries)
    } catch (error) {
      console.error('Error fetching galleries:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteGallery = async (galleryId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumentasi ini?')) return

    try {
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', galleryId)

      if (error) throw error

      setGalleries(galleries.filter(gallery => gallery.id !== galleryId))
    } catch (error) {
      console.error('Error deleting gallery:', error)
    }
  }

  if (!user || (userProfile && userProfile.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
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
          <p className="text-lg text-gray-600">Memuat galeri dokumentasi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Galeri Dokumentasi</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kelola dokumentasi foto dan video dari berbagai event komunitas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Dokumentasi</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{galleries.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GalleryIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dengan Bahasa Isyarat</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {galleries.filter(g => g.has_sign_language).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <UsersIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dengan Subtitle</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {galleries.filter(g => g.has_subtitles).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DocumentIcon />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              {gallery.image_url ? (
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={gallery.image_url}
                    alt={gallery.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute top-3 right-3 flex space-x-1">
                    {gallery.file_type === 'video' && (
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <VideoIcon />
                        <span>Video</span>
                      </span>
                    )}
                    {gallery.file_type === 'image' && (
                      <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                        <ImageIcon />
                        <span>Foto</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : gallery.video_url ? (
                <div className="relative h-48 bg-gray-100">
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-200 to-gray-300">
                    <div className="text-center text-gray-500">
                      <VideoIcon />
                      <span className="text-sm font-medium block mt-1">Video Content</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                      <VideoIcon />
                      <span>Video</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-48 bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <GalleryIcon />
                    <span className="text-sm block mt-1">No Media</span>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{gallery.title}</h3>
                </div>
                
                <p className="text-sm text-red-600 font-medium mb-2 flex items-center">
                  <EventIcon />
                  <span className="ml-1">{gallery.event_title}</span>
                </p>
                
                {gallery.caption && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{gallery.caption}</p>
                )}

                {gallery.description && (
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{gallery.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {gallery.has_sign_language && (
                    <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      <SignLanguageIcon />
                      <span className="ml-1">Bahasa Isyarat</span>
                    </span>
                  )}
                  {gallery.has_subtitles && (
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <SubtitleIcon />
                      <span className="ml-1">Subtitle</span>
                    </span>
                  )}
                  {gallery.file_type && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      gallery.file_type === 'video' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {gallery.file_type === 'video' ? (
                        <>
                          <VideoIcon />
                          <span className="ml-1">Video</span>
                        </>
                      ) : (
                        <>
                          <ImageIcon />
                          <span className="ml-1">Gambar</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-500">
                      {new Date(gallery.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                    {gallery.file_name && (
                      <span className="text-xs text-gray-400 truncate max-w-[120px]">
                        {gallery.file_name}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteGallery(gallery.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 shadow-sm flex items-center space-x-2"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada dokumentasi</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Upload dokumentasi pertama Anda untuk mulai membangun galeri.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}