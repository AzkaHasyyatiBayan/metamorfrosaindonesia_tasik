'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import { Icons } from './Icons'

export default function Navbar() {
  const { user, userProfile, loading, signOut } = useAuth()
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await signOut()
      setIsDropdownOpen(false)
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
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
                <div className="w-full h-full bg-linear-to-br from-red-600 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MI</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-none text-gray-900">
                  Metamorfrosa Indonesia
                </span>
                <span className="text-[10px] font-medium tracking-wider text-red-600">
                  Tasikmalaya
                </span>
              </div>
            </div>
            <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/Logo Metamorfrosa_Tasik_Transparan.svg"
                  alt="Metamorfosa Logo"
                  fill
                  className="object-contain"
                  sizes="48px"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold leading-none text-gray-900">
                  Metamorfrosa Indonesia
                </span>
                <span className="text-[10px] font-medium tracking-wider text-red-600">
                  Tasikmalaya
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              prefetch={false}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'text-red-600 font-semibold' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Beranda
            </Link>
            <Link 
              href="/user/events" 
              prefetch={false}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/user/events') 
                  ? 'text-red-600 font-semibold' 
                  : 'text-gray-700 hover:text-red-600'
              }`}
            >
              Event
            </Link>
            <Link 
              href="/user/about" 
              prefetch={false}
              className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                isActive('/user/about') 
                  ? 'text-red-600 font-semibold' 
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
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-red-300 shadow-sm">
                    <div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm font-semibold">
                        {(userProfile?.name || user.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <span className="max-w-32 truncate">{userProfile?.name || 'User'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{userProfile?.name}</p>
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
                  prefetch={false}
                  className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2"
                >
                  Masuk
                </Link>
                <Link 
                  href="/auth/register" 
                  prefetch={false}
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
          <div className="md:hidden bg-white py-4">
            <div className="flex flex-col space-y-3">
              <Link 
                href="/" 
                prefetch={false}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-red-50 rounded ${
                  isActive('/') 
                    ? 'text-red-600 font-semibold' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link 
                href="/user/events" 
                prefetch={false}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-red-50 rounded ${
                  isActive('/user/events') 
                    ? 'text-red-600 font-semibold' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Event
              </Link>
              <Link 
                href="/user/about" 
                prefetch={false}
                className={`px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-red-50 rounded ${
                  isActive('/user/about') 
                    ? 'text-red-600 font-semibold' 
                    : 'text-gray-700 hover:text-red-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tentang Kami
              </Link>
              
              {user ? (
                <>
                  <div className="px-4 py-2 mt-2 pt-4">
                    <p className="text-sm font-medium text-gray-900">{userProfile?.name}</p>
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
                <div className="flex flex-col space-y-2 pt-4">
                  <Link 
                    href="/auth/login" 
                    prefetch={false}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 hover:bg-red-50 rounded text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/auth/register" 
                    prefetch={false}
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