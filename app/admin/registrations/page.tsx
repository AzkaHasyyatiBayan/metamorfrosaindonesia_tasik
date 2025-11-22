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

    if (userProfile && userProfile.role !== 'ADMIN') {
      router.push('/')
      return
    }

    fetchRegistrations()
  }, [user, userProfile, router])

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants_detail')
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
          <p className="text-lg text-gray-600">Loading registrations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Kelola Pendaftaran</h1>

        <div className="mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Semua ({registrations.length})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'PENDING' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Pending ({registrations.filter(r => r.status === 'PENDING').length})
            </button>
            <button
              onClick={() => setFilter('CONFIRMED')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'CONFIRMED' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Dikonfirmasi ({registrations.filter(r => r.status === 'CONFIRMED').length})
            </button>
            <button
              onClick={() => setFilter('REJECTED')}
              className={`px-4 py-2 rounded-lg ${
                filter === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              Ditolak ({registrations.filter(r => r.status === 'REJECTED').length})
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">User</th>
                <th className="px-6 py-3 text-left">Event</th>
                <th className="px-6 py-3 text-left">Tipe</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Tanggal Daftar</th>
                <th className="px-6 py-3 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{registration.user_name}</div>
                      <div className="text-sm text-gray-500">{registration.user_email}</div>
                      {registration.user_phone && (
                        <div className="text-sm text-gray-500">{registration.user_phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium">{registration.event_title}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(registration.event_date).toLocaleDateString('id-ID')}
                      </div>
                      <div className="text-sm text-gray-500">{registration.event_location}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      registration.type === 'VOLUNTEER' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {registration.type === 'VOLUNTEER' ? 'Relawan' : 'Peserta'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      registration.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-800'
                        : registration.status === 'REJECTED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {registration.status === 'CONFIRMED' ? 'Dikonfirmasi' : 
                       registration.status === 'REJECTED' ? 'Ditolak' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(registration.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    {registration.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => updateRegistrationStatus(registration.id, 'CONFIRMED')}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Konfirmasi
                        </button>
                        <button
                          onClick={() => updateRegistrationStatus(registration.id, 'REJECTED')}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Tolak
                        </button>
                      </>
                    )}
                    {registration.status !== 'PENDING' && (
                      <button
                        onClick={() => updateRegistrationStatus(registration.id, 'PENDING')}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Reset
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {filter === 'ALL' 
                  ? 'Belum ada pendaftaran.' 
                  : `Tidak ada pendaftaran dengan status ${filter.toLowerCase()}.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}