'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { UserRole } from '../types/database.types'
import { Icons } from './Icons'

interface AppUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar_url?: string
}

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
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (authUser) {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authUser.id,
                email: authUser.email,
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                role: 'USER'
              }
            ])
            .select()
            .single()

          if (!createError && newProfile) {
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
        setUser(null)
        return
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name || profile.email?.split('@')[0] || 'User',
          email: profile.email,
          role: profile.role,
          avatar_url: profile.avatar_url,
        })
      }
    } catch {
      setUser(null)
    }
  }, [])

  const checkUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [fetchUserProfile])

  useEffect(() => {
    checkUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [checkUser, fetchUserProfile])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setIsDropdownOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      console.error('Error logging out')
    }
  }

  const isActive = (path: string) => pathname === path

  if (pathname.startsWith('/admin')) {
    return null
  }

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
                    onError={() => setLogoError(true)}
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
              href="/user/about" 
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/about') 
                  ? 'text-red-600 border-b-2 border-red-600' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Tentang Kami
            </Link>

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

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    
                    <Link 
                      href="/user/profile" 
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Icons.User />
                      <span>Profil Saya</span>
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                      >
                        <Icons.Logout />
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
                href="/user/about" 
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
                  
                  <Link 
                    href="/user/profile" 
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icons.User />
                    <span>Profil Saya</span>
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded text-left"
                  >
                    <Icons.Logout />
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
                    href="/auth/register" 
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

      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}
    </nav>
  )
}