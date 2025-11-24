export type UserRole = 'ADMIN' | 'USER' | 'VOLUNTEER';
export type RegistrationType = 'PARTICIPANT' | 'VOLUNTEER';
export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';
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
  category: AccessibilityCategory[];
  max_participants?: number;
  image_url?: string;
  is_active: boolean;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface About {
  id: string;
  section: AboutSection;
  title: string;
  content: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}