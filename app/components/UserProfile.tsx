'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { useAuth } from '../components/AuthProvider'

interface Event {
  id: string
  title: string
  date_time: string
  location: string
  image_url?: string
  category: string[]
}

interface Registration {
  id: string
  event_id: string
  status: 'pending' | 'approved' | 'rejected'
  events: Event
  created_at: string
}

interface UserProfileWithBio {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER' | 'VOLUNTEER'
  phone?: string
  address?: string
  interests?: string[]
  location?: string
  bio?: string
}

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

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

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const LockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zm0 4h16M7 15h2" />
  </svg>
)

export default function UserProfile() {
  const router = useRouter()
  const { user, userProfile, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'dashboard'>('dashboard')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: ''
  })

  const fetchRegistrations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    if (userProfile) {
      const profileWithBio = userProfile as UserProfileWithBio
      setFormData({
        name: userProfile.name || '',
        email: user?.email || '',
        phone: userProfile.phone || '',
        bio: profileWithBio.bio || ''
      })
    }

    fetchRegistrations()
  }, [user, userProfile, router, fetchRegistrations])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    try {
      setUpdating(true)
      setMessage(null)

      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio
      } as Partial<UserProfileWithBio>)

      setMessage({
        type: 'success',
        text: 'Profile berhasil diperbarui!'
      })
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({
        type: 'error',
        text: 'Gagal memperbarui profile. Silakan coba lagi.'
      })
    } finally {
      setUpdating(false)
    }
  }

  const upcomingEvents = registrations.filter(reg => 
    new Date(reg.events.date_time) > new Date() && reg.status === 'approved'
  )

  const pastEvents = registrations.filter(reg => 
    new Date(reg.events.date_time) <= new Date() && reg.status === 'approved'
  )

  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockIcon />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">Silakan login untuk mengakses halaman ini.</p>
          <button 
            onClick={() => router.push('/auth/login')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
              <p className="text-gray-600 mt-1">
                Kelola profil dan lihat aktivitas Anda
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{userProfile?.name || 'User'}</h3>
                <p className="text-gray-600 text-sm">{user?.email}</p>
                <span className="inline-block px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium mt-2">
                  Member
                </span>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <DashboardIcon />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === 'profile'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserIcon />
                  <span>Edit Profil</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeTab === 'history'
                      ? 'bg-red-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <HistoryIcon />
                  <span>History Event</span>
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            {message && (
              <div className={`mb-6 p-4 rounded-xl ${
                message.type === 'success' 
                  ? 'bg-green-100 border border-green-200 text-green-700' 
                  : 'bg-red-100 border border-red-200 text-red-700'
              }`}>
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <CheckIcon />
                  ) : (
                    <XIcon />
                  )}
                  <span className="ml-2">{message.text}</span>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Saya</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-red-50 rounded-2xl p-6 text-center">
                      <div className="text-2xl font-bold text-red-600 mb-2">
                        {upcomingEvents.length}
                      </div>
                      <div className="text-gray-700">Event Mendatang</div>
                    </div>
                    <div className="bg-yellow-50 rounded-2xl p-6 text-center">
                      <div className="text-2xl font-bold text-yellow-600 mb-2">
                        {pendingRegistrations.length}
                      </div>
                      <div className="text-gray-700">Menunggu Konfirmasi</div>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-6 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-2">
                        {pastEvents.length}
                      </div>
                      <div className="text-gray-700">Event Selesai</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push('/events')}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-center"
                    >
                      Lihat Semua Event
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors text-center"
                    >
                      Lihat History
                    </button>
                  </div>
                </div>

                {upcomingEvents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Event Mendatang</h3>
                    <div className="space-y-4">
                      {upcomingEvents.slice(0, 3).map(reg => (
                        <div key={reg.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{reg.events.title}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon />
                                <span className="ml-1">
                                  {new Date(reg.events.date_time).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <LocationIcon />
                                <span className="ml-1">{reg.events.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            Disetujui
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profil</h2>
                
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Masukkan nomor telepon"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Menyimpan...</span>
                        </>
                      ) : (
                        <>
                          <EditIcon />
                          <span>Simpan Perubahan</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => router.push('/auth/change-password')}
                      className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors flex items-center space-x-2"
                    >
                      <LockIcon />
                      <span>Ubah Password</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                {pendingRegistrations.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Menunggu Konfirmasi</h3>
                    <div className="space-y-4">
                      {pendingRegistrations.map(reg => (
                        <div key={reg.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{reg.events.title}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon />
                                <span className="ml-1">
                                  {new Date(reg.events.date_time).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <LocationIcon />
                                <span className="ml-1">{reg.events.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium flex items-center space-x-1">
                            <ClockIcon />
                            <span>Menunggu</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingEvents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Event Mendatang</h3>
                    <div className="space-y-4">
                      {upcomingEvents.map(reg => (
                        <div key={reg.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{reg.events.title}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon />
                                <span className="ml-1">
                                  {new Date(reg.events.date_time).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <LocationIcon />
                                <span className="ml-1">{reg.events.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center space-x-1">
                            <CheckIcon />
                            <span>Disetujui</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pastEvents.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Event Selesai</h3>
                    <div className="space-y-4">
                      {pastEvents.map(reg => (
                        <div key={reg.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{reg.events.title}</h4>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <CalendarIcon />
                                <span className="ml-1">
                                  {new Date(reg.events.date_time).toLocaleDateString('id-ID')}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <LocationIcon />
                                <span className="ml-1">{reg.events.location}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            Selesai
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {registrations.length === 0 && (
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada event</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Anda belum mendaftar event apapun. Mulai jelajahi event yang tersedia!
                    </p>
                    <button
                      onClick={() => router.push('/events')}
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Jelajahi Event
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}