'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../components/AuthProvider'
import { useRouter } from 'next/navigation'

type AnalyticsData = {
  total_users: number
  total_volunteers: number
  active_events: number
  upcoming_events: number
  total_registrations: number
  monthly_registrations: number
  total_galleries: number
  pending_registrations: number
}

type EventStatistic = {
  id: string
  title: string
  date_time: string
  location: string
  max_participants: number
  total_registrations: number
  confirmed_participants: number
  volunteer_registrations: number
  participation_rate: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsData | null>(null)
  const [eventStats, setEventStats] = useState<EventStatistic[]>([])
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

    fetchAnalytics()
    fetchEventStatistics()
  }, [user, userProfile, router])

  const fetchAnalytics = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const fetchEventStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('event_statistics')
        .select('*')
        .order('date_time', { ascending: false })

      if (error) throw error
      setEventStats(data || [])
    } catch (error) {
      console.error('Error fetching event statistics:', error)
    } finally {
      setLoading(false)
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
          <p className="text-lg text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics & Statistik</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Pengguna</h3>
            <p className="text-2xl font-bold text-blue-600">{stats?.total_users || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Event Aktif</h3>
            <p className="text-2xl font-bold text-green-600">{stats?.active_events || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Total Pendaftaran</h3>
            <p className="text-2xl font-bold text-purple-600">{stats?.total_registrations || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Relawan</h3>
            <p className="text-2xl font-bold text-orange-600">{stats?.total_volunteers || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Event Mendatang</h3>
            <p className="text-2xl font-bold text-indigo-600">{stats?.upcoming_events || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2">Pendaftaran Bulan Ini</h3>
            <p className="text-2xl font-bold text-teal-600">{stats?.monthly_registrations || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Statistik Event</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Event</th>
                  <th className="px-6 py-3 text-left">Tanggal</th>
                  <th className="px-6 py-3 text-left">Total Pendaftar</th>
                  <th className="px-6 py-3 text-left">Peserta Dikonfirmasi</th>
                  <th className="px-6 py-3 text-left">Relawan</th>
                  <th className="px-6 py-3 text-left">Tingkat Partisipasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {eventStats.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4">{event.title}</td>
                    <td className="px-6 py-4">
                      {new Date(event.date_time).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4">{event.total_registrations}</td>
                    <td className="px-6 py-4">{event.confirmed_participants}</td>
                    <td className="px-6 py-4">{event.volunteer_registrations}</td>
                    <td className="px-6 py-4">
                      {event.participation_rate ? `${event.participation_rate}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {eventStats.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada data statistik event.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}