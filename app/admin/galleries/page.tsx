'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Gallery = {
  id: string
  title: string
  description: string
  image_url: string
  video_url: string
  caption: string
  has_sign_language: boolean
  has_subtitles: boolean
  created_at: string
  event_title: string
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

    if (userProfile && userProfile.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchGalleries()
  }, [user, userProfile, router])

  const fetchGalleries = async () => {
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select(`
          *,
          events(title)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedGalleries = (data || []).map(item => ({
        ...item,
        event_title: item.events?.title || 'Unknown Event'
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
        .from('galleries')
        .delete()
        .eq('id', galleryId)

      if (error) throw error

      setGalleries(galleries.filter(gallery => gallery.id !== galleryId))
    } catch (error) {
      console.error('Error deleting gallery:', error)
    }
  }

  if (!user || (userProfile && userProfile.role !== 'ADMIN')) {
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
          <p className="text-lg text-gray-600">Loading galleries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Kelola Galeri Dokumentasi</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <div key={gallery.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {gallery.image_url && (
                <Image
                  src={gallery.image_url}
                  alt={gallery.title}
                  width={400}
                  height={300}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{gallery.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{gallery.event_title}</p>
                {gallery.caption && (
                  <p className="text-gray-500 text-sm mb-3">{gallery.caption}</p>
                )}
                <div className="flex gap-2 mb-3">
                  {gallery.has_sign_language && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Bahasa Isyarat
                    </span>
                  )}
                  {gallery.has_subtitles && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Subtitle
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    {new Date(gallery.created_at).toLocaleDateString('id-ID')}
                  </span>
                  <button
                    onClick={() => deleteGallery(gallery.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {galleries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Belum ada dokumentasi yang diupload.</p>
          </div>
        )}
      </div>
    </div>
  )
}