import { supabase } from '../../../lib/supabase'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import RegistrationForm from '../../../components/RegistrationForm'
import FileUpload from '../../../components/FileUpload'

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
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return null
    }

    if (!event) {
      return null
    }

    return event as Event
  } catch (error) {
    console.error('Error in getEvent:', error)
    return null
  }
}

async function getEventGalleries(eventId: string): Promise<Gallery[]> {
  try {
    const { data: galleries, error } = await supabase
      .from('galleries')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching galleries:', error)
      return []
    }

    return galleries as Gallery[] || []
  } catch (error) {
    console.error('Error in getEventGalleries:', error)
    return []
  }
}

interface PageProps {
  params: { id: string }
}

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
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CategoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const DescriptionIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default async function EventEditPage({ params }: PageProps) {
  const event = await getEvent(params.id)
  const galleries = await getEventGalleries(params.id)

  if (!event) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
              {event.image_url && (
                <div className="relative h-80 md:h-96">
                  <Image 
                    src={event.image_url} 
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
              
              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">{event.title}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <CalendarIcon />
                      <span className="ml-2">Tanggal & Waktu</span>
                    </h3>
                    <p className="text-gray-900 font-medium">
                      {new Date(event.date_time).toLocaleString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                      <LocationIcon />
                      <span className="ml-2">Lokasi</span>
                    </h3>
                    <p className="text-gray-900 font-medium">{event.location}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center text-lg">
                    <CategoryIcon />
                    <span className="ml-2">Kategori Aksesibilitas</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {event.category?.map((cat) => (
                      <span 
                        key={cat} 
                        className="px-4 py-2 bg-blue-100 text-blue-800 font-medium rounded-full border border-blue-200"
                      >
                        {cat.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center text-lg">
                    <DescriptionIcon />
                    <span className="ml-2">Deskripsi</span>
                  </h3>
                  <div className="prose max-w-none text-gray-700 leading-relaxed text-lg">
                    {event.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ))}
                  </div>
                </div>

                {event.max_participants && (
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                      <UsersIcon />
                      <span className="ml-2">Kapasitas Peserta</span>
                    </h3>
                    <p className="text-yellow-900 font-medium">{event.max_participants} orang</p>
                  </div>
                )}
              </div>
            </div>

            {galleries.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Dokumentasi Event</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleries.map((gallery) => (
                    <div key={gallery.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      {gallery.image_url && (
                        <div className="relative h-48">
                          <Image
                            src={gallery.image_url}
                            alt={gallery.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{gallery.title}</h3>
                        {gallery.caption && (
                          <p className="text-gray-600 text-sm mb-3">{gallery.caption}</p>
                        )}
                        <div className="flex gap-3 text-xs">
                          {gallery.has_sign_language && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Bahasa Isyarat
                            </span>
                          )}
                          {gallery.has_subtitles && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Subtitle
                            </span>
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
