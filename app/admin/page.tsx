'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import { requireAdmin } from '../lib/auth'
import { getAdminStats } from '../lib/data'
import { Icons } from '../components/Icons'

type DashboardStats = {
  totalEvents: number
  upcomingEvents: number
  totalRegistrations: number
  totalVolunteers: number
  participationRate: number
  pendingRegistrations: number
  confirmedRegistrations: number
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
      const data = await getAdminStats()
      setStats(data as unknown as DashboardStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshAnim(true)
    await fetchStats()
    setTimeout(() => setRefreshAnim(false), 800)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-red-200 rounded-full opacity-50"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Memuat dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Dashboard Overview
              </h1>
              <p className="text-gray-500 mt-1 text-sm md:text-base flex items-center gap-2">
                Selamat datang kembali, 
                <span className="font-semibold text-red-600 bg-red-50 px-3 py-0.5 rounded-full border border-red-100">
                  {userProfile?.name || user?.email}
                </span>
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">Online</span>
              </div>
              
              <div className="h-6 w-px bg-gray-200"></div>

              <button
                onClick={handleRefresh}
                className="group flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-2"
                title="Refresh Data"
              >
                <span className="text-sm font-medium hidden sm:block group-hover:text-red-600">Refresh</span>
                <div className={`p-1.5 rounded-full group-hover:bg-red-50 transition-all ${refreshAnim ? 'animate-spin text-red-600' : ''}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pengguna</p>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {stats?.totalEvents || 0}
                </h3>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-all duration-300">
                <Icons.User />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Terdaftar di sistem</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Event Aktif</p>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {stats?.upcomingEvents || 0}
                </h3>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-all duration-300">
                <Icons.Calendar />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Sedang berjalan</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Pendaftaran</p>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {stats?.totalRegistrations || 0}
                </h3>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-all duration-300">
                <Icons.Manage />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Semua partisipasi</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md hover:border-red-200 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Relawan</p>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                  {stats?.totalVolunteers || 0}
                </h3>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-gray-600 group-hover:bg-red-50 group-hover:text-red-600 transition-all duration-300">
                <Icons.Community />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Kontributor aktif</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-red-300 transition-all duration-300">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-100">
                  <Icons.Pending />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Menunggu Persetujuan</h3>
                  <p className="text-sm text-gray-500">Pendaftaran perlu review</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats?.pendingRegistrations || 0}</span>
                <span className="text-sm text-gray-400 font-medium">pending</span>
              </div>
            </div>
            <Link 
              href="/admin/registrations?status=PENDING" 
              className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center justify-between group"
            >
              Review Pendaftaran
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:border-red-300 transition-all duration-300">
            <div className="p-6 flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-100">
                  <Icons.Gallery />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dokumentasi & Galeri</h3>
                  <p className="text-sm text-gray-500">Media event terkonfirmasi</p>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{stats?.confirmedRegistrations || 0}</span>
                <span className="text-sm text-gray-400 font-medium">items</span>
              </div>
            </div>
            <Link 
              href="/admin/galleries" 
              className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm font-medium text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors flex items-center justify-between group"
            >
              Kelola Galeri
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </Link>
          </div>

          <div className="bg-red-600 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-white opacity-10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Icons.Calendar /> 
                </div>
                <h3 className="font-medium text-red-50">Tingkat Partisipasi</h3>
              </div>
              
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold tracking-tight">
                  {!isNaN(Number(stats?.participationRate)) ? stats?.participationRate : 0}
                </span>
                <span className="text-2xl font-medium text-red-200">%</span>
              </div>
              
              <p className="text-red-100 text-sm mt-4 pt-4 border-t border-red-500/50">
                {!isNaN(Number(stats?.participationRate)) && (stats?.participationRate || 0) > 0 
                  ? 'Pertumbuhan positif bulan ini.'
                  : 'Menunggu data pendaftaran.'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-red-600"></span>
            Aksi Cepat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href="/admin/events/create" 
              className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                  <Icons.Create />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Buat Event Baru</h3>
                <p className="text-xs text-gray-500">Mulai kampanye atau acara baru</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/registrations" 
              className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <Icons.Manage />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Kelola Pendaftaran</h3>
                <p className="text-xs text-gray-500">Verifikasi data peserta masuk</p>
              </div>
            </Link>
            
            <Link 
              href="/admin/galleries" 
              className="group relative overflow-hidden bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-300"
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                  <Icons.Upload />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Upload Dokumentasi</h3>
                <p className="text-xs text-gray-500">Perbarui galeri kegiatan</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}