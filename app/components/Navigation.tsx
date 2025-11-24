'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'

interface AppUser {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  avatar_url?: string
}

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function Navbar() {
  const [user, setUser] = useState<AppUser | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log('🔄 Fetching profile for user:', userId)
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      // Jika profile tidak ditemukan (error PGRST116), coba buat profile
      if (error && error.code === 'PGRST116') {
        console.log('📝 Profile not found, getting user data from auth...')
        
        // Dapatkan data user dari auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('❌ Error getting auth user:', authError)
          setUser(null)
          return
        }

        if (authUser) {
          console.log('👤 Creating profile for:', authUser.email)
          
          // Buat profile baru menggunakan RPC atau direct insert
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                role: 'user'
              }
            ])
            .select()
            .single()

          if (createError) {
            console.error('❌ Error creating profile:', createError)
            // Jika gagal buat profile, tetap set user dengan data dari auth
            setUser({
              id: authUser.id,
              name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: 'user'
            })
            return
          }

          if (newProfile) {
            console.log('✅ Profile created successfully')
            setUser({
              id: newProfile.id,
              name: newProfile.name,
              email: newProfile.email,
              role: newProfile.role,
              avatar_url: newProfile.avatar_url,
            })
            return
          }
        }
      } else if (error) {
        // Error lainnya
        console.error('❌ Error fetching profile:', error)
        setUser(null)
        return
      }

      // Jika profile ditemukan
      if (profile) {
        console.log('✅ Profile found:', profile.email)
        setUser({
          id: profile.id,
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email,
          role: profile.role || 'user',
          avatar_url: profile.avatar_url,
        })
      }
    } catch (error) {
      console.error('💥 Error in fetchUserProfile:', error)
      setUser(null)
    }
  }, [])

  const checkUser = useCallback(async () => {
    try {
      console.log('🔍 Checking user session...')
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('👤 User session found:', session.user.email)
        await fetchUserProfile(session.user.id)
      } else {
        console.log('🚫 No user session')
        setUser(null)
      }
    } catch (error) {
      console.error('❌ Error checking user:', error)
      setUser(null)
    } finally {
      setLoading(false)
      console.log('🏁 Loading complete')
    }
  }, [fetchUserProfile])

  useEffect(() => {
    checkUser()
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event)
        
        if (event === 'SIGNED_IN' && session) {
          console.log('🔐 User signed in:', session.user.email)
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out')
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [checkUser, fetchUserProfile])

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...')
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setIsDropdownOpen(false)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('❌ Error logging out:', error)
    }
  }

  const handleImageError = () => {
    setLogoError(true)
  }

  const isActive = (path: string) => pathname === path

  // Jangan tampilkan navbar di halaman admin
  if (pathname.startsWith('/admin')) {
    return null
  }

  // Tampilkan loading state
  if (loading) {
    return (
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-3xl font-disney tracking-wide text-gray-900">
                Metamorfosa
              </span>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo dan Nama Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-700 transition-colors duration-200 overflow-hidden">
                {!logoError ? (
                  <Image 
                    src="/logo.jpg" 
                    alt="Metamorfosa Logo" 
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                    priority
                  />
                ) : (
                  <span className="text-white font-bold text-lg">M</span>
                )}
              </div>
              <span className="text-3xl font-disney tracking-wide text-gray-900">
                Metamorfosa
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Beranda
            </Link>
            <Link 
              href="/events" 
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/events') 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Event
            </Link>
            <Link 
              href="/about" 
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/about') 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Tentang Kami
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center border border-red-200">
                    <span className="text-red-600 text-sm font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="max-w-32 truncate">{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    {/* Hanya tampilkan Dashboard Admin untuk admin */}
                    {user.role === 'admin' && (
                      <Link 
                        href="/admin" 
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <SettingsIcon />
                        <span>Dashboard Admin</span>
                      </Link>
                    )}
                    
                    {/* Profil Saya untuk semua user */}
                    <Link 
                      href="/profile" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <ProfileIcon />
                      <span>Profil Saya</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        <LogoutIcon />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/login" 
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2"
                >
                  Masuk
                </Link>
                <Link 
                  href="/auth/register" 
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors duration-200 shadow-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-red-600 transition-colors duration-200 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link 
                href="/events" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Event
              </Link>
              <Link 
                href="/about" 
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tentang Kami
              </Link>
              
              {user ? (
                <>
                  <div className="px-4 py-2 border-t border-gray-200 mt-2 pt-4">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  
                  {/* Hanya tampilkan Dashboard Admin untuk admin di mobile */}
                  {user.role === 'admin' && (
                    <Link 
                      href="/admin" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <SettingsIcon />
                      <span>Dashboard Admin</span>
                    </Link>
                  )}
                  
                  {/* Profil Saya untuk semua user di mobile */}
                  <Link 
                    href="/profile" 
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ProfileIcon />
                    <span>Profil Saya</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded text-left"
                  >
                    <LogoutIcon />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link 
                    href="/auth/login" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors duration-200 text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay untuk dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  )
}