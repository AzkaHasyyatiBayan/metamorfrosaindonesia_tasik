 'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { avatarOptions } from '../../components/AvatarIcons'

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

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
)

interface Event {
  id: string
  title: string
  date_time: string
  location: string
  image_url?: string
  category: string[]
  max_participants?: number
}

interface Registration {
  id: string
  event_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  role: 'peserta' | 'volunteer'
  volunteer_type?: string
  events: Event
  created_at: string
  updated_at: string
}

interface FormData {
  name: string
  email: string
  phone: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  avatar: string
}

interface OriginalData {
  name: string
  email: string
  phone: string
  avatar: string
}

// Helper types for fallback join when PostgREST relationship is missing
interface RegistrationRow {
  id: string
  event_id: string
  user_id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  role: 'peserta' | 'volunteer'
  volunteer_type?: string
  created_at: string
  updated_at: string
}

// Helper function to safely map fallback join result to Registration type
function mapFallbackRegistrationForUser(reg: RegistrationRow, eventsMap: Record<string, Event>): Registration {
  return {
    ...reg,
    events: eventsMap[reg.event_id] || {
      id: reg.event_id,
      title: 'Unknown Event',
      date_time: '',
      location: '',
      category: [],
      max_participants: undefined
    }
  }
}

// Normalize registration row coming from DB/server to the shape expected by this component
function normalizeRegistrationForUser(raw: unknown): Registration {
  const r = raw as Record<string, unknown>
  const statusRaw: string = String(r['status'] || r['status_text'] || '')
  const typeRaw: string = String(r['type'] || r['role'] || '')

  // Map status from DB (possibly uppercase like 'PENDING'/'CONFIRMED')
  const status = ((): Registration['status'] => {
    const s = statusRaw.trim().toUpperCase()
    if (!s) return 'pending'
    if (s === 'PENDING') return 'pending'
    if (s === 'CONFIRMED' || s === 'APPROVED') return 'approved'
    if (s === 'REJECTED') return 'rejected'
    if (s === 'CANCELLED' || s === 'CANCELED') return 'cancelled'
    return s.toLowerCase() as Registration['status']
  })()

  // Map type -> role used in UI (DB may store 'PARTICIPANT'/'VOLUNTEER')
  const role = ((): Registration['role'] => {
    const t = typeRaw.trim().toUpperCase()
    if (!t) return 'peserta'
    if (t === 'PARTICIPANT') return 'peserta'
    if (t === 'VOLUNTEER') return 'volunteer'
    // fallback: if already in bahasa
    if (t === 'PESERTA') return 'peserta'
    return 'peserta'
  })()

  const volunteer_type = (r['volunteer_type'] as string) || (r['volunteerType'] as string) || undefined

  // events might be nested under `events` or `event` or provided separately
  const eventsCandidate = (r['events'] || r['event'] || r['events_detail']) as Record<string, unknown> | undefined
  const events = eventsCandidate ? {
    id: (eventsCandidate['id'] as string) || (r['event_id'] as string) || '',
    title: (eventsCandidate['title'] as string) || (r['event_title'] as string) || '',
    date_time: (eventsCandidate['date_time'] as string) || (r['event_date_time'] as string) || (r['date_time'] as string) || '',
    location: (eventsCandidate['location'] as string) || (r['event_location'] as string) || ''
    ,
    category: (eventsCandidate['category'] as string[]) || [],
    max_participants: (eventsCandidate['max_participants'] as number) || undefined
  } : {
    id: (r['event_id'] as string) || '',
    title: (r['event_title'] as string) || '',
    date_time: (r['event_date_time'] as string) || (r['date_time'] as string) || '',
    location: (r['event_location'] as string) || ''
    ,
    category: [],
    max_participants: undefined
  }

  return {
    id: (r['id'] as string),
    event_id: (r['event_id'] as string) || events.id,
    user_id: (r['user_id'] as string),
    status,
    role,
    volunteer_type,
    events,
    created_at: (r['created_at'] as string),
    updated_at: (r['updated_at'] as string)
  }
}

