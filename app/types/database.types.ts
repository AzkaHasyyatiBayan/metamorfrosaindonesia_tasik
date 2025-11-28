export type UserRole = 'ADMIN' | 'USER' | 'VOLUNTEER';
export type RegistrationType = 'PARTICIPANT' | 'VOLUNTEER';
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
export type AccessibilityCategory = 'SIGN_LANGUAGE' | 'WHEELCHAIR_ACCESS' | 'BRAILLE' | 'AUDIO_DESCRIPTION' | 'TACTILE';
export type AboutSection = 'PROFILE' | 'VISION_MISSION' | 'GOALS' | 'STRUCTURE' | 'CONTACT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  interests?: string[];
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date_time: string;
  location: string;
  category: string[];
  max_participants?: number | null;
  image_url?: string | null;
  is_active: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface Registration {
  id: string;
  event_id: string;
  user_id: string;
  type: RegistrationType;
  status: RegistrationStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RegistrationWithDetails extends Registration {
  events: {
    title: string;
    date_time: string;
    location: string;
    max_participants?: number | null;
  };
  profiles?: {
    name: string;
    email: string;
  };
}

export interface AdminStats {
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  pendingRegistrations: number;
  participationRate: string;
  volunteerCount: number;
}

export interface TableEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  registrations: number;
}