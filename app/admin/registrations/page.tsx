'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'

type Registration = {
  id: string
  type: 'PARTICIPANT' | 'VOLUNTEER'
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED'
  notes: string
  created_at: string
  user_name: string
  user_email: string
  user_phone: string
  event_title: string
  event_date: string
  event_location: string
}

// Simple registration row from DB
interface DBRegistrationRow {
  id: string
  event_id: string
  user_id: string
  type?: string
  role?: string
  status?: string
  notes?: string | null
  created_at: string
}

// Simple event row from DB
interface DBEventRow {
  id: string
  title: string
  date_time: string
  location: string
}

// Simple profile row from DB
interface DBProfileRow {
  id: string
  name: string
  email: string
  phone?: string | null
}

// --- ICON COMPONENTS (SVG) ---

const UserIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const MailIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ClipboardIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)

const CheckCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const XCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

// Helper to safely map fetched rows to typed Registration
const mapFallbackRegistration = (reg: DBRegistrationRow, eventsMap: Record<string, DBEventRow>, profilesMap: Record<string, DBProfileRow>): Registration => {
  const event = eventsMap[reg.event_id] || { id: reg.event_id, title: 'Unknown', date_time: '', location: '' }
  const profile = profilesMap[reg.user_id] || { id: reg.user_id, name: 'Unknown', email: '', phone: null }

  const normalizeStatus = (s?: string) => {
    if (!s) return 'PENDING'
    const v = String(s).toLowerCase()
    if (v === 'confirmed' || v === 'approved' || v === 'konfirmasi' || v === 'accept' || v === 'accepted') return 'CONFIRMED'
    if (v === 'rejected' || v === 'reject' || v === 'tolak') return 'REJECTED'
    return 'PENDING'
  }

  const normalizeType = (t?: string) => {
    if (!t) return 'PARTICIPANT'
    const v = String(t).toLowerCase()
    if (v === 'volunteer' || v === 'relawan') return 'VOLUNTEER'
    return 'PARTICIPANT'
  }

  return {
    id: reg.id,
    type: normalizeType(reg.type || reg.role),
    status: normalizeStatus(reg.status) as 'PENDING' | 'CONFIRMED' | 'REJECTED',
    notes: reg.notes || '',
    created_at: reg.created_at,
    user_name: profile.name,
    user_email: profile.email,
    user_phone: profile.phone || '',
    event_title: event.title,
    event_date: event.date_time,
    event_location: event.location,
  }
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [page] = useState(0)
  const pageSize = 20
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const [countsByStatus, setCountsByStatus] = useState<Record<string, number> | null>(null)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL')
  
  const { user, userProfile, isAdmin } = useAuth()
  const router = useRouter()
  
  const fetchCounts = async () => {
    try {
      const mapping: Record<string, string[]> = {
        PENDING: ['pending'],
        CONFIRMED: ['approved', 'confirmed', 'accepted'],
        REJECTED: ['rejected']
      }
      
      const result: Record<string, number> = { PENDING: 0, CONFIRMED: 0, REJECTED: 0 }
      
      for (const key of Object.keys(mapping)) {
        const dbStatuses = mapping[key]
        let c = 0
        
        const { count } = await supabase
            .from('registrations')
            .select('id', { count: 'exact' })
            .in('status', dbStatuses)
        c = count ?? 0
        
        result[key] = c
      }
      setCountsByStatus(result)
    } catch (err) {
      console.warn('Failed to fetch status counts:', err)
    }
  }

  const fetchRegistrations = async () => {
    try {
      setLoading(true)
      const from = page * pageSize
      const to = from + pageSize - 1

      const { data: regsData, error: regsError, count: regsCount } = await supabase
        .from('registrations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (regsError) throw regsError

      if (!regsData || regsData.length === 0) {
        setRegistrations([])
        setTotalCount(regsCount ?? 0)
        await fetchCounts()
        return
      }

      const eventIds = Array.from(new Set(regsData.map(r => r.event_id).filter(Boolean)))
      const userIds = Array.from(new Set(regsData.map(r => r.user_id).filter(Boolean)))

      let eventsMap: Record<string, DBEventRow> = {}
      if (eventIds.length > 0) {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('id, title, date_time, location')
          .in('id', eventIds)

        if (!eventsError && eventsData) {
          eventsMap = (eventsData || []).reduce((acc: Record<string, DBEventRow>, ev: DBEventRow) => {
            acc[ev.id] = ev
            return acc
          }, {})
        }
      }

      let profilesMap: Record<string, DBProfileRow> = {}
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email, phone')
          .in('id', userIds)

        if (!profilesError && profilesData) {
          profilesMap = (profilesData || []).reduce((acc: Record<string, DBProfileRow>, p: DBProfileRow) => {
            acc[p.id] = p
            return acc
          }, {})
        }
      }

      const mapped = (regsData || []).map(r => mapFallbackRegistration(r, eventsMap, profilesMap))
      
      setRegistrations(mapped)
      setTotalCount(regsCount ?? null)
      
      await fetchCounts()
      
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRegistrationStatus = async (registrationId: string, status: 'PENDING' | 'CONFIRMED' | 'REJECTED') => {
    try {
      const dbStatusMap: Record<string, string> = {
        PENDING: 'pending',
        CONFIRMED: 'approved',
        REJECTED: 'rejected',
      }
      
      const dbStatus = dbStatusMap[status] ?? String(status).toLowerCase()

      const { error } = await supabase
        .from('registrations')
        .update({ status: dbStatus })
        .eq('id', registrationId)

      if (error) throw error

      setRegistrations(registrations.map(reg => 
        reg.id === registrationId ? { ...reg, status } : reg
      ))
      
      fetchCounts()

    } catch (error) {
      console.error('Error updating registration:', error)
      alert('Gagal memperbarui status pendaftaran')
    }
  }

  useEffect(() => {
    if (user && isAdmin) {
      fetchRegistrations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin, page])

  const filteredRegistrations = registrations.filter(reg => 
    filter === 'ALL' ? true : reg.status === filter
  )

  const getStatusCount = (status: string) => {
    if (countsByStatus && countsByStatus[status] !== undefined) return countsByStatus[status]
    return registrations.filter(r => r.status === status).length
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

  if (loading && registrations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-red-100 rounded-full opacity-50"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 font-medium animate-pulse">Memuat data pendaftaran...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kelola Pendaftaran</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Verifikasi data peserta dan relawan untuk setiap event
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pendaftaran</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalCount ?? registrations.length}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <ClipboardIcon />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">{getStatusCount('PENDING')}</p>
              </div>
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
                <ClockIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Dikonfirmasi</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{getStatusCount('CONFIRMED')}</p>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <CheckCircleIcon />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ditolak</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{getStatusCount('REJECTED')}</p>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <XCircleIcon />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {[
              { key: 'ALL' as const, label: 'Semua', count: totalCount ?? registrations.length, color: 'black' },
              { key: 'PENDING' as const, label: 'Pending', count: getStatusCount('PENDING'), color: 'yellow' },
              { key: 'CONFIRMED' as const, label: 'Dikonfirmasi', count: getStatusCount('CONFIRMED'), color: 'green' },
              { key: 'REJECTED' as const, label: 'Ditolak', count: getStatusCount('REJECTED'), color: 'red' }
            ].map(({ key, label, count, color }) => {
              const isActive = filter === key
              return (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? `bg-${color === 'black' ? 'black-900' : color + '500'} text-white shadow-md transform scale-[1.02]` 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                    }
                  `}
                >
                  {label}
                  <span className={`
                    px-2 py-0.5 rounded-md text-xs font-bold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : `bg-${color}-50 text-${color}-600`
                    }
                  `}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Peserta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Event Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tanggal Daftar
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* User Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                          <UserIcon />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{registration.user_name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <MailIcon />
                            <span className="truncate max-w-[150px]">{registration.user_email}</span>
                          </div>
                          {registration.user_phone && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                              <PhoneIcon />
                              <span>{registration.user_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Event Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg text-gray-500 mt-0.5">
                          <CalendarIcon />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 truncate max-w-[200px]" title={registration.event_title}>
                            {registration.event_title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(registration.event_date).toLocaleDateString('id-ID', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPinIcon />
                            <span className="truncate max-w-[150px]">{registration.event_location}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border
                        ${registration.type === 'VOLUNTEER' 
                          ? 'bg-purple-50 text-purple-700 border-purple-100' 
                          : 'bg-blue-50 text-blue-700 border-blue-100'
                        }
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${registration.type === 'VOLUNTEER' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                        {registration.type === 'VOLUNTEER' ? 'Relawan' : 'Peserta'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border
                        ${registration.status === 'CONFIRMED'
                          ? 'bg-green-50 text-green-700 border-green-100'
                          : registration.status === 'REJECTED'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                        }
                      `}>
                        {registration.status === 'CONFIRMED' && <CheckIcon />}
                        {registration.status === 'REJECTED' && <XIcon />}
                        {registration.status === 'PENDING' && <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>}
                        
                        {registration.status === 'CONFIRMED' ? 'Dikonfirmasi' : registration.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {registration.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => updateRegistrationStatus(registration.id, 'CONFIRMED')}
                            className="p-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg transition-colors"
                            title="Terima"
                          >
                            <CheckIcon />
                          </button>
                          <button
                            onClick={() => updateRegistrationStatus(registration.id, 'REJECTED')}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors"
                            title="Tolak"
                          >
                            <XIcon />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 italic">
                           Selesai
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gray-50 rounded-full mb-3">
                          <ClipboardIcon />
                        </div>
                        <p className="text-gray-900 font-medium">Tidak ada data ditemukan</p>
                        <p className="text-gray-500 text-sm mt-1">Coba ubah filter status di atas</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}