export default function UserProfile() {
  const router = useRouter()
  const { user, userProfile, loading: authLoading, updateUserProfile, refreshProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'dashboard'>('dashboard')
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [updating, setUpdating] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    avatar: 'flower'
  })
  const [originalData, setOriginalData] = useState<OriginalData>({
    name: '',
    email: '',
    phone: '',
    avatar: 'flower'
  })
  const [profileLoaded, setProfileLoaded] = useState(false)

  const fetchRegistrations = useCallback(async () => {
    try {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('registrations')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // If PostgREST reports no relationship between registrations and events,
        // fallback to fetching registrations and events separately and merging.
        // PGRST200 indicates missing relationship in the schema cache.
        if (error.code === 'PGRST200' || (error.message && String(error.message).includes('Could not find a relationship'))) {
          console.warn('Relationship registrations->events not found; falling back to manual join')

          const { data: regs, error: regsError } = await supabase
            .from('registrations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

          if (regsError) throw regsError

          const eventIds = Array.from(new Set((regs || []).map((r: RegistrationRow) => r.event_id).filter(Boolean)))

          let eventsMap: Record<string, Event> = {}
          if (eventIds.length > 0) {
            const { data: eventsData, error: eventsError } = await supabase
              .from('events')
              .select('*')
              .in('id', eventIds)

            if (eventsError) throw eventsError

            eventsMap = (eventsData as Event[] || []).reduce((acc: Record<string, Event>, ev: Event) => {
              acc[ev.id] = ev
              return acc
            }, {})
          }

          const mapped = (regs as RegistrationRow[] || []).map(r => mapFallbackRegistrationForUser(r, eventsMap))

          // Normalize fields (status, role, event shape) so UI logic is consistent
          setRegistrations(mapped.map(normalizeRegistrationForUser))
          return
        }

        console.error('Error fetching registrations:', error)
        throw error
      }

      // Normalize nested result as well
      setRegistrations((data || []).map(normalizeRegistrationForUser))
    } catch (error) {
      console.error('Error fetching registrations:', error)
      setMessage({
        type: 'error',
        text: 'Gagal memuat data pendaftaran event'
      })
    }
  }, [user?.id])

  useEffect(() => {
    if (authLoading) {
      console.log('🔄 Auth masih loading, tunggu...')
      return
    }

    if (!user) {
      console.log('🚫 No user, redirecting to login')
      router.push('/auth/login')
      return
    }

    console.log('✅ User found, loading profile data:', user.email)

    const timeoutId = setTimeout(() => {
      if (!profileLoaded) {
        console.log('⏰ Profile loading timeout, using default data')
        const defaultData = {
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: '',
          avatar: 'flower'
        }
        setFormData(prev => ({ ...prev, ...defaultData }))
        setOriginalData(defaultData)
        setProfileLoaded(true)
      }
    }, 3000)

    if (userProfile) {
      const profileData = {
        name: userProfile.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        phone: userProfile.phone || '',
        avatar: userProfile.avatar_url || 'flower'
      }
      setFormData(prev => ({
        ...prev,
        ...profileData
      }))
      setOriginalData(profileData)
      setProfileLoaded(true)
      clearTimeout(timeoutId)
      
      fetchRegistrations()
    }

    return () => clearTimeout(timeoutId)
  }, [user, userProfile, router, authLoading, profileLoaded, fetchRegistrations])

  const hasProfileChanges = (): boolean => {
    return (
      formData.name !== originalData.name ||
      formData.phone !== originalData.phone ||
      formData.avatar !== originalData.avatar
    )
  }

  const hasPasswordChanges = (): boolean => {
    return (
      formData.newPassword.trim() !== '' && 
      formData.newPassword === formData.confirmPassword
    )
  }

  const updateProfileOnly = async (): Promise<boolean> => {
    try {
      console.log('🔄 Updating profile data...')
      
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        avatar_url: formData.avatar,
        updated_at: new Date().toISOString()
      }

      await updateUserProfile(updateData)
      
      await refreshProfile()
      
      setOriginalData({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: formData.avatar
      })

      console.log('✅ Profile updated successfully')
      return true
    } catch (error) {
      console.error('❌ Error updating profile:', error)
      throw error
    }
  }

  const updatePasswordOnly = async (): Promise<boolean> => {
    try {
      console.log('🔑 Updating password...')
      
      if (!formData.currentPassword) {
        throw new Error('Harap masukkan password saat ini')
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: formData.currentPassword
      })

      if (signInError) {
        throw new Error('Password saat ini salah')
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        throw updateError
      }

      console.log('✅ Password updated successfully')
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))

      return true
    } catch (error) {
      console.error('❌ Error updating password:', error)
      throw error
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) return

    const profileChanged = hasProfileChanges()
    const passwordChanged = hasPasswordChanges()

    if (!profileChanged && !passwordChanged) {
      setMessage({
        type: 'error',
        text: 'Tidak ada perubahan yang perlu disimpan.'
      })
      return
    }

    if (passwordChanged) {
      if (formData.newPassword.length < 6) {
        setMessage({
          type: 'error',
          text: 'Password baru harus minimal 6 karakter.'
        })
        return
      }
    }

    try {
      setMessage(null)
      
      if (profileChanged && passwordChanged) {
        setUpdating(true)
        await updateProfileOnly()
        setUpdatingPassword(true)
        await updatePasswordOnly()
      } else if (profileChanged) {
        setUpdating(true)
        await updateProfileOnly()
      } else if (passwordChanged) {
        setUpdatingPassword(true)
        await updatePasswordOnly()
      }

      setMessage({
        type: 'success',
        text: 'Perubahan berhasil disimpan!'
      })

      console.log('🎉 All updates completed successfully')
      
    } catch (error: unknown) {
      console.error('💥 Error updating:', error)
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan perubahan. Silakan coba lagi.'
      setMessage({
        type: 'error',
        text: errorMessage
      })
    } finally {
      setUpdating(false)
      setUpdatingPassword(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      ...formData,
      name: originalData.name,
      phone: originalData.phone,
      avatar: originalData.avatar,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setMessage(null)
  }

  const handleBackClick = () => {
    router.push('/')
  }

  const upcomingEvents = registrations.filter(reg => 
    new Date(reg.events.date_time) > new Date() && reg.status === 'approved'
  )

  const pastEvents = registrations.filter(reg => 
    new Date(reg.events.date_time) <= new Date() && reg.status === 'approved'
  )

  const pendingRegistrations = registrations.filter(reg => reg.status === 'pending')

  if (authLoading && !profileLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat profile...</p>
          <p className="text-sm text-gray-500 mt-2">Menyiapkan data Anda</p>
        </div>
      </div>
    )
  }

  if (!authLoading && !user) {
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
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex-1">
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
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  avatarOptions.find(a => a.id === formData.avatar)?.color || 'bg-red-100 text-red-600'
                }`}>
                  {avatarOptions.find(a => a.id === formData.avatar)?.icon || <UserIcon />}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{formData.name || 'User'}</h3>
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
                      onClick={() => router.push('/user/events')}
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
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Pilih Avatar
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                      {avatarOptions.map((avatar) => (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setFormData({...formData, avatar: avatar.id})}
                          className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                            formData.avatar === avatar.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatar.color}`}>
                            {avatar.icon}
                          </div>
                          <span className="text-xs mt-2 text-gray-600">{avatar.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
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

                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <LockIcon />
                      <h3 className="text-lg font-semibold text-gray-900">Ubah Password</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Kosongkan field password jika tidak ingin mengubah password
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Password Saat Ini
                        </label>
                        <input
                          type="password"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                          placeholder="Masukkan password saat ini"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Password Baru
                          </label>
                          <input
                            type="password"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="Masukkan password baru"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Konfirmasi Password Baru
                          </label>
                          <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            placeholder="Konfirmasi password baru"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={updating || updatingPassword}
                      className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                    >
                      {(updating || updatingPassword) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>
                            {updatingPassword ? 'Mengupdate Password...' : 'Menyimpan...'}
                          </span>
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
                      onClick={handleCancel}
                      disabled={updating || updatingPassword}
                      className="bg-gray-500 hover:bg-gray-600 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Batal
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
                            <div className="mt-2 text-xs text-gray-500">
                              Role: {reg.role === 'volunteer' ? 'Relawan' : 'Peserta'}
                              {reg.volunteer_type && ` - ${reg.volunteer_type}`}
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
                            <div className="mt-2 text-xs text-gray-500">
                              Role: {reg.role === 'volunteer' ? 'Relawan' : 'Peserta'}
                              {reg.volunteer_type && ` - ${reg.volunteer_type}`}
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
                            <div className="mt-2 text-xs text-gray-500">
                              Role: {reg.role === 'volunteer' ? 'Relawan' : 'Peserta'}
                              {reg.volunteer_type && ` - ${reg.volunteer_type}`}
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