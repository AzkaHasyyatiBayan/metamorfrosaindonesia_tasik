import { supabase } from './supabase';

const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowSeconds: 900,
}

export const checkRateLimit = async (
  identifier: string, 
  maxAttempts: number = RATE_LIMIT_CONFIG.maxAttempts, 
  windowSeconds: number = RATE_LIMIT_CONFIG.windowSeconds
): Promise<boolean> => {
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
      console.warn(`Rate limit exceeded for identifier: ${identifier}`);
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
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      throw new Error('Unauthorized - No active session');
    }
    return session;
  } catch (error) {
    console.error('Authentication check failed:', error);
    throw error;
  }
};

export const requireAdmin = async () => {
  try {
    const session = await requireAuth();
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching admin profile:', error);
      throw new Error('Failed to verify admin status');
    }

    if (!profile || profile?.role?.toUpperCase() !== 'ADMIN') {
      console.log('🚫 Admin access denied - profile role:', profile?.role);
      throw new Error('Admin access required - insufficient privileges');
    }

    console.log('✅ Admin access granted for:', session.user.email);
    return session;
  } catch (error) {
    console.error('Admin verification failed:', error);
    throw error;
  }
};
