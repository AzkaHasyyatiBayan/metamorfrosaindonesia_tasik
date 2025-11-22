import { supabase } from '../../lib/supabase'
import { notFound } from 'next/navigation'
import Navigation from '../../components/Navigation'
import Image from 'next/image'
import RegistrationForm from '../../components/RegistrationForm'
import FileUpload from '../../components/FileUpload'

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
}

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
}

async function getEvent(id: string): Promise<Event | null> {
  try {
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (!event) {
      return null
    }

    return event as Event
  } catch {
    return null
  }
}

async function getEventGalleries(eventId: string): Promise<Gallery[]> {
  try {
    const { data: galleries } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    return galleries as Gallery[] || []
  } catch {
    return []
  }
}

interface PageProps {
  params: { id: string }
}

export default async function EventDetail({ params }: PageProps) {
  const event = await getEvent(params.id)
  const galleries = await getEventGalleries(params.id)

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {event.image_url && (
                <Image 
                  src={event.image_url} 
                  alt={event.title}
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover"
                />
              )}
              
              <div className="p-8">
                <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Tanggal & Waktu</h3>
                    <p>{new Date(event.date_time).toLocaleString('id-ID')}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Lokasi</h3>
                    <p>{event.location}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Kategori Aksesibilitas</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.category?.map((cat) => (
                      <span 
                        key={cat} 
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {cat.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-semibold text-gray-700 mb-2">Deskripsi</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{event.description}</p>
                </div>

                {event.max_participants && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Kapasitas Peserta</h3>
                    <p>{event.max_participants} orang</p>
                  </div>
                )}
              </div>
            </div>

            {galleries.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-6">Dokumentasi Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleries.map((gallery) => (
                    <div key={gallery.id} className="border rounded-lg overflow-hidden">
                      {gallery.image_url && (
                        <Image
                          src={gallery.image_url}
                          alt={gallery.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2">{gallery.title}</h3>
                        {gallery.caption && (
                          <p className="text-gray-600 text-sm mb-2">{gallery.caption}</p>
                        )}
                        <div className="flex gap-2 text-xs text-gray-500">
                          {gallery.has_sign_language && (
                            <span>Bahasa Isyarat</span>
                          )}
                          {gallery.has_subtitles && (
                            <span>Subtitle</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            <RegistrationForm eventId={event.id} />
            
            <FileUpload 
              eventId={event.id}
              onUploadComplete={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  )
}