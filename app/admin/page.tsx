'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'

type DashboardStats = {
  total_users: number
  total_volunteers: number
  active_events: number
  upcoming_events: number
  total_registrations: number
  monthly_registrations: number
  total_galleries: number
  pending_registrations: number
}

// SVG Icons untuk dashboard stats
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const EventsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const RegistrationsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
)

const VolunteersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const PendingIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const GalleryIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

// SVG Icons untuk Quick Actions
const CreateEventIcon = () => (
  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
)

const ManageRegistrationsIcon = () => (
  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const UploadGalleryIcon = () => (
  <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h8m-4-4v8" />
  </svg>
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const PeopleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ImageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshAnim, setRefreshAnim] = useState(false)
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

    fetchStats()
  }, [user, userProfile, router])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('admin_dashboard_stats')
        .select('*')
        .single()

      if (error) throw error
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshAnim(true)
    await fetchStats()
    setTimeout(() => setRefreshAnim(false), 500)
  }

  if (!user || (userProfile && userProfile.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4 border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">Anda tidak memiliki akses ke halaman admin.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Selamat datang, <span className="font-semibold text-red-600">{userProfile?.name || user.email}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Online</span>
              </div>
              <button
                onClick={handleRefresh}
                className={`p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all ${refreshAnim ? 'animate-spin' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <UsersIcon />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : stats?.total_users || 0}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Total Pengguna</h3>
            <p className="text-sm text-gray-600">Jumlah pengguna terdaftar</p>
          </div>

          {/* Active Events Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <EventsIcon />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : stats?.active_events || 0}
                </div>
                <div className="text-sm text-gray-500">Aktif</div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Event Aktif</h3>
            <p className="text-sm text-gray-600">Event yang sedang berjalan</p>
          </div>

          {/* Total Registrations Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <RegistrationsIcon />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : stats?.total_registrations || 0}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Total Pendaftaran</h3>
            <p className="text-sm text-gray-600">Seluruh pendaftaran event</p>
          </div>

          {/* Volunteers Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <VolunteersIcon />
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {loading ? '...' : stats?.total_volunteers || 0}
                </div>
                <div className="text-sm text-gray-500">Relawan</div>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Total Relawan</h3>
            <p className="text-sm text-gray-600">Relawan aktif</p>
          </div>
        </div>

        {/* Additional Stats & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pending Registrations */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <PendingIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pendaftaran Tertunda</h3>
                <div className="text-3xl font-bold text-red-600 mt-2">
                  {loading ? '...' : stats?.pending_registrations || 0}
                </div>
              </div>
            </div>
            <Link 
              href="/admin/registrations" 
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <PeopleIcon />
              <span className="ml-2">Review Pendaftaran</span>
            </Link>
          </div>

          {/* Gallery Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <GalleryIcon />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Dokumentasi</h3>
                <div className="text-3xl font-bold text-red-600 mt-2">
                  {loading ? '...' : stats?.total_galleries || 0}
                </div>
              </div>
            </div>
            <Link 
              href="/admin/galleries" 
              className="flex items-center justify-center w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <ImageIcon />
              <span className="ml-2">Kelola Galeri</span>
            </Link>
          </div>

          {/* Monthly Stats */}
          <div className="bg-red-600 rounded-2xl shadow-lg p-6 lg:col-span-1 text-white">
            <div className="flex items-center mb-2">
              <CalendarIcon />
              <h3 className="font-semibold ml-2">Pendaftaran Bulan Ini</h3>
            </div>
            <div className="text-3xl font-bold mb-4">
              {loading ? '...' : stats?.monthly_registrations || 0}
            </div>
            <p className="text-red-100 text-sm">
              {stats?.monthly_registrations && stats.monthly_registrations > 0 
                ? `↑ ${Math.round((stats.monthly_registrations / (stats.total_registrations || 1)) * 100)}% dari total`
                : 'Belum ada pendaftaran bulan ini'
              }
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/events/create" 
              className="group bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-center"
            >
              <CreateEventIcon />
              <h3 className="font-semibold mb-2">Buat Event Baru</h3>
              <p className="text-red-100 text-sm">Buat event baru untuk komunitas</p>
            </Link>
            
            <Link 
              href="/admin/registrations" 
              className="group bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-center"
            >
              <ManageRegistrationsIcon />
              <h3 className="font-semibold mb-2">Kelola Pendaftaran</h3>
              <p className="text-red-100 text-sm">Kelola pendaftaran event</p>
            </Link>
            
            <Link 
              href="/admin/galleries" 
              className="group bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-center"
            >
              <UploadGalleryIcon />
              <h3 className="font-semibold mb-2">Upload Dokumentasi</h3>
              <p className="text-red-100 text-sm">Upload foto & video event</p>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
              <div className="text-center">
                <p className="text-gray-800 font-semibold">Memuat data...</p>
                <p className="text-gray-600 text-sm mt-1">Mengambil statistik terbaru</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}