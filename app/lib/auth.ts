import { supabase } from './supabase';

export const checkRateLimit = async (identifier: string, maxAttempts = 5, windowSeconds = 900): Promise<boolean> => {
  try {
    const windowStart = new Date(Date.now() - windowSeconds * 1000).toISOString();

    await supabase.from('rate_limits').delete().lt('attempt_time', windowStart);

    const { count, error } = await supabase
      .from('rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .gte('attempt_time', windowStart);

    if (error) {
      console.error('Rate limit check error:', error);
      return true; 
    }

    if ((count || 0) >= maxAttempts) {
      return false;
    }

    await supabase.from('rate_limits').insert({ identifier });
    return true;
  } catch (err) {
    console.error('Rate limit exception:', err);
    return true; 
  }
};

export const requireAuth = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) {
    throw new Error('Unauthorized');
  }
  return session;
};

export const requireAdmin = async () => {
  const session = await requireAuth();
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !profile || profile?.role?.toUpperCase() !== 'ADMIN') {
    console.log('🚫 Admin access denied - profile:', profile?.role, 'error:', error);
    throw new Error('Admin access required');
  }

  console.log('✅ Admin access granted for:', session.user.email);
  return session;
};