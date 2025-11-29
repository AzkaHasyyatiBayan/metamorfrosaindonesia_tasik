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

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL')
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

    fetchRegistrations()
  }, [user, userProfile, router])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_registrations_detail')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRegistrationStatus = async (registrationId: string, status: 'PENDING' | 'CONFIRMED' | 'REJECTED') => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', registrationId)

      if (error) throw error

      setRegistrations(registrations.map(reg =>
        reg.id === registrationId ? { ...reg, status } : reg
      ))
    } catch (error) {
      console.error('Error updating registration:', error)
    }
  }

  const filteredRegistrations = registrations.filter(reg =>
    filter === 'ALL' ? true : reg.status === filter
  )

  const getStatusCount = (status: string) => {
    return registrations.filter(r => r.status === status).length
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
          <p className="text-lg text-gray-600">Memuat data pendaftaran...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Kelola Pendaftaran</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Kelola dan verifikasi pendaftaran event dari peserta dan relawan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendaftaran</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{registrations.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{getStatusCount('PENDING')}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dikonfirmasi</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{getStatusCount('CONFIRMED')}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ditolak</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{getStatusCount('REJECTED')}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'ALL' as const, label: 'Semua', count: registrations.length, color: 'gray' },
              { key: 'PENDING' as const, label: 'Pending', count: getStatusCount('PENDING'), color: 'yellow' },
              { key: 'CONFIRMED' as const, label: 'Dikonfirmasi', count: getStatusCount('CONFIRMED'), color: 'green' },
              { key: 'REJECTED' as const, label: 'Ditolak', count: getStatusCount('REJECTED'), color: 'red' }
            ].map(({ key, label, count, color }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  filter === key 
                    ? `bg-${color}-600 text-white shadow-lg transform scale-105` 
                    : 'bg-white text-gray-700 shadow-md hover:shadow-lg hover:bg-gray-50'
                }`}
              >
                <span>{label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filter === key ? 'bg-white bg-opacity-20' : `bg-${color}-100 text-${color}-800`
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Peserta
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tipe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal Daftar
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{registration.user_name}</div>
                        <div className="text-sm text-gray-500">{registration.user_email}</div>
                        {registration.user_phone && (
                          <div className="text-sm text-gray-500">{registration.user_phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{registration.event_title}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(registration.event_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">{registration.event_location}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        registration.type === 'VOLUNTEER' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {registration.type === 'VOLUNTEER' ? '🤝 Relawan' : '👤 Peserta'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        registration.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-800'
                          : registration.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registration.status === 'CONFIRMED' ? '✅ Dikonfirmasi' : 
                         registration.status === 'REJECTED' ? '❌ Ditolak' : '⏳ Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(registration.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {registration.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateRegistrationStatus(registration.id, 'CONFIRMED')}
                              className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors duration-200 shadow-sm flex items-center space-x-1"
                            >
                              <span>✓</span>
                              <span>Konfirmasi</span>
                            </button>
                            <button
                              onClick={() => updateRegistrationStatus(registration.id, 'REJECTED')}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-200 shadow-sm flex items-center space-x-1"
                            >
                              <span>✕</span>
                              <span>Tolak</span>
                            </button>
                          </>
                        )}
                        {registration.status !== 'PENDING' && (
                          <button
                            onClick={() => updateRegistrationStatus(registration.id, 'PENDING')}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors duration-200 shadow-sm flex items-center space-x-1"
                          >
                            <span>↶</span>
                            <span>Reset</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pendaftaran</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                {filter === 'ALL' 
                  ? 'Belum ada pendaftaran event.' 
                  : `Tidak ada pendaftaran dengan status ${filter.toLowerCase()}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}