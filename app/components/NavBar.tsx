'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from './AuthProvider'
import Button from './Button'

export default function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Cek halaman aktif untuk menentukan warna tombol
  const isRegisterPage = pathname === '/auth/register'
  // const isLoginPage = pathname === '/auth/login' // Opsional jika butuh logika spesifik login

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/events', label: 'Event' },
    { href: '/user/about', label: 'Tentang Kami' },
  ]

  // Style Tombol Solid (Background Merah, Teks Putih)
  const solidBtnClass = "py-2! px-6! text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 border-2 border-transparent"
  
  // Style Tombol Outline (Background Putih, Teks Merah, Border Merah)
  // Perbaikan: Tidak ada lagi teks putih di sini, selalu merah agar terlihat di bg putih
  const outlineBtnClass = "py-2! px-6! text-sm font-semibold bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 transition-all transform hover:-translate-y-0.5"

  return (
    <nav
      // Background SELALU PUTIH, shadow muncul saat discroll
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled || isMobileMenuOpen ? 'shadow-sm py-3' : 'py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* --- BAGIAN LOGO --- */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-transform duration-300 group-hover:scale-105">
              {!logoError ? (
                <Image
                  src="/logo.jpg"
                  alt="Metamorfosa Logo"
                  fill
                  className="object-cover transform scale-110"
                  sizes="48px"
                  priority
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-red-600 to-orange-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MI</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col">
              {/* Teks selalu hitam/merah karena background putih */}
              <span className="text-base font-bold leading-none text-gray-900">
                Metamorfosa
              </span>
              <span className="text-[10px] font-medium tracking-wider text-red-600">
                INDONESIA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-red-600 ${
                  pathname === link.href
                    ? 'text-red-600 font-semibold'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/user/profile"
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Halo, {user.user_metadata?.name?.split(' ')[0] || 'User'}
                </Link>
                <Button 
                  onClick={() => signOut()}
                  variant="outline"
                  className="py-1.5! px-4! text-xs font-medium border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Keluar
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Tombol Masuk: 
                    - Jika di halaman Register: Outline (Putih/Merah)
                    - Jika BUKAN di halaman Register (Home/Login): Solid (Merah) 
                */}
                <Link href="/auth/login">
                  <Button className={!isRegisterPage ? solidBtnClass : outlineBtnClass}>
                    Masuk
                  </Button>
                </Link>

                {/* Tombol Daftar: 
                    - Jika di halaman Register: Solid (Merah)
                    - Jika BUKAN di halaman Register (Home/Login): Outline (Putih/Merah)
                */}
                <Link href="/auth/register">
                  <Button className={isRegisterPage ? solidBtnClass : outlineBtnClass}>
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-xl py-4 px-4 flex flex-col space-y-3 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-sm font-medium px-4 py-3 rounded-lg transition-colors ${
                pathname === link.href
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-4 mt-2 grid gap-3">
            {user ? (
              <>
                <Link
                  href="/user/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 text-gray-700 font-medium px-2"
                >
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span>Profile Saya</span>
                </Link>
                <button
                  onClick={() => {
                    signOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-center py-2 text-red-600 font-medium text-sm hover:bg-red-50 rounded-lg"
                >
                  Keluar Akun
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className={`w-full justify-center ${!isRegisterPage ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-2 border-red-600'}`}>
                    Masuk
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className={`w-full justify-center ${isRegisterPage ? 'bg-red-600 text-white' : 'bg-white text-red-600 border-2 border-red-600'}`}>
                    Daftar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}