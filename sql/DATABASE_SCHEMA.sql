INSERT INTO storage.buckets (id, name, public)
VALUES ('galleries', 'galleries', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'galleries' );

CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'galleries' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'galleries' 
  AND auth.role() = 'authenticated'
);

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS content CASCADE;
DROP TABLE IF EXISTS media CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  category TEXT[] DEFAULT '{}',
  max_participants INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  creator_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('peserta', 'volunteer')),
  volunteer_type TEXT CHECK (volunteer_type IN ('juru-bahasa', 'panitia', 'logistik', 'documentation')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
  file_size INTEGER,
  title TEXT,
  caption TEXT,
  uploaded_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page TEXT NOT NULL CHECK (page IN ('about', 'home', 'contact')),
  section TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  updated_by UUID REFERENCES profiles(id) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(page, section)
);

CREATE TABLE analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  recorded_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_date_time ON events(date_time);
CREATE INDEX idx_events_category ON events USING GIN(category);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_creator_id ON events(creator_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF NEW.email IN (
    '237006049@student.unsil.ac.id', 
    '237006057@student.unsil.ac.id',
    '237006066@student.unsil.ac.id',
    '237006088@student.unsil.ac.id',
    '237006074@student.unsil.ac.id'
  ) THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Users can view own registrations" ON registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own registrations" ON registrations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own registrations" ON registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all registrations" ON registrations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Anyone can view media" ON media FOR SELECT USING (true);
CREATE POLICY "Admins can manage media" ON media FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Anyone can view content" ON content FOR SELECT USING (true);
CREATE POLICY "Admins can manage content" ON content FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

CREATE POLICY "Only admins can access analytics" ON analytics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'galleries' );
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'galleries' AND auth.role() = 'authenticated' );
CREATE POLICY "Authenticated Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'galleries' AND auth.role() = 'authenticated' );

NOTIFY pgrst, 'reload schema';

-- tambahan baru --

-- BACKUP POLICY LAMA (optional)
CREATE TABLE IF NOT EXISTS backup_rls_policies AS 
SELECT schemaname, tablename, policyname, qual, cmd, permissive, roles
FROM pg_policies 
WHERE schemaname = 'public';

-- PERBAIKAN RLS POLICY - ASUSMSI TABLE users

-- ==================== TABLE users ====================
DROP POLICY IF EXISTS "users_update_own" ON "public"."users";
CREATE POLICY "users_update_own" ON "public"."users"
FOR UPDATE USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "users_view_own" ON "public"."users";
CREATE POLICY "users_view_own" ON "public"."users"
FOR SELECT USING (id = (SELECT auth.uid()));

-- ==================== TABLE events ====================
DROP POLICY IF EXISTS "Admins can manage events" ON "public"."events";
CREATE POLICY "Admins can manage events" ON "public"."events"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Anyone can view active events" ON "public"."events";
CREATE POLICY "Anyone can view active events" ON "public"."events"
FOR SELECT USING (is_active = true);

-- ==================== TABLE profiles ====================
DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
CREATE POLICY "Users can update own profile" ON "public"."profiles"
FOR UPDATE USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON "public"."profiles";
CREATE POLICY "Users can insert own profile" ON "public"."profiles"
FOR INSERT WITH CHECK (id = (SELECT auth.uid()));

-- ==================== TABLE registrations ====================
DROP POLICY IF EXISTS "Admins can manage all registrations" ON "public"."registrations";
CREATE POLICY "Admins can manage all registrations" ON "public"."registrations"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Users can insert own registrations" ON "public"."registrations";
CREATE POLICY "Users can insert own registrations" ON "public"."registrations"
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage own registrations" ON "public"."registrations";
CREATE POLICY "Users can manage own registrations" ON "public"."registrations"
FOR ALL USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own registrations" ON "public"."registrations";
CREATE POLICY "Users can view own registrations" ON "public"."registrations"
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- ==================== TABLE galleries ====================
DROP POLICY IF EXISTS "admins_manage_galleries" ON "public"."galleries";
CREATE POLICY "admins_manage_galleries" ON "public"."galleries"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- ==================== TABLE media ====================
DROP POLICY IF EXISTS "Admins can insert media" ON "public"."media";
CREATE POLICY "Admins can insert media" ON "public"."media"
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

DROP POLICY IF EXISTS "Admins can manage media" ON "public"."media";
CREATE POLICY "Admins can manage media" ON "public"."media"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- ==================== TABLE about ====================
DROP POLICY IF EXISTS "admins_manage_about" ON "public"."about";
CREATE POLICY "admins_manage_about" ON "public"."about"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- ==================== TABLE analytics ====================
DROP POLICY IF EXISTS "Only admins can access analytics" ON "public"."analytics";
CREATE POLICY "Only admins can access analytics" ON "public"."analytics"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- ==================== TABLE content ====================
DROP POLICY IF EXISTS "Admins can manage content" ON "public"."content";
CREATE POLICY "Admins can manage content" ON "public"."content"
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() AND users.role = 'ADMIN'
  )
);

-- ==================== TABLE user_preferences ====================
DROP POLICY IF EXISTS "users_manage_own_preferences" ON "public"."user_preferences";
CREATE POLICY "users_manage_own_preferences" ON "public"."user_preferences"
FOR ALL USING (user_id = (SELECT auth.uid()));

-- ==================== PERBAIKAN RLS UNTUK BACKUP TABLE ====================

-- OPSI 1: Enable RLS untuk backup table (jika masih perlu diakses)
ALTER TABLE public.backup_rls_policies ENABLE ROW LEVEL SECURITY;

