'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'
import { getUserRoleByEmail } from '../lib/config'

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
    const role = getUserRoleByEmail(email)
    if (process.env.NODE_ENV === 'development') {
      console.debug('[Auth] Checking role for email:', email, 'role:', role)
    }
    return role
  }, [])

  const createUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Creating new profile for:', userId)
      }

      const userRole = userEmail ? getUserRole(userEmail) : 'USER'
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Setting user role to:', userRole)
      }

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
        console.error('[Auth] Error creating profile:', createError.message, createError.code)

        if (createError.code === '23505') {
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Auth] Profile already exists, fetching again...')
          }
          const { data: existingProfile, error: fetchAgainError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

          if (fetchAgainError) {
            console.error('[Auth] Error fetching existing profile:', fetchAgainError.message)
            return null
          }

          if (process.env.NODE_ENV === 'development') {
            console.debug('[Auth] Found existing profile with role:', existingProfile?.role)
          }
          return existingProfile
        }
        return null
      }

      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Profile created successfully with role:', newProfile?.role)
      }
      return newProfile
    } catch (error) {
      console.error('[Auth] Unexpected error in createUserProfile:', error)
      return null
    }
  }, [getUserRole])

  const fetchUserProfile = useCallback(async (userId: string, userEmail?: string, userName?: string) => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Fetching user profile for:', userId)
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('[Auth] Error fetching profile:', error.message, error.code)

        if (error.code === 'PGRST116') {
          const newProfile = await createUserProfile(userId, userEmail, userName)
          if (newProfile) {
            setUserProfile(newProfile)
            const role = newProfile.role?.toUpperCase()
            setIsAdmin(role === 'ADMIN')
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Auth] Profile created, isAdmin:', role === 'ADMIN')
            }
            return newProfile
          }
        }

        console.warn('[Auth] Profile fetch failed:', error.message)
        return null
      }

      if (data) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Auth] Profile found with role:', data.role)
        }
        setUserProfile(data)
        const role = data.role?.toUpperCase()
        setIsAdmin(role === 'ADMIN')
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Auth] Profile loaded, isAdmin:', role === 'ADMIN')
        }
        return data
      }

      return null
    } catch (error) {
      console.error('[Auth] Unexpected error in fetchUserProfile:', error)
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
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Updating user profile')
      }

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
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Auth] Profile updated successfully')
        }
        setUserProfile(data)
        const role = data.role?.toUpperCase()
        setIsAdmin(role === 'ADMIN')
      }
    } catch (error) {
      console.error('[Auth] Error updating profile:', error)
      throw error
    }
  }, [user])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setSession(null)
      setUserProfile(null)
      setIsAdmin(false)
      setError(null)

      if (process.env.NODE_ENV === 'development') {
        console.debug('[Auth] Signed out successfully')
      }
    } catch (error) {
      console.error('[Auth] Error signing out:', error)
      throw error
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setLoading(true)
        if (process.env.NODE_ENV === 'development') {
          console.debug('[Auth] Initializing auth...')
        }

        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

        if (!mounted) return

        if (sessionError) {
          console.error('[Auth] Session error:', sessionError)
          setError(sessionError.message)
          return
        }

        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Auth] User found:', currentSession.user.email)
          }

          const profile = await fetchUserProfile(
            currentSession.user.id,
            currentSession.user.email || undefined,
            currentSession.user.user_metadata?.name
          )

          if (profile) {
            const role = profile.role?.toUpperCase()
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Auth] Final role check - role:', role, 'isAdmin:', role === 'ADMIN')
            }

            if (role === 'ADMIN' && !pathname.startsWith('/admin') && pathname !== '/auth/login') {
              if (process.env.NODE_ENV === 'development') {
                console.debug('[Auth] Admin detected on non-admin page, redirecting to admin dashboard')
              }
              setTimeout(() => {
                router.push('/admin')
              }, 100)
            }
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Auth] No session found')
          }
          setSession(null)
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error('[Auth] Auth initialization error:', error)
        setError(error instanceof Error ? error.message : 'Authentication error')
      } finally {
        if (mounted) {
          setLoading(false)
          if (process.env.NODE_ENV === 'development') {
            console.debug('[Auth] Auth initialization complete')
          }
        }
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        if (process.env.NODE_ENV === 'development') {
          console.debug('[Auth] Auth state changed:', event)
        }

        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            if (process.env.NODE_ENV === 'development') {
              console.debug('[Auth] Processing user for event:', event)
            }
            const profile = await fetchUserProfile(
              currentSession.user.id,
              currentSession.user.email,
              currentSession.user.user_metadata?.name
            )

            if (event === 'SIGNED_IN' && profile) {
              const role = profile.role?.toUpperCase()
              if (process.env.NODE_ENV === 'development') {
                console.debug('[Auth] Post-login role check - role:', role, 'isAdmin:', role === 'ADMIN')
              }

              if (role === 'ADMIN' && !pathname.startsWith('/admin')) {
                if (process.env.NODE_ENV === 'development') {
                  console.debug('[Auth] Admin signed in, redirecting to admin dashboard')
                }
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
    updateProfile: updateUserProfile,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
