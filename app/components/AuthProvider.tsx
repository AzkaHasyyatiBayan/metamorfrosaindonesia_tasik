'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface UserProfile {
  id: string
  email: string
  name: string
  role: string
  phone?: string
  bio?: string
  avatar_url?: string
}

interface AuthContextType {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  refreshProfile: () => Promise<void>
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  session: null, 
  userProfile: null,
  loading: true,
  error: null,
  isAdmin: false,
  refreshProfile: async () => {},
  updateUserProfile: async () => {},
  updateProfile: async () => {},
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

const ADMIN_EMAILS = [
  '237006049@student.unsil.ac.id',
  '237006057@student.unsil.ac.id', 
  '237006066@student.unsil.ac.id',
  '237006088@student.unsil.ac.id',
  '237006074@student.unsil.ac.id',
  'bazkahasyyati@gmail.com'
]

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const getUserRole = useCallback((email: string): string => {
    const isAdminEmail = ADMIN_EMAILS.includes(email.toLowerCase())
    return isAdminEmail ? 'ADMIN' : 'USER'
  }, [])

  const createUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      const userRole = userEmail ? getUserRole(userEmail) : 'USER'
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userEmail || '',
            name: userName || userEmail?.split('@')[0] || 'User',
            role: userRole
          }
        ])
        .select()
        .single()

      if (createError) {
        if (createError.code === '23505') {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
            
          return existingProfile
        }
        console.error('Error creating profile:', createError)
        return null
      }

      return newProfile
    } catch (error) {
      console.error('Unexpected error in createUserProfile:', error)
      return null
    }
  }, [getUserRole])

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          const newProfile = await createUserProfile(userId, userEmail, userName)
          if (newProfile) {
            setUserProfile(newProfile)
            setIsAdmin(newProfile.role?.toUpperCase() === 'ADMIN')
            return newProfile
          }
        }
        return null
      }

      if (data) {
        setUserProfile(data)
        setIsAdmin(data.role?.toUpperCase() === 'ADMIN')
        return data
      }
      
      return null
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error)
      return null
    }
  }, [createUserProfile])

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchUserProfile(user.id, user.email || undefined, user.user_metadata?.name)
    }
  }, [user, fetchUserProfile])

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user?.id) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      if (data) {
        setUserProfile(data)
        setIsAdmin(data.role?.toUpperCase() === 'ADMIN')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }, [user])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    return updateUserProfile(updates)
  }, [updateUserProfile])

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      setUserProfile(null)
      setIsAdmin(false)
      setError(null)
      // Menggunakan window.location untuk hard refresh agar state bersih total
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [])

  // EFFECT 1: INITIALIZATION
  // Hanya dijalankan SEKALI saat aplikasi dimuat pertama kali.
  // Tidak bergantung pada 'pathname' atau 'router' agar tidak looping saat navigasi.
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          throw sessionError
        }

        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          await fetchUserProfile(
            currentSession.user.id, 
            currentSession.user.email || undefined, 
            currentSession.user.user_metadata?.name
          )
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setError(error instanceof Error ? error.message : 'Authentication error')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return
        
        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          if (event === 'SIGNED_IN') {
             await fetchUserProfile(
              currentSession.user.id, 
              currentSession.user.email,
              currentSession.user.user_metadata?.name
            )
          }
        } else {
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
        
        if (event === 'SIGNED_OUT') {
           setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) 

  // EFFECT 2: ROUTE PROTECTION
  // Dijalankan setiap kali user berpindah halaman (pathname berubah).
  // Cek apakah user boleh mengakses halaman tersebut.
  useEffect(() => {
    if (loading) return // Tunggu loading selesai dulu

    // 1. Proteksi Halaman Admin
    if (pathname.startsWith('/admin')) {
      if (!user) {
        router.push('/auth/login')
      } else if (!isAdmin) {
        router.push('/')
      }
    }

    // 2. Proteksi Halaman User (Profile, Events, dll)
    if (pathname.startsWith('/user')) {
      if (!user) {
        router.push('/auth/login')
      }
    }

    // 3. Redirect Login Page jika sudah login
    if (pathname === '/auth/login' || pathname === '/auth/register') {
      if (user) {
        if (isAdmin) {
          router.push('/admin')
        } else {
          router.push('/')
        }
      }
    }
  }, [user, isAdmin, loading, pathname, router])

  const value = {
    user,
    session,
    userProfile,
    loading,
    error,
    isAdmin,
    refreshProfile,
    updateUserProfile,
    updateProfile,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}