-- Buat policy untuk backup table (hanya admin yang bisa akses)
DROP POLICY IF EXISTS "admins_access_backup" ON public.backup_rls_policies;
CREATE POLICY "admins_access_backup" ON public.backup_rls_policies
FOR ALL USING (public.is_admin());

-- OPSI 2: Atau hapus backup table jika sudah tidak diperlukan
-- DROP TABLE IF EXISTS public.backup_rls_policies;

-- ======================================================
-- Migration (fixed order): Fix profiles.role casing, constraint, trigger, and policies
-- Run: copy-paste whole file into Supabase SQL Editor and execute.
-- ======================================================

-- 1) Backup current profiles table (snapshot)
CREATE TABLE IF NOT EXISTS backup_profiles_before_role_fix AS
SELECT * FROM public.profiles;

-- 2) Inspect column type (informative)
SELECT 'COLUMN_INFO' AS note, column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role';

-- 3) DROP existing role CHECK constraint FIRST (so UPDATE won't be blocked)
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 4) Ensure enum values exist if role is enum and normalize rows to uppercase
DO $$
DECLARE
  udt text;
BEGIN
  SELECT udt_name INTO udt
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='profiles' AND column_name='role';

  IF udt = 'user_role' THEN
    -- Add enum values ADMIN and USER if they don't exist
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'ADMIN'
    ) THEN
      RAISE NOTICE 'Adding enum value ADMIN to user_role';
      EXECUTE 'ALTER TYPE user_role ADD VALUE ''ADMIN''';
    ELSE
      RAISE NOTICE 'Enum value ADMIN already exists';
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_enum WHERE enumtypid = 'user_role'::regtype AND enumlabel = 'USER'
    ) THEN
      RAISE NOTICE 'Adding enum value USER to user_role';
      EXECUTE 'ALTER TYPE user_role ADD VALUE ''USER''';
    ELSE
      RAISE NOTICE 'Enum value USER already exists';
    END IF;

    -- Normalize stored enum/text values to uppercase (safe because we added values)
    EXECUTE 'UPDATE public.profiles SET role = upper(role::text) WHERE role IS NOT NULL';
    RAISE NOTICE 'Normalized enum profile.role to uppercase';
  ELSIF udt IS NOT NULL THEN
    -- For text or other types, normalize by casting to text then upper
    EXECUTE 'UPDATE public.profiles SET role = upper(role::text) WHERE role IS NOT NULL';
    RAISE NOTICE 'Normalized (non-enum) profile.role to uppercase';
  ELSE
    RAISE NOTICE 'profiles.role column not found - skipping normalization';
  END IF;
END;
$$;

-- 5) Now re-create a case-insensitive CHECK constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK ( upper(role::text) IN ('ADMIN','USER') );

-- 6) Replace/create trigger function handle_new_user so it inserts uppercase roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  IF NEW.email IN (
    '237006049@student.unsil.ac.id',
    '237006057@student.unsil.ac.id',
    '237006066@student.unsil.ac.id',
    '237006088@student.unsil.ac.id',
    '237006074@student.unsil.ac.id',
    'bazkahasyyati@gmail.com'
  ) THEN
    user_role := 'ADMIN';
  ELSE
    user_role := 'USER';
  END IF;

  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    user_role
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists and points to function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7) Update RLS policies to check admin using upper(...) for case-insensitive matching
-- events
DROP POLICY IF EXISTS "Admins can manage events" ON public.events;
CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role::text) = 'ADMIN'
    )
  );

-- registrations
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.registrations;
CREATE POLICY "Admins can manage all registrations" ON public.registrations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role::text) = 'ADMIN'
    )
  );

-- media
DROP POLICY IF EXISTS "Admins can manage media" ON public.media;
CREATE POLICY "Admins can manage media" ON public.media
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role::text) = 'ADMIN'
    )
  );

-- content
DROP POLICY IF EXISTS "Admins can manage content" ON public.content;
CREATE POLICY "Admins can manage content" ON public.content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role::text) = 'ADMIN'
    )
  );

-- analytics
DROP POLICY IF EXISTS "Only admins can access analytics" ON public.analytics;
CREATE POLICY "Only admins can access analytics" ON public.analytics
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND upper(profiles.role::text) = 'ADMIN'
    )
  );

-- 8) Quick verification queries
SELECT 'SAMPLE_PROFILES' AS note, id, email, role FROM public.profiles ORDER BY created_at DESC LIMIT 20;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass;

SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename IN ('events','registrations','media','content','analytics')
ORDER BY tablename;

-- End of script

-- 1) Create a convenience view for admin/clients
CREATE OR REPLACE VIEW public.event_registrations_detail AS
SELECT
  r.id,
  r.event_id,
  r.user_id,
  r.role       AS registration_role,
  r.volunteer_type,
  r.status     AS registration_status,
  r.full_name,
  r.email     AS registrant_email,
  r.phone     AS registrant_phone,
  r.notes,
  r.created_at AS registration_created_at,
  -- event fields
  e.title     AS event_title,
  e.date_time AS event_date_time,
  e.location  AS event_location,
  e.image_url AS event_image_url,
  e.category  AS event_category,
  e.max_participants,
  -- profile fields
  p.name      AS user_name,
  p.email     AS user_email,
  p.phone     AS user_phone
FROM public.registrations r
JOIN public.events e   ON e.id = r.event_id
JOIN public.profiles p ON p.id = r.user_id;

-- Admins can manage registrations (contoh)
DROP POLICY IF EXISTS "Admins can manage all registrations" ON public.registrations;
CREATE POLICY "Admins can manage all registrations" ON public.registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can view own registrations
DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
CREATE POLICY "Users can view own registrations" ON public.registrations
  FOR SELECT USING ( user_id = auth.uid() );