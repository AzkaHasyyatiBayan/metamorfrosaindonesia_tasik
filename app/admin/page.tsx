'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { requireAdmin } from '../lib/auth'
import { Icons } from '../components/Icons'

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshAnim, setRefreshAnim] = useState(false)
  const { user, userProfile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        await requireAdmin()
        fetchStats()
      } catch {
        router.push('/')
      }
    }

    if (user) {
      checkAdminAccess()
    } else {
      router.push('/auth/login')
    }
  }, [user, router])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Selamat datang, <span className="font-semibold text-red-600">{userProfile?.name || user?.email}</span>
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <Icons.User />
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

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <Icons.Calendar />
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

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <Icons.Manage />
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

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-xl group-hover:bg-red-200 transition-colors">
                <Icons.Community />
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <Icons.Pending />
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
              <Icons.User />
              <span className="ml-2">Review Pendaftaran</span>
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-red-100 rounded-xl mr-4">
                <Icons.Gallery />
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
              <Icons.Gallery />
              <span className="ml-2">Kelola Galeri</span>
            </Link>
          </div>

          <div className="bg-red-600 rounded-2xl shadow-lg p-6 lg:col-span-1 text-white">
            <div className="flex items-center mb-2">
              <Icons.Calendar />
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

        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/events/create" 
              className="group bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-center"
            >
              <Icons.Create />
              <h3 className="font-semibold mb-2">Buat Event Baru</h3>
              <p className="text-red-100 text-sm">Buat event baru untuk komunitas</p>
            </Link>
            
            <Link 
              href="/admin/registrations" 
              className="group bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-center"
            >
              <Icons.Manage />
              <h3 className="font-semibold mb-2">Kelola Pendaftaran</h3>
              <p className="text-red-100 text-sm">Kelola pendaftaran event</p>
            </Link>
            
            <Link 
              href="/admin/galleries" 
              className="group bg-red-600 hover:bg-red-700 text-white p-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-md text-center"
            >
              <Icons.Upload />
              <h3 className="font-semibold mb-2">Upload Dokumentasi</h3>
              <p className="text-red-100 text-sm">Upload foto & video event</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}