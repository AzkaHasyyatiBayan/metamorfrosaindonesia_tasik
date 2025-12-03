'use client'

import { useState } from 'react'
import Image from 'next/image'
import RegistrationForm from './RegistrationForm'

export type Event = {
  id: string
  title: string
  description: string
  date_time: string
  location: string
  category: string[]
  max_participants?: number | null
  image_url?: string | null
  is_active: boolean
  creator_id: string
  created_at: string
  updated_at: string
}

interface EventCardProps {
  event: Event
  onShowDetail?: (event: Event) => void
}

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

export default function EventCard({ event, onShowDetail }: EventCardProps) {
  const [imageError, setImageError] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showRegistration, setShowRegistration] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const handleShowDetail = () => {
    if (onShowDetail) {
      onShowDetail(event)
    } else {
      setShowModal(true)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setShowRegistration(false)
  }

  return (
    <>
      <div className="group relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden hover:shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative h-52 overflow-hidden shrink-0">
          {event.image_url && !imageError ? (
            <Image
              src={event.image_url}
              alt={event.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
              onError={() => setImageError(true)}
              unoptimized
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #DC2626)'
              }}
            >
              <div className="text-white/50">
                 <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
              </div>
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
            {event.category.slice(0, 2).map((cat) => (
              <span 
                key={cat} 
                className="px-3 py-1 bg-white/95 backdrop-blur-md text-red-600 text-xs font-bold rounded-full shadow-sm border border-red-100"
              >
                {cat.replace('_', ' ')}
              </span>
            ))}
            {event.category.length > 2 && (
              <span className="px-3 py-1 bg-white/95 backdrop-blur-md text-gray-600 text-xs font-bold rounded-full shadow-sm border border-gray-200">
                +{event.category.length - 2}
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
        </div>

        <div className="p-6 flex flex-col flex-1 relative z-10">
          <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors tracking-tight">
            {event.title}
          </h3>

          <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed flex-1">
            {truncateDescription(event.description)}
          </p>

          <div className="space-y-3 mb-6 pt-4 border-t border-gray-100/50">
            <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              <div className="p-2 rounded-full bg-red-50 text-red-500 mr-3">
                 <CalendarIcon />
              </div>
              <span className="font-medium">
                {formatDate(event.date_time)} • {formatTime(event.date_time)}
              </span>
            </div>

            <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
              <div className="p-2 rounded-full bg-red-50 text-red-500 mr-3">
                 <LocationIcon />
              </div>
              <span className="truncate">{event.location}</span>
            </div>

            {event.max_participants && (
              <div className="flex items-center text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                <div className="p-2 rounded-full bg-red-50 text-red-500 mr-3">
                   <UsersIcon />
                </div>
                <span>Kapasitas: <span className="font-semibold">{event.max_participants}</span> orang</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleShowDetail}
            className="w-full relative overflow-hidden bg-linear-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-red-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center group/btn"
          >
            <span className="relative z-10">Lihat Detail</span>
            <svg className="w-4 h-4 ml-2 relative z-10 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent to-white opacity-20 group-hover/btn:animate-shine" />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-2xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/50 shadow-2xl relative">
            
            <div className="relative">
                {event.image_url && (
                  <div className="relative h-64 md:h-72 w-full">
                     <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                     />
                     <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"></div>
                     <button
                        onClick={handleCloseModal}
                        className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                )}
                
                {!event.image_url && (
                   <button
                    onClick={handleCloseModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
            </div>

            <div className="p-8">
              {!event.image_url && (
                 <h2 className="text-3xl font-bold text-gray-900 mb-6">{event.title}</h2>
              )}
              
              {event.image_url && (
                 <h2 className="text-3xl font-bold mb-6 -mt-16 relative z-10 text-white drop-shadow-md">{event.title}</h2>
              )}

              {!showRegistration ? (
                <>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-3">Tentang Event</h3>
                      <p className="text-gray-600 leading-relaxed text-lg">{event.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-red-500">
                           <CalendarIcon />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase font-bold">Waktu</p>
                           <p className="text-gray-900 font-medium">{formatDate(event.date_time)}</p>
                           <p className="text-gray-600 text-sm">{formatTime(event.date_time)}</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm text-red-500">
                           <LocationIcon />
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 uppercase font-bold">Lokasi</p>
                           <p className="text-gray-900 font-medium">{event.location}</p>
                        </div>
                      </div>

                      {event.max_participants && (
                        <div className="flex items-start space-x-4 md:col-span-2">
                          <div className="p-3 bg-white rounded-xl shadow-sm text-red-500">
                             <UsersIcon />
                          </div>
                          <div>
                             <p className="text-xs text-gray-400 uppercase font-bold">Kapasitas</p>
                             <p className="text-gray-900 font-medium">{event.max_participants} Peserta</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {event.category.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Kategori & Aksesibilitas</h3>
                        <div className="flex flex-wrap gap-2">
                          {event.category.map((cat) => (
                            <span 
                              key={cat}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              {cat.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Tutup
                    </button>
                    <button
                      onClick={() => setShowRegistration(true)}
                      className="px-8 py-3.5 bg-linear-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                      Daftar Event
                    </button>
                  </div>
                </>
              ) : (
                <div className="animate-fadeIn">
                   <div className="flex items-center mb-6">
                      <button 
                        onClick={() => setShowRegistration(false)}
                        className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                      >
                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                      </button>
                      <h3 className="text-xl font-bold text-gray-900">Formulir Pendaftaran</h3>
                   </div>
                   <RegistrationForm eventId={event.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}