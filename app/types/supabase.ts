export type UserRole = 'admin' | 'user'
export type RegistrationType = 'peserta' | 'volunteer'
export type VolunteerType = 'juru-bahasa' | 'panitia' | 'logistik' | 'documentation'
export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type FileType = 'image' | 'video'
export type ContentPage = 'about' | 'home' | 'contact'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  phone?: string | null
  bio?: string | null
  avatar_url?: string | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string
  date_time: string
  location: string
  category: string[]
  max_participants?: number | null
  image_url?: string | null
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface Registration {
  id: string
  event_id: string
  user_id: string
  role: RegistrationType
  volunteer_type?: VolunteerType | null
  status: RegistrationStatus
  full_name: string
  email: string
  phone?: string | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface RegistrationWithDetails extends Registration {
  events: {
    title: string
    date_time: string
    location: string
    max_participants?: number | null
  }
  profiles?: {
    name: string
    email: string
  }
}

export interface Media {
  id: string
  event_id: string
  file_url: string
  file_name: string
  file_type: FileType
  file_size?: number | null
  caption?: string | null
  has_sign_language: boolean
  has_subtitles: boolean
  uploaded_by: string
  created_at: string
}

export interface AdminStats {
  totalEvents: number
  upcomingEvents: number
  totalRegistrations: number
  pendingRegistrations: number
  participationRate: string
  volunteerCount: number
}

export interface TableEvent {
  id: string
  title: string
  date: string
  location: string
  registrations: number
}
