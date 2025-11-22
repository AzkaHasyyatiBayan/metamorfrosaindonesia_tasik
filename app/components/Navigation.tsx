'use client'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navigation() {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">
              <Link href="/">Metamorfrosa Tasik</Link>
            </div>
            <div className="flex gap-6 items-center">
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">
            <Link href="/">Metamorfrosa Tasik</Link>
          </div>
          <div className="flex gap-6 items-center">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">
              Beranda
            </Link>
            <Link href="/events" className="text-gray-700 hover:text-blue-600 transition-colors">
              Event
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors">
              Tentang Kami
            </Link>
            {user ? (
              <div className="flex gap-6 items-center">
                {userProfile?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600 transition-colors">
                    Admin
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link href="/auth/login" className="text-gray-700 hover:text-blue-600 transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}