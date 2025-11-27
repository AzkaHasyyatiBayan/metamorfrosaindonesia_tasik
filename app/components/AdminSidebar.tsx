'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthProvider'

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const DocumentsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const EventsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

const RegistrationsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
)

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

const CollapseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
)

const ExpandIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
)

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [logoError, setLogoError] = useState(false)
  
  // PERBAIKAN: Hilangkan 'any' dan manual check
  const { userProfile, loading } = useAuth()
  // Manual check untuk admin role
  const isAdmin = (userProfile as { role?: string })?.role === 'admin'

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    } else {
      return pathname.startsWith(path)
    }
  }

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/admin/galleries', label: 'Dokumentasi', icon: <DocumentsIcon /> },
    { path: '/admin/events', label: 'Kelola Event', icon: <EventsIcon /> },
    { path: '/admin/registrations', label: 'Pendaftaran', icon: <RegistrationsIcon /> },
  ]

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (loading) {
    return (
      <div className="bg-red-600 text-white min-h-screen w-64 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <p className="mt-2 text-sm">Memuat...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className={`bg-red-600 text-white min-h-screen transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col sticky top-0 h-screen`}>
      {/* Header Sidebar */}
      <div className="p-4 border-b border-red-500 shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                {!logoError ? (
                  <Image 
                    src="/logo.jpg" 
                    alt="Metamorfrosa Indonesia"
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">MI</span>
                  </div>
                )}
              </div>
              <span className="text-white font-bold text-lg">Admin</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden mx-auto">
              {!logoError ? (
                <Image 
                  src="/logo.jpg" 
                  alt="Metamorfrosa Indonesia"
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">MI</span>
                </div>
              )}
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:text-red-200 transition-colors duration-200 p-1 rounded hover:bg-red-500"
          >
            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </button>
        </div>
      </div>

      {/* User Info */}
      {!isCollapsed && userProfile && (
        <div className="p-4 border-b border-red-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
              {/* PERBAIKAN: Simple avatar dengan initial */}
              <div className="w-full h-full rounded-full flex items-center justify-center">
                <span className="text-red-600 font-semibold text-sm">
                  {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{userProfile.name}</p>
              <p className="text-xs text-red-200 truncate">{userProfile.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <nav className="p-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const active = isActive(item.path)
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${
                active
                  ? 'bg-white text-red-600 font-semibold shadow-sm'
                  : 'text-white hover:bg-red-500'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className={`${active ? 'text-red-600' : 'text-white'}`}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="p-4 border-t border-red-500 shrink-0">
        {!isCollapsed ? (
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 w-full p-3 text-white hover:bg-red-500 rounded-lg transition-colors duration-200 text-sm"
          >
            <LogoutIcon />
            <span>Keluar</span>
          </button>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full p-3 text-white hover:bg-red-500 rounded-lg transition-colors duration-200 flex justify-center"
            title="Keluar"
          >
            <LogoutIcon />
          </button>
        )}
      </div>
    </div>
  )
}