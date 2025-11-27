'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../components/AuthProvider'
import AdminSidebar from '../components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('🚫 No user, redirecting to login')
        router.push('/auth/login')
        return
      }

      if (!isAdmin) {
        console.log('🚫 Not admin, redirecting to home')
        router.push('/')
        return
      }
    }
  }, [user, isAdmin, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memverifikasi akses admin...</p>
          <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
