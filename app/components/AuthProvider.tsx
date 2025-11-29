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
    console.log('🔍 Checking role for email:', email, 'isAdmin:', isAdminEmail)
    return isAdminEmail ? 'ADMIN' : 'USER'
  }, [])

  const createUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      console.log('📝 Creating new profile for:', userId)
      
      const userRole = userEmail ? getUserRole(userEmail) : 'USER'
      console.log('🎯 Setting user role to:', userRole)
      
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
        console.error('❌ Error creating profile:', createError.message, createError.code)
        
        if (createError.code === '23505') {
          console.log('🔄 Profile already exists, fetching again...')
          const { data: existingProfile, error: fetchAgainError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
            
          if (fetchAgainError) {
            console.error('❌ Error fetching existing profile:', fetchAgainError.message)
            return null
          }
          
          console.log('✅ Found existing profile with role:', existingProfile?.role)
          return existingProfile
        }
        return null
      }

      console.log('✅ Profile created successfully with role:', newProfile?.role)
      return newProfile
    } catch (error) {
      console.error('💥 Unexpected error in createUserProfile:', error)
      return null
    }
  }, [getUserRole])

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      console.log('🔄 Fetching user profile for:', userId)
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('❌ Error fetching profile:', error.message, error.code)
        
        if (error.code === 'PGRST116') {
          const newProfile = await createUserProfile(userId, userEmail, userName)
          if (newProfile) {
            setUserProfile(newProfile)
            const role = newProfile.role?.toUpperCase()
            setIsAdmin(role === 'ADMIN')
            console.log('👤 Profile created, isAdmin:', role === 'ADMIN')
            return newProfile
          }
        }
        
        console.warn('⚠️ Profile fetch failed:', error.message)
        return null
      }

      if (data) {
        console.log('✅ Profile found with role:', data.role)
        setUserProfile(data)
        const role = data.role?.toUpperCase()
        setIsAdmin(role === 'ADMIN')
        console.log('👤 Profile loaded, isAdmin:', role === 'ADMIN')
        return data
      }
      
      return null
    } catch (error) {
      console.error('💥 Unexpected error in fetchUserProfile:', error)
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
      console.log('📝 Updating user profile')
      
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
        console.log('✅ Profile updated successfully')
        setUserProfile(data)
        const role = data.role?.toUpperCase()
        setIsAdmin(role === 'ADMIN')
      }
    } catch (error) {
      console.error('💥 Error updating profile:', error)
      throw error
    }
  }, [user])

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    return updateUserProfile(updates)
  }, [updateUserProfile])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      setUser(null)
      setSession(null)
      setUserProfile(null)
      setIsAdmin(false)
      setError(null)
      
      console.log('✅ Signed out successfully')
    } catch (error) {
      console.error('❌ Error signing out:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        console.log('🔍 Initializing auth...')
        
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (sessionError) {
          console.error('❌ Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          console.log('👤 User found:', currentSession.user.email)
          
          const profile = await fetchUserProfile(
            currentSession.user.id, 
            currentSession.user.email || undefined, 
            currentSession.user.user_metadata?.name
          )

          if (profile) {
            const role = profile.role?.toUpperCase()
            console.log('🎯 Final role check - role:', role, 'isAdmin:', role === 'ADMIN')
            
            if (role === 'ADMIN' && !pathname.startsWith('/admin') && pathname !== '/auth/login') {
              console.log('👑 Admin detected on non-admin page, redirecting to admin dashboard')
              setTimeout(() => {
                router.push('/admin')
              }, 100)
            }
          }
        } else {
          console.log('🚫 No session found')
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
        setError(error instanceof Error ? error.message : 'Authentication error')
      } finally {
        if (mounted) {
          setLoading(false)
          console.log('🏁 Auth initialization complete')
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        console.log('🔄 Auth state changed:', event)
        
        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('👤 Processing user for event:', event)
            const profile = await fetchUserProfile(
              currentSession.user.id, 
              currentSession.user.email,
              currentSession.user.user_metadata?.name
            )

            if (event === 'SIGNED_IN' && profile) {
              const role = profile.role?.toUpperCase()
              console.log('🎯 Post-login role check - role:', role, 'isAdmin:', role === 'ADMIN')
              
              if (role === 'ADMIN' && !pathname.startsWith('/admin')) {
                console.log('👑 Admin signed in, redirecting to admin dashboard')
                setTimeout(() => {
                  router.push('/admin')
                }, 100)
              }
            }
          }
        } else {
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
        
        setError(null)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile, router, pathname])

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