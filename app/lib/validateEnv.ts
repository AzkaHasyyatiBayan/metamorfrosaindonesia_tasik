/**
 * Environment variable validation
 * Run this on startup to ensure all required env vars are set
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required vars
  REQUIRED_ENV_VARS.forEach(varName => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  });

  // Validate format of specific vars
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid URL');
    }
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 10) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function logEnvironmentStatus(): void {
  const validation = validateEnvironment();

  if (validation.valid) {
    console.log('[Startup] ✓ All required environment variables are configured');
  } else {
    console.error('[Startup] ✗ Environment validation failed:');
    validation.errors.forEach(error => {
      console.error(`  - ${error}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed');
    }
  }
}
